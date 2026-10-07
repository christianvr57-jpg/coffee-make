// Lógica de calendario del hogar (pura, sin DOM): qué toca cada día.
import { iso, parse, addDays, isoWeekday, lunesDe, diasEpoch, diasEntre } from '../../core/fechas';
import type { Colada, Tarea, AjustesHogar, Frecuencia, Momento } from './tipos';

const pad = (n: number) => String(n).padStart(2, '0');

export { iso, parse, addDays, isoWeekday, lunesDe };

/** n-ésimo (1-4) día de la semana `wd` del mes `mes` (1-12). */
export function nEsimoDia(year: number, mes: number, n: number, wd: number): Date {
  const primero = new Date(year, mes - 1, 1, 12);
  const desfase = (wd - isoWeekday(primero) + 7) % 7;
  return new Date(year, mes - 1, 1 + desfase + 7 * (n - 1), 12);
}

export const LONGITUD: Partial<Record<Frecuencia, number>> = { mensual: 1, trimestral: 3, semestral: 6, anual: 12 };
export const esPeriodica = (t: Pick<Tarea, 'frecuencia'>): boolean => t.frecuencia in LONGITUD;

export interface Periodo {
  clave: string;
  year: number;
  inicioMes: number;
  inicio: Date;
  fin: Date;
}

/** Periodo natural (mes, trimestre, semestre o año) que contiene la fecha. */
export function periodoDe(freq: Frecuencia, d: Date): Periodo {
  const len = LONGITUD[freq] ?? 1;
  const year = d.getFullYear();
  const inicioMes = Math.floor(d.getMonth() / len) * len;
  const inicio = new Date(year, inicioMes, 1, 12);
  const fin = new Date(year, inicioMes + len, 0, 12);
  let clave: string;
  if (freq === 'mensual') clave = `${year}-${pad(inicioMes + 1)}`;
  else if (freq === 'trimestral') clave = `${year}-T${inicioMes / 3 + 1}`;
  else if (freq === 'semestral') clave = `${year}-S${inicioMes / 6 + 1}`;
  else clave = `${year}`;
  return { clave, year, inicioMes, inicio, fin };
}

/** Fecha en la que "salta" la tarea periódica dentro de su periodo (o null si el mes no está activo). */
export function fechaProgramada(t: Tarea, per: Periodo): Date | null {
  const plan = t.plan || { semana: 1, dia: 1, mes: 1 };
  const mesRel = t.frecuencia === 'mensual' ? 0 : Math.max(1, plan.mes || 1) - 1;
  const mes = per.inicioMes + mesRel + 1;
  if (t.frecuencia === 'mensual' && t.meses && !t.meses.includes(mes)) return null;
  return nEsimoDia(per.year, mes, plan.semana || 1, plan.dia || 1);
}

/** Tipo de semana (A/B) de la semana que contiene la fecha. */
export function tipoSemana(d: Date, ajustes: Pick<AjustesHogar, 'semanaAuto' | 'semanaAncla'>): 'A' | 'B' {
  const { semanaAuto, semanaAncla } = ajustes;
  if (!semanaAuto) return semanaAncla.tipo;
  const semanas = Math.round(diasEntre(lunesDe(parse(semanaAncla.lunes)), lunesDe(d)) / 7);
  const par = ((semanas % 2) + 2) % 2 === 0;
  const otro = semanaAncla.tipo === 'A' ? 'B' : 'A';
  return par ? semanaAncla.tipo : otro;
}

function tocaHoy(t: Tarea, d: Date, ajustes: AjustesHogar): boolean {
  if (t.requiere === 'camaBaja' && !ajustes.camaBaja) return false;
  if (t.frecuencia === 'diaria') {
    if (t.cadaDias && t.cadaDias > 1) return diasEpoch(d) % t.cadaDias === 0;
    return true;
  }
  if (t.frecuencia === 'semanal') {
    if (!(t.dias || []).includes(isoWeekday(d))) return false;
    if (t.semana && t.semana !== tipoSemana(d, ajustes)) return false;
    return true;
  }
  return false;
}

