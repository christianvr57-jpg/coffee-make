// Comprueba el reparto de las tareas periódicas y la lógica de "qué toca hoy".
// Uso: node test/repartir.test.mjs   (imprime un informe; falla si algún día tiene más de 2 extras nuevos)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { addDays, iso, parse, isoWeekday, lunesDe, planDelDia, elementosDelDia, esPeriodica, fechaProgramada, periodoDe, tipoSemana, minutosATexto } from '../js/schedule.js';

const datos = JSON.parse(readFileSync(fileURLToPath(new URL('../data/rutina.json', import.meta.url)), 'utf8'));
const modelo = { tareas: datos.tareas, coladas: datos.coladas };
const ajustes = { camaBaja: false, semanaAuto: true, semanaAncla: { lunes: '2026-09-28', tipo: 'A' }, inicio: null };

const DIAS = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const desde = parse('2026-01-01');
const dias = 365 * 2;

// 1. Extras periódicos nuevos por día (lo que "salta" ese día)
const porDia = {};
const porSemana = {};
let maxDia = 0;
for (let i = 0; i < dias; i++) {
  const d = addDays(desde, i);
  const plan = planDelDia(modelo, ajustes, d);
  const nuevas = plan.periodicas.filter((p) => p.nueva);
  maxDia = Math.max(maxDia, nuevas.length);
  if (nuevas.length) {
    porDia[iso(d)] = nuevas;
    const lun = iso(lunesDe(d));
    porSemana[lun] = (porSemana[lun] || 0) + nuevas.reduce((s, p) => s + p.minutos, 0);
  }
}
const hist = {};
for (const v of Object.values(porDia)) hist[v.length] = (hist[v.length] || 0) + 1;
const semanasMin = Object.values(porSemana);
console.log('Días con extras nuevos (2 años):', hist, ' máximo en un día:', maxDia);
console.log('Minutos extra por semana (con extras): mín', Math.min(...semanasMin), '· máx', Math.max(...semanasMin));
assert.ok(maxDia <= 2, 'algún día tiene más de 2 extras nuevos');

// 2. Calendario de un año concreto
console.log('\nOctubre 2026 – septiembre 2027 (día en el que salta cada tarea periódica):');
const filas = [];
for (const t of modelo.tareas.filter(esPeriodica)) {
  const fechas = [];
  for (let i = 0; i < 12; i++) {
    const ref = new Date(2026, 9 + i, 15, 12);
    const per = periodoDe(t.frecuencia, ref);
    const f = fechaProgramada(t, per);
    if (f && iso(f) >= '2026-10-01' && iso(f) <= '2027-09-30') fechas.push(iso(f));
  }
  filas.push({ t, fechas: [...new Set(fechas)] });
}
for (const { t, fechas } of filas) {
  console.log(`${t.frecuencia.padEnd(10)} ${t.titulo.slice(0, 48).padEnd(48)} ${fechas.map((f) => `${DIAS[isoWeekday(parse(f))]} ${f.slice(5)}`).slice(0, 4).join(', ')}${fechas.length > 4 ? ` … (${fechas.length})` : ''}`);
}

// 3. Semana tipo (sin periódicas)
console.log('\nSemana tipo (lunes 5 oct 2026):');
let totalSemana = 0;
for (let i = 0; i < 7; i++) {
  const d = addDays(parse('2026-10-05'), i);
  const plan = planDelDia(modelo, ajustes, d);
  const el = elementosDelDia(plan).filter((e) => !plan.periodicas.includes(e));
  const min = el.reduce((s, e) => s + e.minutos, 0);
  totalSemana += min;
  console.log(`${DIAS[plan.wd]}  semana ${plan.tipo}  colada: ${plan.coladas.map((c) => c.t.titulo).join(' + ') || '—'}  · ${el.length} tareas · ${minutosATexto(min)}`);
}
console.log('Total semana (sin periódicas):', minutosATexto(totalSemana));

// 4. Alternancia A/B y caducidad de lo no hecho
assert.equal(tipoSemana(parse('2026-09-30'), ajustes), 'A');
assert.equal(tipoSemana(parse('2026-10-07'), ajustes), 'B');
assert.equal(tipoSemana(parse('2026-09-23'), ajustes), 'B');
assert.equal(tipoSemana(parse('2026-10-11'), ajustes), 'B'); // domingo de la misma semana que el 5 oct
assert.equal(tipoSemana(parse('2026-10-12'), ajustes), 'A');
const sab = planDelDia(modelo, ajustes, parse('2026-10-03'));
assert.deepEqual(sab.coladas.map((c) => c.t.id), ['col-sab-a']);
const sabB = planDelDia(modelo, ajustes, parse('2026-10-10'));
assert.deepEqual(sabB.coladas.map((c) => c.t.id), ['col-sab-b']);
// cama baja
assert.equal(planDelDia(modelo, ajustes, parse('2026-10-06')).grupos.dia.some((x) => x.t.id === 'd-suelo-cuarto'), false);
const conCama = { ...ajustes, camaBaja: true };
const a = planDelDia(modelo, conCama, parse('2026-10-06')).grupos.dia.some((x) => x.t.id === 'd-suelo-cuarto');
const b = planDelDia(modelo, conCama, parse('2026-10-07')).grupos.dia.some((x) => x.t.id === 'd-suelo-cuarto');
assert.notEqual(a, b, 'cada dos días alterna');
// Lo periódico no vuelve a aparecer en el periodo siguiente y no salta antes de instalar
const t = modelo.tareas.find((x) => x.id === 'm-lavadora'); // 4.ª semana, viernes
const per = periodoDe('mensual', parse('2026-10-15'));
const due = iso(fechaProgramada(t, per));
const antes = planDelDia(modelo, ajustes, addDays(parse(due), -1)).periodicas.some((p) => p.t.id === t.id);
const el = planDelDia(modelo, ajustes, parse(due)).periodicas.some((p) => p.t.id === t.id);
const despues = planDelDia(modelo, ajustes, addDays(parse(due), 2)).periodicas.some((p) => p.t.id === t.id);
const mesSiguiente = planDelDia(modelo, ajustes, parse('2026-11-01')).periodicas.some((p) => p.t.id === t.id);
assert.deepEqual([antes, el, despues, mesSiguiente], [false, true, true, false]);
const instalada = planDelDia(modelo, { ...ajustes, inicio: '2026-10-30' }, parse('2026-10-31')).periodicas;
assert.equal(instalada.length, 0, 'lo anterior a la instalación no aparece');
console.log('\nOK');
