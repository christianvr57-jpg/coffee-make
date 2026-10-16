// Sincronización en la nube: todos los datos (menos las fotos) en un archivo de un repositorio
// privado de GitHub. Cada dispositivo guarda su clave de acceso en este navegador (nunca en la
// copia de seguridad ni en el código).
//
// Cuándo se sincroniza: al abrir la app, al volver a ella, a los pocos segundos de cada cambio y
// cada 30 s mientras está a la vista. Cómo: se lee la nube, se fusiona registro a registro con lo
// de aquí (gana la versión más reciente; los borrados viajan como marcas), se escribe aquí lo que
// llega y se sube el resultado si la nube no lo tenía.
import { signal } from '@preact/signals';
import { db, TABLAS_DATOS, alCambiarDatos } from './db';
import { claveDe, fusionar, type Datos, type Fila } from './fusion';
import { ErrorNube, comprobarRepo, escribirNube, leerNube, type ConfigNube } from './github';

export const REPO_POR_DEFECTO = 'christianvr57-jpg/coffee-make-datos';
const CLAVE_LS = 'coffee-make:nube';
/** Las fotos se quedan en cada dispositivo (pesan demasiado para un archivo de texto). */
const TABLAS_NUBE = TABLAS_DATOS.filter((t) => t !== 'fotos');
/** Ajustes propios de cada dispositivo. */
const AJUSTES_LOCALES = new Set(['copia', 'hogar:migrado', 'cafe:semillas']);
const CADA_MS = 30_000;

interface Config extends ConfigNube {
  /** Hasta la primera sincronización correcta: si hay diferencias, ¿manda la nube? */
  primeraMandaNube?: boolean;
}

export interface EstadoNube {
  activa: boolean;
  repo?: string;
  sincronizando: boolean;
  /** Última sincronización correcta (ms). */
  ultima: number | null;
  error: string | null;
}

function leerConfig(): Config | null {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_LS) || 'null') as Config | null;
    return c?.token && c.repo ? c : null;
  } catch {
    return null;
  }
}
function guardarConfig(c: Config | null) {
  try {
    if (c) localStorage.setItem(CLAVE_LS, JSON.stringify(c));
    else localStorage.removeItem(CLAVE_LS);
  } catch {
    /* almacenamiento no disponible */
  }
}
const leerUltima = (): number | null => {
  try {
    return Number(localStorage.getItem(`${CLAVE_LS}:ultima`)) || null;
  } catch {
    return null;
  }
};

const inicial = leerConfig();
export const estadoNube = signal<EstadoNube>({ activa: !!inicial, repo: inicial?.repo, sincronizando: false, ultima: leerUltima(), error: null });
const poner = (p: Partial<EstadoNube>) => (estadoNube.value = { ...estadoNube.value, ...p });

/** Qué hacer cuando llegan datos de otro dispositivo (lo pone main.tsx: recargar los módulos). */
let alRecibir: () => Promise<void> = async () => {};
export const alRecibirDatos = (f: () => Promise<void>) => (alRecibir = f);

/** Última versión de la nube leída o escrita en esta sesión (para las lecturas condicionales). */
let ultimaNube: { sha: string | null; datos: Datos; etag?: string } | null = null;

async function leerLocal(): Promise<Datos> {
  const datos: Datos = {};
  for (const t of TABLAS_NUBE) {
    const filas = (await db.table(t).toArray()) as Fila[];
    datos[t] = t === 'ajustes' ? filas.filter((a) => !AJUSTES_LOCALES.has(String(a.clave))) : filas;
  }
  return datos;
}

/** Escribe aquí lo que llega de la nube, salvo que mientras tanto se haya escrito algo más nuevo. */
async function aplicarLocal(paraLocal: Datos): Promise<number> {
  const tablas = Object.keys(paraLocal).filter((t) => (TABLAS_NUBE as readonly string[]).includes(t));
  if (!tablas.length) return 0;
  let n = 0;
  await db.transaction('rw', tablas.map((t) => db.table(t)), async () => {
    for (const t of tablas) {
      const k = claveDe(t);
      for (const fila of paraLocal[t]) {
        if (t === 'ajustes' && AJUSTES_LOCALES.has(String(fila.clave))) continue;
        const actual = (await db.table(t).get(fila[k] as string)) as Fila | undefined;
        if (actual && (actual.actualizado || 0) > (fila.actualizado || 0)) continue;
        await db.table(t).put(fila);
        n++;
      }
    }
  });
  return n;
}

const origen = () => (typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1000px)').matches ? 'el ordenador' : 'el móvil');

