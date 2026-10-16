// Estado del módulo Cocina: ajustes (qué lunes empezó el ciclo), cambios de plato y lista de la compra.
import { signal } from '@preact/signals';
import { borrar, db, escribirAjuste, escribirAjusteInicial, guardar, leerAjuste, vivos } from '../../core/db';
import { iso, lunesDe } from '../../core/fechas';
import type { ArticuloCompra, Categoria, Momento } from './tipos';
import type { AjustesRaciones } from './raciones';
import { claveCambio, type Cambios } from './plan';

export interface AjustesCocina {
  /** Lunes en que empezó la semana 1 del ciclo. */
  inicio: string;
  /** Semanas de la rotación: 4 (las primeras) u 8. */
  ciclo: 4 | 8;
  raciones: AjustesRaciones;
}

/** Los nombres y las kcal solo se guardan en el dispositivo (nunca en el código). */
export const RACIONES_INICIALES: AjustesRaciones = {
  activo: false,
  personas: [
    { nombre: 'Adulto 1', kcal: 2000 },
    { nombre: 'Adulto 2', kcal: 2000 },
  ],
  pctComida: 35,
  pctCena: 30,
  ninoEnCompra: true,
};

export const ajustesCocina = signal<AjustesCocina>({ inicio: iso(lunesDe(new Date())), ciclo: 8, raciones: RACIONES_INICIALES });

export async function cambiarAjustesCocina(p: Partial<AjustesCocina>) {
  ajustesCocina.value = { ...ajustesCocina.value, ...p };
  await escribirAjuste('cocina', ajustesCocina.value);
}

export async function iniciarCocina(): Promise<void> {
  const guardado = await db.ajustes.get('cocina');
  if (guardado) ajustesCocina.value = await leerAjuste('cocina', ajustesCocina.value);
  // La primera vez, la semana 1 empieza esta semana.
  else await escribirAjusteInicial('cocina', ajustesCocina.value);
}

// ---------- Cambios de plato ----------

export async function leerCambios(): Promise<Cambios> {
  const lista = vivos(await db.cocina_cambios.toArray());
  return new Map(lista.map((c) => [c.id, c.recetaId]));
}

export async function cambiarPlato(fecha: string, momento: Momento, recetaId: string | null): Promise<void> {
  const id = claveCambio(fecha, momento);
  if (recetaId) await guardar('cocina_cambios', { id, fecha, momento, recetaId, borrado: null });
  else if (await db.cocina_cambios.get(id)) await borrar('cocina_cambios', id);
}

export async function restablecerCambios(): Promise<void> {
  for (const c of vivos(await db.cocina_cambios.toArray())) await borrar('cocina_cambios', c.id);
}

// ---------- Lista de la compra ----------

export const claveArticulo = (lunes: string, nombre: string) => `${lunes}|${nombre}`;

export async function leerCompra(lunes: string): Promise<ArticuloCompra[]> {
  return vivos(await db.cocina_compra.where('lunes').equals(lunes).toArray());
}

export async function marcarArticulo(lunes: string, nombre: string, c: Categoria, hecho: boolean, manual = false): Promise<void> {
  await guardar('cocina_compra', { id: claveArticulo(lunes, nombre), lunes, nombre, c, hecho, manual, borrado: null });
}

export async function anadirArticulo(lunes: string, nombre: string): Promise<void> {
  await marcarArticulo(lunes, nombre.trim(), 'despensa', false, true);
}

export async function quitarArticulo(lunes: string, nombre: string): Promise<void> {
  await borrar('cocina_compra', claveArticulo(lunes, nombre));
}

export async function desmarcarTodo(lunes: string): Promise<void> {
  const lista = await leerCompra(lunes);
  for (const a of lista.filter((x) => x.hecho)) await guardar('cocina_compra', { ...a, hecho: false });
}
