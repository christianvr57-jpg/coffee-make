// Listas de referencia para los desplegables. Se puede escribir cualquier valor nuevo;
// estas listas solo agilizan y unifican la escritura. Las fichas educativas llegan con la Guía.
import type { NivelTueste, Sintoma, UsoCafe } from '../modelo';

export const PAISES = [
  'Bolivia', 'Brasil', 'Burundi', 'China', 'Colombia', 'Congo (RD)', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador',
  'Etiopía', 'Filipinas', 'Guatemala', 'Haití', 'Honduras', 'India', 'Indonesia', 'Jamaica', 'Kenia', 'Laos',
  'Malaui', 'México', 'Myanmar', 'Nicaragua', 'Panamá', 'Papúa Nueva Guinea', 'Perú', 'República Dominicana',
  'Ruanda', 'Tailandia', 'Tanzania', 'Timor Oriental', 'Uganda', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Hawái (EE. UU.)',
];

export const VARIEDADES = [
  // Etíopes y relacionadas
  'Landrace etíope (heirloom)', '74110', '74112', '74158', 'Kurume', 'Wolisho', 'Dega', 'Gesha / Geisha', 'Wush Wush',
  // Bourbon-Typica
  'Typica', 'Bourbon', 'Bourbon amarillo', 'Bourbon rosado (Pink Bourbon)', 'Bourbon Pointu (Laurina)', 'Caturra', 'Catuaí',
  'Mundo Novo', 'Pacas', 'Villa Sarchi', 'Maragogipe', 'Pacamara', 'Sidra', 'Java', 'Mokka', 'Yemenia', 'Chiroso',
  // Kenia
  'SL28', 'SL34', 'K7', 'Ruiru 11', 'Batian',
  // Híbridos e introgresados
  'Castillo', 'Colombia', 'Cenicafé 1', 'Tabi', 'Catimor', 'Sarchimor', 'Marsellesa', 'Obatã', 'Parainema', 'Lempira',
  'IHCAFE 90', 'Starmaya', 'Centroamericano (H1)', 'S795', 'Kent',
  // Otras especies
  'Robusta (C. canephora)', 'Liberica', 'Excelsa', 'Eugenioides',
];

export const PROCESOS = [
  'Lavado', 'Natural', 'Honey blanco', 'Honey amarillo', 'Honey rojo', 'Honey negro', 'Semilavado (pulped natural)',
  'Wet-hulled (Giling Basah)', 'Doble lavado (Kenia)', 'Anaeróbico lavado', 'Anaeróbico natural', 'Maceración carbónica',
  'Fermentación con levaduras', 'Fermentación láctica', 'Termochoque', 'Co-fermentado / infusionado',
  'Descafeinado (agua)', 'Descafeinado (CO₂)', 'Descafeinado (acetato de etilo)', 'Monsooned',
];

export const TUESTES: [NivelTueste, string][] = [
  ['claro', 'Claro'],
  ['medio-claro', 'Medio-claro'],
  ['medio', 'Medio'],
  ['medio-oscuro', 'Medio-oscuro'],
  ['oscuro', 'Oscuro'],
];

export const USOS: [UsoCafe, string][] = [
  ['filtro', 'Filtro'],
  ['espresso', 'Espresso'],
  ['omni', 'Omni'],
];

/** Sensaciones que describen la extracción. La explicación ayuda a reconocerlas. */
export const SINTOMAS: { id: Sintoma; nombre: string; ayuda: string; tipo: 'defecto' | 'virtud' }[] = [
  { id: 'agrio', nombre: 'Agrio', ayuda: 'Ácido punzante, salado o a limón verde. No es lo mismo que una acidez agradable y jugosa.', tipo: 'defecto' },
  { id: 'amargo', nombre: 'Amargo', ayuda: 'Amargor que se queda al final, a tostado o quemado.', tipo: 'defecto' },
  { id: 'astringente', nombre: 'Astringente', ayuda: 'Sequedad en la lengua y las encías, como el té muy reposado.', tipo: 'defecto' },
  { id: 'aguado', nombre: 'Aguado', ayuda: 'Poco cuerpo y poco sabor: parece diluido.', tipo: 'defecto' },
  { id: 'plano', nombre: 'Plano', ayuda: 'Sin defectos claros pero sin chispa: ni dulzor ni acidez definidos.', tipo: 'defecto' },
  { id: 'intenso', nombre: 'Demasiado fuerte', ayuda: 'Concentrado y pesado; satura el paladar.', tipo: 'defecto' },
  { id: 'dulce', nombre: 'Dulce', ayuda: 'Sensación de azúcar, caramelo o fruta madura.', tipo: 'virtud' },
  { id: 'equilibrado', nombre: 'Equilibrado', ayuda: 'Acidez, dulzor y amargor en armonía, sin que ninguno moleste.', tipo: 'virtud' },
];

export const BEBIDAS_LECHE = ['Solo', 'Cortado', 'Flat white', 'Cappuccino', 'Latte', 'Macchiato', 'Con hielo'];
export const LECHES = ['Entera', 'Semidesnatada', 'Avena', 'Soja', 'Almendra', 'Sin lactosa'];

/** Etiqueta orientativa de la puntuación 1-10 (pensada para empezar a catar). */
export function textoPuntuacion(p: number | undefined): string {
  if (p === undefined) return 'Sin puntuar';
  if (p < 4) return 'No me gusta';
  if (p < 6) return 'Flojo';
  if (p < 7.5) return 'Bueno';
  if (p < 9) return 'Muy bueno';
  if (p < 10) return 'Excelente';
  return 'Excepcional';
}
