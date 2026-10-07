// Reparte las tareas periódicas de la rutina del hogar por semanas y días y escribe el "plan" de cada una.
// Uso:  npm run repartir                 (recalcula todos los planes)
//       npm run repartir -- --solo-nuevas (solo las tareas periódicas que aún no tienen plan)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sugerirPlan } from '../src/modulos/hogar/reparto';
import type { Rutina, Tarea } from '../src/modulos/hogar/tipos';

const ruta = fileURLToPath(new URL('../src/modulos/hogar/rutina.json', import.meta.url));
const texto = readFileSync(ruta, 'utf8');
const datos = JSON.parse(texto) as Rutina;
const soloNuevas = process.argv.includes('--solo-nuevas');

const orden: Record<string, number> = { mensual: 0, trimestral: 1, semestral: 2, anual: 3 };
const periodicas: Tarea[] = datos.tareas
  .filter((t) => t.frecuencia in orden)
  .sort((a, b) => orden[a.frecuencia] - orden[b.frecuencia] || (b.minutos || 0) - (a.minutos || 0));

if (!soloNuevas) for (const t of periodicas) delete t.plan;
for (const t of periodicas) if (!t.plan) t.plan = sugerirPlan(datos, t);

// Reescribe solo el campo "plan" en la línea de cada tarea, respetando el formato del archivo.
const salida = texto
  .split('\n')
  .map((linea) => {
    const m = linea.match(/"id": "([^"]+)"/);
    const t = m && periodicas.find((x) => x.id === m[1]);
    if (!t || !t.plan) return linea;
    const sinPlan = linea.replace(/, "plan": \{[^}]*\}/, '');
    const plan = `, "plan": { "mes": ${t.plan.mes}, "semana": ${t.plan.semana}, "dia": ${t.plan.dia} }`;
    return sinPlan.replace(/ \}(,?)\s*$/, `${plan} }$1`);
  })
  .join('\n');

JSON.parse(salida);
writeFileSync(ruta, salida);
const D = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
for (const t of periodicas) {
  console.log(`${t.frecuencia.padEnd(10)} ${String(t.minutos).padStart(3)} min  mes ${t.plan!.mes}  semana ${t.plan!.semana}  ${D[t.plan!.dia]}  ${t.titulo}`);
}
