// Modelo de datos del módulo Café.
import type { Registro } from '../../core/db';

export type TipoEquipo = 'cafetera' | 'molino' | 'bascula' | 'hervidor' | 'dripper' | 'cesta' | 'otro';

export interface AjustesMolino {
  escala: 'clics' | 'numero';
  min: number;
  max: number;
  paso: number;
  /** Cambio aproximado de tamaño de partícula por paso, si se conoce. */
  micrasPorPaso?: number;
  manual: boolean;
}

export interface Equipo extends Registro {
  tipo: TipoEquipo;
  nombre: string;
  marca?: string;
  modelo?: string;
  notas?: string;
  molino?: AjustesMolino;
  cafetera?: { portafiltroMm?: number; tempMin?: number; tempMax?: number; preinfusionMax?: number; manometro?: boolean };
  activo: boolean;
}

export interface Agua extends Registro {
  nombre: string;
  tipo: 'filtrada' | 'embotellada' | 'grifo' | 'receta';
  /** Residuo seco a 180 °C, mg/L (lo que trae la etiqueta de las botellas). */
  residuoSeco?: number;
  /** Dureza general y alcalinidad, ppm como CaCO₃. */
  gh?: number;
  kh?: number;
  notas?: string;
}

export type NivelTueste = 'claro' | 'medio-claro' | 'medio' | 'medio-oscuro' | 'oscuro';
export type UsoCafe = 'filtro' | 'espresso' | 'omni';

export interface Congelacion {
  desde: string;
  hasta?: string;
}

export interface Cafe extends Registro {
  nombre: string;
  tostador: string;
  pais?: string;
  region?: string;
  productor?: string;
  altitudMin?: number;
  altitudMax?: number;
  variedades: string[];
  procesos: string[];
  tueste?: NivelTueste;
  uso?: UsoCafe;
  fechaTueste?: string;
  fechaApertura?: string;
  congelaciones: Congelacion[];
  pesoG?: number;
  precio?: number;
  notasTostador: string[];
  notas?: string;
  fotoId?: string;
  terminado?: boolean;
}

export type MetodoId =
  | 'v60' | 'kalita' | 'chemex' | 'aeropress' | 'aeropress-inv' | 'clever' | 'prensa' | 'moka' | 'coldbrew' | 'espresso';

export interface FaseReal {
  nombre: string;
  inicio: number;
  fin: number;
}

export type Sintoma = 'agrio' | 'amargo' | 'astringente' | 'aguado' | 'plano' | 'intenso' | 'dulce' | 'equilibrado';

export interface Preparacion extends Registro {
  fecha: number;
  cafeId?: string;
  /** Copia del nombre por si el café se borra. */
  cafeNombre?: string;
  metodo: MetodoId;
  recetaId?: string;
  molinoId?: string;
  molienda?: number;
  cafeteraId?: string;
  aguaId?: string;
  filtro?: string;
  dosis: number;
  /** Agua total vertida (g). En espresso no se usa. */
  agua?: number;
  /** Gramos en taza: salida del espresso o bebida pesada en filtro. */
  rendimiento?: number;
  temperatura?: number;
  /** Segundos. */
  tiempoTotal?: number;
  preinfusion?: number;
  primeraGota?: number;
  presion?: number;
  bebida?: { tipo: string; leche?: string; ml?: number };
  /** % de sólidos disueltos (refractómetro). */
  tds?: number;
  fases?: FaseReal[];
  /** Días de reposo efectivos el día de la preparación. */
  diasReposo?: number;
  /** 1-10 en pasos de 0,5. */
  puntuacion?: number;
  sintomas: Sintoma[];
  notas?: string;
  /** Preparación de la que parte ("repetir cambiando una variable"). */
  padreId?: string;
  /** Cata completa (opcional). Va dentro de la preparación porque es 1 a 1. */
  cata?: Cata;
}

export interface ValorAtributo {
  /** 1-5: de "me disgusta" a "me encanta". */
  agrado?: number;
  /** 1-3: baja, media, alta. */
  intensidad?: number;
}

export interface Cata {
  fecha: number;
  atributos: Partial<Record<import('./datos/cata').AtributoId, ValorAtributo>>;
  acidezTipos: string[];
  textura?: string;
  /** Ids de la rueda de sabores (familia, grupo o matiz). */
  sabores: string[];
  defectos: string[];
}

/** Fotos comprimidas (paquetes de café, etc.). */
export interface Foto {
  id: string;
  blob: Blob;
  tipo: string;
  creado: number;
}