/** Instancia de una tarea periódica que está "viva" en la fecha d, o null. */
export function instanciaPeriodica(t: Tarea, d: Date, ajustes: AjustesHogar): { clave: string; due: string; fin: string } | null {
  if (t.requiere === 'camaBaja' && !ajustes.camaBaja) return null;
  const per = periodoDe(t.frecuencia, d);
  const due = fechaProgramada(t, per);
  if (!due) return null;
  const dueISO = iso(due);
  const hoy = iso(d);
  if (dueISO > hoy || hoy > iso(per.fin)) return null;
  // No arrastra lo que ya había "saltado" antes de empezar a usar la app.
  if (ajustes.inicio && dueISO < ajustes.inicio) return null;
  return { clave: per.clave, due: dueISO, fin: iso(per.fin) };
}

export interface ItemDia {
  tipo: 'tarea' | 'colada';
  t: Tarea | Colada;
  clave: string;
  minutos: number;
  categoria: string;
  due?: string;
  fin?: string;
  nueva?: boolean;
}
export interface ItemTarea extends ItemDia {
  tipo: 'tarea';
  t: Tarea;
}
export interface ItemColada extends ItemDia {
  tipo: 'colada';
  t: Colada;
}

export interface PlanDia {
  dia: string;
  wd: number;
  tipo: 'A' | 'B';
  coladas: ItemColada[];
  grupos: Record<Momento, ItemTarea[]>;
  periodicas: ItemTarea[];
}

/** Plan completo de un día. */
export function planDelDia(modelo: { tareas: Tarea[]; coladas: Colada[] }, ajustes: AjustesHogar, d: Date): PlanDia {
  const dia = iso(d);
  const wd = isoWeekday(d);
  const tipo = tipoSemana(d, ajustes);
  const grupos: Record<Momento, ItemTarea[]> = { manana: [], dia: [], fija: [], noche: [] };
  const periodicas: ItemTarea[] = [];

  const coladas: ItemColada[] = modelo.coladas
    .filter((c) => c.dia === wd && (!c.semana || c.semana === tipo))
    .map((c) => ({ tipo: 'colada', t: c, clave: `${c.id}@${dia}`, minutos: c.minutos || 0, categoria: 'ropa' }));

  for (const t of modelo.tareas) {
    if (esPeriodica(t)) {
      const inst = instanciaPeriodica(t, d, ajustes);
      if (inst) {
        periodicas.push({
          tipo: 'tarea', t, clave: `${t.id}@${inst.clave}`, minutos: t.minutos || 0,
          categoria: t.categoria, due: inst.due, fin: inst.fin, nueva: inst.due === dia,
        });
      }
    } else if (tocaHoy(t, d, ajustes)) {
      const g: Momento = t.momento && t.momento in grupos ? t.momento : 'fija';
      grupos[g].push({ tipo: 'tarea', t, clave: `${t.id}@${dia}`, minutos: t.minutos || 0, categoria: t.categoria });
    }
  }
  return { dia, wd, tipo, coladas, grupos, periodicas };
}

/** Elementos que cuentan para el anillo y el tiempo restante del día. */
export function elementosDelDia(plan: PlanDia): ItemDia[] {
  const g = plan.grupos;
  return [...plan.coladas, ...g.manana, ...g.dia, ...g.fija, ...g.noche, ...plan.periodicas.filter((p) => p.nueva)];
}

/** Próxima fecha programada (>= d) de una tarea periódica. */
export function proximaFecha(t: Tarea, d: Date): Date | null {
  const hoy = iso(d);
  for (let i = 0; i < 14; i++) {
    const ref = new Date(d.getFullYear(), d.getMonth() + i, 1, 12);
    const due = fechaProgramada(t, periodoDe(t.frecuencia, ref));
    if (due && iso(due) >= hoy) return due;
  }
  return null;
}
