// Tipos del módulo Calendario: turnos de la pareja y notas (recordatorios) de cada día.
import type { Registro } from '../../core/db';

export type Turno = 'L' | 'M' | 'T' | 'N';

export const TURNOS: { id: Turno; nombre: string }[] = [
  { id: 'M', nombre: 'Mañana' },
  { id: 'T', nombre: 'Tarde' },
  { id: 'N', nombre: 'Noche' },
  { id: 'L', nombre: 'Libre' },
];
export const nombreTurno = (t: Turno) => TURNOS.find((x) => x.id === t)?.nombre || t;

/** Turno de un día. id = "AAAA-MM-DD". Quitarlo = marca de borrado. */
export interface TurnoDia extends Registro {
  turno: Turno;
}

export type TipoNota = 'cita' | 'recordar' | 'plan' | 'otro';

export const TIPOS_NOTA: { id: TipoNota; nombre: string; icono: string }[] = [
  { id: 'cita', nombre: 'Cita', icono: 'pulso' },
  { id: 'recordar', nombre: 'Recordar', icono: 'aviso' },
  { id: 'plan', nombre: 'Plan', icono: 'estrella' },
  { id: 'otro', nombre: 'Otro', icono: 'diario' },
];
export const tipoNota = (t: TipoNota) => TIPOS_NOTA.find((x) => x.id === t) || TIPOS_NOTA[3];

/** Nota o recordatorio de un día (sin horario). */
export interface NotaDia extends Registro {
  fecha: string;
  texto: string;
  tipo: TipoNota;
  /** Ya hecho o pasado (se tacha). */
  hecha?: boolean;
}

export interface AjustesCalendario {
  /** Nombre de quien tiene los turnos (se muestra en la leyenda y en Inicio). */
  nombre: string;
}
