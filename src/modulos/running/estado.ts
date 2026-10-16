// Estado del módulo Running. Todo vive solo en el dispositivo:
//  - plan del entrenador (ajuste "running:plan"), que se carga pegando o abriendo un JSON;
//  - tus datos (ajuste "running:datos"): respuestas de la auditoría, zonas propias y sesiones del
//    plan marcadas como hechas;
//  - sesiones registradas (tabla running_registros), que entran en la copia de seguridad.
import { signal } from '@preact/signals';
import { borrar, db, escribirAjuste, guardar, leerAjuste, vivos } from '../../core/db';
import type { DatosZonas, PlanEntrenador, RegistroRun } from './tipos';
import { validarPlan } from './validar';

export interface DatosRunning {
  respuestas: Record<string, string>;
  zonas: Partial<DatosZonas>;
  /** id de sesión del plan → true o id del registro asociado. */
  hechas: Record<string, true | string>;
}

const DATOS_INICIALES: DatosRunning = { respuestas: {}, zonas: {}, hechas: {} };

export const plan = signal<PlanEntrenador | null>(null);
export const datos = signal<DatosRunning>(DATOS_INICIALES);

export async function iniciarRunning(): Promise<void> {
  const p = await db.ajustes.get('running:plan');
  plan.value = (p?.valor as PlanEntrenador) || null;
  datos.value = await leerAjuste<DatosRunning>('running:datos', DATOS_INICIALES);
}

async function guardarDatos(d: DatosRunning) {
  datos.value = d;
  await escribirAjuste('running:datos', d);
}

// ---------- Plan del entrenador ----------

export async function cargarPlan(texto: string): Promise<PlanEntrenador> {
  let obj: unknown;
  try {
    obj = JSON.parse(texto);
  } catch {
    throw new Error('El texto no es un JSON válido. Copia el plan completo, desde la primera llave { hasta la última }.');
  }
  // Se aceptan también copias de la app antigua o envoltorios { plan: … }.
  const o = obj as { running?: unknown; app?: string };
  if (o.app === 'rutina-hogar') throw new Error('Eso es una copia de la app antigua: impórtala desde Ajustes → Importar copia.');
  const r = validarPlan(obj);
  if (typeof r === 'string') throw new Error(r);
  // La guía general ya está en la app: no se guarda la del JSON si viene incluida.
  const { guia: _g, ...limpio } = r as PlanEntrenador & { guia?: unknown };
  await db.ajustes.put({ clave: 'running:plan', valor: limpio, actualizado: Date.now() });
  plan.value = limpio;
  return limpio;
}

export async function borrarPlan(): Promise<void> {
  await db.ajustes.delete('running:plan');
  plan.value = null;
}

// ---------- Auditoría y zonas ----------

export const responder = (id: string, valor: string) => {
  const respuestas = { ...datos.value.respuestas };
  if (valor.trim()) respuestas[id] = valor;
  else delete respuestas[id];
  return guardarDatos({ ...datos.value, respuestas });
};

/** Zonas efectivas: las tuyas o, si no hay, las del plan del entrenador. */
export function datosZonas(): Partial<DatosZonas> {
  return { ...(plan.value?.perfil?.zonas || {}), ...datos.value.zonas };
}

export function cambiarZonas(parcial: Partial<DatosZonas>) {
  const zonas = { ...datos.value.zonas, ...parcial };
  for (const k of Object.keys(zonas) as (keyof DatosZonas)[]) if (zonas[k] === undefined || (zonas[k] as unknown) === '') delete zonas[k];
  return guardarDatos({ ...datos.value, zonas });
}

export const restablecerZonas = () => guardarDatos({ ...datos.value, zonas: {} });

// ---------- Sesiones hechas y registro ----------

export const sesionHecha = (id: string) => Boolean(datos.value.hechas[id]);

export function marcarSesion(id: string, valor: true | string | null) {
  const hechas = { ...datos.value.hechas };
  if (valor) hechas[id] = valor;
  else delete hechas[id];
  return guardarDatos({ ...datos.value, hechas });
}

export const listarRegistros = async () => vivos(await db.running_registros.toArray()).sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.creado - a.creado));

export async function guardarRegistro(r: Partial<RegistroRun>): Promise<RegistroRun> {
  const reg = await guardar<RegistroRun>('running_registros', { ...r, borrado: null });
  if (r.sesionId) await marcarSesion(r.sesionId, reg.id);
  return reg;
}

export async function eliminarRegistro(r: RegistroRun): Promise<void> {
  await borrar('running_registros', r.id);
  if (r.sesionId && datos.value.hechas[r.sesionId] === r.id) await marcarSesion(r.sesionId, true);
}

export async function borrarDatosRunning(): Promise<void> {
  await guardarDatos(DATOS_INICIALES);
  const ids = (await db.running_registros.toArray()).map((r) => r.id);
  for (const id of ids) await borrar('running_registros', id);
}

/** Importa los datos de running de una copia de la app antigua «Rutina del hogar». */
export async function importarLegadoRunning(obj: { respuestas?: Record<string, string>; zonas?: Partial<DatosZonas>; registros?: Record<string, unknown>[]; hechas?: Record<string, true | string> }): Promise<number> {
  const mapa = new Map<string, string>();
  let n = 0;
  for (const r of obj.registros || []) {
    const id = String(r.id || '');
    const reg = await guardar<RegistroRun>('running_registros', { ...(r as Partial<RegistroRun>), id: undefined, demo: false, borrado: null });
    if (id) mapa.set(id, reg.id);
    n++;
  }
  const hechas: DatosRunning['hechas'] = {};
  for (const [k, v] of Object.entries(obj.hechas || {})) hechas[k] = v === true ? true : mapa.get(String(v)) || true;
  await guardarDatos({
    respuestas: { ...datos.value.respuestas, ...(obj.respuestas || {}) },
    zonas: { ...datos.value.zonas, ...(obj.zonas || {}) },
    hechas: { ...datos.value.hechas, ...hechas },
  });
  return n + Object.keys(obj.respuestas || {}).length;
}
