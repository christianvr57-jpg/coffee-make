// Piezas compartidas por las vistas de Running.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { formatoRitmo, leerTiempo, zonasFC, zonasRitmo, type ZonaRitmo } from '../calculos';
import { datosZonas } from '../estado';
import { nombreTipo, type SesionPlan } from '../tipos';

export const kmTxt = (n: number) => fmt(n, 1);

/** Zonas actuales (las tuyas o las del plan del entrenador). */
export function zonasActuales() {
  const d = datosZonas();
  const t = leerTiempo(d.marca);
  return {
    datos: d,
    ritmo: t ? zonasRitmo(Number(d.distancia) || 10000, t) : null,
    fc: Number(d.fcUmbral) ? zonasFC(Number(d.fcUmbral), Number(d.fcMax) || null) : null,
  };
}

/** Sustituye {E}, {T}, {I}… por el rango de ritmo de tus zonas. */
export function ConRitmos({ texto, zonas }: { texto: string; zonas: ZonaRitmo[] | null }) {
  const partes = texto.split(/(\{(?:E|M|T|10K|I|R)\})/g);
  return (
    <>
      {partes.map((p) => {
        const m = p.match(/^\{(E|M|T|10K|I|R)\}$/);
        if (!m) return p;
        const z = zonas?.find((x) => x.id === m[1]);
        return z ? (
          <b class="ritmo-zona">
            {formatoRitmo(z.desde)}–{formatoRitmo(z.hasta)}/km
          </b>
        ) : (
          <b class="ritmo-zona">ritmo {m[1]}</b>
        );
      })}
    </>
  );
}

/** Ficha de una sesión (del plan o de la biblioteca). */
export function DetalleSesion({ s, zonas }: { s: SesionPlan; zonas: ZonaRitmo[] | null }) {
  const filas: [string, string | undefined][] = [
    ['Duración', [s.duracion ? `${s.duracion} min` : '', s.km ? `~${kmTxt(s.km)} km` : ''].filter(Boolean).join(' · ')],
    ['Calentamiento', s.calentamiento],
    ['Bloque principal', s.principal],
    ['Recuperaciones', s.recuperaciones],
    ['Vuelta a la calma', s.vuelta],
    ['Ritmo', s.ritmo],
    ['Intensidad', [s.zona, s.rpe ? `RPE ${s.rpe}` : ''].filter(Boolean).join(' · ') || s.intensidad],
    ['Objetivo', s.objetivo],
    ['Notas', s.notas || s.nota],
  ];
  return (
    <dl class="run-dl">
      {filas
        .filter(([, v]) => v && v.trim() && v.trim() !== '—')
        .map(([k, v]) => (
          <div>
            <dt>{k}</dt>
            <dd>
              <ConRitmos texto={v!} zonas={zonas} />
            </dd>
          </div>
        ))}
    </dl>
  );
}

export function Plegable({ titulo, sub, children, inicial = false }: { titulo: string; sub?: string; children: ComponentChildren; inicial?: boolean }) {
  const [abierto, setAbierto] = useState(inicial);
  return (
    <section class={`run-plegable${abierto ? ' abierto' : ''}`}>
      <button type="button" class="run-plegable-cab" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        <span>
          <b>{titulo}</b>
          {sub && <small>{sub}</small>}
        </span>
        <Icono n="chevronAbajo" t={18} clase="mini-chev" />
      </button>
      {abierto && <div class="run-plegable-cuerpo">{children}</div>}
    </section>
  );
}

export const metaSesion = (s: SesionPlan) => [nombreTipo(s.tipo), s.duracion ? `${s.duracion} min` : '', s.km ? `~${kmTxt(s.km)} km` : '', s.zona].filter(Boolean).join(' · ');

/** Copia un texto al portapapeles; si el navegador no deja, lo muestra para copiarlo a mano. */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
