// Lógica del calendario (pura, con pruebas en tests/calendario.test.ts): rejilla del mes, patrones
// de turnos rotativos, recuento del mes y próximos recordatorios.
import { addDays, iso, lunesDe, parse } from '../../core/fechas';
import type { NotaDia, Turno } from './tipos';

/** Semanas (lunes a domingo) que cubren el mes; `mes` de 1 a 12. Siempre 6 filas para que no salte. */
export function rejillaMes(año: number, mes: number): Date[][] {
  const primero = new Date(año, mes - 1, 1, 12);
  const inicio = lunesDe(primero);
  return Array.from({ length: 6 }, (_, s) => Array.from({ length: 7 }, (_, d) => addDays(inicio, s * 7 + d)));
}

/** Mes desplazado: `n` meses desde (año, mes). */
export function moverMes(año: number, mes: number, n: number): { año: number; mes: number } {
  const t = año * 12 + (mes - 1) + n;
  return { año: Math.floor(t / 12), mes: (t % 12) + 1 };
}

/** Lee un patrón como "MMTTNNLL" o "M M T T N N L L" (también minúsculas). Letras desconocidas: error. */
export function leerPatron(texto: string): Turno[] | null {
  const letras = texto.toUpperCase().replace(/[\s,·-]/g, '').split('');
  if (!letras.length || letras.some((l) => !'LMTN'.includes(l))) return null;
  return letras as Turno[];
}

/** Turnos de `dias` días seguidos desde `desde`, repitiendo el patrón. */
export function aplicarPatron(desde: string, patron: Turno[], dias: number): { fecha: string; turno: Turno }[] {
  const d0 = parse(desde);
  return Array.from({ length: dias }, (_, i) => ({ fecha: iso(addDays(d0, i)), turno: patron[i % patron.length] }));
}

/** Cuántos días de cada turno hay en un mes. */
export function recuentoMes(turnos: Map<string, Turno>, año: number, mes: number): Record<Turno, number> {
  const r: Record<Turno, number> = { M: 0, T: 0, N: 0, L: 0 };
  const pref = `${año}-${String(mes).padStart(2, '0')}-`;
  for (const [f, t] of turnos) if (f.startsWith(pref)) r[t]++;
  return r;
}

/** Notas desde hoy durante `dias` días, por fecha (las hechas al final de cada día). */
export function proximas(notas: NotaDia[], hoy: string, dias: number): NotaDia[] {
  const hasta = iso(addDays(parse(hoy), dias - 1));
  return notas
    .filter((n) => !n.borrado && n.fecha >= hoy && n.fecha <= hasta)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : Number(!!a.hecha) - Number(!!b.hecha) || a.creado - b.creado));
}

/** "hoy", "mañana", "en 3 días"… */
export function cuandoEs(fecha: string, hoy: string): string {
  const dias = Math.round((parse(fecha).getTime() - parse(hoy).getTime()) / 86400000);
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias === -1) return 'ayer';
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`;
}
