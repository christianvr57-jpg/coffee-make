// Aprendizaje a partir de tus registros (puro, con pruebas en tests/aprendizaje.test.ts):
//  - recomendarInicio: con qué empezar un café nuevo, a partir de tu mejor resultado con un
//    café parecido y el mismo método.
//  - aprendizajes: qué cambios de una sola variable te han subido o bajado la nota.
//  - preferencias: con qué orígenes, procesos y tuestes puntúas mejor y qué sabores aparecen
//    en tus mejores tazas.
// Son correlaciones de tus propios datos, no reglas: con pocos registros se dice claramente.
import { diferencias } from './calculos';
import { metodo } from './datos/metodos';
import { INDICE_SABORES } from './datos/rueda';
import { TUESTES } from './datos/catalogos';
import type { Cafe, Equipo, MetodoId, NivelTueste, Preparacion } from './modelo';

const fmt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
const ORDEN_TUESTE: NivelTueste[] = TUESTES.map(([v]) => v);
const idxTueste = (t?: NivelTueste) => (t ? ORDEN_TUESTE.indexOf(t) : -1);

/** Parecido entre dos cafés (0 = nada). */
export function parecido(a: Cafe, b: Cafe): { puntos: number; motivos: string[] } {
  let puntos = 0;
  const motivos: string[] = [];
  const ta = idxTueste(a.tueste);
  const tb = idxTueste(b.tueste);
  if (ta >= 0 && tb >= 0) {
    if (ta === tb) {
      puntos += 3;
      motivos.push('mismo tueste');
    } else if (Math.abs(ta - tb) === 1) puntos += 1.5;
  }
  const proc = a.procesos.find((p) => b.procesos.includes(p));
  if (proc) {
    puntos += 2;
    motivos.push(`proceso ${proc.toLowerCase()}`);
  }
  if (a.pais && a.pais === b.pais) {
    puntos += 1;
    motivos.push(`origen ${a.pais}`);
  }
  if (a.variedades.some((v) => b.variedades.includes(v))) puntos += 0.5;
  return { puntos, motivos };
}

export interface Recomendacion {
  prep: Partial<Preparacion>;
  texto: string;
  base: Preparacion;
}

/**
 * Punto de partida para un café con el que aún no has usado este método: tu mejor preparación
 * (nota ≥ 7) con el café más parecido, corrigiendo molienda y temperatura por la diferencia
 * de tueste (los tuestes más claros extraen peor: más fino y más caliente).
 */
export function recomendarInicio(cafe: Cafe | undefined, m: MetodoId, preps: Preparacion[], cafes: Cafe[], equipo: Equipo[] = []): Recomendacion | null {
  if (!cafe) return null;
  let mejor: { p: Preparacion; c: Cafe; puntos: number; motivos: string[] } | null = null;
  for (const p of preps) {
    if (p.metodo !== m || p.puntuacion === undefined || p.puntuacion < 7 || !p.cafeId || p.cafeId === cafe.id) continue;
    const c = cafes.find((x) => x.id === p.cafeId);
    if (!c) continue;
    const { puntos, motivos } = parecido(cafe, c);
    if (puntos < 2) continue;
    const valor = puntos * 10 + p.puntuacion;
    if (!mejor || valor > mejor.puntos * 10 + mejor.p.puntuacion!) mejor = { p, c, puntos, motivos };
  }
  if (!mejor) return null;
  const { p, c, motivos } = mejor;
  const prep: Partial<Preparacion> = {
    dosis: p.dosis, agua: p.agua, rendimiento: p.rendimiento, molinoId: p.molinoId, molienda: p.molienda, temperatura: p.temperatura,
    aguaId: p.aguaId, filtro: p.filtro, cafeteraId: p.cafeteraId, preinfusion: p.preinfusion, recetaId: p.recetaId,
  };
  const ajustes: string[] = [];
  const d = idxTueste(cafe.tueste) - idxTueste(c.tueste);
  if (idxTueste(cafe.tueste) >= 0 && idxTueste(c.tueste) >= 0 && d !== 0) {
    const pasos = Math.max(-2, Math.min(2, d));
    const molino = equipo.find((e) => e.id === p.molinoId)?.molino;
    if (p.molienda !== undefined) {
      let nueva = p.molienda + pasos * (molino?.paso || 1);
      if (molino) nueva = Math.max(molino.min, Math.min(molino.max, nueva));
      prep.molienda = nueva;
    }
    if (p.temperatura !== undefined) prep.temperatura = Math.max(80, Math.min(100, p.temperatura - pasos));
    ajustes.push(d < 0 ? 'un poco más fino y más caliente porque este café es más claro' : 'un poco más grueso y menos caliente porque este café es más oscuro');
  }
  const texto = `Tu mejor ${metodo(m).nombre} con un café parecido (${c.nombre}${motivos.length ? `: ${motivos.join(', ')}` : ''}) sacó un ${fmt(p.puntuacion!)}/10. Empiezas con sus valores${ajustes.length ? `, ${ajustes[0]}` : ''}.`;
  return { prep, texto, base: p };
}

// ---------- Aprendizajes de "cambiar una sola cosa" ----------

export interface Aprendizaje {
  metodo: MetodoId;
  variable: string;
  accion: string;
  n: number;
  /** Cambio medio de nota. */
  media: number;
  texto: string;
}

const NUMERICAS = ['molienda', 'temperatura', 'dosis', 'agua', 'rendimiento', 'preinfusion'] as const;
const ACCION: Record<(typeof NUMERICAS)[number], [string, string]> = {
  molienda: ['moler más fino', 'moler más grueso'],
  temperatura: ['bajar la temperatura', 'subir la temperatura'],
  dosis: ['bajar la dosis', 'subir la dosis'],
  agua: ['usar menos agua', 'usar más agua'],
  rendimiento: ['acortar la salida', 'alargar la salida'],
  preinfusion: ['acortar la preinfusión', 'alargar la preinfusión'],
};

