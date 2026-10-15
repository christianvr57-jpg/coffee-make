// Tipos del módulo Cocina (menú semanal familiar).
import type { Registro } from '../../core/db';

/** Categorías de la lista de la compra. */
export type Categoria = 'fruta-verdura' | 'proteina' | 'lacteo' | 'cereal-legumbre' | 'despensa';

export const CATEGORIAS: [Categoria, string][] = [
  ['fruta-verdura', 'Verduras y frutas'],
  ['proteina', 'Pescado, carne y huevos'],
  ['lacteo', 'Lácteos'],
  ['cereal-legumbre', 'Cereales, pan y legumbres'],
  ['despensa', 'Despensa'],
];

/** Proteína principal del plato: es lo que se cuenta para el equilibrio semanal. */
export type Proteina = 'legumbre' | 'pescado-blanco' | 'pescado-azul' | 'huevo' | 'carne-blanca' | 'carne-roja' | 'vegetal';

export const PROTEINAS: Record<Proteina, string> = {
  legumbre: 'Legumbre',
  'pescado-blanco': 'Pescado blanco',
  'pescado-azul': 'Pescado azul',
  huevo: 'Huevo',
  'carne-blanca': 'Carne blanca',
  'carne-roja': 'Carne roja',
  vegetal: 'Verdura y lácteo',
};

export type Aparato = 'horno' | 'freidora' | 'olla-rapida';
export const APARATOS: Record<Aparato, string> = { horno: 'Horno', freidora: 'Freidora de aire', 'olla-rapida': 'Olla rápida' };

export interface Ingrediente {
  n: string;
  c: Categoria;
}

export interface Receta {
  id: string;
  nombre: string;
  proteina: Proteina;
  /** Minutos totales aproximados (con los ingredientes del batch cooking ya listos si se indica). */
  minutos: number;
  aparato?: Aparato;
  /** Guarnición o acompañamiento, en una línea. */
  acompanamiento?: string;
  ingredientes: Ingrediente[];
  pasos: string[];
  nino: {
    /** Cómo adaptar la textura (siempre sin sal: se separa su ración antes de salar). */
    adaptacion: string;
    /** Ración orientativa para 1 año. */
    racion: string;
  };
}

export type Momento = 'comida' | 'cena';

/** Merienda o desayuno del niño. */
export interface Toma {
  id: string;
  texto: string;
  racion: string;
  ingredientes: Ingrediente[];
}

export interface DiaPlan {
  comida: string;
  cena: string;
  /** Merienda del niño. */
  merienda: string;
  /** Solo sábado y domingo. */
  desayuno?: string;
}

export interface SemanaPlan {
  numero: number;
  dias: DiaPlan[];
  /** Preparación anticipada (domingo anterior). */
  lote: string[];
}

/** Cambio de plato en una fecha concreta. id = "AAAA-MM-DD|comida". */
export interface CambioPlato extends Registro {
  fecha: string;
  momento: Momento;
  recetaId: string;
}

/** Estado de un artículo de la lista de la compra. id = "<lunes>|<nombre>". */
export interface ArticuloCompra extends Registro {
  lunes: string;
  nombre: string;
  c: Categoria;
  hecho: boolean;
  /** Añadido a mano (no viene del menú). */
  manual?: boolean;
}
