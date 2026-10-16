// Progreso del hogar (puro, con pruebas en tests/hogar.test.ts): cuánto se hizo cada día, racha,
// semanas, categorías, lo que más se escapa y lo que se quedó pendiente de días anteriores.
import { addDays, iso, isoWeekday, lunesDe } from '../../core/fechas';
import { elementosDelDia, planDelDia, type ItemDia } from './calendario';
import type { AjustesHogar, Colada, Tarea } from './tipos';

type Modelo = { tareas: Tarea[]; coladas: Colada[] };

/** Un día se da por cumplido con el 80 % de lo que tocaba hecho. */
export const UMBRAL_CUMPLIDO = 0.8;

export interface DiaProgreso {
  fecha: string;
  total: number;
  hechas: number;
  /** Minutos de lo que se hizo. */
  minutos: number;
  items: ItemDia[];
}

export function progresoDia(modelo: Modelo, ajustes: AjustesHogar, hechas: Map<string, string>, d: Date): DiaProgreso {
  const items = elementosDelDia(planDelDia(modelo, ajustes, d));
  const hechos = items.filter((i) => hechas.has(i.clave));
  return { fecha: iso(d), total: items.length, hechas: hechos.length, minutos: hechos.reduce((s, i) => s + i.minutos, 0), items };
}

const fraccion = (d: Pick<DiaProgreso, 'total' | 'hechas'>) => (d.total ? d.hechas / d.total : 1);
export const cumplido = (d: Pick<DiaProgreso, 'total' | 'hechas'>) => d.total > 0 && fraccion(d) >= UMBRAL_CUMPLIDO;

export interface Progreso {
  /** De lunes a hoy, `semanas` semanas hacia atrás (hoy incluido). Antes de empezar a usar la app: null. */
  dias: (DiaProgreso | null)[];
  /** Días seguidos cumplidos hasta ayer (y hoy si ya está cumplido). */
  racha: number;
  mejorRacha: number;
  /** % hecho de cada semana (de la más antigua a la actual). */
  semanas: { lunes: string; pct: number | null }[];
  /** % hecho por categoría en los últimos 28 días. */
  categorias: { categoria: string; pct: number; total: number }[];
  /** Tareas que más se quedan sin hacer en los últimos 28 días (sin contar hoy). */
  escapan: { titulo: string; categoria: string; fallos: number; veces: number }[];
  /** Minutos dedicados en los últimos 7 días. */
  minutos7: number;
}

export function progreso(modelo: Modelo, ajustes: AjustesHogar, hechas: Map<string, string>, hoy: Date, semanas = 12): Progreso {
  const primerLunes = addDays(lunesDe(hoy), -7 * (semanas - 1));
  const inicio = ajustes.inicio || '0000';
  const hoyISO = iso(hoy);
  const dias: (DiaProgreso | null)[] = [];
  for (let d = primerLunes; iso(d) <= hoyISO; d = addDays(d, 1)) dias.push(iso(d) < inicio ? null : progresoDia(modelo, ajustes, hechas, d));
  const validos = dias.filter((d): d is DiaProgreso => !!d);

  // Rachas (hoy solo suma si ya está cumplido: el día aún no ha terminado).
  let racha = 0;
  for (let i = validos.length - 1; i >= 0; i--) {
    const d = validos[i];
    if (d.fecha === hoyISO && !cumplido(d)) continue;
    if (!d.total) continue;
    if (cumplido(d)) racha++;
    else break;
  }
  let mejorRacha = 0;
  let actual = 0;
  for (const d of validos) {
    if (!d.total) continue;
    if (cumplido(d)) mejorRacha = Math.max(mejorRacha, ++actual);
    else if (d.fecha !== hoyISO) actual = 0;
  }

  const sem: Progreso['semanas'] = [];
  for (let s = 0; s < semanas; s++) {
    const ds = dias.slice(s * 7, s * 7 + 7).filter((d): d is DiaProgreso => !!d);
    const total = ds.reduce((a, d) => a + d.total, 0);
    sem.push({ lunes: iso(addDays(primerLunes, 7 * s)), pct: total ? Math.round((100 * ds.reduce((a, d) => a + d.hechas, 0)) / total) : null });
  }

  const ultimos28 = validos.filter((d) => d.fecha > iso(addDays(hoy, -28)));
  const porCat = new Map<string, { hechas: number; total: number }>();
  const porTarea = new Map<string, { titulo: string; categoria: string; fallos: number; veces: number }>();
  for (const d of ultimos28) {
    for (const i of d.items) {
      const hecha = hechas.has(i.clave);
      const c = porCat.get(i.categoria) || { hechas: 0, total: 0 };
      c.total++;
      if (hecha) c.hechas++;
      porCat.set(i.categoria, c);
      if (d.fecha === hoyISO) continue;
      const t = porTarea.get(i.t.id) || { titulo: i.t.titulo, categoria: i.categoria, fallos: 0, veces: 0 };
      t.veces++;
      if (!hecha) t.fallos++;
      porTarea.set(i.t.id, t);
    }
  }
  const categorias = [...porCat.entries()].map(([categoria, c]) => ({ categoria, total: c.total, pct: Math.round((100 * c.hechas) / c.total) })).sort((a, b) => a.pct - b.pct);
  const escapan = [...porTarea.values()].filter((t) => t.fallos > 0).sort((a, b) => b.fallos / b.veces - a.fallos / a.veces || b.fallos - a.fallos).slice(0, 5);
  const minutos7 = validos.filter((d) => d.fecha > iso(addDays(hoy, -7))).reduce((s, d) => s + d.minutos, 0);

  return { dias, racha, mejorRacha, semanas: sem, categorias, escapan, minutos7 };
}

export interface Pendiente {
  item: ItemDia;
  /** Día en que tocaba. */
  fecha: string;
}

/**
 * Lo que se quedó sin hacer en días anteriores de esta semana: coladas y tareas de un día concreto
 * (no las diarias, que vuelven mañana, ni las periódicas, que ya se arrastran solas).
 */
export function pendientesSemana(modelo: Modelo, ajustes: AjustesHogar, hechas: Map<string, string>, hoy: Date): Pendiente[] {
  const res: Pendiente[] = [];
  const inicio = ajustes.inicio || '0000';
  for (let d = lunesDe(hoy); isoWeekday(d) < isoWeekday(hoy) && iso(d) < iso(hoy); d = addDays(d, 1)) {
    if (iso(d) < inicio) continue;
    const plan = planDelDia(modelo, ajustes, d);
    const g = plan.grupos;
    const candidatos: ItemDia[] = [...plan.coladas, ...[...g.manana, ...g.dia, ...g.fija, ...g.noche].filter((i) => i.t.frecuencia !== 'diaria')];
    for (const item of candidatos) if (!hechas.has(item.clave)) res.push({ item, fecha: iso(d) });
  }
  return res;
}
