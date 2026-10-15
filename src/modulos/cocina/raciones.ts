// Raciones según las kcal de cada adulto (puro, con pruebas en tests/cocina.test.ts).
// Cada receta trae los gramos de una ración de referencia; sus kcal se calculan con la tabla de
// composición (USDA) y todos los ingredientes se escalan en la misma proporción hasta llegar a las
// kcal que le tocan a esa persona en esa comida. Es una estimación (±10-15 %): sirve para cocinar
// cantidades coherentes, no para contar calorías al gramo.
import { G_CUCHARADA_ACEITE, G_HUEVO, NUTRICION } from './datos/nutricion';
import type { Ingrediente, Momento, Receta } from './tipos';

export interface Persona {
  nombre: string;
  kcal: number;
}

export interface AjustesRaciones {
  activo: boolean;
  personas: Persona[];
  /** % de las kcal del día para la comida y para la cena (el resto: desayuno, meriendas, fruta…). */
  pctComida: number;
  pctCena: number;
  /** Añadir a la compra la parte del niño (≈ ¼ de ración de adulto cuando come en casa). */
  ninoEnCompra: boolean;
}

export const RACION_NINO = 0.25;

/** Nombre para mostrar (si se deja vacío, «Adulto 1/2»). */
export const nombrePersona = (p: Persona, i: number) => p.nombre.trim() || `Adulto ${i + 1}`;

export interface Totales {
  kcal: number;
  prot: number;
  grasa: number;
  hc: number;
}

/** Nutrientes de un ingrediente con su peso (0 si es "al gusto" o no está en la tabla). */
export function nutrientesIngrediente(i: Ingrediente, g = i.g ?? 0): Totales {
  const n = NUTRICION[i.n];
  if (!n || !g) return { kcal: 0, prot: 0, grasa: 0, hc: 0 };
  const f = g / 100;
  return { kcal: n.kcal * f, prot: n.prot * f, grasa: n.grasa * f, hc: n.hc * f };
}

/** Nutrientes de la ración de referencia de la receta. */
export function nutrientesReceta(r: Receta, factor = 1): Totales {
  const t = { kcal: 0, prot: 0, grasa: 0, hc: 0 };
  for (const i of r.ingredientes) {
    const n = nutrientesIngrediente(i, (i.g ?? 0) * factor);
    t.kcal += n.kcal;
    t.prot += n.prot;
    t.grasa += n.grasa;
    t.hc += n.hc;
  }
  return t;
}

/** Kcal que le tocan a una persona en una comida o cena. */
export const kcalComida = (p: Persona, momento: Momento, aj: Pick<AjustesRaciones, 'pctComida' | 'pctCena'>) =>
  (p.kcal * (momento === 'comida' ? aj.pctComida : aj.pctCena)) / 100;

/** Factor de escala de la receta para llegar a unas kcal. */
export function factorPara(r: Receta, kcalObjetivo: number): number {
  const base = nutrientesReceta(r).kcal;
  return base > 0 ? kcalObjetivo / base : 1;
}

/** Redondeo práctico para la báscula de cocina. */
export function redondear(g: number): number {
  if (g < 20) return Math.max(1, Math.round(g));
  if (g < 100) return Math.round(g / 5) * 5;
  return Math.round(g / 10) * 10;
}

const fmt = (x: number, dec = 1) => String(Math.round(x * 10 ** dec) / 10 ** dec).replace('.', ',');

/** "2 huevos", "15 g (1 cda)", "75 g en seco (≈ 230 g cocidas)", "120 g". */
export function textoCantidad(nombre: string, g: number): string {
  if (nombre === 'Huevos') {
    const u = Math.max(0.5, Math.round((g / G_HUEVO) * 2) / 2);
    return `${fmt(u)} ${u === 1 ? 'huevo' : 'huevos'}`;
  }
  const gr = redondear(g);
  if (nombre === 'Aceite de oliva virgen extra') {
    const c = Math.round((g / G_CUCHARADA_ACEITE) * 2) / 2;
    return `${gr} g (${c > 0 ? `${fmt(c)} cda${c > 1 ? 's' : ''}` : 'un chorrito'})`;
  }
  const n = NUTRICION[nombre];
  if (n?.kcalCocida) return `${gr} g en seco (≈ ${redondear((g * n.kcal) / n.kcalCocida)} g cocidas)`;
  return `${gr} g`;
}

export interface RacionPersona {
  persona: Persona;
  factor: number;
  kcal: number;
  prot: number;
}

/** Ración de cada adulto para una receta en una comida o cena. */
export function racionesReceta(r: Receta, momento: Momento, aj: AjustesRaciones): RacionPersona[] {
  return aj.personas.map((p) => {
    const objetivo = kcalComida(p, momento, aj);
    const factor = factorPara(r, objetivo);
    const t = nutrientesReceta(r, factor);
    return { persona: p, factor, kcal: t.kcal, prot: t.prot };
  });
}

/** Gramos de cada ingrediente para cada persona y el total a cocinar (con el niño si se indica). */
export function tablaCantidades(r: Receta, momento: Momento, aj: AjustesRaciones, conNino: boolean) {
  const rs = racionesReceta(r, momento, aj);
  const extra = conNino ? RACION_NINO : 0;
  return r.ingredientes.map((i) => ({
    ingrediente: i,
    porPersona: rs.map((x) => (i.g ? i.g * x.factor : undefined)),
    total: i.g ? i.g * (rs.reduce((s, x) => s + x.factor, 0) + extra) : undefined,
  }));
}
