// Modo cocinar (puro, con pruebas en tests/cocina.test.ts): tiempos que aparecen en cada paso para
// ofrecer un temporizador, y cantidades de la lista de ingredientes para lo que se va a cocinar.
import { RACION_NINO, tablaCantidades, textoCantidad, type AjustesRaciones } from './raciones';
import type { Momento, Receta } from './tipos';

export interface TiempoPaso {
  /** Texto tal cual aparece: "12-15 min", "1 h". */
  etiqueta: string;
  /** Segundos del temporizador (en un rango, el mínimo: se mira antes y se alarga si hace falta). */
  segundos: number;
}

/** Tiempos de un paso ("Hornea 12-15 min", "olla rápida 1 h"…), sin repetir. */
export function tiemposDePaso(texto: string): TiempoPaso[] {
  const res: TiempoPaso[] = [];
  const re = /(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|a)\s*(\d+(?:[.,]\d+)?))?\s*(minutos?|min|horas?|h)\b/gi;
  for (const m of texto.matchAll(re)) {
    const desde = Number(m[1].replace(',', '.'));
    const horas = /^h/i.test(m[3]);
    const segundos = Math.round(desde * (horas ? 3600 : 60));
    if (!segundos || segundos > 6 * 3600) continue;
    const unidad = horas ? 'h' : 'min';
    const etiqueta = `${m[1]}${m[2] ? `-${m[2]}` : ''} ${unidad}`;
    if (!res.some((x) => x.etiqueta === etiqueta)) res.push({ etiqueta, segundos });
  }
  return res;
}

export interface IngredienteCocinar {
  nombre: string;
  cantidad: string;
}

/**
 * Lo que hay que sacar para cocinar la receta: con raciones por kcal, el total calculado (y la parte
 * del niño si se indica); sin ellas, dos raciones de referencia de adulto más la del niño.
 */
export function ingredientesParaCocinar(r: Receta, momento: Momento, aj: AjustesRaciones): IngredienteCocinar[] {
  if (aj.activo) {
    return tablaCantidades(r, momento, aj, aj.ninoEnCompra).map((t) => ({
      nombre: t.ingrediente.n,
      cantidad: t.total ? textoCantidad(t.ingrediente.n, t.total) : 'al gusto',
    }));
  }
  const factor = 2 + RACION_NINO;
  return r.ingredientes.map((i) => ({ nombre: i.n, cantidad: i.g ? textoCantidad(i.n, i.g * factor) : 'al gusto' }));
}

/** "4:05", "1:02:30". */
export function relojTexto(s: number): string {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${seg}` : `${m}:${seg}`;
}
