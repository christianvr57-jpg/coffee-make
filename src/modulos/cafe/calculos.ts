// Cálculos del café (puros, con pruebas en tests/cafe.test.ts).
import { diasEntre, parse } from '../../core/fechas';
import { metodo, type Familia } from './datos/metodos';
import type { Cafe, MetodoId, NivelTueste, Preparacion } from './modelo';

// ---------- Ratio ----------------------------------------------------------------------------------

/** Ratio 1:x. En espresso es salida/dosis; en el resto agua/dosis. */
export function ratio(p: Pick<Preparacion, 'metodo' | 'dosis' | 'agua' | 'rendimiento'>): number | undefined {
  if (!p.dosis) return undefined;
  const num = p.metodo === 'espresso' ? p.rendimiento : p.agua;
  return num ? num / p.dosis : undefined;
}

export const textoRatio = (x: number | undefined): string => (x ? `1:${(Math.round(x * 10) / 10).toString().replace('.', ',')}` : '—');

// ---------- Reposo ---------------------------------------------------------------------------------

/** Ventanas orientativas de reposo (días desde el tueste) por uso y nivel de tueste.
 *  Punto de partida editable; los tuestes claros necesitan más días, sobre todo para espresso. */
export const VENTANAS: Record<'filtro' | 'espresso', Record<NivelTueste, [number, number]>> = {
  filtro: { claro: [7, 30], 'medio-claro': [5, 25], medio: [4, 21], 'medio-oscuro': [3, 18], oscuro: [3, 14] },
  espresso: { claro: [14, 35], 'medio-claro': [10, 30], medio: [7, 25], 'medio-oscuro': [5, 21], oscuro: [4, 18] },
};

/** Días de reposo efectivos: desde el tueste, descontando los días en el congelador. */
export function diasReposo(cafe: Pick<Cafe, 'fechaTueste' | 'congelaciones'>, en: Date = new Date()): number | undefined {
  if (!cafe.fechaTueste) return undefined;
  let dias = diasEntre(parse(cafe.fechaTueste), en);
  for (const c of cafe.congelaciones || []) {
    const desde = parse(c.desde);
    const hasta = c.hasta ? parse(c.hasta) : en;
    const ini = desde < parse(cafe.fechaTueste) ? parse(cafe.fechaTueste) : desde;
    const fin = hasta > en ? en : hasta;
    dias -= Math.max(0, diasEntre(ini, fin));
  }
  return Math.max(0, dias);
}

export type EstadoReposo = 'sin-fecha' | 'temprano' | 'optimo' | 'tarde';

export function estadoReposo(cafe: Pick<Cafe, 'fechaTueste' | 'congelaciones' | 'tueste'>, uso: 'filtro' | 'espresso', en: Date = new Date()) {
  const dias = diasReposo(cafe, en);
  const [min, max] = VENTANAS[uso][cafe.tueste || 'medio-claro'];
  let estado: EstadoReposo = 'sin-fecha';
  if (dias !== undefined) estado = dias < min ? 'temprano' : dias > max ? 'tarde' : 'optimo';
  return { dias, min, max, estado };
}

export const congelado = (cafe: Pick<Cafe, 'congelaciones'>) => (cafe.congelaciones || []).some((c) => !c.hasta);

/** Uso principal del café: si es omni, el de la preparación que se va a hacer. */
export const usoParaReposo = (cafe: Pick<Cafe, 'uso'>, m?: MetodoId): 'filtro' | 'espresso' =>
  m ? metodo(m).reposo : cafe.uso === 'espresso' ? 'espresso' : 'filtro';

// ---------- Stock -----------------------------------------------------------------------------------

export function stock(cafe: Pick<Cafe, 'id' | 'pesoG'>, preps: Pick<Preparacion, 'cafeId' | 'dosis' | 'borrado'>[]) {
  const usado = preps.filter((p) => p.cafeId === cafe.id && !p.borrado).reduce((s, p) => s + (p.dosis || 0), 0);
  const restante = cafe.pesoG ? Math.max(0, cafe.pesoG - usado) : undefined;
  return { usado, restante };
}

