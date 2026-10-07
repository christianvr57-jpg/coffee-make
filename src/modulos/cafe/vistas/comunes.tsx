// Piezas compartidas por las vistas del café.
import { useEffect, useState } from 'preact/hooks';
import { db } from '../../../core/db';
import { segundosATexto } from '../../../core/fechas';
import { fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { estadoReposo, ratio, textoRatio, congelado } from '../calculos';
import { metodo } from '../datos/metodos';
import { textoPuntuacion } from '../datos/catalogos';
import type { Cafe, Equipo, MetodoId, Preparacion, Receta } from '../modelo';

export function IconoMetodo({ id, tam = 36 }: { id: MetodoId; tam?: number }) {
  return (
    <span class="insignia insignia-cafe" style={{ '--tam': `${tam}px` }}>
      <Icono n={metodo(id).icono} t={Math.round(tam * 0.6)} />
    </span>
  );
}

export function Nota({ p, grande = false }: { p?: number; grande?: boolean }) {
  if (p === undefined || p === null) return <span class="nota vacia">–</span>;
  const nivel = p >= 8 ? 'alta' : p >= 6 ? 'media' : 'baja';
  return (
    <span class={`nota ${nivel}${grande ? ' grande' : ''}`} title={textoPuntuacion(p)}>
      {fmt(p, 1)}
    </span>
  );
}

const TEXTO_REPOSO = { temprano: 'reposando', optimo: 'en su punto', tarde: 'pasado de su ventana', 'sin-fecha': 'sin fecha de tueste' };

export function ChipReposo({ cafe, uso }: { cafe: Cafe; uso: 'filtro' | 'espresso' }) {
  if (congelado(cafe)) {
    return (
      <span class="chip-estado congelado">
        <Icono n="nieve" t={13} /> Congelado
      </span>
    );
  }
  const r = estadoReposo(cafe, uso);
  if (r.dias === undefined) return <span class="chip-estado">Sin fecha de tueste</span>;
  return (
    <span class={`chip-estado ${r.estado}`} title={`Ventana orientativa para ${uso}: días ${r.min}-${r.max}`}>
      Día {r.dias} · {TEXTO_REPOSO[r.estado]}
    </span>
  );
}

/** Barra de reposo con la ventana recomendada marcada. */
export function BarraReposo({ cafe, uso }: { cafe: Cafe; uso: 'filtro' | 'espresso' }) {
  const r = estadoReposo(cafe, uso);
  const tope = Math.max(r.max + 10, (r.dias || 0) + 3);
  const pct = (n: number) => `${Math.min(100, (n / tope) * 100)}%`;
  return (
    <div class="barra-reposo">
      <div class="br-cab">
        <span>{uso === 'filtro' ? 'Filtro' : 'Espresso'}</span>
        <span class="br-txt">
          {r.dias === undefined
            ? 'Sin fecha de tueste'
            : r.estado === 'temprano'
              ? `En su punto en ${r.min - r.dias} ${r.min - r.dias === 1 ? 'día' : 'días'}`
              : r.estado === 'optimo'
                ? `En su punto · días ${r.min}-${r.max}`
                : `Pasada su ventana (días ${r.min}-${r.max})`}
        </span>
      </div>
      <div class="br-pista">
        <div class="br-ventana" style={{ left: pct(r.min), width: `calc(${pct(r.max)} - ${pct(r.min)})` }} />
        {r.dias !== undefined && <div class={`br-hoy ${r.estado}`} style={{ left: pct(r.dias) }} />}
      </div>
    </div>
  );
}

export function textoMolienda(p: Pick<Preparacion, 'molienda' | 'molinoId'>, equipo: Equipo[] = []): string {
  if (p.molienda === undefined || p.molienda === null) return '';
  const m = equipo.find((e) => e.id === p.molinoId);
  const escala = m?.molino?.escala;
  const v = fmt(p.molienda, 1);
  return escala === 'clics' ? `${v} clics` : escala === 'numero' ? `pos. ${v}` : v;
}

/** "15 g · 1:16,7 · 22 clics · 3:12" */
export function resumenPrep(p: Preparacion, equipo: Equipo[] = []): string {
  const esp = p.metodo === 'espresso';
  return [
    esp ? `${fmt(p.dosis)} → ${fmt(p.rendimiento) || '?'} g` : `${fmt(p.dosis)} g`,
    textoRatio(ratio(p)),
    textoMolienda(p, equipo),
    p.tiempoTotal ? segundosATexto(p.tiempoTotal) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** "15 g · 1:16,7 · 3:00" (o "18 → 36 g · 25-30 s" en espresso) */
export function resumenReceta(r: Receta): string {
  const esp = r.metodo === 'espresso';
  const obj = r.tiempoObjetivo;
  const plan = r.fases.reduce((s, f) => s + (f.duracion || 0), 0);
  const tiempo = esp ? (obj ? `${obj[0]}-${obj[1]} s` : '') : plan ? segundosATexto(plan) : obj ? segundosATexto(Math.round((obj[0] + obj[1]) / 2 / 5) * 5) : '';
  return [esp ? `${fmt(r.dosis)} → ${fmt(r.rendimiento)} g` : `${fmt(r.dosis)} g`, textoRatio(ratio(r)), tiempo].filter(Boolean).join(' · ');
}

/** URL temporal para mostrar una foto guardada. */
export function useFoto(id?: string): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let u: string | undefined;
    if (id) {
      db.fotos.get(id).then((f) => {
        if (f) {
          u = URL.createObjectURL(f.blob);
          setUrl(u);
        }
      });
    } else setUrl(undefined);
    return () => u && URL.revokeObjectURL(u);
  }, [id]);
  return url;
}

export const descripcionCafe = (c: Cafe) => [c.pais, c.procesos[0], c.variedades[0]].filter(Boolean).join(' · ');
