// Estado del Gym: ajustes, ejercicios propios (en memoria para buscarlos al vuelo), entrenos y rutinas.
// Todo se guarda con marcas de tiempo y se sincroniza con la nube como el resto.
import { signal } from '@preact/signals';
import { borrar, db, escribirAjuste, guardar, leerAjuste, vivos } from '../../core/db';
import { hoyISO } from '../../core/fechas';
import { ulid } from '../../core/ids';
import { EJERCICIOS } from './datos/ejercicios';
import { PLANTILLAS } from './datos/plantillas';
import { anterior } from './calculos';
import type { AjustesGym, Ejercicio, EjercicioPropio, EjercicioRutina, EjercicioSesion, RutinaGym, SerieGym, SesionGym } from './tipos';

const AJUSTES_INICIALES: AjustesGym = { descanso: 90, sonido: true };
export const ajustesGym = signal<AjustesGym>(AJUSTES_INICIALES);
export const propios = signal<Ejercicio[]>([]);

export async function cambiarAjustesGym(p: Partial<AjustesGym>) {
  ajustesGym.value = { ...ajustesGym.value, ...p };
  await escribirAjuste('gym', ajustesGym.value);
}

async function cargarPropios() {
  const filas = vivos(await db.gym_ejercicios.toArray());
  propios.value = filas.map((p) => ({ id: p.id, nombre: p.nombre, grupo: p.grupo, equipo: p.equipo, tipo: p.tipo, secundarios: p.secundarios || [], consejo: p.consejo, propio: true }));
}

export async function iniciarGym(): Promise<void> {
  ajustesGym.value = await leerAjuste<AjustesGym>('gym', AJUSTES_INICIALES);
  await cargarPropios();
}

// ---------- Ejercicios ----------

const POR_ID = new Map(EJERCICIOS.map((e) => [e.id, e]));

/** Catálogo completo: el de la app y los tuyos. */
export const catalogo = (): Ejercicio[] => [...propios.value, ...EJERCICIOS];

export function ejercicio(id: string): Ejercicio | undefined {
  return POR_ID.get(id) || propios.value.find((e) => e.id === id);
}

/** Nombre aunque el ejercicio ya no exista (p. ej. uno propio borrado). */
export const nombreEjercicio = (id: string) => ejercicio(id)?.nombre || 'Ejercicio borrado';

export async function guardarPropio(e: Omit<EjercicioPropio, 'creado' | 'actualizado' | 'id'> & { id?: string }): Promise<string> {
  const id = e.id || `propio-${ulid()}`;
  await guardar<EjercicioPropio>('gym_ejercicios', { ...e, id, borrado: null });
  await cargarPropios();
  return id;
}

export async function borrarPropio(id: string) {
  await borrar('gym_ejercicios', id);
  await cargarPropios();
}

// ---------- Entrenos ----------

export const listarSesiones = async () => vivos(await db.gym_sesiones.toArray()).sort((a, b) => b.inicio - a.inicio);
export const leerSesion = (id: string) => db.gym_sesiones.get(id);
export const sesionEnCurso = async () => (await listarSesiones()).find((s) => !s.fin);

const serieVacia = (): SerieGym => ({ hecha: false });

/** Series iniciales de un ejercicio: copia lo de la última vez (sin marcar) o `n` vacías. */
export function seriesIniciales(previas: SerieGym[], n: number): SerieGym[] {
  const base = previas.filter((s) => s.tipo !== 'calentamiento');
  return Array.from({ length: Math.max(n, 1) }, (_, i) => {
    const p = base[i] || base[base.length - 1];
    return p ? { peso: p.peso, reps: p.reps, segundos: p.segundos, minutos: p.minutos, km: p.km, hecha: false } : serieVacia();
  });
}

export const nuevoEjercicioSesion = (ejercicioId: string, series: SerieGym[], objetivo?: string): EjercicioSesion => ({ uid: ulid(), ejercicioId, series, objetivo });

/** Empieza un entreno (vacío o desde una rutina o plantilla). Devuelve su id. */
export async function empezarSesion(nombre: string, ejercicios: EjercicioRutina[] = [], rutinaId?: string): Promise<string> {
  const previas = await listarSesiones();
  const ahora = Date.now();
  const s = await guardar<SesionGym>('gym_sesiones', {
    fecha: hoyISO(),
    nombre,
    inicio: ahora,
    rutinaId,
    ejercicios: ejercicios.map((e) => nuevoEjercicioSesion(e.ejercicioId, seriesIniciales(anterior(previas, e.ejercicioId, ahora), e.series), e.reps)),
  });
  return s.id;
}

export async function guardarSesion(s: SesionGym): Promise<SesionGym> {
  return guardar<SesionGym>('gym_sesiones', { ...s });
}

export const borrarSesion = (id: string) => borrar('gym_sesiones', id);

// ---------- Rutinas ----------

export const listarRutinas = async () => vivos(await db.gym_rutinas.toArray()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export async function guardarRutina(r: Partial<RutinaGym> & { nombre: string; ejercicios: EjercicioRutina[] }): Promise<RutinaGym> {
  return guardar<RutinaGym>('gym_rutinas', { ...r, borrado: null });
}

export const borrarRutina = (id: string) => borrar('gym_rutinas', id);

/** Rutina propia o plantilla de la app por id. */
export async function rutinaOPlantilla(id: string): Promise<{ id: string; nombre: string; ejercicios: EjercicioRutina[]; plantilla: boolean } | undefined> {
  const p = PLANTILLAS.find((x) => x.id === id);
  if (p) return { ...p, plantilla: true };
  const r = await db.gym_rutinas.get(id);
  return r && !r.borrado ? { id: r.id, nombre: r.nombre, ejercicios: r.ejercicios, plantilla: false } : undefined;
}
