// Reparto de las tareas periódicas por las semanas de su periodo.
// Cada tarea periódica se guarda con un "plan": { mes, semana, dia }
//   mes    → mes dentro del periodo (1-3 trimestral, 1-6 semestral, 1-12 anual; ignorado en mensual)
//   semana → 1-4: es el n-ésimo día de la semana de ese mes
//   dia    → 1 (lunes) … 7 (domingo)
// Cualquier mes tiene al menos cuatro de cada día de la semana, así que el plan vale siempre.

import { esperaPeriodo } from './schedule.js';

// Meses naturales (1-12) en los que la tarea "salta" a lo largo de un año.
export function mesesActivos(t) {
  const len = esperaPeriodo[t.frecuencia];
  const meses = [];
  for (let ini = 0; ini < 12; ini += len) {
    const m = t.frecuencia === 'mensual' ? ini + 1 : ini + Math.max(1, (t.plan && t.plan.mes) || 1);
    if (t.frecuencia === 'mensual' && t.meses && !t.meses.includes(m)) continue;
    meses.push(m);
  }
  return meses;
}

// Minutos fijos de cada día de la semana (coladas + tareas semanales), para no cargar los días densos.
function cargaBase(modelo) {
  const base = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const c of modelo.coladas) base[c.dia] += c.minutos || 0;
  for (const t of modelo.tareas) {
    if (t.frecuencia === 'semanal') for (const d of t.dias || []) base[d] += t.minutos || 0;
  }
  return base;
}

function mapaDeCarga(modelo, excluirId) {
  const cuenta = {}; // "mes|semana|dia" → nº de tareas
  const minSemana = {}; // "mes|semana" → minutos
  for (const t of modelo.tareas) {
    if (t.id === excluirId || !(t.frecuencia in esperaPeriodo) || !t.plan) continue;
    for (const mes of mesesActivos(t)) {
      const k = `${mes}|${t.plan.semana}|${t.plan.dia}`;
      cuenta[k] = (cuenta[k] || 0) + 1;
      const s = `${mes}|${t.plan.semana}`;
      minSemana[s] = (minSemana[s] || 0) + (t.minutos || 0);
    }
  }
  return { cuenta, minSemana };
}

// Elige el hueco (semana, día) menos cargado. `tarea` debe traer frecuencia y, si procede, mes.
export function sugerirPlan(modelo, tarea, opciones = {}) {
  const dias = opciones.dias || [1, 2, 3, 4, 5, 6];
  const base = cargaBase(modelo);
  const { cuenta, minSemana } = mapaDeCarga(modelo, tarea.id);
  const pesada = (tarea.minutos || 0) >= 30;
  const mes = tarea.plan ? tarea.plan.mes : (tarea.mes || 1);
  const meses = mesesActivos({ ...tarea, plan: { mes } });
  let mejor = null;
  for (let semana = 1; semana <= 4; semana++) {
    for (const dia of dias) {
      let coste = 0;
      for (const m of meses) {
        coste += 1000 * (cuenta[`${m}|${semana}|${dia}`] || 0);
        coste += 4 * (minSemana[`${m}|${semana}`] || 0);
      }
      coste = coste / meses.length + 0.6 * base[dia];
      if (dia === 7) coste += 500;
      if (pesada && dia === 6) coste -= 90;
      if (!mejor || coste < mejor.coste - 1e-9) mejor = { coste, plan: { mes, semana, dia } };
    }
  }
  return mejor.plan;
}
