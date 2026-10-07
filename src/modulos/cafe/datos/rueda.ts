// Léxico de sabores para la rueda interactiva.
// Inspirado en el léxico sensorial de World Coffee Research y en la rueda de sabores SCA/WCR,
// pero con jerarquía, agrupación y términos propios en castellano (la rueda oficial tiene licencia
// CC BY-NC-ND y no se reproduce). Tres niveles: familia → grupo → matiz.

export interface NodoSabor {
  id: string;
  nombre: string;
  /** Etiqueta corta para la rueda cuando el nombre no cabe. */
  corto?: string;
  hijos?: NodoSabor[];
}

export interface Familia extends NodoSabor {
  color: string;
  hijos: NodoSabor[];
}

type Def = [string, string, (string | [string, string])[]];

function familia(id: string, nombre: string, color: string, grupos: Def[], corto?: string): Familia {
  return {
    id,
    nombre,
    corto,
    color,
    hijos: grupos.map(([gid, gnombre, matices]) => ({
      id: `${id}/${gid}`,
      nombre: gnombre,
      hijos: matices.map((m) => {
        const [nombreM, cortoM] = Array.isArray(m) ? m : [m, undefined];
        const slug = nombreM.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return { id: `${id}/${gid}/${slug}`, nombre: nombreM, corto: cortoM };
      }),
    })),
  };
}

export const RUEDA: Familia[] = [
  familia('frutal', 'Frutal', '#e0445a', [
    ['rojos', 'Frutos rojos', ['Fresa', 'Frambuesa', 'Cereza', 'Grosella', 'Arándano rojo']],
    ['bayas', 'Bayas oscuras', ['Arándano', 'Mora', ['Grosella negra', 'Cassis']]],
    ['citricos', 'Cítricos', ['Limón', 'Lima', 'Naranja', 'Mandarina', 'Pomelo', 'Bergamota']],
    ['hueso', 'Fruta de hueso', ['Melocotón', 'Albaricoque', 'Ciruela', 'Nectarina']],
    ['tropical', 'Tropical', ['Mango', 'Piña', 'Maracuyá', 'Papaya', 'Lichi', 'Guayaba']],
    ['pepita', 'Manzana y pera', ['Manzana verde', 'Manzana roja', 'Pera', 'Membrillo']],
    ['uva', 'Uva', ['Uva blanca', 'Uva negra']],
    ['seca', 'Fruta seca', ['Pasas', 'Ciruela pasa', 'Dátil', 'Higo', 'Orejón']],
  ]),
  familia('floral', 'Floral', '#a565d6', [
    ['blancas', 'Flores blancas', ['Jazmín', 'Azahar', 'Flor de café', 'Madreselva']],
    ['flores', 'Flores', ['Rosa', 'Lavanda', 'Hibisco', 'Violeta']],
    ['te', 'Té e infusiones', ['Té negro', 'Té verde', 'Earl Grey', 'Manzanilla']],
  ]),
  familia('dulce', 'Dulce', '#e09a2c', [
    ['azucar', 'Azúcares', ['Azúcar moreno', 'Panela', 'Caramelo', 'Toffee', ['Jarabe de arce', 'Arce'], 'Melaza']],
    ['miel', 'Miel y vainilla', ['Miel', 'Vainilla']],
    ['reposteria', 'Repostería', ['Galleta', 'Bizcocho', 'Turrón', 'Mazapán']],
  ]),
  familia('cacao', 'Chocolate', '#8a5a3b', [
    ['chocolate', 'Chocolate', [['Chocolate negro', 'Choc. negro'], ['Chocolate con leche', 'Choc. leche'], 'Cacao', ['Nibs de cacao', 'Nibs']]],
  ]),
  familia('frutos-secos', 'Frutos secos', '#b88a5a', [
    ['secos', 'Frutos secos', ['Almendra', 'Avellana', 'Nuez', 'Cacahuete', 'Pistacho', 'Macadamia']],
  ], 'F. secos'),
  familia('especias', 'Especias', '#d1663a', [
    ['dulces', 'Especias dulces', ['Canela', 'Clavo', ['Nuez moscada', 'N. moscada'], 'Anís', 'Cardamomo', 'Jengibre']],
    ['picantes', 'Pimientas', [['Pimienta negra', 'P. negra'], ['Pimienta rosa', 'P. rosa']]],
  ]),
  familia('tostado', 'Tostado', '#7a6a5c', [
    ['cereal', 'Cereal', ['Malta', 'Cebada', 'Pan', 'Avena']],
    ['tostado', 'Tostado', ['Pan tostado', 'Tabaco', 'Cuero', 'Ahumado', 'Leña']],
  ]),
  familia('fermentado', 'Fermentado', '#b0335c', [
    ['vino', 'Vinoso', ['Vino tinto', 'Vino blanco', 'Sidra', 'Kombucha']],
    ['licor', 'Licor', ['Ron', 'Whisky', 'Brandy', ['Licor de cereza', 'Kirsch']]],
  ], 'Ferment.'),
  familia('lacteo', 'Lácteo', '#d9b25f', [
    ['lacteo', 'Lácteo', ['Mantequilla', 'Nata', 'Yogur', ['Leche condensada', 'Condensada']]],
  ]),
  familia('verde', 'Verde y herbal', '#4f9c57', [
    ['herbal', 'Herbal', ['Hierba fresca', 'Menta', 'Albahaca', 'Romero']],
    ['vegetal', 'Vegetal', ['Guisante', ['Pimiento verde', 'Pimiento'], 'Tomate']],
  ], 'Verde'),
];

/** Índice id → nodo y su familia, para pintar chips y buscar. */
export const INDICE_SABORES: Map<string, { nodo: NodoSabor; familia: Familia; ruta: string[] }> = new Map();
for (const f of RUEDA) {
  INDICE_SABORES.set(f.id, { nodo: f, familia: f, ruta: [f.nombre] });
  for (const g of f.hijos) {
    INDICE_SABORES.set(g.id, { nodo: g, familia: f, ruta: [f.nombre, g.nombre] });
    for (const m of g.hijos || []) INDICE_SABORES.set(m.id, { nodo: m, familia: f, ruta: [f.nombre, g.nombre, m.nombre] });
  }
}

export const nombreSabor = (id: string) => INDICE_SABORES.get(id)?.nodo.nombre || id;
export const colorSabor = (id: string) => INDICE_SABORES.get(id)?.familia.color || '#888';
