// Lógica del menú (pura, con pruebas en tests/cocina.test.ts): qué semana del ciclo toca,
// el menú de cada día con los cambios del usuario, la lista de la compra y el equilibrio semanal.
import { addDays, DIAS, diasEntre, iso, isoWeekday, lunesDe, parse } from '../../core/fechas';
import { BASICOS_SEMANA, DESAYUNOS, MERIENDAS, SEMANAS } from './datos/menu';
import { RECETAS, receta } from './datos/recetas';
import type { Categoria, Momento, Proteina, Receta, Toma } from './tipos';
import { RACION_NINO, racionesReceta, type AjustesRaciones } from './raciones';

export const CICLO = SEMANAS.length;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Índice de la semana del ciclo (0 = semana 1) para una fecha, sabiendo qué lunes fue la semana 1. */
export function semanaDelCiclo(fecha: Date, inicio: string, ciclo = CICLO): number {
  return mod(Math.floor(diasEntre(lunesDe(parse(inicio)), lunesDe(fecha)) / 7), Math.min(ciclo, CICLO));
}

/** Lunes que hace que `fecha` caiga en la semana `n` (0 = semana 1) del ciclo. */
export function inicioParaSemana(fecha: Date, n: number): string {
  return iso(addDays(lunesDe(fecha), -7 * n));
}

export type Cambios = Map<string, string>;
export const claveCambio = (fecha: string, m: Momento) => `${fecha}|${m}`;

/** Platos sustituidos para siempre (receta del menú → la que la sustituye). Los fija estado.ts. */
let sustituciones: Record<string, string> = {};
export const fijarSustituciones = (s: Record<string, string>) => {
  sustituciones = s;
};
/** Receta que ocupa un hueco del menú base, con la sustitución permanente si la hay. */
export const efectiva = (id: string) => (sustituciones[id] && receta(sustituciones[id]) ? sustituciones[id] : id);

export interface PlanDia {
  fecha: string;
  /** 1 = lunes … 7 = domingo. */
  dia: number;
  semana: number;
  finde: boolean;
  comida: Receta;
  cena: Receta;
  /** Cambiado solo ese día. */
  comidaCambiada: boolean;
  cenaCambiada: boolean;
  /** Recetas del menú original en ese hueco (antes de sustituciones y cambios). */
  base: { comida: string; cena: string };
  /** Sustituido para siempre (en todas las semanas). */
  comidaSustituida: boolean;
  cenaSustituida: boolean;
  merienda: Toma;
  desayuno?: Toma;
  /** Postre recomendado según el plato. */
  postre: string;
}

const POSTRE_C = 'Fruta con vitamina C (mandarina, naranja, kiwi o fresas): ayuda a absorber el hierro.';
const POSTRE = 'Fruta de temporada.';
export const postreDe = (r: Receta) => (r.proteina === 'legumbre' || r.proteina === 'carne-roja' || r.proteina === 'carne-blanca' ? POSTRE_C : POSTRE);

export function planDia(fecha: Date, inicio: string, cambios: Cambios = new Map(), ciclo = CICLO): PlanDia {
  const s = semanaDelCiclo(fecha, inicio, ciclo);
  const dia = isoWeekday(fecha);
  const base = SEMANAS[s].dias[dia - 1];
  const f = iso(fecha);
  const idComida = cambios.get(claveCambio(f, 'comida'));
  const idCena = cambios.get(claveCambio(f, 'cena'));
  const menuComida = efectiva(base.comida);
  const menuCena = efectiva(base.cena);
  const comida = (idComida && receta(idComida)) || receta(menuComida)!;
  const cena = (idCena && receta(idCena)) || receta(menuCena)!;
  return {
    fecha: f,
    dia,
    semana: s,
    finde: dia >= 6,
    comida,
    cena,
    comidaCambiada: !!idComida && idComida !== menuComida,
    cenaCambiada: !!idCena && idCena !== menuCena,
    base: { comida: base.comida, cena: base.cena },
    comidaSustituida: menuComida !== base.comida && comida.id === menuComida,
    cenaSustituida: menuCena !== base.cena && cena.id === menuCena,
    merienda: MERIENDAS.find((m) => m.id === base.merienda)!,
    desayuno: base.desayuno ? DESAYUNOS.find((m) => m.id === base.desayuno) : undefined,
    postre: postreDe(comida),
  };
}

export function planSemana(lunes: Date, inicio: string, cambios: Cambios = new Map(), ciclo = CICLO): PlanDia[] {
  return Array.from({ length: 7 }, (_, i) => planDia(addDays(lunes, i), inicio, cambios, ciclo));
}

// ---------- Lista de la compra ----------

export interface ArticuloLista {
  nombre: string;
  c: Categoria;
  /** "Lun comida", "Sáb merienda"… */
  usos: string[];
  /** Gramos totales de la semana (solo con las raciones por kcal activadas). */
  g?: number;
}

const DIA_CORTO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Lista de la compra de unos días. Con `raciones` activas, suma también los gramos de cada
 * ingrediente según las kcal de cada adulto (y la parte del niño si se pide).
 */