// ---------- Extracción y control chart -----------------------------------------------------------------

/** Gramos de agua que retiene cada gramo de café molido en percolación (valor habitual ≈ 2). */
export const RETENCION = 2;

/**
 * % de extracción (EY) a partir del TDS.
 * - Espresso y percolación: EY = TDS × bebida / dosis. Si no se pesó la bebida, se estima
 *   como agua − retención × dosis.
 * - Inmersión: el líquido retenido en el poso tiene la misma concentración que la taza, así
 *   que se usa el agua total: EY ≈ TDS × agua / dosis.
 */
export function extraccion(p: Pick<Preparacion, 'metodo' | 'dosis' | 'agua' | 'rendimiento' | 'tds'>): number | undefined {
  if (!p.tds || !p.dosis) return undefined;
  const fam: Familia = metodo(p.metodo).familia;
  let bebida: number | undefined;
  if (p.metodo === 'espresso' || fam === 'moka') bebida = p.rendimiento;
  else if (fam === 'inmersion' || fam === 'frio') bebida = p.agua;
  else bebida = p.rendimiento || (p.agua ? p.agua - RETENCION * p.dosis : undefined);
  if (!bebida || bebida <= 0) return undefined;
  return (p.tds * bebida) / p.dosis;
}

export interface ZonaControl {
  tdsMin: number;
  tdsMax: number;
  eyMin: number;
  eyMax: number;
}

/** Zona ideal del control chart clásico de la SCA para filtro; para espresso, referencia habitual. */
export const ZONAS: Record<'filtro' | 'espresso', ZonaControl> = {
  filtro: { tdsMin: 1.15, tdsMax: 1.35, eyMin: 18, eyMax: 22 },
  espresso: { tdsMin: 8, tdsMax: 12, eyMin: 18, eyMax: 22 },
};

export function diagnosticoControl(tds: number, ey: number, tipo: 'filtro' | 'espresso') {
  const z = ZONAS[tipo];
  const fuerza = tds < z.tdsMin ? 'débil' : tds > z.tdsMax ? 'fuerte' : 'ideal';
  const ext = ey < z.eyMin ? 'subextraído' : ey > z.eyMax ? 'sobreextraído' : 'ideal';
  return { fuerza, ext };
}

// ---------- Comparar con la preparación anterior ----------------------------------------------------

export const VARIABLES: { clave: keyof Preparacion; nombre: string; unidad?: string }[] = [
  { clave: 'cafeId', nombre: 'Café' },
  { clave: 'metodo', nombre: 'Método' },
  { clave: 'dosis', nombre: 'Dosis', unidad: 'g' },
  { clave: 'agua', nombre: 'Agua', unidad: 'g' },
  { clave: 'rendimiento', nombre: 'Salida', unidad: 'g' },
  { clave: 'molinoId', nombre: 'Molino' },
  { clave: 'molienda', nombre: 'Molienda' },
  { clave: 'temperatura', nombre: 'Temperatura', unidad: '°C' },
  { clave: 'aguaId', nombre: 'Tipo de agua' },
  { clave: 'filtro', nombre: 'Filtro' },
  { clave: 'preinfusion', nombre: 'Preinfusión', unidad: 's' },
];

/** Variables de entrada que cambian entre dos preparaciones (lo que hace útil "cambiar una sola cosa"). */
export function diferencias(p: Partial<Preparacion>, base: Partial<Preparacion>) {
  const esp = p.metodo === 'espresso';
  return VARIABLES.filter((v) => {
    if (v.clave === 'rendimiento' && !esp) return false;
    if (v.clave === 'agua' && esp) return false;
    const a = p[v.clave];
    const b = base[v.clave];
    if ((a === undefined || a === '' || a === null) && (b === undefined || b === '' || b === null)) return false;
    return a !== b;
  }).map((v) => ({ ...v, antes: base[v.clave], ahora: p[v.clave] }));
}
