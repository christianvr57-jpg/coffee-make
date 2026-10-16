// Cálculos de running (puros, con pruebas en tests/running.test.ts): tiempos, ritmos, VDOT,
// zonas de ritmo y de frecuencia cardíaca y carga de entrenamiento.
// Ritmos en segundos por km; tiempos de carrera en segundos.
import { addDays, diasEntre, iso, parse } from '../../core/fechas';
import { esCarrera, type TipoSesion } from './tipos';

const pad = (n: number) => String(n).padStart(2, '0');

/** "41:00" | "1:02:30" → segundos (null si no es válido). */
export function leerTiempo(txt: string | undefined | null): number | null {
  const partes = String(txt ?? '').trim().split(':').map((p) => p.trim());
  if (!partes.length || partes.length > 3 || partes.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null;
  const s = partes.map(Number).reduce((acc, n) => acc * 60 + n, 0);
  return s > 0 ? s : null;
}

export function formatoTiempo(seg: number): string {
  const s = Math.round(seg);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
export const formatoRitmo = formatoTiempo;

// ---------- VDOT (Daniels y Gilbert, 1979) ----------
const costeO2 = (v: number) => -4.6 + 0.182258 * v + 0.000104 * v * v;
const fraccionSostenible = (t: number) => 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);

export function vdot(distanciaM: number, tiempoSeg: number): number {
  const t = tiempoSeg / 60;
  return costeO2(distanciaM / t) / fraccionSostenible(t);
}

/** Velocidad (m/min) a la que el coste de O2 es `vo2`. */
function velocidadPara(vo2: number): number {
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.6 - vo2;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}
export const ritmoAPorcentaje = (vd: number, pct: number) => 60000 / velocidadPara(vd * pct);

/** Tiempo equivalente en otra distancia para el mismo VDOT. */
export function tiempoEquivalente(vd: number, distanciaM: number): number {
  let lo = (distanciaM / 400) * 60;
  let hi = (distanciaM / 50) * 60;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (vdot(distanciaM, mid) > vd) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type IdZonaRitmo = 'E' | 'M' | 'T' | '10K' | 'I' | 'R';
export interface ZonaRitmo {
  id: IdZonaRitmo;
  nombre: string;
  /** Ritmo más rápido y más lento del rango (s/km): se muestra «desde–hasta». */
  desde: number;
  hasta: number;
  uso: string;
}

/** Zonas de ritmo a partir de una marca (porcentajes del VDOT habituales en la metodología de Daniels). */
export function zonasRitmo(distanciaM: number, tiempoSeg: number): { vdot: number; zonas: ZonaRitmo[] } {
  const vd = vdot(distanciaM, tiempoSeg);
  const r = (pct: number) => ritmoAPorcentaje(vd, pct);
  const r10k = tiempoEquivalente(vd, 10000) / 10;
  const r5k = tiempoEquivalente(vd, 5000) / 5;
  return {
    vdot: vd,
    zonas: [
      { id: 'E', nombre: 'Fácil / rodaje', desde: r(0.7), hasta: r(0.62), uso: 'Rodajes, tiradas largas y calentamientos. La mayor parte del volumen.' },
      { id: 'M', nombre: 'Ritmo maratón / aeróbico alto', desde: r(0.8), hasta: r(0.76), uso: 'Final de tiradas largas y progresivos. Con moderación.' },
      { id: 'T', nombre: 'Umbral', desde: r(0.89), hasta: r(0.86), uso: 'Tempo continuo de 20-30 min o intervalos largos.' },
      { id: '10K', nombre: 'Ritmo 10K', desde: r10k - 3, hasta: r10k + 3, uso: 'Repeticiones específicas de 1-3 km en la fase de ritmo de carrera.' },
      { id: 'I', nombre: 'VO2max / intervalos', desde: r5k - 8, hasta: r5k - 2, uso: 'Repeticiones de 3-5 min con recuperación similar o algo menor.' },
      { id: 'R', nombre: 'Repeticiones / economía', desde: r5k - 18, hasta: r5k - 10, uso: 'Repeticiones de 200-400 m con recuperación completa; rectas.' },
    ],
  };
}

export interface ZonaFC {
  id: string;
  nombre: string;
  min: number;
  max: number | null;
  uso: string;
}

/** Zonas de FC sobre la FC de umbral (porcentajes de Friel para carrera). */
export function zonasFC(fcUmbral: number, fcMax?: number | null): ZonaFC[] {
  const techo = (p: number) => Math.round(fcUmbral * p);
  const base: Omit<ZonaFC, 'min'>[] = [
    { id: 'Z1', nombre: 'Recuperación', max: techo(0.84), uso: 'Regenerativos y calentamientos.' },
    { id: 'Z2', nombre: 'Aeróbico', max: techo(0.89), uso: 'Techo de los rodajes fáciles.' },
    { id: 'Z3', nombre: 'Tempo', max: techo(0.94), uso: 'Zona «gris»: útil en dosis, no como rodaje habitual.' },
    { id: 'Z4', nombre: 'Subumbral – umbral', max: Math.round(fcUmbral) - 1, uso: 'Tempos e intervalos de umbral.' },
    { id: 'Z5', nombre: 'Por encima del umbral', max: fcMax || null, uso: 'Ritmo 10K al final y VO2max. La FC llega tarde: guíate por ritmo.' },
  ];
  return base.map((z, i) => ({ ...z, min: i ? (base[i - 1].max as number) + 1 : 0 }));
}

// ---------- Carga (sRPE de Foster: minutos × RPE 0-10) ----------
export interface RegistroCarga {
  fecha: string;
  tipo: TipoSesion;
  minutos?: number;
  km?: number;
  rpe?: number;
}

export const cargaSesion = (s: RegistroCarga) => (Number(s.minutos) || 0) * (Number(s.rpe) || 0);

export interface SemanaCarga {
  desde: string;
  hasta: string;
  km: number;
  minutosCarrera: number;
  sesiones: number;
  carga: number;
}

/** Resumen de los 28 días que terminan en `hasta` (incluido). */
export function resumenCarga(registros: RegistroCarga[], hasta = new Date()) {
  const fin = iso(hasta);
  const inicio28 = iso(addDays(hasta, -27));
  const dentro = registros.filter((r) => r.fecha >= inicio28 && r.fecha <= fin);
  const porDia = new Array(28).fill(0);
  const semanas: SemanaCarga[] = [0, 1, 2, 3].map((i) => ({ desde: iso(addDays(hasta, -27 + i * 7)), hasta: iso(addDays(hasta, -21 + i * 7)), km: 0, minutosCarrera: 0, sesiones: 0, carga: 0 }));
  for (const r of dentro) {
    const i = 27 - diasEntre(parse(r.fecha), hasta);
    if (i < 0 || i > 27) continue;
    porDia[i] += cargaSesion(r);
    const s = semanas[Math.floor(i / 7)];
    s.carga += cargaSesion(r);
    s.sesiones += 1;
    if (esCarrera(r.tipo)) {
      s.km += Number(r.km) || 0;
      s.minutosCarrera += Number(r.minutos) || 0;
    }
  }
  const aguda = semanas[3].carga;
  const cronica = semanas.reduce((a, s) => a + s.carga, 0) / 4;
  const ultimos7 = porDia.slice(21);
  const media = ultimos7.reduce((a, b) => a + b, 0) / 7;
  const sd = Math.sqrt(ultimos7.reduce((a, b) => a + (b - media) ** 2, 0) / 7);
  // Con menos de 4 semanas registradas, la relación aguda:crónica no significa nada.
  const primera = registros.length ? registros.map((r) => r.fecha).sort()[0] : null;
  const historialDias = primera ? Math.max(0, diasEntre(parse(primera), hasta) + 1) : 0;
  return {
    semanas,
    aguda,
    cronica,
    ratio: historialDias >= 28 && cronica > 0 ? aguda / cronica : null,
    monotonia: sd > 0 ? media / sd : null,
    historialDias,
  };
}

export function ritmoMedio(r: { km?: number; minutos?: number }): number | null {
  const km = Number(r.km);
  const min = Number(r.minutos);
  return km > 0 && min > 0 ? (min * 60) / km : null;
}

/** Semana del plan que contiene hoy (o la próxima, o la última). */
export function indiceSemanaActual(semanas: { lunes: string }[], hoy = new Date()): number {
  const h = iso(hoy);
  let idx = semanas.findIndex((s) => s.lunes <= h && h <= iso(addDays(parse(s.lunes), 6)));
  if (idx < 0) idx = semanas.findIndex((s) => s.lunes > h);
  if (idx < 0) idx = semanas.length - 1;
  return idx;
}
