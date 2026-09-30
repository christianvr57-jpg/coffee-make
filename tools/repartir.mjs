// Reparte las tareas periódicas de data/rutina.json por semanas y días y escribe el "plan" de cada una.
// Uso:  node tools/repartir.mjs           (recalcula todos los planes)
//       node tools/repartir.mjs --solo-nuevas   (solo las tareas periódicas que aún no tienen plan)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sugerirPlan } from '../js/planner.js';

const ruta = fileURLToPath(new URL('../data/rutina.json', import.meta.url));
const texto = readFileSync(ruta, 'utf8');
const datos = JSON.parse(texto);
const soloNuevas = process.argv.includes('--solo-nuevas');

const orden = { mensual: 0, trimestral: 1, semestral: 2, anual: 3 };
const periodicas = datos.tareas
  .filter((t) => t.frecuencia in orden)
  .sort((a, b) => orden[a.frecuencia] - orden[b.frecuencia] || (b.minutos || 0) - (a.minutos || 0));

if (!soloNuevas) for (const t of periodicas) delete t.plan;
const modelo = { tareas: datos.tareas, coladas: datos.coladas };
for (const t of periodicas) {
  if (t.plan) continue;
  t.plan = sugerirPlan(modelo, t);
}

// Reescribe solo el campo "plan" en la línea de cada tarea, respetando el formato del archivo.
let salida = texto.split('\n').map((linea) => {
  const m = linea.match(/"id": "([^"]+)"/);
  if (!m) return linea;
  const t = periodicas.find((x) => x.id === m[1]);
  if (!t) return linea;
  const sinPlan = linea.replace(/, "plan": \{[^}]*\}/, '');
  const plan = `, "plan": { "mes": ${t.plan.mes}, "semana": ${t.plan.semana}, "dia": ${t.plan.dia} }`;
  return sinPlan.replace(/ \}(,?)\s*$/, `${plan} }$1`);
}).join('\n');

JSON.parse(salida); // comprueba que sigue siendo JSON válido
writeFileSync(ruta, salida);
const D = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
for (const t of periodicas) {
  console.log(`${t.frecuencia.padEnd(10)} ${String(t.minutos).padStart(3)} min  mes ${t.plan.mes}  semana ${t.plan.semana}  ${D[t.plan.dia]}  ${t.titulo}`);
}
