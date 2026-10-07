// Protocolo de cata doméstico, inspirado en el Coffee Value Assessment (CVA) de la SCA:
// separa lo que percibes (intensidad) de cuánto te gusta (agrado). Simplificado para empezar:
// agrado en 5 niveles e intensidad en 3.

export type AtributoId = 'fragancia' | 'aroma' | 'sabor' | 'acidez' | 'dulzor' | 'cuerpo' | 'retrogusto' | 'balance' | 'limpieza';

export interface DefAtributo {
  id: AtributoId;
  nombre: string;
  /** Qué es, en una frase. */
  que: string;
  /** Cómo evaluarlo en casa. */
  como: string;
  /** Si tiene sentido valorar la intensidad (baja/media/alta). */
  intensidad: boolean;
}

export const ATRIBUTOS: DefAtributo[] = [
  { id: 'fragancia', nombre: 'Fragancia', que: 'El olor del café recién molido, en seco.', como: 'Huele el molido justo antes de preparar. Inspira corto varias veces.', intensidad: true },
  { id: 'aroma', nombre: 'Aroma', que: 'El olor del café ya preparado.', como: 'Acerca la nariz a la taza caliente nada más servir.', intensidad: true },
  { id: 'sabor', nombre: 'Sabor', que: 'La impresión general en boca: gustos y aromas juntos.', como: 'Sorbe con fuerza para repartirlo por toda la boca y que llegue a la nariz.', intensidad: true },
  { id: 'acidez', nombre: 'Acidez', que: 'La viveza o brillo que hace salivar. Buena acidez = jugosa; mala = agria.', como: 'Fíjate en los laterales de la lengua y en si te hace salivar.', intensidad: true },
  { id: 'dulzor', nombre: 'Dulzor', que: 'Sensación de azúcar, caramelo o fruta madura.', como: 'Mejor al templarse: el dulzor se nota más que con el café muy caliente.', intensidad: true },
  { id: 'cuerpo', nombre: 'Cuerpo', que: 'El peso y la textura en boca: del agua a la leche entera.', como: 'Pasa el café por la lengua contra el paladar. ¿Ligero, sedoso, denso?', intensidad: true },
  { id: 'retrogusto', nombre: 'Retrogusto', que: 'Lo que queda en la boca después de tragar.', como: 'Traga y espera unos segundos: ¿cuánto dura y es agradable?', intensidad: true },
  { id: 'balance', nombre: 'Balance', que: 'Si acidez, dulzor y amargor están en armonía.', como: 'Pregúntate si algo destaca demasiado o falta.', intensidad: false },
  { id: 'limpieza', nombre: 'Limpieza', que: 'Ausencia de sabores extraños o sucios de principio a fin.', como: 'Pruébalo también tibio: los defectos aparecen al enfriarse.', intensidad: false },
];

export const AGRADO = ['', 'Me disgusta', 'No me gusta', 'Neutro', 'Me gusta', 'Me encanta'];
export const INTENSIDAD = ['', 'Baja', 'Media', 'Alta'];

export const TIPOS_ACIDEZ: { id: string; nombre: string; ejemplo: string }[] = [
  { id: 'citrica', nombre: 'Cítrica', ejemplo: 'limón, naranja, pomelo' },
  { id: 'malica', nombre: 'Málica', ejemplo: 'manzana verde, pera' },
  { id: 'tartarica', nombre: 'Tartárica', ejemplo: 'uva, vino blanco' },
  { id: 'fosforica', nombre: 'Fosfórica', ejemplo: 'chispeante, como un refresco de cola' },
  { id: 'lactica', nombre: 'Láctica', ejemplo: 'suave y cremosa, como el yogur' },
  { id: 'acetica', nombre: 'Acética', ejemplo: 'avinagrada; en exceso es un defecto' },
];

export const TEXTURAS = ['Acuoso', 'Ligero', 'Sedoso', 'Cremoso', 'Almibarado', 'Denso', 'Áspero'];

export const DEFECTOS: { id: string; nombre: string; pista: string }[] = [
  { id: 'papel', nombre: 'Papel / cartón', pista: 'Suele ser el filtro sin enjuagar o café viejo. Enjuaga el papel con agua caliente.' },
  { id: 'viejo', nombre: 'Rancio / viejo', pista: 'Café pasado de su ventana o mal conservado (aire, luz, calor).' },
  { id: 'quimico', nombre: 'Químico / cloro', pista: 'Casi siempre el agua: prueba con otra agua filtrada o embotellada.' },
  { id: 'quemado', nombre: 'Quemado / ceniza', pista: 'Tueste muy oscuro o agua demasiado caliente con un tueste oscuro.' },
  { id: 'fermentado', nombre: 'Fermentado en exceso', pista: 'Vinagre o fruta podrida. Puede venir del proceso del café.' },
  { id: 'mohoso', nombre: 'Mohoso / terroso', pista: 'Humedad en el almacenaje del café verde. No se arregla preparando.' },
  { id: 'fenolico', nombre: 'Fenólico / medicinal', pista: 'Defecto del grano (contaminación). No se arregla preparando.' },
  { id: 'patata', nombre: 'Patata cruda', pista: 'Defecto de algunos cafés de África del Este por daño de insectos. Suele ser una taza puntual.' },
  { id: 'verde', nombre: 'Verde / heno', pista: 'Tueste poco desarrollado o café muy fresco.' },
  { id: 'goma', nombre: 'Goma / caucho', pista: 'Típico de algunos robustas o granos defectuosos.' },
];
