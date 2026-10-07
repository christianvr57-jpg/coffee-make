// Catálogo de métodos de preparación con valores de partida y plantilla de fases para el temporizador.
// Las plantillas son genéricas y conservadoras (no son recetas de autor; esas llegan con la biblioteca
// de recetas). Los pesos de cada vertido son acumulados: "vierte hasta X g".
import type { MetodoId } from '../modelo';

export type Familia = 'percolacion' | 'inmersion' | 'hibrido' | 'presion' | 'moka' | 'frio';

export interface FasePlan {
  nombre: string;
  /** Duración prevista en segundos; null = la fase termina cuando tú lo indicas. */
  duracion: number | null;
  /** Peso acumulado de agua al terminar la fase (g), si hay que verter. */
  aguaHasta?: number;
  instruccion: string;
}

export interface Metodo {
  id: MetodoId;
  nombre: string;
  icono: string;
  familia: Familia;
  /** Qué ventana de reposo aplica. */
  reposo: 'filtro' | 'espresso';
  dosis: number;
  /** Agua/café (en espresso: salida/café). */
  ratio: number;
  temperatura: number;
  filtros: string[];
  /** Molienda orientativa en el Comandante C40 (clics), solo como primer punto de partida. */
  clicsC40?: [number, number];
  descripcionMolienda: string;
  /** false = no tiene sentido un temporizador en vivo (cold brew). */
  temporizador: boolean;
  fases: (dosis: number, agua: number) => FasePlan[];
}

const r = (n: number) => Math.round(n);

