// Copia de seguridad de toda la app (todos los módulos) en un único JSON.
import { db, TABLAS_DATOS, escribirAjuste, leerAjuste } from './db';
import { blobADataUrl, dataUrlABlob } from './archivos';
import { importarLegado } from '../modulos/hogar/estado';

export const APP_ID = 'coffee-make';
export const VERSION_COPIA = 1;

interface Copia {
  app: string;
  version: number;
  exportado: string;
  tablas: Record<string, unknown[]>;
}

export async function exportarTodo(): Promise<string> {
  const tablas: Record<string, unknown[]> = {};
  for (const t of TABLAS_DATOS) {
    const filas = await db.table(t).toArray();
    tablas[t] = t === 'fotos' ? await Promise.all(filas.map(async (f) => ({ ...f, blob: await blobADataUrl(f.blob) }))) : filas;
  }
  const copia: Copia = { app: APP_ID, version: VERSION_COPIA, exportado: new Date().toISOString(), tablas };
  await escribirAjuste('copia', { ultima: Date.now() });
  return JSON.stringify(copia);
}

export type ResultadoImportacion = { tipo: 'completa' | 'hogar-antigua'; registros: number };

/** Importa una copia. Las de la app antigua "Rutina del hogar" se convierten al formato nuevo. */
export async function importarTodo(texto: string): Promise<ResultadoImportacion> {
  let obj: unknown;
  try {
    obj = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const o = obj as Partial<Copia> & { app?: string; datos?: unknown };
  if (o.app === 'rutina-hogar' && o.datos) {
    const n = await importarLegado(o.datos as never);
    return { tipo: 'hogar-antigua', registros: n };
  }
  if (o.app !== APP_ID || !o.tablas) throw new Error('El archivo no es una copia de Coffee Make.');
  if ((o.version || 0) > VERSION_COPIA) throw new Error('La copia es de una versión más nueva de la app. Actualízala primero.');
  let n = 0;
  await db.transaction('rw', TABLAS_DATOS.map((t) => db.table(t)), async () => {
    for (const t of TABLAS_DATOS) {
      const filas = (o.tablas![t] as Record<string, unknown>[] | undefined) || [];
      await db.table(t).clear();
      if (!filas.length) continue;
      const listas = t === 'fotos' ? await Promise.all(filas.map(async (f) => ({ ...f, blob: await dataUrlABlob(String(f.blob)) }))) : filas;
      await db.table(t).bulkPut(listas);
      n += filas.length;
    }
  });
  return { tipo: 'completa', registros: n };
}

export async function diasDesdeUltimaCopia(): Promise<number | null> {
  const a = await leerAjuste<{ ultima?: number }>('copia', {});
  if (!a.ultima) return null;
  return Math.floor((Date.now() - a.ultima) / 86400000);
}

/** Borra absolutamente todo (todas las tablas). */
export async function borrarTodo(): Promise<void> {
  await db.transaction('rw', [...TABLAS_DATOS.map((t) => db.table(t)), db.cambios], async () => {
    for (const t of TABLAS_DATOS) await db.table(t).clear();
    await db.cambios.clear();
  });
}
