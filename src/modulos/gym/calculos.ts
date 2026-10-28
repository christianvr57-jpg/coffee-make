// Cálculos del Gym (puros, con pruebas en tests/gym.test.ts): 1RM estimado, volumen, récords, lo que
// hiciste la última vez, sugerencia de progresión y series por grupo muscular.
import { addDays, iso, parse } from '../../core/fechas';
import type { Ejercicio, Grupo, SerieGym, SesionGym, TipoRegistro } from './tipos';

/** 1RM estimado (Epley). Con 1 repetición, el propio peso; por encima de 12 reps la estimación es poco fiable. */
export function e1rm(peso?: number, reps?: number): number {
  if (!peso || !reps || peso <= 0 || reps <= 0) return 0;
  return reps === 1 ? peso : peso * (1 + reps / 30);
}

/** Series que cuentan: hechas y que no son de calentamiento. */
export const efectivas = (series: SerieGym[]) => series.filter((s) => s.hecha && s.tipo !== 'calentamiento');

/** Volumen (kg × reps) de unas series. Con lastre en ejercicios de peso corporal, solo el lastre. */
export function volumen(series: SerieGym[]): number {
  return efectivas(series).reduce((t, s) => t + (s.peso && s.peso > 0 && s.reps ? s.peso * s.reps : 0), 0);
}

export function volumenSesion(s: SesionGym): number {
  return s.ejercicios.reduce((t, e) => t + volumen(e.series), 0);
}

export const seriesHechas = (s: SesionGym) => s.ejercicios.reduce((t, e) => t + efectivas(e.series).length, 0);

/** Duración en minutos (hasta ahora si sigue en curso). */
export const duracionMin = (s: SesionGym, ahora = Date.now()) => Math.max(0, Math.round(((s.fin || ahora) - s.inicio) / 60000));

/** Puntuación de una serie para comparar «mejor» según el tipo de registro. */
export function marca(tipo: TipoRegistro, s: SerieGym): number {
  if (tipo === 'peso') return e1rm(s.peso, s.reps);
  if (tipo === 'reps') return (s.reps || 0) * (1 + Math.max(0, s.peso || 0) / 100);
  if (tipo === 'tiempo') return (s.segundos || 0) * (1 + Math.max(0, s.peso || 0) / 100);
  return s.km || s.minutos || 0;
}

export interface Historial {
  sesionId: string;
  fecha: string;
  series: SerieGym[];
  mejor: number;
}

/** Cada vez que hiciste un ejercicio (de la más antigua a la más reciente). */
export function historialEjercicio(sesiones: SesionGym[], ej: Pick<Ejercicio, 'id' | 'tipo'>): Historial[] {
  const res: Historial[] = [];
  for (const s of [...sesiones].sort((a, b) => a.inicio - b.inicio)) {
    if (s.borrado) continue;
    const series = s.ejercicios.filter((x) => x.ejercicioId === ej.id).flatMap((x) => efectivas(x.series));
    if (!series.length) continue;
    res.push({ sesionId: s.id, fecha: s.fecha, series, mejor: Math.max(...series.map((x) => marca(ej.tipo, x))) });
  }
  return res;
}

/** Series de la última sesión anterior en la que hiciste el ejercicio. */
export function anterior(sesiones: SesionGym[], ejercicioId: string, antesDe: number): SerieGym[] {
  const previas = sesiones.filter((s) => !s.borrado && s.inicio < antesDe && s.ejercicios.some((e) => e.ejercicioId === ejercicioId)).sort((a, b) => b.inicio - a.inicio);
  for (const s of previas) {
    const series = s.ejercicios.filter((e) => e.ejercicioId === ejercicioId).flatMap((e) => e.series.filter((x) => x.hecha));
    if (series.length) return series;
  }
  return [];
}

/** Máximo de un rango de repeticiones ("8-12" → 12, "10" → 10, "al fallo" → null). */
export function repsMax(objetivo?: string): number | null {
  const m = (objetivo || '').match(/(\d+)\s*(?:-|–|a)\s*(\d+)/);
  if (m) return Number(m[2]);
  const n = (objetivo || '').match(/^\s*(\d+)\s*$/);
  return n ? Number(n[1]) : null;
}

/** Incremento de peso razonable según el material. */
export const incremento = (equipo: string) => (equipo === 'mancuernas' || equipo === 'kettlebell' ? 2 : equipo === 'maquina' || equipo === 'polea' ? 5 : 2.5);

/**
 * Doble progresión: si la última vez llegaste al máximo del rango en todas las series con el mismo
 * peso, toca subir; si no, intenta sumar repeticiones con el mismo peso.
 */
