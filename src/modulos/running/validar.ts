// Validación del plan del entrenador (pura, con pruebas en tests/running.test.ts).
import type { PlanEntrenador } from './tipos';
import planBase from './datos/plan.json';

/** Plan del entrenador que trae la app (se actualiza con cada versión). */
export const PLAN_APP = planBase as unknown as PlanEntrenador;

/** El plan pegado en el dispositivo solo manda si es igual o más reciente que el de la app. */
export function elegirPlan(dispositivo: PlanEntrenador | null, app: PlanEntrenador = PLAN_APP): PlanEntrenador {
  if (dispositivo && (dispositivo.actualizado || '') >= (app.actualizado || '')) return dispositivo;
  return app;
}

/** Comprueba la forma mínima del plan. Devuelve el plan o un mensaje de error. */
export function validarPlan(obj: unknown): PlanEntrenador | string {
  if (!obj || typeof obj !== 'object') return 'No es un JSON con forma de plan.';
  const p = obj as PlanEntrenador;
  const semanas = p.plan?.semanas;
  if (semanas !== undefined && !Array.isArray(semanas)) return '«plan.semanas» debe ser una lista.';
  for (const s of semanas || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.lunes || '')) return `Una semana no tiene «lunes» con formato AAAA-MM-DD.`;
    if (!Array.isArray(s.dias)) return `La semana del ${s.lunes} no tiene «dias».`;
    for (const d of s.dias) if (!Array.isArray(d.sesiones)) return `El día ${d.fecha} no tiene «sesiones».`;
  }
  if (!semanas?.length && !p.diagnostico && !p.auditoria?.length) return 'El plan no tiene semanas, diagnóstico ni auditoría.';
  return p;
}
