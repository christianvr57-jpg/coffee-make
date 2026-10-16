// Tipos del módulo Running.
//
// El "plan del entrenador" es personal (perfil, molestias, marcas, plan semanal) y por eso NO está en
// el código: se carga en el dispositivo pegando o abriendo un JSON con esta forma. La guía general
// (semáforo, biblioteca de sesiones, fuerza, nutrición) sí está en el código porque no es personal.
import type { Registro } from '../../core/db';

export type TipoSesion = 'rodaje' | 'calidad' | 'tirada' | 'competicion' | 'padel' | 'gimnasio' | 'natacion' | 'otro' | 'fuerza' | 'descanso' | 'movilidad';

export interface SesionPlan {
  id: string;
  tipo: TipoSesion;
  titulo: string;
  duracion?: number;
  km?: number;
  zona?: string;
  rpe?: string;
  calentamiento?: string;
  principal?: string;
  recuperaciones?: string;
  vuelta?: string;
  ritmo?: string;
  intensidad?: string;
  objetivo?: string;
  notas?: string;
  nota?: string;
}

export interface DiaPlan {
  fecha: string;
  sesiones: SesionPlan[];
}

export interface SemanaPlan {
  id: string;
  lunes: string;
  fase?: string;
  diagnostico?: string;
  objetivo?: string;
  porque?: string;
  observar?: string[];
  modificar?: string[];
  dias: DiaPlan[];
}

export interface PreguntaAuditoria {
  id: string;
  texto: string;
  ayuda?: string;
}

export interface BloqueAuditoria {
  id: string;
  titulo: string;
  porque?: string;
  preguntas: PreguntaAuditoria[];
}

export interface DatosZonas {
  /** Distancia de la marca de referencia (m). */
  distancia: number;
  /** "mm:ss" o "h:mm:ss". */
  marca: string;
  fcUmbral?: number;
  fcMax?: number;
}

export interface PlanEntrenador {
  actualizado?: string;
  estado?: string;
  perfil?: { datos?: [string, string][]; zonas?: Partial<DatosZonas>; pesoKg?: number };
  diagnostico?: { fuente?: string; hallazgos?: { nivel: 'dato' | 'alerta' | 'duda' | string; titulo: string; texto: string }[]; conclusion?: string };
  hojaDeRuta?: { paso: string; texto: string; estado: 'hecho' | 'actual' | 'pendiente' | string }[];
  fases?: { id: string; nombre: string; objetivo: string; duracion: string }[];
  auditoria?: BloqueAuditoria[];
  plan?: { semanas: SemanaPlan[] };
  objetivos?: { nota?: string; lista: [string, string][]; prioridades?: string[]; evaluacion?: string[] };
}

/** Sesión registrada (lo que hiciste y cómo te sentiste). */
export interface RegistroRun extends Registro {
  fecha: string;
  tipo: TipoSesion;
  titulo?: string;
  minutos?: number;
  km?: number;
  fc?: number;
  rpe?: number;
  sueno?: number;
  calidad?: number;
  aquiles?: number;
  rodilla?: number;
  cervical?: number;
  notas?: string;
  /** Sesión del plan a la que corresponde. */
  sesionId?: string;
}

export const TIPOS: [TipoSesion, string][] = [
  ['rodaje', 'Rodaje'],
  ['calidad', 'Calidad'],
  ['tirada', 'Tirada larga'],
  ['competicion', 'Competición o test'],
  ['padel', 'Pádel'],
  ['gimnasio', 'Gimnasio'],
  ['natacion', 'Natación'],
  ['otro', 'Otro'],
];
const OTROS: Partial<Record<TipoSesion, string>> = { descanso: 'Descanso', fuerza: 'Fuerza', movilidad: 'Movilidad' };
export const nombreTipo = (t: TipoSesion) => OTROS[t] || TIPOS.find(([k]) => k === t)?.[1] || 'Sesión';
export const esCarrera = (t: TipoSesion) => t === 'rodaje' || t === 'calidad' || t === 'tirada' || t === 'competicion';

/** Zonas de molestia que se vigilan (antecedentes habituales en corredores; se registran de 0 a 10). */
export const MOLESTIAS: ['aquiles' | 'rodilla' | 'cervical', string][] = [
  ['aquiles', 'Gemelo / Aquiles'],
  ['rodilla', 'Rodilla'],
  ['cervical', 'Cuello / trapecios'],
];
