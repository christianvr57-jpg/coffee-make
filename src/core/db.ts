// Base de datos local (IndexedDB a través de Dexie). Una sola base para toda la app;
// cada módulo tiene sus tablas con prefijo. Todas las tablas de datos del usuario
// llevan marcas de tiempo y borrado lógico para poder sincronizar en el futuro.
import Dexie, { type EntityTable } from 'dexie';
import { ulid } from './ids';
import type { Agua, Cafe, Equipo, Foto, Preparacion, Receta } from '../modulos/cafe/modelo';

/** Campos comunes de cualquier registro sincronizable. */
export interface Registro {
  id: string;
  creado: number;
  actualizado: number;
  /** Marca de borrado lógico (tombstone). Nunca se borra físicamente para poder sincronizar. */
  borrado?: number | null;
  /** Datos de ejemplo, borrables de un golpe. */
  demo?: boolean;
}

export interface Ajuste {
  clave: string;
  valor: unknown;
  actualizado: number;
}

/** Marca de tarea del hogar hecha. id = "<tarea>@<periodo>". */
export interface HechaHogar extends Registro {
  fecha: string;
}

/** Cambio del usuario sobre la rutina base del hogar (edición, alta o baja). */
export interface CambioHogar extends Registro {
  tipo: 'tarea' | 'colada';
  origen: 'base' | 'usuario';
  eliminada: boolean;
  datos: Record<string, unknown>;
}

/** Cola de cambios pendientes para una futura sincronización. */
export interface CambioPendiente {
  n?: number;
  tabla: string;
  registroId: string;
  ts: number;
}

export class BaseDatos extends Dexie {
  ajustes!: EntityTable<Ajuste, 'clave'>;
  cambios!: EntityTable<CambioPendiente, 'n'>;
  hogar_hechas!: EntityTable<HechaHogar, 'id'>;
  hogar_tareas!: EntityTable<CambioHogar, 'id'>;
  cafe_equipo!: EntityTable<Equipo, 'id'>;
  cafe_aguas!: EntityTable<Agua, 'id'>;
  cafe_cafes!: EntityTable<Cafe, 'id'>;
  cafe_preparaciones!: EntityTable<Preparacion, 'id'>;
  cafe_recetas!: EntityTable<Receta, 'id'>;
  fotos!: EntityTable<Foto, 'id'>;

  constructor() {
    super('coffee-make');
    this.version(1).stores({
      ajustes: '&clave',
      cambios: '++n, tabla',
      hogar_hechas: '&id, fecha',
      hogar_tareas: '&id',
      cafe_equipo: '&id, tipo',
      cafe_aguas: '&id',
      cafe_cafes: '&id, nombre, fechaTueste',
      cafe_preparaciones: '&id, fecha, cafeId, metodo, padreId',
      fotos: '&id',
    });
    // v2 (café fase 3): recetas propias.
    this.version(2).stores({ cafe_recetas: '&id, metodo' });
  }
}

export const db = new BaseDatos();

/** Tablas que forman la copia de seguridad (todas menos la cola de cambios). */
export const TABLAS_DATOS = ['ajustes', 'hogar_hechas', 'hogar_tareas', 'cafe_equipo', 'cafe_aguas', 'cafe_cafes', 'cafe_preparaciones', 'cafe_recetas', 'fotos'] as const;
export type TablaDatos = (typeof TABLAS_DATOS)[number];

type TablaRegistros = 'hogar_hechas' | 'hogar_tareas' | 'cafe_equipo' | 'cafe_aguas' | 'cafe_cafes' | 'cafe_preparaciones' | 'cafe_recetas';

/** Crea o actualiza un registro poniendo marcas de tiempo y anotándolo en la cola de cambios. */
export async function guardar<T extends Registro>(tabla: TablaRegistros, datos: Partial<T> & Record<string, unknown>): Promise<T> {
  const ahora = Date.now();
  const reg = { ...datos, id: (datos.id as string) || ulid(ahora), creado: (datos.creado as number) || ahora, actualizado: ahora } as unknown as T;
  await db.transaction('rw', db.table(tabla), db.cambios, async () => {
    await db.table(tabla).put(reg);
    await db.cambios.add({ tabla, registroId: reg.id, ts: ahora });
  });
  return reg;
}

/** Borrado lógico. */
export async function borrar(tabla: TablaRegistros, id: string): Promise<void> {
  const ahora = Date.now();
  await db.transaction('rw', db.table(tabla), db.cambios, async () => {
    await db.table(tabla).update(id, { borrado: ahora, actualizado: ahora });
    await db.cambios.add({ tabla, registroId: id, ts: ahora });
  });
}

export const vivos = <T extends Registro>(lista: T[]): T[] => lista.filter((r) => !r.borrado);

// --- Ajustes clave/valor ------------------------------------------------------------------------
export async function leerAjuste<T>(clave: string, porDefecto: T): Promise<T> {
  const a = await db.ajustes.get(clave);
  return a ? ({ ...(porDefecto as object), ...(a.valor as object) } as T) : porDefecto;
}
export async function escribirAjuste(clave: string, valor: unknown): Promise<void> {
  await db.ajustes.put({ clave, valor, actualizado: Date.now() });
}

/** Pide al navegador que no borre los datos si falta espacio. */
export async function pedirPersistencia(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* no disponible */
  }
  return false;
}
