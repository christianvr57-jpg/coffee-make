// Tipos del módulo Hogar.
export type Frecuencia = 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
export type Momento = 'manana' | 'dia' | 'fija' | 'noche';

export interface PlanPeriodica {
  /** Mes dentro del periodo (1-3 trimestral, 1-6 semestral, 1-12 anual; ignorado en mensual). */
  mes: number;
  /** 1-4: n-ésimo día de la semana del mes. */
  semana: number;
  /** 1 (lunes) … 7 (domingo). */
  dia: number;
}

export interface Tarea {
  id: string;
  titulo: string;
  categoria: string;
  frecuencia: Frecuencia;
  momento?: Momento;
  minutos: number;
  notas?: string;
  dias?: number[];
  semana?: 'A' | 'B';
  cadaDias?: number;
  requiere?: 'camaBaja';
  plan?: PlanPeriodica;
  meses?: number[];
  /** Solo en datos fuente: mes preferido para repartir. */
  mes?: number;
}

export interface Colada {
  id: string;
  dia: number;
  semana: 'A' | 'B' | null;
  titulo: string;
  ropa: string[];
  programa: string;
  temperatura: string;
  centrifugado: string;
  aditivos: string;
  minutos: number;
  notas: string[];
}

export interface Rutina {
  version: number;
  categorias: Record<string, { nombre: string; icono: string }>;
  coladas: Colada[];
  tareas: Tarea[];
}

export interface AjustesHogar {
  camaBaja: boolean;
  semanaAuto: boolean;
  semanaAncla: { lunes: string; tipo: 'A' | 'B' };
  /** Fecha desde la que se usa la app: lo periódico anterior no se arrastra. */
  inicio: string | null;
}
