// Estado del módulo Hogar: la rutina base (rutina.json) + los cambios del usuario y el progreso,
// cargados en memoria (señales) y guardados en IndexedDB.
import { computed, signal } from '@preact/signals';
import { db, guardar, leerAjuste, escribirAjuste, type CambioHogar, type HechaHogar } from '../../core/db';
import { iso, lunesDe, hoyISO } from '../../core/fechas';
import { ulid } from '../../core/ids';
import rutinaBase from './rutina.json';
import type { AjustesHogar, Colada, Rutina, Tarea } from './tipos';

export const rutina = rutinaBase as unknown as Rutina;

const ajustesPorDefecto = (): AjustesHogar => ({
  camaBaja: false,
  semanaAuto: true,
  semanaAncla: { lunes: iso(lunesDe(new Date())), tipo: 'A' },
  inicio: hoyISO(),
});

export const ajustesHogar = signal<AjustesHogar>(ajustesPorDefecto());
export const hechas = signal<Map<string, string>>(new Map());
const cambios = signal<CambioHogar[]>([]);

export const modelo = computed(() => {
  const porId = new Map(cambios.value.map((c) => [c.id, c]));
  const aplicar = <T extends { id: string }>(x: T): T | null => {
    const c = porId.get(x.id);
    if (!c) return x;
    if (c.eliminada) return null;
    return { ...(c.datos as unknown as T), id: x.id };
  };
  const nuevas = (tipo: 'tarea' | 'colada') =>
    cambios.value.filter((c) => c.origen === 'usuario' && c.tipo === tipo && !c.eliminada).map((c) => ({ ...c.datos, id: c.id }));
  const tareas = [...rutina.tareas.map(aplicar).filter(Boolean), ...nuevas('tarea')] as Tarea[];
  const coladas = [...rutina.coladas.map(aplicar).filter(Boolean), ...nuevas('colada')] as Colada[];
  return { tareas, coladas };
});

export async function iniciarHogar(): Promise<void> {
  const [aj, hs, cs] = await Promise.all([
    leerAjuste<AjustesHogar>('hogar', ajustesPorDefecto()),
    db.hogar_hechas.toArray(),
    db.hogar_tareas.toArray(),
  ]);
  ajustesHogar.value = aj;
  hechas.value = new Map(hs.filter((h) => !h.borrado).map((h) => [h.id, h.fecha]));
  cambios.value = cs;
  // Primera vez: guarda los ajustes iniciales (fecha de inicio y semana A).
  if (!(await db.ajustes.get('hogar'))) await escribirAjuste('hogar', aj);
}

export async function cambiarAjustesHogar(parcial: Partial<AjustesHogar>): Promise<void> {
  ajustesHogar.value = { ...ajustesHogar.value, ...parcial };
  await escribirAjuste('hogar', ajustesHogar.value);
}

// --- Progreso ---------------------------------------------------------------------------------
export const estaHecha = (clave: string) => hechas.value.has(clave);
export const fechaHecha = (clave: string) => hechas.value.get(clave) || null;

export async function marcar(clave: string, fecha = hoyISO()): Promise<void> {
  const m = new Map(hechas.value);
  m.set(clave, fecha);
  hechas.value = m;
  await guardar<HechaHogar>('hogar_hechas', { id: clave, fecha, borrado: null });
}

export async function desmarcar(clave: string): Promise<void> {
  const m = new Map(hechas.value);
  m.delete(clave);
  hechas.value = m;
  await guardar<HechaHogar>('hogar_hechas', { id: clave, fecha: '', borrado: Date.now() });
}

// --- Edición de la rutina ---------------------------------------------------------------------
const esBase = (id: string) => rutina.tareas.some((t) => t.id === id) || rutina.coladas.some((c) => c.id === id);

export async function guardarElemento(tipo: 'tarea' | 'colada', datos: Tarea | Colada): Promise<void> {
  const id = datos.id || ulid();
  const reg = await guardar<CambioHogar>('hogar_tareas', {
    id,
    tipo,
    origen: esBase(id) ? 'base' : 'usuario',
    eliminada: false,
    datos: { ...datos, id } as unknown as Record<string, unknown>,
  });
  cambios.value = [...cambios.value.filter((c) => c.id !== id), reg];
}

export async function eliminarElemento(tipo: 'tarea' | 'colada', id: string): Promise<void> {
  const previo = cambios.value.find((c) => c.id === id);
  const reg = await guardar<CambioHogar>('hogar_tareas', {
    id,
    tipo,
    origen: esBase(id) ? 'base' : 'usuario',
    eliminada: true,
    datos: previo?.datos || {},
  });
  cambios.value = [...cambios.value.filter((c) => c.id !== id), reg];
}

export async function restablecerTareas(): Promise<void> {
  await db.hogar_tareas.clear();
  cambios.value = [];
}

export const idNuevo = () => ulid();

// --- Copias de la app anterior ("Rutina del hogar", localStorage) --------------------------------
interface EstadoLegado {
  v: 1;
  ajustes?: Partial<AjustesHogar>;
  hechas?: Record<string, string>;
  ediciones?: Record<string, Tarea | Colada>;
  eliminadas?: string[];
  nuevas?: Tarea[];
  colNuevas?: Colada[];
}

/** Importa el estado de la app anterior (copia JSON o localStorage del mismo origen). */
export async function importarLegado(e: EstadoLegado): Promise<number> {
  const ahora = Date.now();
  const hs: HechaHogar[] = Object.entries(e.hechas || {}).map(([id, fecha]) => ({ id, fecha, creado: ahora, actualizado: ahora }));
  const cs: CambioHogar[] = [];
  const esColada = (x: Tarea | Colada) => 'dia' in x && !('frecuencia' in x);
  for (const [id, d] of Object.entries(e.ediciones || {})) {
    cs.push({ id, tipo: esColada(d) ? 'colada' : 'tarea', origen: 'base', eliminada: false, datos: { ...d, id } as never, creado: ahora, actualizado: ahora });
  }
  for (const id of e.eliminadas || []) {
    cs.push({ id, tipo: rutina.coladas.some((c) => c.id === id) ? 'colada' : 'tarea', origen: 'base', eliminada: true, datos: {}, creado: ahora, actualizado: ahora });
  }
  for (const t of e.nuevas || []) cs.push({ id: t.id, tipo: 'tarea', origen: 'usuario', eliminada: false, datos: t as never, creado: ahora, actualizado: ahora });
  for (const c of e.colNuevas || []) cs.push({ id: c.id, tipo: 'colada', origen: 'usuario', eliminada: false, datos: c as never, creado: ahora, actualizado: ahora });
  await db.transaction('rw', db.hogar_hechas, db.hogar_tareas, async () => {
    await db.hogar_hechas.bulkPut(hs);
    await db.hogar_tareas.bulkPut(cs);
  });
  if (e.ajustes) await cambiarAjustesHogar({ ...ajustesHogar.value, ...e.ajustes });
  await iniciarHogar();
  return hs.length;
}

/** Si en este mismo navegador quedan datos de la app anterior, se traen una única vez. */
export async function migrarLocalStorage(): Promise<void> {
  try {
    const txt = localStorage.getItem('rutina-hogar:v1');
    if (!txt || (await db.ajustes.get('hogar:migrado'))) return;
    await importarLegado(JSON.parse(txt));
    await escribirAjuste('hogar:migrado', { fecha: Date.now() });
  } catch {
    /* sin datos antiguos */
  }
}
