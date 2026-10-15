// Lógica del menú (pura, con pruebas en tests/cocina.test.ts): qué semana del ciclo toca,
// el menú de cada día con los cambios del usuario, la lista de la compra y el equilibrio semanal.
import { addDays, DIAS, diasEntre, iso, isoWeekday, lunesDe, parse } from '../../core/fechas';
import { BASICOS_SEMANA, DESAYUNOS, MERIENDAS, SEMANAS } from './datos/menu';
import { RECETAS, receta } from './datos/recetas';
import type { Categoria, Momento, Proteina, Receta, Toma } from './tipos';

export const CICLO = SEMANAS.length;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Índice (0-3) de la semana del ciclo para una fecha, sabiendo qué lunes fue la semana 1. */
export function semanaDelCiclo(fecha: Date, inicio: string): number {
  return mod(Math.floor(diasEntre(lunesDe(parse(inicio)), lunesDe(fecha)) / 7), CICLO);
}

/** Lunes que hace que `fecha` caiga en la semana `n` (0-3) del ciclo. */
export function inicioParaSemana(fecha: Date, n: number): string {
  return iso(addDays(lunesDe(fecha), -7 * n));
}

export type Cambios = Map<string, string>;
export const claveCambio = (fecha: string, m: Momento) => `${fecha}|${m}`;

export interface PlanDia {
  fecha: string;
  /** 1 = lunes … 7 = domingo. */
  dia: number;
  semana: number;
  finde: boolean;
  comida: Receta;
  cena: Receta;
  comidaCambiada: boolean;
  cenaCambiada: boolean;
  merienda: Toma;
  desayuno?: Toma;
  /** Postre recomendado según el plato. */
  postre: string;
}

const POSTRE_C = 'Fruta con vitamina C (mandarina, naranja, kiwi o fresas): ayuda a absorber el hierro.';
const POSTRE = 'Fruta de temporada.';
export const postreDe = (r: Receta) => (r.proteina === 'legumbre' || r.proteina === 'carne-roja' || r.proteina === 'carne-blanca' ? POSTRE_C : POSTRE);

export function planDia(fecha: Date, inicio: string, cambios: Cambios = new Map()): PlanDia {
  const s = semanaDelCiclo(fecha, inicio);
  const dia = isoWeekday(fecha);
  const base = SEMANAS[s].dias[dia - 1];
  const f = iso(fecha);
  const idComida = cambios.get(claveCambio(f, 'comida'));
  const idCena = cambios.get(claveCambio(f, 'cena'));
  const comida = (idComida && receta(idComida)) || receta(base.comida)!;
  const cena = (idCena && receta(idCena)) || receta(base.cena)!;
  return {
    fecha: f,
    dia,
    semana: s,
    finde: dia >= 6,
    comida,
    cena,
    comidaCambiada: !!idComida && idComida !== base.comida,
    cenaCambiada: !!idCena && idCena !== base.cena,
    merienda: MERIENDAS.find((m) => m.id === base.merienda)!,
    desayuno: base.desayuno ? DESAYUNOS.find((m) => m.id === base.desayuno) : undefined,
    postre: postreDe(comida),
  };
}

export function planSemana(lunes: Date, inicio: string, cambios: Cambios = new Map()): PlanDia[] {
  return Array.from({ length: 7 }, (_, i) => planDia(addDays(lunes, i), inicio, cambios));
}

// ---------- Lista de la compra ----------

export interface ArticuloLista {
  nombre: string;
  c: Categoria;
  /** "Lun comida", "Sáb merienda"… */
  usos: string[];
}

const DIA_CORTO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function listaCompra(dias: PlanDia[]): ArticuloLista[] {
  const m = new Map<string, ArticuloLista>();
  const add = (n: string, c: Categoria, uso?: string) => {
    const a = m.get(n) || { nombre: n, c, usos: [] };
    if (uso && !a.usos.includes(uso)) a.usos.push(uso);
    m.set(n, a);
  };
  for (const d of dias) {
    const k = DIA_CORTO[d.dia];
    for (const x of d.comida.ingredientes) add(x.n, x.c, `${k} comida`);
    for (const x of d.cena.ingredientes) add(x.n, x.c, `${k} cena`);
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

/** Recetas alternativas para un cambio: primero las de la misma proteína (mantienen el equilibrio). */
export function alternativas(actual: Receta, findeSemana: boolean): { misma: Receta[]; otras: Receta[] } {
  const validas = RECETAS.filter((r) => r.id !== actual.id && (findeSemana || r.minutos <= 40));
  return { misma: validas.filter((r) => r.proteina === actual.proteina), otras: validas.filter((r) => r.proteina !== actual.proteina) };
}

/** En qué días del ciclo aparece una receta. */
export function apariciones(id: string): string[] {
  const res: string[] = [];
  SEMANAS.forEach((s) =>
    s.dias.forEach((d, i) => {
      if (d.comida === id) res.push(`Semana ${s.numero} · ${DIAS[i + 1].toLowerCase()} · comida`);
      if (d.cena === id) res.push(`Semana ${s.numero} · ${DIAS[i + 1].toLowerCase()} · cena`);
    }),
  );
  return res;
}