export function sugerencia(previas: SerieGym[], objetivo: string | undefined, ej: Pick<Ejercicio, 'tipo' | 'equipo'>): string | null {
  const ef = efectivas(previas);
  if (ej.tipo !== 'peso' || !ef.length) return null;
  const max = repsMax(objetivo);
  const pesos = ef.map((s) => s.peso || 0);
  const peso = Math.max(...pesos);
  const conPeso = ef.filter((s) => (s.peso || 0) === peso);
  if (max && conPeso.length === ef.length && ef.every((s) => (s.reps || 0) >= max)) {
    const nuevo = Math.round((peso + incremento(ej.equipo)) * 4) / 4;
    return `La última vez llegaste a ${max} en todas: prueba con ${String(nuevo).replace('.', ',')} kg.`;
  }
  return `Objetivo: igualar ${String(peso).replace('.', ',')} kg y sumar alguna repetición.`;
}

export interface RecordGym {
  ejercicioId: string;
  fecha: string;
  valor: number;
  serie: SerieGym;
}

/** Récords (mejor marca de siempre) conseguidos en una sesión, frente a todo lo anterior. */
export function recordsDeSesion(sesion: SesionGym, sesiones: SesionGym[], buscar: (id: string) => Pick<Ejercicio, 'id' | 'tipo'> | undefined): RecordGym[] {
  const res: RecordGym[] = [];
  for (const ej of sesion.ejercicios) {
    const def = buscar(ej.ejercicioId);
    if (!def) continue;
    const ef = efectivas(ej.series);
    if (!ef.length) continue;
    const mejorHoy = ef.reduce((b, s) => (marca(def.tipo, s) > marca(def.tipo, b) ? s : b));
    const valorHoy = marca(def.tipo, mejorHoy);
    const antes = historialEjercicio(
      sesiones.filter((s) => s.id !== sesion.id && s.inicio < sesion.inicio),
      def,
    );
    const mejorAntes = antes.length ? Math.max(...antes.map((h) => h.mejor)) : 0;
    if (antes.length && valorHoy > mejorAntes + 1e-9 && !res.some((r) => r.ejercicioId === def.id)) res.push({ ejercicioId: def.id, fecha: sesion.fecha, valor: valorHoy, serie: mejorHoy });
  }
  return res;
}

/** Series efectivas por grupo muscular (principal = 1; secundario = 0,5) entre dos fechas. */
export function seriesPorGrupo(sesiones: SesionGym[], desde: string, hasta: string, buscar: (id: string) => Pick<Ejercicio, 'grupo' | 'secundarios'> | undefined): Map<Grupo, number> {
  const m = new Map<Grupo, number>();
  for (const s of sesiones) {
    if (s.borrado || s.fecha < desde || s.fecha > hasta) continue;
    for (const e of s.ejercicios) {
      const def = buscar(e.ejercicioId);
      if (!def) continue;
      const n = efectivas(e.series).length;
      if (!n) continue;
      m.set(def.grupo, (m.get(def.grupo) || 0) + n);
      for (const g of def.secundarios) m.set(g, (m.get(g) || 0) + n / 2);
    }
  }
  return m;
}

/** Sesiones, series y volumen de las últimas `n` semanas (de lunes a domingo), de la más antigua a la actual. */
export function porSemana(sesiones: SesionGym[], hoy: Date, n = 8) {
  const lunesHoy = addDays(hoy, 1 - (hoy.getDay() || 7));
  return Array.from({ length: n }, (_, i) => {
    const lunes = addDays(lunesHoy, -7 * (n - 1 - i));
    const desde = iso(lunes);
    const hasta = iso(addDays(lunes, 6));
    const ss = sesiones.filter((s) => !s.borrado && s.fecha >= desde && s.fecha <= hasta);
    return { lunes: desde, sesiones: ss.length, series: ss.reduce((t, s) => t + seriesHechas(s), 0), volumen: ss.reduce((t, s) => t + volumenSesion(s), 0) };
  });
}

/** "62,5 kg × 8", "12 reps (+10 kg)", "45 s", "20 min · 3,2 km". */
export function textoSerie(tipo: TipoRegistro, s: SerieGym): string {
  const n = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');
  if (tipo === 'peso') return `${n(s.peso || 0)} kg × ${s.reps || 0}`;
  if (tipo === 'reps') return `${s.reps || 0} reps${s.peso ? ` (${s.peso > 0 ? '+' : '−'}${n(Math.abs(s.peso))} kg)` : ''}`;
  if (tipo === 'tiempo') return `${s.segundos || 0} s${s.peso ? ` con ${n(s.peso)} kg` : ''}`;
  return [s.minutos ? `${n(s.minutos)} min` : '', s.km ? `${n(s.km)} km` : ''].filter(Boolean).join(' · ') || '—';
}

/** Días desde la última sesión (null si no hay ninguna). */
export function diasDesdeUltima(sesiones: SesionGym[], hoy: string): number | null {
  const fechas = sesiones.filter((s) => !s.borrado && s.fin).map((s) => s.fecha).sort();
  if (!fechas.length) return null;
  return Math.round((parse(hoy).getTime() - parse(fechas[fechas.length - 1]).getTime()) / 86400000);
}
