// Tipos del módulo Gym: catálogo de ejercicios, entrenos (sesiones) con sus series y rutinas.
import type { Registro } from '../../core/db';

export type Grupo =
  | 'pecho' | 'espalda' | 'hombro' | 'biceps' | 'triceps' | 'antebrazo'
  | 'cuadriceps' | 'isquios' | 'gluteo' | 'aductores' | 'gemelo' | 'core' | 'cuerpo' | 'cardio';

export const GRUPOS: [Grupo, string][] = [
  ['pecho', 'Pecho'],
  ['espalda', 'Espalda'],
  ['hombro', 'Hombro'],
  ['biceps', 'Bíceps'],
  ['triceps', 'Tríceps'],
  ['antebrazo', 'Antebrazo'],
  ['cuadriceps', 'Cuádriceps'],
  ['isquios', 'Isquiotibiales'],
  ['gluteo', 'Glúteo'],
  ['aductores', 'Aductores'],
  ['gemelo', 'Gemelo'],
  ['core', 'Core'],
  ['cuerpo', 'Cuerpo completo'],
  ['cardio', 'Cardio'],
];
export const nombreGrupo = (g: string) => GRUPOS.find(([k]) => k === g)?.[1] || g;

export type Equipo = 'barra' | 'mancuernas' | 'maquina' | 'polea' | 'corporal' | 'kettlebell' | 'banda' | 'smith' | 'ez' | 'discos' | 'trx' | 'cardio' | 'otro';

export const EQUIPOS: [Equipo, string][] = [
  ['barra', 'Barra'],
  ['mancuernas', 'Mancuernas'],
  ['maquina', 'Máquina'],
  ['polea', 'Polea'],
  ['corporal', 'Peso corporal'],
  ['kettlebell', 'Kettlebell'],
  ['banda', 'Banda elástica'],
  ['smith', 'Multipower'],
  ['ez', 'Barra Z'],
  ['discos', 'Disco'],
  ['trx', 'TRX'],
  ['cardio', 'Máquina de cardio'],
  ['otro', 'Otro'],
];
export const nombreEquipo = (e: string) => EQUIPOS.find(([k]) => k === e)?.[1] || e;

/**
 * Qué se apunta en cada serie:
 *  - peso: kg × repeticiones;
 *  - reps: repeticiones (con lastre opcional en kg; con asistencia, en negativo);
 *  - tiempo: segundos (con peso opcional);
 *  - cardio: minutos y km.
 */
export type TipoRegistro = 'peso' | 'reps' | 'tiempo' | 'cardio';

export interface Ejercicio {
  id: string;
  nombre: string;
  grupo: Grupo;
  equipo: Equipo;
  tipo: TipoRegistro;
  secundarios: Grupo[];
  consejo?: string;
  /** Creado por el usuario. */
  propio?: boolean;
}

/** Ejercicio creado por el usuario (se sincroniza). */
export interface EjercicioPropio extends Registro {
  nombre: string;
  grupo: Grupo;
  equipo: Equipo;
  tipo: TipoRegistro;
  secundarios?: Grupo[];
  consejo?: string;
}

export type TipoSerie = 'normal' | 'calentamiento' | 'fallo' | 'drop';

export interface SerieGym {
  peso?: number;
  reps?: number;
  segundos?: number;
  minutos?: number;
  km?: number;
  hecha: boolean;
  tipo?: TipoSerie;
}

export interface EjercicioSesion {
  /** Identificador dentro de la sesión (un ejercicio puede repetirse). */
  uid: string;
  ejercicioId: string;
  series: SerieGym[];
  /** Repeticiones objetivo de la rutina, p. ej. "8-12". */
  objetivo?: string;
  nota?: string;
}

/** Un entreno. Sin `fin`, está en curso. */
export interface SesionGym extends Registro {
  fecha: string;
  nombre: string;
  inicio: number;
  fin?: number;
  rutinaId?: string;
  ejercicios: EjercicioSesion[];
  notas?: string;
}

export interface EjercicioRutina {
  ejercicioId: string;
  series: number;
  /** "8-12", "10", "30 s"… */
  reps: string;
}

export interface RutinaGym extends Registro {
  nombre: string;
  ejercicios: EjercicioRutina[];
  notas?: string;
}

export interface AjustesGym {
  /** Descanso entre series (s). 0 = sin temporizador. */
  descanso: number;
  /** Pitido al acabar el descanso. */
  sonido: boolean;
}
