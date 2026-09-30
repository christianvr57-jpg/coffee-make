// Lógica de calendario pura (sin DOM): qué toca cada día.
// Semana: lunes = 1 … domingo = 7. Fechas como cadenas ISO "AAAA-MM-DD".

const pad = (n) => String(n).padStart(2, '0');

export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Mediodía local para esquivar los saltos de horario de verano.
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};
export const addDays = (d, n) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
  return r;
};
export const isoWeekday = (d) => d.getDay() || 7;
export const lunesDe = (d) => addDays(d, 1 - isoWeekday(d));
export const diasEpoch = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
export const diasEntre = (a, b) => diasEpoch(b) - diasEpoch(a);

// n-ésimo (1-4) día de la semana `wd` del mes `mes` (1-12).
export function nEsimoDia(year, mes, n, wd) {
  const primero = new Date(year, mes - 1, 1, 12);
  const desfase = (wd - isoWeekday(primero) + 7) % 7;
  return new Date(year, mes - 1, 1 + desfase + 7 * (n - 1), 12);
}

const LONGITUD = { mensual: 1, trimestral: 3, semestral: 6, anual: 12 };
export const esPeriodica = (t) => t.frecuencia in LONGITUD;
export const esperaPeriodo = LONGITUD;

// Periodo natural (mes, trimestre, semestre o año) que contiene la fecha.
export function periodoDe(freq, d) {
  const len = LONGITUD[freq];
  const year = d.getFullYear();
  const inicioMes = Math.floor(d.getMonth() / len) * len; // 0-based
  const inicio = new Date(year, inicioMes, 1, 12);
  const fin = new Date(year, inicioMes + len, 0, 12);
  let clave;
  if (freq === 'mensual') clave = `${year}-${pad(inicioMes + 1)}`;
  else if (freq === 'trimestral') clave = `${year}-T${inicioMes / 3 + 1}`;
  else if (freq === 'semestral') clave = `${year}-S${inicioMes / 6 + 1}`;
  else clave = `${year}`;
  return { clave, year, inicioMes, inicio, fin };
}

// Fecha en la que "salta" la tarea periódica dentro de su periodo (o null si el mes no está activo).
export function fechaProgramada(t, per) {
  const plan = t.plan || { semana: 1, dia: 1, mes: 1 };
  const mesRel = t.frecuencia === 'mensual' ? 0 : Math.max(1, plan.mes || 1) - 1;
  const mes = per.inicioMes + mesRel + 1;
  if (t.frecuencia === 'mensual' && t.meses && !t.meses.includes(mes)) return null;
  return nEsimoDia(per.year, mes, plan.semana || 1, plan.dia || 1);
}

// Tipo de semana (A/B) de la semana que contiene la fecha.
export function tipoSemana(d, ajustes) {
  const { semanaAuto, semanaAncla } = ajustes;
  if (!semanaAuto) return semanaAncla.tipo;
  const semanas = Math.round(diasEntre(lunesDe(parse(semanaAncla.lunes)), lunesDe(d)) / 7);
  const par = ((semanas % 2) + 2) % 2 === 0;
  const otro = semanaAncla.tipo === 'A' ? 'B' : 'A';
  return par ? semanaAncla.tipo : otro;
}

function tocaHoy(t, d, ajustes) {
  if (t.requiere === 'camaBaja' && !ajustes.camaBaja) return false;
  if (t.frecuencia === 'diaria') {
    if (t.cadaDias > 1) return diasEpoch(d) % t.cadaDias === 0;
    return true;
  }
  if (t.frecuencia === 'semanal') {
    if (!(t.dias || []).includes(isoWeekday(d))) return false;
    if (t.semana && t.semana !== tipoSemana(d, ajustes)) return false;
    return true;
  }
  return false;
}

// Instancia de una tarea periódica que está "viva" en la fecha d, o null.
export function instanciaPeriodica(t, d, ajustes) {
  if (t.requiere === 'camaBaja' && !ajustes.camaBaja) return null;
  const per = periodoDe(t.frecuencia, d);
  const due = fechaProgramada(t, per);
  if (!due) return null;
  const dueISO = iso(due);
  const hoy = iso(d);
  if (dueISO > hoy || hoy > iso(per.fin)) return null;
  // No arrastra lo que ya había "saltado" antes de instalar la app.
  if (ajustes.inicio && dueISO < ajustes.inicio) return null;
  return { clave: per.clave, due: dueISO, fin: iso(per.fin) };
}

// Plan completo de un día. `modelo` = { tareas, coladas }.
export function planDelDia(modelo, ajustes, d) {
  const dia = iso(d);
  const wd = isoWeekday(d);
  const tipo = tipoSemana(d, ajustes);
  const grupos = { manana: [], dia: [], fija: [], noche: [] };
  const periodicas = [];

  const coladas = modelo.coladas
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
      const g = grupos[t.momento] ? t.momento : 'fija';
      grupos[g].push({ tipo: 'tarea', t, clave: `${t.id}@${dia}`, minutos: t.minutos || 0, categoria: t.categoria });
    }
  }
  return { dia, wd, tipo, coladas, grupos, periodicas };
}

// Elementos que cuentan para el anillo y el tiempo restante del día.
export function elementosDelDia(plan) {
  const g = plan.grupos;
  return [...plan.coladas, ...g.manana, ...g.dia, ...g.fija, ...g.noche, ...plan.periodicas.filter((p) => p.nueva)];
}

// Próxima fecha programada (>= d) de una tarea periódica; para mostrarla en el listado.
export function proximaFecha(t, d, ajustes) {
  const hoy = iso(d);
  for (let i = 0; i < 14; i++) {
    const ref = new Date(d.getFullYear(), d.getMonth() + i, 1, 12);
    const per = periodoDe(t.frecuencia, ref);
    const due = fechaProgramada(t, per);
    if (due && iso(due) >= hoy) return due;
    if (t.frecuencia === 'mensual' && i > 12) break;
  }
  return null;
}

export const minutosATexto = (min) => {
  min = Math.max(0, Math.round(min));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${pad(m)} min` : `${h} h`;
};
