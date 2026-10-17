// Estado del Calendario: turnos (tabla agenda_turnos, un registro por día) y notas (agenda_notas).
// Todo se sincroniza con la nube como el resto de datos.
import { signal } from '@preact/signals';
import { borrar, db, escribirAjuste, guardar, leerAjuste, vivos } from '../../core/db';
import { aplicarPatron } from './logica';
import type { AjustesCalendario, NotaDia, TipoNota, Turno, TurnoDia } from './tipos';

const AJUSTES_INICIALES: AjustesCalendario = { nombre: '' };
export const ajustesCalendario = signal<AjustesCalendario>(AJUSTES_INICIALES);
/** Nombre para mostrar: el elegido o «Pareja». */
export const nombreTurnos = () => ajustesCalendario.value.nombre.trim() || 'Pareja';

export async function iniciarCalendario(): Promise<void> {
  ajustesCalendario.value = await leerAjuste<AjustesCalendario>('calendario', AJUSTES_INICIALES);
}

export async function cambiarAjustesCalendario(p: Partial<AjustesCalendario>) {
  ajustesCalendario.value = { ...ajustesCalendario.value, ...p };
  await escribirAjuste('calendario', ajustesCalendario.value);
}

// ---------- Turnos ----------

/** Turnos entre dos fechas (incluidas), como mapa fecha → turno. */
export async function leerTurnos(desde: string, hasta: string): Promise<Map<string, Turno>> {
  const filas = vivos(await db.agenda_turnos.where('id').between(desde, hasta, true, true).toArray());
  return new Map(filas.map((f) => [f.id, f.turno]));
}

/** Pone (o quita, con null) el turno de un día. */
export async function ponerTurno(fecha: string, turno: Turno | null): Promise<void> {
  const actual = await db.agenda_turnos.get(fecha);
  if (turno) {
    if (actual && !actual.borrado && actual.turno === turno) return;
    await guardar<TurnoDia>('agenda_turnos', { id: fecha, turno, borrado: null });
  } else if (actual && !actual.borrado) await borrar('agenda_turnos', fecha);
}

/** Rellena días seguidos repitiendo un patrón (p. ej. MMTTNNLL). Devuelve cuántos días ha puesto. */
export async function rellenarPatron(desde: string, patron: Turno[], dias: number): Promise<number> {
  const lista = aplicarPatron(desde, patron, dias);
  for (const x of lista) await ponerTurno(x.fecha, x.turno);
  return lista.length;
}

// ---------- Notas ----------

export async function leerNotas(desde: string, hasta: string): Promise<NotaDia[]> {
  return vivos(await db.agenda_notas.where('fecha').between(desde, hasta, true, true).toArray()).sort((a, b) => a.creado - b.creado);
}

export const todasLasNotas = async () => vivos(await db.agenda_notas.toArray());

export async function guardarNota(n: { id?: string; fecha: string; texto: string; tipo: TipoNota; hecha?: boolean }): Promise<void> {
  const texto = n.texto.trim();
  if (!texto) return;
  const previa = n.id ? await db.agenda_notas.get(n.id) : undefined;
  await guardar<NotaDia>('agenda_notas', { ...(previa || {}), ...n, texto, borrado: null });
}

export const borrarNota = (id: string) => borrar('agenda_notas', id);

export async function alternarHecha(n: NotaDia): Promise<void> {
  await guardar<NotaDia>('agenda_notas', { ...n, hecha: !n.hecha });
}
