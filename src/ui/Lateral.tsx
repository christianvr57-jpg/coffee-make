// Ordenador: barra lateral con los módulos (y las secciones del que está abierto), el buscador y
// los ajustes, y la cabecera de cada sección. Sustituye a la barra de pestañas del móvil.
import { seccionDe, type ModuloApp, type Seccion } from '../core/modulos';
import { visibles } from '../core/registro';
import { ir } from '../core/router';
import { Icono } from './Icono';
import { IndicadorNube } from '../vistas/Nube';

export const esMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Lateral({ path, modulo }: { path: string; modulo?: ModuloApp }) {
  const seccion = modulo && seccionDe(modulo, path);
  return (
    <aside class="lateral" aria-label="Navegación">
      <a class="lat-marca" href="#/">
        <img src="icons/icon-192.png" alt="" width={30} height={30} />
        <span>Coffee Make</span>
      </a>
      <button type="button" class="lat-buscar" onClick={() => ir('/buscar')}>
        <Icono n="buscar" t={16} />
        <span>Buscar</span>
        <kbd>{esMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      <nav class="lat-nav">
        <a class={`lat-item${path === '/' ? ' activo' : ''}`} href="#/" aria-current={path === '/' ? 'page' : undefined}>
          <span class="lat-ico neutro">
            <Icono n="inicio" t={17} />
          </span>
          Inicio
        </a>
        <div class="lat-tit">Módulos</div>
        {visibles.value.map((m) => {
          const abierto = modulo?.id === m.id;
          return (
            <div class={`lat-modulo ${m.tema}${abierto ? ' abierto' : ''}`}>
              <a class={`lat-item${abierto ? ' activo' : ''}`} href={`#${m.rutaInicio}`}>
                <span class="lat-ico">
                  <Icono n={m.icono} t={17} />
                </span>
                {m.nombre}
              </a>
              {abierto && (
                <div class="lat-secciones">
                  {m.secciones.map((s) => (
                    <a class={`lat-sub${s.id === seccion?.id ? ' activo' : ''}`} href={`#${s.ruta}`} aria-current={s.ruta === path ? 'page' : undefined}>
                      {s.nombre}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div class="lat-pie">
        <a class={`lat-item${path === '/ajustes' ? ' activo' : ''}`} href="#/ajustes">
          <span class="lat-ico neutro">
            <Icono n="ajustes" t={17} />
          </span>
          Ajustes y datos
        </a>
        <IndicadorNube />
        <p class="lat-version">Versión {__VERSION__}</p>
      </div>
    </aside>
  );
}

/** Cabecera de una sección en el ordenador: módulo arriba y nombre de la sección. */
export function CabeceraSeccion({ modulo, seccion }: { modulo: ModuloApp; seccion: Seccion }) {
  return (
    <header class="cab-escritorio">
      <div>
        <div class="ce-sobre">
          <Icono n={modulo.icono} t={16} />
          {modulo.nombre}
        </div>
        <h1>{seccion.nombre}</h1>
      </div>
    </header>
  );
}