export function listaCompra(dias: PlanDia[], raciones?: AjustesRaciones): ArticuloLista[] {
  const m = new Map<string, ArticuloLista>();
  const add = (n: string, c: Categoria, uso?: string, g?: number) => {
    const a = m.get(n) || { nombre: n, c, usos: [] };
    if (uso && !a.usos.includes(uso)) a.usos.push(uso);
    if (g) a.g = (a.g || 0) + g;
    m.set(n, a);
  };
  const plato = (r: Receta, momento: Momento, uso: string, comeNino: boolean) => {
    const factores = raciones?.activo ? racionesReceta(r, momento, raciones).reduce((s, x) => s + x.factor, 0) + (comeNino && raciones.ninoEnCompra ? RACION_NINO : 0) : 0;
    for (const x of r.ingredientes) add(x.n, x.c, uso, x.g && factores ? x.g * factores : undefined);
  };
  for (const d of dias) {
    const k = DIA_CORTO[d.dia];
    plato(d.comida, 'comida', `${k} comida`, d.finde);
    plato(d.cena, 'cena', `${k} cena`, true);
    for (const x of d.merienda.ingredientes) add(x.n, x.c, `${k} merienda`);
    for (const x of d.desayuno?.ingredientes || []) add(x.n, x.c, `${k} desayuno`);
  }
  for (const b of BASICOS_SEMANA) add(b.n, b.c);
  const orden: Categoria[] = ['fruta-verdura', 'proteina', 'lacteo', 'cereal-legumbre', 'despensa'];
  return [...m.values()].sort((a, b) => orden.indexOf(a.c) - orden.indexOf(b.c) || a.nombre.localeCompare(b.nombre, 'es'));
}

// ---------- Equilibrio semanal ----------

export interface Criterio {
  nombre: string;
  valor: number;
  objetivo: string;
  ok: boolean;
}

export function contarProteinas(dias: PlanDia[]): Record<Proteina, number> {
  const c: Record<Proteina, number> = { legumbre: 0, 'pescado-blanco': 0, 'pescado-azul': 0, huevo: 0, 'carne-blanca': 0, 'carne-roja': 0, vegetal: 0 };
  for (const d of dias) {
    c[d.comida.proteina]++;
    c[d.cena.proteina]++;
  }
  return c;
}

/** Comprobación de los criterios del menú (AESAN y prompt del usuario). */
export function equilibrio(dias: PlanDia[]): Criterio[] {
  const c = contarProteinas(dias);
  const pescado = c['pescado-blanco'] + c['pescado-azul'];
  const carne = c['carne-blanca'] + c['carne-roja'];
  const conVerdura = dias.every((d) => [d.comida, d.cena].every((r) => r.ingredientes.some((x) => x.c === 'fruta-verdura' && !['Ajo', 'Limón', 'Perejil'].includes(x.n))));
  const nombres = dias.flatMap((d) => [d.comida.id, d.cena.id]);
  return [
    { nombre: 'Legumbres', valor: c.legumbre, objetivo: '3-4 (AESAN: al menos 4)', ok: c.legumbre >= 3 },
    { nombre: 'Pescado', valor: pescado, objetivo: '3-4', ok: pescado >= 3 },
    { nombre: 'Pescado azul', valor: c['pescado-azul'], objetivo: '1-2 o más', ok: c['pescado-azul'] >= 1 },
    { nombre: 'Carne', valor: carne, objetivo: 'máximo 3', ok: carne <= 3 },
    { nombre: 'Carne roja', valor: c['carne-roja'], objetivo: 'ocasional (máx. 1)', ok: c['carne-roja'] <= 1 },
    { nombre: 'Platos de huevo', valor: c.huevo, objetivo: '2-3 (3-4 huevos)', ok: c.huevo >= 1 && c.huevo <= 4 },
    { nombre: 'Verdura en cada comida y cena', valor: conVerdura ? 14 : 0, objetivo: 'todas', ok: conVerdura },
    { nombre: 'Platos sin repetir', valor: new Set(nombres).size, objetivo: '14', ok: new Set(nombres).size === nombres.length },
  ];
}

/**
 * Recetas alternativas para un cambio: primero las de la misma proteína (mantienen el equilibrio).
 * Con valoraciones, las que os gustan van primero y las que no, al final.
 */
export function alternativas(actual: Receta, findeSemana: boolean, valoraciones: Record<string, number> = {}): { misma: Receta[]; otras: Receta[] } {
  const orden = (r: Receta) => -(valoraciones[r.id] || 0);
  const validas = RECETAS.filter((r) => r.id !== actual.id && (findeSemana || r.minutos <= 40)).sort((a, b) => orden(a) - orden(b));
  return { misma: validas.filter((r) => r.proteina === actual.proteina), otras: validas.filter((r) => r.proteina !== actual.proteina) };
}

/** Sustituciones que rompen el equilibrio porque cambian la proteína del plato. */
export const cambiaProteina = (original: string, por: string) => receta(original)?.proteina !== receta(por)?.proteina;

/** En qué días del ciclo aparece una receta (con las sustituciones permanentes aplicadas). */
export function apariciones(id: string): string[] {
  const res: string[] = [];
  SEMANAS.forEach((s) =>
    s.dias.forEach((d, i) => {
      if (efectiva(d.comida) === id) res.push(`Semana ${s.numero} · ${DIAS[i + 1].toLowerCase()} · comida`);
      if (efectiva(d.cena) === id) res.push(`Semana ${s.numero} · ${DIAS[i + 1].toLowerCase()} · cena`);
    }),
  );
  return res;
}