export const METODOS: Metodo[] = [
  {
    id: 'v60',
    nombre: 'V60',
    icono: 'v60',
    familia: 'percolacion',
    reposo: 'filtro',
    dosis: 15,
    ratio: 16.7,
    temperatura: 93,
    filtros: ['Papel Hario blanco', 'Papel Hario marrón', 'Papel Cafec', 'Papel Sibarist', 'Metálico'],
    clicsC40: [20, 26],
    descripcionMolienda: 'Media-fina, como sal de mesa gruesa',
    temporizador: true,
    fases: (d, a) => [
      { nombre: 'Bloom', duracion: 45, aguaHasta: r(d * 2), instruccion: 'Vierte en espiral hasta mojar todo el café y da un giro suave al dripper.' },
      { nombre: 'Primer vertido', duracion: 30, aguaHasta: r(a * 0.6), instruccion: 'Vertido en espiral desde el centro, sin tocar el papel.' },
      { nombre: 'Segundo vertido', duracion: 30, aguaHasta: a, instruccion: 'Vierte hasta el total manteniendo un nivel constante.' },
      { nombre: 'Drenaje', duracion: 75, instruccion: 'Un giro suave para aplanar la cama y deja drenar. Pulsa Terminar cuando caiga la última gota.' },
    ],
  },
  {
    id: 'kalita',
    nombre: 'Kalita Wave',
    icono: 'v60',
    familia: 'percolacion',
    reposo: 'filtro',
    dosis: 15,
    ratio: 16.7,
    temperatura: 93,
    filtros: ['Papel Kalita Wave 155', 'Papel Kalita Wave 185'],
    clicsC40: [22, 27],
    descripcionMolienda: 'Media',
    temporizador: true,
    fases: (d, a) => [
      { nombre: 'Bloom', duracion: 40, aguaHasta: r(d * 2), instruccion: 'Moja todo el café de forma uniforme.' },
      { nombre: 'Pulso 1', duracion: 25, aguaHasta: r(d * 2 + (a - d * 2) * 0.25), instruccion: 'Pulso corto en círculos pequeños.' },
      { nombre: 'Pulso 2', duracion: 25, aguaHasta: r(d * 2 + (a - d * 2) * 0.5), instruccion: 'Mantén el nivel del agua estable.' },
      { nombre: 'Pulso 3', duracion: 25, aguaHasta: r(d * 2 + (a - d * 2) * 0.75), instruccion: 'Igual que el anterior.' },
      { nombre: 'Pulso 4', duracion: 25, aguaHasta: a, instruccion: 'Último pulso hasta el total.' },
      { nombre: 'Drenaje', duracion: 60, instruccion: 'Deja drenar. Pulsa Terminar al acabar.' },
    ],
  },
  {
    id: 'chemex',
    nombre: 'Chemex',
    icono: 'chemex',
    familia: 'percolacion',
    reposo: 'filtro',
    dosis: 30,
    ratio: 16.7,
    temperatura: 94,
    filtros: ['Papel Chemex blanco', 'Papel Chemex natural'],
    clicsC40: [26, 31],
    descripcionMolienda: 'Media-gruesa (el papel Chemex es grueso y drena lento)',
    temporizador: true,
    fases: (d, a) => [
      { nombre: 'Bloom', duracion: 45, aguaHasta: r(d * 2), instruccion: 'Moja todo el café y remueve suave.' },
      { nombre: 'Primer vertido', duracion: 45, aguaHasta: r(a * 0.5), instruccion: 'Vertido continuo en espiral.' },
      { nombre: 'Segundo vertido', duracion: 60, aguaHasta: a, instruccion: 'Hasta el total, sin desbordar.' },
      { nombre: 'Drenaje', duracion: 120, instruccion: 'Deja drenar. Pulsa Terminar al acabar.' },
    ],
  },
  {
    id: 'aeropress',
    nombre: 'AeroPress',
    icono: 'aeropress',
    familia: 'inmersion',
    reposo: 'filtro',
    dosis: 15,
    ratio: 16,
    temperatura: 90,
    filtros: ['Papel AeroPress', 'Metálico'],
    clicsC40: [16, 22],
    descripcionMolienda: 'Media-fina',
    temporizador: true,
    fases: (_d, a) => [
      { nombre: 'Verter', duracion: 10, aguaHasta: a, instruccion: 'Vierte todo el agua de una vez.' },
      { nombre: 'Remover', duracion: 10, instruccion: 'Remueve 3-4 veces y coloca el émbolo sin presionar (hace vacío).' },
      { nombre: 'Infusión', duracion: 85, instruccion: 'Espera sin tocar.' },
      { nombre: 'Presionar', duracion: 30, instruccion: 'Presiona suave y constante. Para al oír el silbido.' },
    ],
  },
  {
    id: 'aeropress-inv',
    nombre: 'AeroPress invertida',
    icono: 'aeropress',
    familia: 'inmersion',
    reposo: 'filtro',
    dosis: 15,
    ratio: 16,
    temperatura: 90,
    filtros: ['Papel AeroPress', 'Metálico'],
    clicsC40: [16, 22],
    descripcionMolienda: 'Media-fina',
    temporizador: true,
    fases: (_d, a) => [
      { nombre: 'Verter', duracion: 10, aguaHasta: a, instruccion: 'Con la AeroPress invertida, vierte todo el agua.' },
      { nombre: 'Remover', duracion: 10, instruccion: 'Remueve 3-4 veces.' },
      { nombre: 'Infusión', duracion: 70, instruccion: 'Espera. Mientras, enjuaga el filtro en la tapa.' },
      { nombre: 'Tapar y girar', duracion: 15, instruccion: 'Enrosca la tapa con el filtro y gírala con cuidado sobre la taza.' },
      { nombre: 'Presionar', duracion: 30, instruccion: 'Presiona suave y constante.' },
    ],
  },
  {
    id: 'clever',
    nombre: 'Clever',
    icono: 'v60',
    familia: 'hibrido',
    reposo: 'filtro',
    dosis: 18,
    ratio: 16.7,
    temperatura: 94,
    filtros: ['Papel Melitta 1x4', 'Papel Clever'],
    clicsC40: [22, 28],
    descripcionMolienda: 'Media',
    temporizador: true,
    fases: (_d, a) => [
      { nombre: 'Verter', duracion: 15, aguaHasta: a, instruccion: 'Agua primero y café después (o al revés), todo de una vez.' },
      { nombre: 'Remover', duracion: 15, instruccion: 'Remueve suave para mojar todo el café.' },
      { nombre: 'Infusión', duracion: 90, instruccion: 'Tapa y espera.' },
      { nombre: 'Drenaje', duracion: 60, instruccion: 'Coloca el Clever sobre la taza. Pulsa Terminar cuando acabe de caer.' },
    ],
  },
  {
    id: 'prensa',
    nombre: 'Prensa francesa',
    icono: 'prensa',
    familia: 'inmersion',
    reposo: 'filtro',
    dosis: 30,
    ratio: 16.7,
    temperatura: 95,
    filtros: ['Malla metálica'],
    clicsC40: [28, 35],
    descripcionMolienda: 'Media-gruesa',
    temporizador: true,
    fases: (_d, a) => [
      { nombre: 'Verter', duracion: 15, aguaHasta: a, instruccion: 'Vierte todo el agua.' },
      { nombre: 'Infusión', duracion: 225, instruccion: 'Espera sin tapar ni remover.' },
      { nombre: 'Romper costra', duracion: 30, instruccion: 'Remueve la costra de la superficie y retira la espuma con dos cucharas.' },
      { nombre: 'Presionar y servir', duracion: 30, instruccion: 'Coloca la tapa, baja el émbolo solo hasta la superficie y sirve despacio.' },
    ],
  },
  {
    id: 'moka',
    nombre: 'Moka',
    icono: 'moka',
    familia: 'moka',
    reposo: 'espresso',
    dosis: 15,
    ratio: 10,
    temperatura: 80,
    filtros: ['Filtro de la cafetera'],
    clicsC40: [11, 15],
    descripcionMolienda: 'Fina, algo más gruesa que espresso',
    temporizador: true,
    fases: () => [
      { nombre: 'Calentar', duracion: null, instruccion: 'Agua caliente en la base hasta la válvula, café sin prensar, fuego medio y tapa abierta. Pulsa Siguiente cuando empiece a salir.' },
      { nombre: 'Salida', duracion: null, instruccion: 'Cuando el chorro se aclare o empiece a gorgotear, retira del fuego y enfría la base. Pulsa Terminar.' },
    ],
  },
  {
    id: 'coldbrew',
    nombre: 'Cold brew',
    icono: 'frio',
    familia: 'frio',
    reposo: 'filtro',
    dosis: 60,
    ratio: 10,
    temperatura: 20,
    filtros: ['Papel', 'Tela', 'Metálico'],
    clicsC40: [30, 36],
    descripcionMolienda: 'Gruesa',
    temporizador: false,
    fases: () => [],
  },
  {
    id: 'espresso',
    nombre: 'Espresso',
    icono: 'espresso',
    familia: 'presion',
    reposo: 'espresso',
    dosis: 18,
    ratio: 2,
    temperatura: 93,
    filtros: ['Cesta de serie', 'Cesta de precisión'],
    descripcionMolienda: 'Fina',
    temporizador: true,
    fases: () => [{ nombre: 'Extracción', duracion: null, instruccion: 'Pulsa Primera gota cuando caiga y Parar al llegar al peso objetivo.' }],
  },
];

export const metodo = (id: MetodoId): Metodo => METODOS.find((m) => m.id === id) || METODOS[0];
export const esEspresso = (id: MetodoId) => id === 'espresso';
