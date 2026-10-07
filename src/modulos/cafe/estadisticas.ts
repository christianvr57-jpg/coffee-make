// Estadísticas del diario de café (puras, con pruebas en tests/estadisticas.test.ts).
import { addDays, fechaCorta, iso, lunesDe } from '../../core/fechas';
import type { Cafe, MetodoId, Preparacion } from './modelo';

export const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);

export function enPeriodo(preps: Preparacion[], dias: number | null, ahora = Date.now()): Preparacion[] {
  if (dias === null) return preps;
  const desde = ahora - dias * 86400000;
  return preps.filter((p) => p.fecha >= desde);
}

/** Coste de una preparación según el precio y el peso del paquete. */
export function costePrep(p: Preparacion, cafes: Cafe[]): number | undefined {
  const c = cafes.find((x) => x.id === p.cafeId);
  if (!c?.precio || !c.pesoG || !p.dosis) return undefined;
  return (p.dosis * c.precio) / c.pesoG;
}

export interface Resumen {
  n: number;
  cafes: number;
  media?: number;
  gramos: number;
  coste?: number;
  costeTaza?: number;
  /** Preparaciones con coste conocido. */
  conCoste: number;
}

export function resumen(preps: Preparacion[], cafes: Cafe[]): Resumen {
  const costes = preps.map((p) => costePrep(p, cafes)).filter((x): x is number => x !== undefined);
  const coste = costes.length ? costes.reduce((a, b) => a + b, 0) : undefined;
  return {
    n: preps.length,
    cafes: new Set(preps.map((p) => p.cafeId).filter(Boolean)).size,
    media: media(preps.filter((p) => p.puntuacion !== undefined).map((p) => p.puntuacion!)),
    gramos: preps.reduce((s, p) => s + (p.dosis || 0), 0),
    coste,
    costeTaza: coste !== undefined ? coste / costes.length : undefined,
    conCoste: costes.length,
  };
}

/** Preparaciones por semana (de lunes a domingo), las últimas `semanas`. */
export function porSemana(preps: Preparacion[], semanas = 12, ahora = new Date()): { etiqueta: string; desde: string; n: number }[] {
  const lunes = lunesDe(ahora);
  const res: { etiqueta: string; desde: string; n: number }[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const ini = addDays(lunes, -7 * i);
    const fin = addDays(ini, 7);
    const a = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate()).getTime();
    const b = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate()).getTime();
    res.push({ etiqueta: fechaCorta(ini), desde: iso(ini), n: preps.filter((p) => p.fecha >= a && p.fecha < b).length });
  }
  return res;
}

export interface FilaMetodo {
  metodo: MetodoId;
  n: number;
  media?: number;
  mejor?: Preparacion;
}

export function porMetodo(preps: Preparacion[]): FilaMetodo[] {
  const m = new Map<MetodoId, Preparacion[]>();
  for (const p of preps) m.set(p.metodo, [...(m.get(p.metodo) || []), p]);
  return [...m]
    .map(([metodo, ps]) => {
      const puntuadas = ps.filter((p) => p.puntuacion !== undefined);
      return { metodo, n: ps.length, media: media(puntuadas.map((p) => p.puntuacion!)), mejor: mejorDe(puntuadas) };
    })
    .sort((a, b) => b.n - a.n);
}

/** La de mejor nota; a igualdad, la más reciente. */
export function mejorDe(ps: Preparacion[]): Preparacion | undefined {
  return ps.filter((p) => p.puntuacion !== undefined).sort((a, b) => b.puntuacion! - a.puntuacion! || b.fecha - a.fecha)[0];
}

export interface MejorReceta {
  cafeId?: string;
  cafeNombre: string;
  terminado: boolean;
  metodo: MetodoId;
  mejor: Preparacion;
  n: number;
}

/** Mejor preparación por café y método: tu "receta buena" de cada combinación. */
export function mejoresRecetas(preps: Preparacion[], cafes: Cafe[]): MejorReceta[] {
  const g = new Map<string, Preparacion[]>();
  for (const p of preps) {
    const k = `${p.cafeId || p.cafeNombre || '?'}|${p.metodo}`;
    g.set(k, [...(g.get(k) || []), p]);
  }
  const res: MejorReceta[] = [];
  for (const ps of g.values()) {
    const mejor = mejorDe(ps);
    if (!mejor) continue;
    const c = cafes.find((x) => x.id === mejor.cafeId);
    res.push({ cafeId: mejor.cafeId, cafeNombre: c?.nombre || mejor.cafeNombre || 'Sin registrar', terminado: !!c?.terminado, metodo: mejor.metodo, mejor, n: ps.length });
  }
  return res.sort((a, b) => Number(a.terminado) - Number(b.terminado) || a.cafeNombre.localeCompare(b.cafeNombre) || b.mejor.puntuacion! - a.mejor.puntuacion!);
}

/** Notas en orden cronológico con media móvil (para ver si vas mejorando). */
export function evolucionNota(preps: Preparacion[], ventana = 5): { t: number; nota: number; movil: number; id: string }[] {
  const ps = preps.filter((p) => p.puntuacion !== undefined).sort((a, b) => a.fecha - b.fecha);
  return ps.map((p, i) => {
    const desde = Math.max(0, i - ventana + 1);
    return { t: p.fecha, nota: p.puntuacion!, movil: media(ps.slice(desde, i + 1).map((x) => x.puntuacion!))!, id: p.id };
  });
}

/** Combinaciones café + método con al menos 3 preparaciones puntuadas y con molienda anotada. */
export function combosAjuste(preps: Preparacion[]): { cafeId: string; cafeNombre: string; metodo: MetodoId; molinoId?: string; n: number }[] {
  const g = new Map<string, Preparacion[]>();
  for (const p of preps) {
    if (!p.cafeId || p.puntuacion === undefined || p.molienda === undefined) continue;
    const k = `${p.cafeId}|${p.metodo}|${p.molinoId || ''}`;
    g.set(k, [...(g.get(k) || []), p]);
  }
  return [...g.values()]
    .filter((ps) => ps.length >= 3)
    .map((ps) => ({ cafeId: ps[0].cafeId!, cafeNombre: ps[0].cafeNombre || '', metodo: ps[0].metodo, molinoId: ps[0].molinoId, n: ps.length }))
    .sort((a, b) => b.n - a.n);
}

/** Puntos molienda → nota de una combinación. */
export function puntosAjuste(preps: Preparacion[], cafeId: string, m: MetodoId, molinoId?: string) {
  return preps
    .filter((p) => p.cafeId === cafeId && p.metodo === m && (p.molinoId || '') === (molinoId || '') && p.puntuacion !== undefined && p.molienda !== undefined)
    .map((p) => ({ x: p.molienda!, y: p.puntuacion!, id: p.id, t: p.fecha }));
}