export function aprendizajes(preps: Preparacion[], minimo = 2): Aprendizaje[] {
  const porId = new Map(preps.map((p) => [p.id, p]));
  const grupos = new Map<string, { metodo: MetodoId; variable: string; accion: string; deltas: number[] }>();
  for (const p of preps) {
    const padre = p.padreId ? porId.get(p.padreId) : undefined;
    if (!padre || p.puntuacion === undefined || padre.puntuacion === undefined || p.metodo !== padre.metodo) continue;
    const dif = diferencias(p, padre);
    if (dif.length !== 1) continue;
    const clave = dif[0].clave as (typeof NUMERICAS)[number];
    if (!NUMERICAS.includes(clave) || typeof dif[0].antes !== 'number' || typeof dif[0].ahora !== 'number') continue;
    const accion = ACCION[clave][(dif[0].ahora as number) > (dif[0].antes as number) ? 1 : 0];
    const k = `${p.metodo}|${clave}|${accion}`;
    const g = grupos.get(k) || { metodo: p.metodo, variable: clave, accion, deltas: [] };
    g.deltas.push(p.puntuacion - padre.puntuacion);
    grupos.set(k, g);
  }
  return [...grupos.values()]
    .filter((g) => g.deltas.length >= minimo)
    .map((g) => {
      const media = g.deltas.reduce((a, b) => a + b, 0) / g.deltas.length;
      const efecto = Math.abs(media) < 0.25 ? 'apenas ha cambiado tu nota' : media > 0 ? `te ha subido la nota ${fmt(media)} puntos de media` : `te ha bajado la nota ${fmt(-media)} puntos de media`;
      return { metodo: g.metodo, variable: g.variable, accion: g.accion, n: g.deltas.length, media, texto: `En ${metodo(g.metodo).nombre}, ${g.accion} ${efecto} (${g.deltas.length} veces).` };
    })
    .sort((a, b) => Math.abs(b.media) * Math.sqrt(b.n) - Math.abs(a.media) * Math.sqrt(a.n));
}

// ---------- Preferencias ----------

export interface Grupo {
  nombre: string;
  /** Número de cafés distintos. */
  n: number;
  media: number;
}

export interface Preferencias {
  procesos: Grupo[];
  paises: Grupo[];
  tuestes: Grupo[];
  variedades: Grupo[];
  /** Familias de sabor en tus tazas de 8 o más. */
  sabores: { nombre: string; n: number }[];
  cafesPuntuados: number;
}

/** Nota media por café (para que un café muy repetido no pese más que los demás). */
function mediasPorCafe(preps: Preparacion[]): Map<string, number> {
  const acc = new Map<string, number[]>();
  for (const p of preps) {
    if (!p.cafeId || p.puntuacion === undefined) continue;
    acc.set(p.cafeId, [...(acc.get(p.cafeId) || []), p.puntuacion]);
  }
  return new Map([...acc].map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length]));
}

function agrupar(medias: Map<string, number>, cafes: Cafe[], claves: (c: Cafe) => string[]): Grupo[] {
  const g = new Map<string, number[]>();
  for (const [id, media] of medias) {
    const c = cafes.find((x) => x.id === id);
    if (!c) continue;
    for (const k of new Set(claves(c))) if (k) g.set(k, [...(g.get(k) || []), media]);
  }
  return [...g]
    .map(([nombre, v]) => ({ nombre, n: v.length, media: v.reduce((a, b) => a + b, 0) / v.length }))
    .sort((a, b) => b.media - a.media || b.n - a.n);
}

export function preferencias(preps: Preparacion[], cafes: Cafe[]): Preferencias {
  const medias = mediasPorCafe(preps);
  const tueste = (c: Cafe) => (c.tueste ? [TUESTES.find(([v]) => v === c.tueste)![1]] : []);
  const sabores = new Map<string, number>();
  for (const p of preps) {
    if ((p.puntuacion ?? 0) < 8 || !p.cata) continue;
    const familias = new Set(p.cata.sabores.map((s) => INDICE_SABORES.get(s)?.familia.nombre).filter(Boolean) as string[]);
    for (const f of familias) sabores.set(f, (sabores.get(f) || 0) + 1);
  }
  return {
    procesos: agrupar(medias, cafes, (c) => c.procesos),
    paises: agrupar(medias, cafes, (c) => (c.pais ? [c.pais] : [])),
    tuestes: agrupar(medias, cafes, tueste),
    variedades: agrupar(medias, cafes, (c) => c.variedades),
    sabores: [...sabores].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n),
    cafesPuntuados: medias.size,
  };
}

/** Frase de "qué café comprar" a partir de tus preferencias (solo con datos suficientes). */
export function consejoCompra(pr: Preferencias): string | null {
  if (pr.cafesPuntuados < 3) return null;
  const top = (gs: Grupo[]) => gs.find((g) => g.n >= 2);
  const partes = [top(pr.procesos), top(pr.paises), top(pr.tuestes)].filter(Boolean) as Grupo[];
  if (!partes.length) return null;
  const txt = partes.map((g) => `${g.nombre.toLowerCase()} (${fmt(g.media)} de media en ${g.n} cafés)`).join(', ');
  return `Tus mejores notas van con: ${txt}. Si quieres ir a lo seguro, busca algo así; si quieres aprender, prueba justo lo contrario.`;
}
