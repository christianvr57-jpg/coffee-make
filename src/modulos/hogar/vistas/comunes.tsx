// Piezas compartidas por las vistas del hogar.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { Icono } from '../../../ui/Icono';
import { mostrarToast, ocultarToast } from '../../../ui/capas';
import { minutosATexto, hoyISO } from '../../../core/fechas';
import { rutina, estaHecha, marcar, desmarcar } from '../estado';

export const nombreCategoria = (id: string) => rutina.categorias[id]?.nombre || 'Casa';
export const claseCategoria = (id: string) => `cat-${rutina.categorias[id] ? id : 'casa'}`;

export function Insignia({ cat, tam = 32 }: { cat: string; tam?: number }) {
  const c = rutina.categorias[cat] || rutina.categorias.casa;
  return (
    <span class={`insignia ${claseCategoria(cat)}`} style={{ '--tam': `${tam}px` }}>
      <Icono n={c.icono} t={Math.round(tam * 0.58)} />
    </span>
  );
}

/** Casilla redonda con animación al marcar. */
export function Check({ hecha, onClick }: { hecha: boolean; onClick: () => void }) {
  return (
    <button type="button" class="check" role="checkbox" aria-checked={hecha} aria-label="Marcar como hecha" onClick={onClick}>
      <span class="check-aro">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path class="tick" d="M6 12.5l4 4 8-9" />
        </svg>
      </span>
    </button>
  );
}

/** Marca o desmarca y ofrece deshacer. Devuelve si ha quedado hecha. */
export function alternar(clave: string, titulo: string): boolean {
  if (estaHecha(clave)) {
    desmarcar(clave);
    ocultarToast();
    return false;
  }
  marcar(clave, hoyISO());
  mostrarToast(`Hecho: ${titulo}`, 'Deshacer', () => desmarcar(clave));
  return true;
}

/** Filas desplegadas (sobreviven al cambio de pestaña). */
export const abiertas = signal<Set<string>>(new Set());
const alternarAbierta = (clave: string) => {
  const s = new Set(abiertas.value);
  if (s.has(clave)) s.delete(clave);
  else s.add(clave);
  abiertas.value = s;
};

export function FilaTarea(p: { clave: string; titulo: string; categoria: string; minutos?: number; notas?: string; meta?: string; clase?: string }) {
  const hecha = estaHecha(p.clave);
  const [anim, setAnim] = useState(false);
  const abierta = abiertas.value.has(p.clave);
  const toque = () => {
    if (alternar(p.clave, p.titulo)) {
      setAnim(true);
      setTimeout(() => setAnim(false), 900);
    }
  };
  const meta = [nombreCategoria(p.categoria), p.minutos ? minutosATexto(p.minutos) : '', p.meta].filter(Boolean).join(' · ');
  return (
    <li class={`fila ${claseCategoria(p.categoria)}${hecha ? ' hecha' : ''}${p.notas ? ' con-notas' : ''}${abierta ? ' abierta' : ''}${anim ? ' acaba-de' : ''} ${p.clase || ''}`}>
      <Check hecha={hecha} onClick={toque} />
      <div
        class="fila-cuerpo"
        role={p.notas ? 'button' : undefined}
        aria-expanded={p.notas ? abierta : undefined}
        onClick={() => (p.notas ? alternarAbierta(p.clave) : toque())}
      >
        <div class="fila-titulo">
          <span class="tt">{p.titulo}</span>
        </div>
        <div class="fila-meta">
          <span>{meta}</span>
          {p.notas && <Icono n="chevronAbajo" t={13} clase="mini-chev" />}
        </div>
        {p.notas && (
          <div class="fila-notas">
            <div>
              <p>{p.notas}</p>
            </div>
          </div>
        )}
      </div>
      <Insignia cat={p.categoria} />
    </li>
  );
}