async function ciclo(): Promise<void> {
  const cfg = leerConfig();
  if (!cfg) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    poner({ error: 'Sin conexión: se sincronizará al recuperarla.' });
    return;
  }
  poner({ sincronizando: true });
  try {
    for (let intento = 0; intento < 4; intento++) {
      const ultimoCambio = (await db.cambios.orderBy('n').last())?.n ?? 0;
      const hayLocal = ultimoCambio > 0;
      let nube = await leerNube(cfg, ultimaNube?.etag);
      if (nube.sinCambios) {
        if (!hayLocal) break;
        nube = { sha: ultimaNube!.sha, datos: ultimaNube!.datos };
      }
      const { resultado, paraLocal, subir } = fusionar(await leerLocal(), nube.datos, !!cfg.primeraMandaNube);
      const recibidos = await aplicarLocal(paraLocal);
      if (subir || !nube.sha) {
        const sha = await escribirNube(cfg, resultado, nube.sha, origen());
        if (!sha) {
          // Otro dispositivo escribió entre medias: se vuelve a leer y fusionar.
          ultimaNube = null;
          continue;
        }
        ultimaNube = { sha, datos: resultado };
      } else {
        ultimaNube = { sha: nube.sha, datos: nube.datos, etag: nube.etag ?? ultimaNube?.etag };
      }
      await db.cambios.where('n').belowOrEqual(ultimoCambio).delete();
      if (cfg.primeraMandaNube !== undefined) guardarConfig({ token: cfg.token, repo: cfg.repo });
      if (recibidos) await alRecibir();
      const ahora = Date.now();
      try {
        localStorage.setItem(`${CLAVE_LS}:ultima`, String(ahora));
      } catch {
        /* sin almacenamiento */
      }
      poner({ ultima: ahora, error: null });
      return;
    }
    poner({ error: 'Otro dispositivo está guardando a la vez. Se reintentará en unos segundos.' });
  } catch (e) {
    poner({ error: e instanceof ErrorNube ? e.message : 'No se pudo conectar con GitHub. Se reintentará más tarde.' });
    if (e instanceof ErrorNube && (e.estado === 401 || e.estado === 404)) ultimaNube = null;
  } finally {
    poner({ sincronizando: false });
  }
}

let enCurso: Promise<void> | null = null;
let otraVez = false;

/** Sincroniza ya (si ya hay una en marcha, se encadena otra al terminar). */
export function sincronizar(): Promise<void> {
  if (enCurso) {
    otraVez = true;
    return enCurso;
  }
  enCurso = (async () => {
    try {
      do {
        otraVez = false;
        await ciclo();
      } while (otraVez);
    } finally {
      enCurso = null;
    }
  })();
  return enCurso;
}

let temporizador: ReturnType<typeof setTimeout> | undefined;
const programar = (ms: number) => {
  if (!leerConfig()) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    temporizador = undefined;
    sincronizar();
  }, ms);
};

/** Arranca la sincronización automática (se llama una vez al abrir la app). */
export function iniciarNube(): void {
  alCambiarDatos.add(() => programar(2500));
  document.addEventListener('visibilitychange', () => {
    if (!leerConfig()) return;
    // Al irse: sube lo pendiente ya. Al volver: trae lo que haya cambiado en el otro dispositivo.
    if (document.hidden) {
      if (temporizador) programar(0);
    } else sincronizar();
  });
  window.addEventListener('online', () => leerConfig() && sincronizar());
  setInterval(() => {
    if (!document.hidden && leerConfig()) sincronizar();
  }, CADA_MS);
  if (leerConfig()) sincronizar();
}

/** Conecta este dispositivo. Devuelve un mensaje de error o null. */
export async function conectarNube(token: string, repo: string, mandaNube: boolean): Promise<string | null> {
  const cfg: Config = { token: token.trim(), repo: repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '') };
  if (!/^[\w.-]+\/[\w.-]+$/.test(cfg.repo)) return 'El repositorio debe tener la forma usuario/nombre.';
  if (!cfg.token) return 'Pega la clave de acceso.';
  let error: string | null;
  try {
    error = await comprobarRepo(cfg);
  } catch {
    return 'No se pudo conectar con GitHub. Comprueba la conexión.';
  }
  if (error) return error;
  guardarConfig({ ...cfg, primeraMandaNube: mandaNube });
  ultimaNube = null;
  poner({ activa: true, repo: cfg.repo, error: null });
  await sincronizar();
  return estadoNube.value.error;
}

/** La clave de este dispositivo (para llevarla al otro sin crear una nueva). */
export const claveNube = (): string | null => leerConfig()?.token || null;

/** Desconecta este dispositivo (sus datos se quedan; la nube no se toca). */
export function desconectarNube(): void {
  guardarConfig(null);
  ultimaNube = null;
  clearTimeout(temporizador);
  poner({ activa: false, repo: undefined, error: null });
}
