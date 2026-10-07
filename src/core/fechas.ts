// Utilidades de fecha compartidas. Las fechas de calendario se manejan como "AAAA-MM-DD"
// y se convierten a Date a mediodía local para esquivar los cambios de horario.

const pad = (n: number) => String(n).padStart(2, '0');

export const iso = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyISO = (): string => iso(new Date());

export function parse(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
/** Lunes = 1 … domingo = 7 */
export const isoWeekday = (d: Date): number => d.getDay() || 7;
export const lunesDe = (d: Date): Date => addDays(d, 1 - isoWeekday(d));
export const diasEpoch = (d: Date): number => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
export const diasEntre = (a: Date, b: Date): number => diasEpoch(b) - diasEpoch(a);

export const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTOS = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
export const DIAS_INICIAL = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const MESES_CORTOS = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const fechaLarga = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth() + 1]}`;
export const fechaCorta = (d: Date) => `${d.getDate()} ${MESES_CORTOS[d.getMonth() + 1]}`;
export const diaCorto = (d: Date) => DIAS_CORTOS[isoWeekday(d)];

/** "hoy", "ayer", "lun 5 oct"… para listas */
export function fechaRelativa(ts: number | string): string {
  const d = typeof ts === 'number' ? new Date(ts) : parse(ts);
  const dif = diasEntre(d, new Date());
  if (dif === 0) return 'Hoy';
  if (dif === 1) return 'Ayer';
  if (dif > 1 && dif < 7) return DIAS[isoWeekday(d)];
  return `${diaCorto(d)} ${fechaCorta(d)}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`;
}

export const horaCorta = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const minutosATexto = (min: number): string => {
  min = Math.max(0, Math.round(min));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${pad(m)} min` : `${h} h`;
};

/** 95 → "1:35" */
export const segundosATexto = (s: number): string => {
  const neg = s < 0;
  s = Math.abs(Math.round(s));
  return `${neg ? '−' : ''}${Math.floor(s / 60)}:${pad(s % 60)}`;
};

/** "la de hoy", "la de ayer", "la del viernes", "la del lun 5 oct" (para referirse a una preparación). */
export function laDel(ts: number | string): string {
  const r = fechaRelativa(ts).toLowerCase();
  return r === 'hoy' || r === 'ayer' ? `la de ${r}` : `la del ${r}`;
}
