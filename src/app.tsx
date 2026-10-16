// Carcasa de la app: pantalla según la ruta + barra de pestañas (móvil) o barra lateral (ordenador).
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { ModuloApp } from './core/modulos';
import { escritorio } from './core/pantalla';
import { coincide, ir, ruta } from './core/router';
import { fijados, MODULOS } from './core/registro';
import { BarraSecciones } from './ui/Cabecera';
import { Capas, ocultarToast } from './ui/capas';
import { Icono } from './ui/Icono';
import { CabeceraSeccion, Lateral } from './ui/Lateral';
import { Inicio } from './vistas/Inicio';
import { Mas } from './vistas/Mas';
import { Ajustes, aplicarImportacion } from './vistas/Ajustes';
import { Buscar } from './vistas/Buscar';

interface Resuelta {
  vista: JSX.Element;
  pestana: string;
  tema: string;
  completa: boolean;
  modulo?: ModuloApp;
}

function resolver(path: string): Resuelta {
  if (path === '/' || path === '') return { vista: <Inicio />, pestana: 'inicio', tema: '', completa: false };
  if (path === '/mas') return { vista: <Mas />, pestana: 'mas', tema: '', completa: false };
  if (path === '/ajustes') return { vista: <Ajustes />, pestana: 'mas', tema: '', completa: false };
  if (path === '/buscar') return { vista: <Buscar />, pestana: 'inicio', tema: '', completa: false };
  for (const m of MODULOS) {
    for (const r of m.rutas) {
      const params = coincide(r.patron, path);
      if (!params) continue;
      const seccion = m.secciones.find((s) => s.ruta === path);
      const V = r.vista;
      return {
        vista: (
          <>
            {seccion && (escritorio.value ? <CabeceraSeccion modulo={m} seccion={seccion} /> : <BarraSecciones secciones={m.secciones} activa={seccion.ruta} />)}
            <V params={params} />
          </>
        ),
        pestana: fijados.value.includes(m.id) ? m.id : 'mas',
        tema: m.tema,
        completa: !!r.pantallaCompleta,
        modulo: m,
      };
    }
  }
  return { vista: <Inicio />, pestana: 'inicio', tema: '', completa: false };
}

const escribiendo = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Atajos de teclado del ordenador: Ctrl/⌘ K o «/» para buscar. */
function useAtajos() {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        ir('/buscar');
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !escribiendo(e.target)) {
        e.preventDefault();
        ir('/buscar');
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);
}

/** Ordenador: arrastrar a la ventana una copia de seguridad (.json) la importa. */
function useSoltarCopia(): boolean {
  const [encima, setEncima] = useState(false);
  useEffect(() => {
    let contador = 0;
    const conArchivo = (e: DragEvent) => !!e.dataTransfer && [...e.dataTransfer.types].includes('Files');
    const entra = (e: DragEvent) => {
      if (!conArchivo(e)) return;
      e.preventDefault();
      contador++;
      setEncima(true);
    };
    const sobre = (e: DragEvent) => {
      if (conArchivo(e)) e.preventDefault();
    };
    const sale = (e: DragEvent) => {
      if (!conArchivo(e)) return;
      contador = Math.max(0, contador - 1);
      if (!contador) setEncima(false);
    };
    const suelta = async (e: DragEvent) => {
      if (!conArchivo(e)) return;
      e.preventDefault();
      contador = 0;
      setEncima(false);
      const f = e.dataTransfer?.files?.[0];
      if (f && /\.json$/i.test(f.name)) aplicarImportacion(await f.text());
    };
    window.addEventListener('dragenter', entra);
    window.addEventListener('dragover', sobre);
    window.addEventListener('dragleave', sale);
    window.addEventListener('drop', suelta);
    return () => {
      window.removeEventListener('dragenter', entra);
      window.removeEventListener('dragover', sobre);
      window.removeEventListener('dragleave', sale);
      window.removeEventListener('drop', suelta);
    };
  }, []);
  return encima;
}

export function App() {
  const path = ruta.value.split('?')[0];
  const { vista, pestana, tema, completa, modulo } = resolver(path);
  const esc = escritorio.value;
  useAtajos();
  const soltando = useSoltarCopia();

  useEffect(() => {
    window.scrollTo(0, 0);
    ocultarToast();
  }, [path]);

  const pestanas = [
    { id: 'inicio', nombre: 'Inicio', icono: 'inicio', ruta: '/' },
    ...MODULOS.filter((m) => fijados.value.includes(m.id)).map((m) => ({ id: m.id, nombre: m.nombre, icono: m.icono, ruta: m.rutaInicio })),
    { id: 'mas', nombre: 'Más', icono: 'mas', ruta: '/mas' },
  ];

  return (
    <div class={`${tema}${esc ? ' escritorio' : ''}`}>
      {!esc && <div class="barra-estado" />}
      {esc && !completa && <Lateral path={path} modulo={modulo} />}
      <main class={`vista${completa ? ' completa' : ''}`} key={path}>
        {vista}
      </main>
      {!esc && !completa && (
        <nav class="tabbar" aria-label="Secciones">
          {pestanas.map((t) => (
            <button
              type="button"
              class="tab"
              aria-current={pestana === t.id ? 'page' : undefined}
              onClick={() => (pestana === t.id && path === t.ruta ? window.scrollTo({ top: 0, behavior: 'smooth' }) : ir(t.ruta))}
            >
              <Icono n={t.icono} t={26} />
              <span>{t.nombre}</span>
            </button>
          ))}
        </nav>
      )}
      {soltando && (
        <div class="soltar-copia">
          <div>
            <Icono n="descargar" t={40} />
            <b>Suelta la copia de seguridad para importarla</b>
            <span>El archivo .json que exportaste en el iPhone (Ajustes → Exportar copia)</span>
          </div>
        </div>
      )}
      <Capas />
    </div>
  );
}
