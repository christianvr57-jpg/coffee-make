// Lógica de recetas (pura, con pruebas en tests/recetas.test.ts): escalado de pasos,
// plan del temporizador, comprobaciones del editor y receta a partir de una preparación.
import { esEspresso, metodo, type FasePlan } from './datos/metodos';
import type { Preparacion, Receta } from './modelo';

/** Pasos de la receta con los pesos escalados al agua que vas a usar. */
export function fasesEscaladas(r: Pick<Receta, 'fases' | 'agua'>, agua?: number): FasePlan[] {
  const f = r.agua && agua ? agua / r.agua : 1;
  return r.fases.map((x) => (x.aguaHasta === undefined ? { ...x } : { ...x, aguaHasta: Math.round(x.aguaHasta * f) }));
}

/** Gramos que se vierten en el paso i (diferencia con el último peso anterior). */
export function vertidoEnFase(fases: FasePlan[], i: number): number | undefined {
  const hasta = fases[i]?.aguaHasta;
  if (hasta === undefined) return undefined;
  let previo = 0;
  for (let j = i - 1; j >= 0; j--) {
    if (fases[j].aguaHasta !== undefined) {
      previo = fases[j].aguaHasta!;
      break;
    }
  }
  return hasta - previo;
}

/** Segundo de inicio previsto de cada paso. */
export function iniciosFases(fases: FasePlan[]): number[] {
  let t = 0;
  return fases.map((f) => {
    const ini = t;
    t += f.duracion || 0;
    return ini;
  });
}

/** Duración prevista total (los pasos sin duración cuentan 0). */
export const duracionPlan = (fases: FasePlan[]) => fases.reduce((s, f) => s + (f.duracion || 0), 0);

/** Pasos que usará el temporizador: los de la receta si la hay; si no, la plantilla del método. */
export function planDePreparacion(p: Partial<Preparacion> & Pick<Preparacion, 'metodo'>, receta?: Pick<Receta, 'fases' | 'agua' | 'metodo'> | null): FasePlan[] {
  if (receta && receta.metodo === p.metodo) return fasesEscaladas(receta, p.agua);
  const m = metodo(p.metodo);
  const dosis = p.dosis || m.dosis;
  return m.fases(dosis, p.agua || Math.round(dosis * m.ratio));
}

export interface Revision {
  errores: string[];
  avisos: string[];
}

/** Comprueba una receta antes de guardarla. Los errores impiden guardar; los avisos no. */
export function revisarReceta(r: Partial<Receta>): Revision {
  const errores: string[] = [];
  const avisos: string[] = [];
  const esp = r.metodo ? esEspresso(r.metodo) : false;
  if (!r.nombre?.trim()) errores.push('Ponle un nombre.');
  if (!r.dosis || r.dosis <= 0) errores.push('Indica la dosis de café.');
  if (esp && !r.rendimiento) errores.push('Indica la salida en taza.');
  if (!esp && r.metodo !== 'coldbrew' && !r.agua) errores.push('Indica el agua total.');
  const fases = r.fases || [];
  if (!esp && r.metodo !== 'coldbrew' && fases.length === 0) errores.push('Añade al menos un paso.');
  fases.forEach((f, i) => {
    if (!f.nombre.trim()) errores.push(`El paso ${i + 1} no tiene nombre.`);
  });
  let previo = 0;
  for (const [i, f] of fases.entries()) {
    if (f.aguaHasta === undefined) continue;
    if (f.aguaHasta < previo) errores.push(`En el paso ${i + 1} el peso baja (${f.aguaHasta} g después de ${previo} g). Los pesos son acumulados: «vierte hasta…».`);
    previo = Math.max(previo, f.aguaHasta);
  }
  if (r.agua && previo > 0 && previo !== r.agua) avisos.push(`Los pasos llegan a ${previo} g pero el agua total es ${r.agua} g.`);
  if (fases.length > 0 && fases.every((f) => f.duracion === null)) avisos.push('Ningún paso tiene duración: tendrás que avanzar a mano.');
  return { errores, avisos };
}

/** Tiempo objetivo a partir de los pasos (±15 s sobre el total previsto). */
export function objetivoDesdeFases(fases: FasePlan[]): [number, number] | undefined {
  const t = duracionPlan(fases);
  if (!t || fases.some((f) => f.duracion === null && f !== fases[fases.length - 1])) return undefined;
  return [Math.max(0, t - 15), t + 15];
}

/**
 * Receta a partir de una preparación que te ha gustado: sus cantidades y los pasos que seguiste,
 * con la duración real de cada paso cuando se registró con el temporizador.
 */
export function recetaDesdePreparacion(p: Preparacion, plan: FasePlan[], nombreMetodo: string): Partial<Receta> {
  // Solo si se siguieron todos los pasos: si terminaste antes, los tiempos reales no son representativos.
  const reales = p.fases?.length === plan.length ? p.fases : [];
  const fases = plan.map((f, i) => {
    const real = reales[i];
    const ultimo = i === plan.length - 1;
    if (real && real.nombre === f.nombre && f.duracion !== null && !ultimo) return { ...f, duracion: Math.round(real.fin - real.inicio) };
    return { ...f };
  });
  const esp = esEspresso(p.metodo);
  return {
    nombre: `${nombreMetodo}${p.cafeNombre ? ` · ${p.cafeNombre}` : ''}`,
    metodo: p.metodo,
    dosis: p.dosis,
    agua: esp ? undefined : p.agua,
    rendimiento: esp ? p.rendimiento : undefined,
    temperatura: p.temperatura,
    molinoId: p.molinoId,
    ajusteMolino: p.molienda,
    filtro: p.filtro,
    fases,
    tiempoObjetivo: p.tiempoTotal ? (esp ? [Math.max(0, p.tiempoTotal - 3), p.tiempoTotal + 3] : [Math.max(0, p.tiempoTotal - 15), p.tiempoTotal + 15]) : undefined,
    consejos: [],
    notas: p.notas,
  };
}

/** Receta en blanco con los pasos básicos del método. */
export function recetaDesdeMetodo(m: Preparacion['metodo']): Partial<Receta> {
  const met = metodo(m);
  const esp = esEspresso(m);
  const agua = esp ? undefined : Math.round(met.dosis * met.ratio);
  return {
    nombre: '',
    metodo: m,
    dosis: met.dosis,
    agua,
    rendimiento: esp ? met.dosis * met.ratio : undefined,
    temperatura: met.temperatura,
    molienda: met.descripcionMolienda,
    filtro: met.filtros[0],
    fases: met.fases(met.dosis, agua || 0),
    consejos: [],
  };
}

/** Copia editable de una receta (las de referencia no se tocan). */
export function duplicarReceta(r: Receta): Partial<Receta> {
  const { id: _id, creado: _c, actualizado: _a, referencia: _r, ...resto } = r;
  return { ...resto, nombre: `${r.nombre} (mía)`, baseId: r.id, fases: r.fases.map((f) => ({ ...f })), consejos: [...r.consejos] };
}
