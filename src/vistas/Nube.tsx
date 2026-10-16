// Sincronización en la nube: estado, conectar este dispositivo (con instrucciones paso a paso para
// crear la clave de GitHub) y desconectar.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { escritorio } from '../core/pantalla';
import { REPO_POR_DEFECTO, claveNube, conectarNube, desconectarNube, estadoNube, sincronizar } from '../core/nube';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../ui/capas';
import { Campo, FilaBoton, Lista, Texto } from '../ui/form';
import { Icono } from '../ui/Icono';

const URL_CLAVE = 'https://github.com/settings/personal-access-tokens/new';

/** "hace un momento", "hace 5 min", "a las 9:41"… */
function haceCuanto(ts: number, ahora = Date.now()): string {
  const s = Math.round((ahora - ts) / 1000);
  if (s < 45) return 'hace un momento';
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const d = new Date(ts);
  const hora = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return new Date(ahora).toDateString() === d.toDateString() ? `a las ${hora}` : `el ${d.getDate()}/${d.getMonth() + 1} a las ${hora}`;
}

/** Repinta cada 30 s para que «hace X min» no se quede viejo. */
function useReloj() {
  const [, set] = useState(0);
  useEffect(() => {
    const t = setInterval(() => set((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);
}

export function textoEstadoNube(): string {
  const e = estadoNube.value;
  if (!e.activa) return 'Sin activar';
  if (e.sincronizando) return 'Sincronizando…';
  if (e.error) return 'Sin sincronizar';
  return e.ultima ? `Sincronizado ${haceCuanto(e.ultima)}` : 'Conectado';
}

/** Línea de estado compacta (barra lateral del ordenador). */
export function IndicadorNube() {
  useReloj();
  const e = estadoNube.value;
  return (
    <a class={`indicador-nube${e.error ? ' error' : ''}${e.sincronizando ? ' girando' : ''}`} href="#/ajustes" title={e.error || 'Sincronización en la nube'}>
      <Icono n="nube" t={16} />
      <span>{textoEstadoNube()}</span>
    </a>
  );
}

function Paso({ n, children }: { n: number; children: ComponentChildren }) {
  return (
    <li class="paso-nube">
      <span class="run-num">{n}</span>
      <div>{children}</div>
    </li>
  );
}

function Conectar({ cerrar }: { cerrar: () => void }) {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState(REPO_POR_DEFECTO);
  const [manda, setManda] = useState<'aqui' | 'nube'>(escritorio.value ? 'nube' : 'aqui');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const pegar = async () => {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (t) setToken(t);
    } catch {
      mostrarToast('No se pudo leer el portapapeles: pégala a mano');
    }
  };
  return (
    <Hoja
      titulo="Sincronizar en la nube"
      cerrar={cerrar}
      guardar={ocupado ? 'Conectando…' : 'Conectar'}
      onGuardar={async () => {
        if (ocupado) return false;
        setOcupado(true);
        setError(null);
        const e = await conectarNube(token, repo, manda === 'nube');
        setOcupado(false);
        if (e) {
          setError(e);
          return false;
        }
        mostrarToast('Sincronización activada');
      }}
    >
      <p class="ayuda nube-intro">
        Tus datos se guardan en un repositorio <b>privado</b> de tu cuenta de GitHub (<code>{REPO_POR_DEFECTO}</code>, ya creado). Cada dispositivo necesita una <b>clave de acceso</b> que solo sirve para ese repositorio. Se crea una vez y vale para el iPhone y el ordenador.
      </p>

      <div class="tit-lista">1 · Crear la clave en GitHub</div>
      <ol class="lista bloque-texto pasos-nube">
        <Paso n={1}>
          Abre{' '}
          <a class="enlace" href={URL_CLAVE} target="_blank" rel="noopener noreferrer">
            github.com → nueva clave (fine-grained token)
          </a>{' '}
          con tu cuenta.
        </Paso>
        <Paso n={2}>
          <b>Token name:</b> Coffee Make. <b>Expiration:</b> la más larga que te deje (o «No expiration»).
        </Paso>
        <Paso n={3}>
          <b>Repository access:</b> «Only select repositories» y elige <b>coffee-make-datos</b>.
        </Paso>
        <Paso n={4}>
          <b>Permissions → Repository permissions → Contents:</b> «Read and write». No hace falta nada más.
        </Paso>
        <Paso n={5}>
          Pulsa <b>Generate token</b> y copia la clave (empieza por <code>github_pat_</code>). GitHub solo la enseña una vez: guárdala en tus notas para el otro dispositivo.
        </Paso>
      </ol>

      <Lista titulo="2 · Pegarla aquí">
        <Campo et="Clave" col clase={error ? 'error' : ''}>
          <input type="password" value={token} placeholder="github_pat_…" autocomplete="off" spellcheck={false} onInput={(e) => setToken((e.target as HTMLInputElement).value)} />
        </Campo>
        <FilaBoton icono="copiar" texto="Pegar desde el portapapeles" onClick={pegar} />
      </Lista>

      <div class="tit-lista">3 · Si hay diferencias la primera vez, ¿qué manda?</div>
      <div class="lista">
        <button type="button" class="opcion opcion-larga" aria-pressed={manda === 'aqui'} onClick={() => setManda('aqui')}>
          <span>
            <b>Lo de este dispositivo</b>
            <small>Elígelo en el primero que conectes (el iPhone, que tiene tus datos de verdad).</small>
          </span>
          {manda === 'aqui' && <Icono n="check" t={20} />}
        </button>
        <button type="button" class="opcion opcion-larga" aria-pressed={manda === 'nube'} onClick={() => setManda('nube')}>
          <span>
            <b>Lo que ya hay en la nube</b>
            <small>Elígelo en el segundo (el ordenador): se trae todo lo del iPhone sin pisarlo.</small>
          </span>
          {manda === 'nube' && <Icono n="check" t={20} />}
        </button>
      </div>
      <p class="pie">Solo afecta a la primera sincronización y solo a lo que esté en los dos lados con valores distintos. Lo que solo existe en un lado se conserva siempre.</p>

      {error && (
        <div class="aviso-suave atencion">
          <Icono n="aviso" t={18} />
          <span>{error}</span>
        </div>
      )}

      <details class="nube-avanzado">
        <summary>Repositorio (avanzado)</summary>
        <div class="lista">
          <Campo et="usuario/nombre" col>
            <Texto valor={repo} cambiar={setRepo} />
          </Campo>
        </div>
      </details>
    </Hoja>
  );
}

export const abrirConectarNube = () => abrirHoja((cerrar) => <Conectar cerrar={cerrar} />);

/** Bloque de Ajustes. */
export function SeccionNube() {
  useReloj();
  const e = estadoNube.value;
  if (!e.activa) {
    return (
      <>
        <div class="tit-lista">Sincronización en la nube</div>
        <div class="lista bloque-texto nube-off">
          <p>
            <Icono n="nube" t={20} />
            <span>
              Activa la sincronización y lo que cambies en el iPhone aparecerá en el ordenador y al revés, en segundos. Gratis, con tu cuenta de GitHub y en un repositorio privado.
            </span>
          </p>
          <button type="button" class="boton-principal" onClick={abrirConectarNube}>
            <Icono n="nube" t={20} /> Activar en este dispositivo
          </button>
        </div>
      </>
    );
  }
  const copiarClave = async () => {
    const c = claveNube();
    if (!c) return;
    try {
      await navigator.clipboard.writeText(c);
      mostrarToast('Clave copiada: pégala en el otro dispositivo');
    } catch {
      avisar('No se pudo copiar', 'Usa la clave que guardaste al crearla.');
    }
  };
  return (
    <Lista
      titulo="Sincronización en la nube"
      pie={
        <>
          Se sincroniza sola al abrir la app, al volver a ella, a los pocos segundos de cada cambio y cada 30 segundos mientras está abierta. Las fotos de los paquetes de café se quedan en cada dispositivo. Repositorio: <code>{e.repo}</code>.
        </>
      }
    >
      <div class={`campo estado-nube${e.error ? ' error' : ''}`}>
        <Icono n={e.error ? 'aviso' : 'nube'} t={22} />
        <div class="et">
          {textoEstadoNube()}
          {e.error && <small>{e.error}</small>}
        </div>
      </div>
      <FilaBoton icono="reiniciar" texto={e.sincronizando ? 'Sincronizando…' : 'Sincronizar ahora'} onClick={() => sincronizar()} />
      <FilaBoton icono="copiar" texto="Copiar la clave para otro dispositivo" onClick={copiarClave} />
      {e.error && /clave|repositorio/i.test(e.error) && <FilaBoton icono="nube" texto="Volver a conectar con otra clave" onClick={abrirConectarNube} />}
      <FilaBoton
        icono="cerrar"
        texto="Desconectar este dispositivo"
        peligro
        onClick={async () => {
          if (await confirmar({ titulo: '¿Desconectar este dispositivo?', texto: 'Deja de sincronizarse. Sus datos se quedan aquí y la nube no se toca.', ok: 'Desconectar', peligro: true })) {
            desconectarNube();
            mostrarToast('Sincronización desactivada en este dispositivo');
          }
        }}
      />
    </Lista>
  );
}
