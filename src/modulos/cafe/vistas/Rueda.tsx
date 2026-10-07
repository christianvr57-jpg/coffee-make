// Rueda de sabores interactiva: de lo general a lo específico.
// Nivel 0: familias · nivel 1: grupos de una familia · nivel 2: matices de un grupo.
// Cada nivel muestra porciones grandes (fáciles de tocar en el móvil) y, alrededor, el anillo del nivel siguiente.
import { useState } from 'preact/hooks';
import { Icono } from '../../../ui/Icono';
import { INDICE_SABORES, RUEDA, type NodoSabor } from '../datos/rueda';

const C = 180;
const TAU = Math.PI * 2;

function punto(r: number, a: number): string {
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
}
function arco(r0: number, r1: number, a0: number, a1: number): string {
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${punto(r1, a0)} A ${r1} ${r1} 0 ${grande} 1 ${punto(r1, a1)} L ${punto(r0, a1)} A ${r0} ${r0} 0 ${grande} 0 ${punto(r0, a0)} Z`;
}

function Etiqueta({ r, a, texto, clase }: { r: number; a: number; texto: string; clase: string }) {
  let grados = (a * 180) / Math.PI - 90;
  if (a > Math.PI) grados += 180;
  const x = C + r * Math.sin(a);
  const y = C - r * Math.cos(a);
  return (
    <text class={clase} x={x} y={y} transform={`rotate(${grados.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} text-anchor="middle" dominant-baseline="central">
      {texto}
    </text>
  );
}

export function Rueda({ seleccion, cambiar }: { seleccion: string[]; cambiar: (v: string[]) => void }) {
  const [camino, setCamino] = useState<string[]>([]);
  const [q, setQ] = useState('');

  const familia = camino[0] ? RUEDA.find((f) => f.id === camino[0])! : null;
  const grupo = familia && camino[1] ? familia.hijos.find((g) => g.id === camino[1])! : null;
  const actual: NodoSabor | null = grupo || familia;
  const items: NodoSabor[] = grupo ? grupo.hijos || [] : familia ? familia.hijos : RUEDA;
  const nivel = grupo ? 2 : familia ? 1 : 0;

  const contiene = (id: string) => seleccion.some((s) => s === id || s.startsWith(`${id}/`));
  const alternar = (id: string) => cambiar(seleccion.includes(id) ? seleccion.filter((s) => s !== id) : [...seleccion, id]);

  const entrar = (n: NodoSabor) => {
    if (nivel === 0) {
      const f = RUEDA.find((x) => x.id === n.id)!;
      setCamino(f.hijos.length === 1 ? [f.id, f.hijos[0].id] : [f.id]);
    } else if (nivel === 1) setCamino([camino[0], n.id]);
    else alternar(n.id);
  };
  const volver = () => {
    if (nivel === 2 && familia && familia.hijos.length > 1) setCamino([camino[0]]);
    else setCamino([]);
  };

  const r0 = 54;
  const r1 = nivel === 2 ? 176 : 148;
  const paso = TAU / items.length;
  const color = (n: NodoSabor) => INDICE_SABORES.get(n.id)!.familia.color;

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const resultados = q.trim().length >= 2 ? [...INDICE_SABORES.values()].filter((x) => norm(x.nodo.nombre).includes(norm(q.trim()))).slice(0, 12) : [];

  return (
    <div class="rueda">
      <svg viewBox="0 0 360 360" role="group" aria-label="Rueda de sabores">
        {items.map((n, i) => {
          const a0 = i * paso;
          const a1 = (i + 1) * paso;
          const marcado = nivel === 2 ? seleccion.includes(n.id) : contiene(n.id);
          const hijos = n.hijos || [];
          return (
            <g class={`rueda-porcion${marcado ? ' marcada' : ''}`} onClick={() => entrar(n)} role="button" aria-label={n.nombre} aria-pressed={nivel === 2 ? marcado : undefined}>
              <path d={arco(r0, r1, a0 + 0.004, a1 - 0.004)} style={{ fill: color(n) }} class="rp-fondo" />
              {nivel < 2 &&
                hijos.map((h, j) => {
                  const b0 = a0 + (j * (a1 - a0)) / hijos.length;
                  const b1 = a0 + ((j + 1) * (a1 - a0)) / hijos.length;
                  return <path d={arco(r1 + 3, 176, b0 + 0.006, b1 - 0.006)} style={{ fill: color(n) }} class={`rp-hijo${contiene(h.id) ? ' marcada' : ''}`} />;
                })}
              <Etiqueta r={(r0 + r1) / 2} a={(a0 + a1) / 2} texto={n.corto || n.nombre} clase="rp-texto" />
            </g>
          );
        })}
        <g class="rueda-centro" onClick={nivel ? volver : undefined} role={nivel ? 'button' : undefined} aria-label={nivel ? 'Volver' : undefined}>
          <circle cx={C} cy={C} r={r0 - 3} />
          {nivel ? (
            <>
              <text x={C} y={C - 9} text-anchor="middle" class="rc-atras">‹ volver</text>
              <text x={C} y={C + 10} text-anchor="middle" class="rc-nombre">{(actual?.corto || actual?.nombre || '').slice(0, 12)}</text>
            </>
          ) : (
            <>
              <text x={C} y={C - 6} text-anchor="middle" class="rc-nombre">Sabores</text>
              <text x={C} y={C + 12} text-anchor="middle" class="rc-atras">{seleccion.length ? `${seleccion.length} marcados` : 'toca una familia'}</text>
            </>
          )}
        </g>
      </svg>

      {actual && (
        <button type="button" class={`chip rueda-general${seleccion.includes(actual.id) ? ' activo' : ''}`} aria-pressed={seleccion.includes(actual.id)} style={{ '--c': color(actual) }} onClick={() => alternar(actual.id)}>
          {seleccion.includes(actual.id) ? <Icono n="check" t={16} /> : null}
          {nivel === 2 ? `«${actual.nombre}» en general` : `Algo ${actual.nombre.toLowerCase()} en general`}
        </button>
      )}

      <div class="buscador">
        <Icono n="buscar" t={18} />
        <input type="search" placeholder="Buscar un sabor (fresa, cacao…)" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      </div>
      {resultados.length > 0 && (
        <div class="chips">
          {resultados.map((x) => (
            <button type="button" class="chip" style={{ '--c': x.familia.color }} aria-pressed={seleccion.includes(x.nodo.id)} onClick={() => alternar(x.nodo.id)}>
              {x.ruta.join(' › ')}
            </button>
          ))}
        </div>
      )}

      {seleccion.length > 0 && (
        <div class="chips sabores-elegidos">
          {seleccion.map((id) => (
            <button type="button" class="chip sabor" style={{ '--c': INDICE_SABORES.get(id)?.familia.color }} onClick={() => alternar(id)} aria-label={`Quitar ${INDICE_SABORES.get(id)?.nodo.nombre}`}>
              {INDICE_SABORES.get(id)?.nodo.nombre || id}
              <Icono n="cerrar" t={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Chips de sabores de solo lectura (detalle, listados). */
export function ChipsSabores({ ids, max }: { ids: string[]; max?: number }) {
  const lista = max ? ids.slice(0, max) : ids;
  return (
    <div class="chips sabores-elegidos">
      {lista.map((id) => (
        <span class="chip sabor estatico" style={{ '--c': INDICE_SABORES.get(id)?.familia.color }}>
          {INDICE_SABORES.get(id)?.nodo.nombre || id}
        </span>
      ))}
      {max && ids.length > max && <span class="chip estatico">+{ids.length - max}</span>}
    </div>
  );
}
