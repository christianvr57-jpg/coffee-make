// Acceso a datos del módulo Café: consultas, equipo inicial y datos de ejemplo.
import { signal } from '@preact/signals';
import { db, guardar, leerAjuste, escribirAjuste, vivos } from '../../core/db';
import { addDays, iso } from '../../core/fechas';
import { ulid } from '../../core/ids';
import type { Agua, Cafe, Equipo, MetodoId, Preparacion } from './modelo';
import { diasReposo } from './calculos';

// ---------- Ajustes del módulo ----------------------------------------------------------------------
export interface AjustesCafe {
  sonido: boolean;
  pantallaEncendida: boolean;
}
export const ajustesCafe = signal<AjustesCafe>({ sonido: true, pantallaEncendida: true });
export async function cambiarAjustesCafe(p: Partial<AjustesCafe>) {
  ajustesCafe.value = { ...ajustesCafe.value, ...p };
  await escribirAjuste('cafe', ajustesCafe.value);
}

// ---------- Consultas -----------------------------------------------------------------------------------
export const listarCafes = async () => vivos(await db.cafe_cafes.toArray()).sort((a, b) => (b.fechaTueste || '').localeCompare(a.fechaTueste || ''));
export const listarPreparaciones = async () => vivos(await db.cafe_preparaciones.orderBy('fecha').reverse().toArray());
export const listarEquipo = async () => vivos(await db.cafe_equipo.toArray());
export const listarAguas = async () => vivos(await db.cafe_aguas.toArray());

/** Última preparación con ese café y método; si no hay, la última con ese método. */
export async function ultimaReferencia(cafeId: string | undefined, m: MetodoId): Promise<Preparacion | undefined> {
  const todas = await listarPreparaciones();
  return todas.find((p) => p.metodo === m && p.cafeId === cafeId && cafeId) || todas.find((p) => p.metodo === m);
}

// ---------- Equipo inicial (tu equipo real) -----------------------------------------------------------
export const ID_G3006 = 'eq-gemilai-g3006';
export const ID_G5 = 'eq-hibrew-g5';
export const ID_C40 = 'eq-comandante-c40';

function equipoInicial(): Partial<Equipo>[] {
  return [
    {
      id: ID_G3006, tipo: 'cafetera', nombre: 'Gemilai G3006 «Owl»', marca: 'Gemilai', modelo: 'G3006', activo: true,
      cafetera: { portafiltroMm: 58, tempMin: 80, tempMax: 101, preinfusionMax: 10, manometro: true },
      notas: 'Portafiltro de 58 mm, PID 80-101 °C, preinfusión regulable 0-10 s y manómetro.',
    },
    {
      id: ID_G5, tipo: 'molino', nombre: 'HiBREW G5', marca: 'HiBREW', modelo: 'G5', activo: true,
      molino: { escala: 'numero', min: 1, max: 36, paso: 1, manual: false },
      notas: 'Eléctrico, muelas cónicas de 48 mm y 36 posiciones.',
    },
    {
      id: ID_C40, tipo: 'molino', nombre: 'Comandante C40', marca: 'Comandante', modelo: 'C40 MK4', activo: true,
      molino: { escala: 'clics', min: 0, max: 45, paso: 1, micrasPorPaso: 30, manual: true },
      notas: 'Manual. Unos 30 µm por clic (sin Red Clix). Cuenta los clics desde cerrado del todo.',
    },
  ];
}

function aguasIniciales(): Partial<Agua>[] {
  return [
    { id: 'agua-filtrada', nombre: 'Filtrada (jarra)', tipo: 'filtrada', notas: 'Agua del grifo pasada por filtro de jarra.' },
    { id: 'agua-debil', nombre: 'Mineralización débil (botella)', tipo: 'embotellada', notas: 'Apunta el residuo seco de la etiqueta para poder comparar marcas.' },
  ];
}

// ---------- Datos de ejemplo --------------------------------------------------------------------------
function datosDemo(): { cafes: Partial<Cafe>[]; preps: Partial<Preparacion>[] } {
  const hoy = new Date();
  const dia = (n: number) => iso(addDays(hoy, n));
  const ts = (diasAtras: number, hora: number) => {
    const d = addDays(hoy, -diasAtras);
    d.setHours(hora, 15, 0, 0);
    return d.getTime();
  };
  const guji: Partial<Cafe> = {
    id: 'demo-cafe-guji', demo: true, nombre: 'Guji Hambela (ejemplo)', tostador: 'Tostador de ejemplo', pais: 'Etiopía', region: 'Guji',
    productor: 'Pequeños productores de Hambela', altitudMin: 1900, altitudMax: 2200, variedades: ['Landrace etíope (heirloom)'], procesos: ['Natural'],
    tueste: 'claro', uso: 'filtro', fechaTueste: dia(-12), fechaApertura: dia(-6), congelaciones: [], pesoG: 250, precio: 16.5,
    notasTostador: ['Arándano', 'Jazmín', 'Chocolate con leche'],
  };
  const huila: Partial<Cafe> = {
    id: 'demo-cafe-huila', demo: true, nombre: 'Huila El Mirador (ejemplo)', tostador: 'Tostador de ejemplo', pais: 'Colombia', region: 'Huila',
    productor: 'Pequeños productores de Pitalito', altitudMin: 1700, altitudMax: 1900, variedades: ['Caturra', 'Castillo'], procesos: ['Lavado'],
    tueste: 'medio-claro', uso: 'omni', fechaTueste: dia(-20), fechaApertura: dia(-10), congelaciones: [], pesoG: 250, precio: 13.9,
    notasTostador: ['Panela', 'Naranja', 'Cacao'],
  };
  const cerrado: Partial<Cafe> = {
    id: 'demo-cafe-cerrado', demo: true, nombre: 'Cerrado Mineiro (ejemplo)', tostador: 'Tostador de ejemplo', pais: 'Brasil', region: 'Cerrado Mineiro',
    altitudMin: 1000, altitudMax: 1200, variedades: ['Mundo Novo', 'Catuaí'], procesos: ['Natural'], tueste: 'medio', uso: 'espresso',
    fechaTueste: dia(-16), fechaApertura: dia(-9), congelaciones: [], pesoG: 1000, precio: 26, notasTostador: ['Avellana', 'Chocolate negro', 'Caramelo'],
  };
  const base = { demo: true, sintomas: [] as Preparacion['sintomas'], aguaId: 'agua-debil' };
  const v60 = (n: number, diasAtras: number, clics: number, punt: number, extra: Partial<Preparacion> = {}): Partial<Preparacion> => ({
    ...base, id: `demo-prep-v60-${n}`, fecha: ts(diasAtras, 8), cafeId: guji.id, cafeNombre: guji.nombre, metodo: 'v60', molinoId: ID_C40,
    molienda: clics, dosis: 15, agua: 250, temperatura: 93, filtro: 'Papel Hario blanco', puntuacion: punt, ...extra,
  });
  const esp = (n: number, diasAtras: number, g5: number, salida: number, t: number, punt: number, extra: Partial<Preparacion> = {}): Partial<Preparacion> => ({
    ...base, id: `demo-prep-esp-${n}`, fecha: ts(diasAtras, 10), cafeId: cerrado.id, cafeNombre: cerrado.nombre, metodo: 'espresso', molinoId: ID_G5,
    cafeteraId: ID_G3006, molienda: g5, dosis: 18, rendimiento: salida, tiempoTotal: t, primeraGota: 7, temperatura: 93, preinfusion: 5,
    filtro: 'Cesta de serie', puntuacion: punt, ...extra,
  });
  const preps: Partial<Preparacion>[] = [
    v60(1, 6, 26, 6, { tiempoTotal: 155, sintomas: ['agrio', 'aguado'], notas: 'Corto de tiempo, acidez punzante.' }),
    v60(2, 5, 23, 7.5, { tiempoTotal: 178, sintomas: ['dulce'], padreId: 'demo-prep-v60-1', notas: 'Más dulce, aparece el arándano.' }),
    v60(3, 4, 21, 6.5, { tiempoTotal: 214, sintomas: ['astringente'], padreId: 'demo-prep-v60-2', notas: 'Me pasé: final seco.' }),
    v60(4, 3, 22, 8.5, { tiempoTotal: 192, sintomas: ['dulce', 'equilibrado'], padreId: 'demo-prep-v60-3', tds: 1.34, rendimiento: 213, notas: 'Jazmín y arándano muy claros. Esta es la buena.',
      cata: {
        fecha: ts(3, 9), acidezTipos: ['citrica', 'tartarica'], textura: 'Sedoso', defectos: [],
        sabores: ['frutal/bayas/arandano', 'floral/blancas/jazmin', 'cacao/chocolate/chocolate-con-leche', 'dulce/miel'],
        atributos: { fragancia: { agrado: 5, intensidad: 3 }, aroma: { agrado: 5, intensidad: 3 }, sabor: { agrado: 5, intensidad: 2 }, acidez: { agrado: 4, intensidad: 3 }, dulzor: { agrado: 5, intensidad: 2 }, cuerpo: { agrado: 4, intensidad: 1 }, retrogusto: { agrado: 4, intensidad: 2 }, balance: { agrado: 4 }, limpieza: { agrado: 5 } },
      } }),
    v60(5, 1, 22, 8, { tiempoTotal: 189, temperatura: 94, sintomas: ['dulce'], padreId: 'demo-prep-v60-4' }),
    { ...base, id: 'demo-prep-ap-1', fecha: ts(7, 17), cafeId: huila.id, cafeNombre: huila.nombre, metodo: 'aeropress', molinoId: ID_C40, molienda: 18, dosis: 15, agua: 240, temperatura: 90, tiempoTotal: 135, filtro: 'Papel AeroPress', puntuacion: 7, sintomas: ['equilibrado'], notas: 'Panela y naranja, cuerpo medio.' },
    { ...base, id: 'demo-prep-ap-2', fecha: ts(2, 17), cafeId: huila.id, cafeNombre: huila.nombre, metodo: 'aeropress', molinoId: ID_C40, molienda: 17, dosis: 15, agua: 240, temperatura: 92, tiempoTotal: 140, filtro: 'Papel AeroPress', puntuacion: 7.5, sintomas: ['dulce'], padreId: 'demo-prep-ap-1' },
    esp(1, 8, 12, 41, 19, 5, { sintomas: ['agrio', 'aguado'], notas: 'Sale muy rápido. Hay que moler más fino.' }),
    esp(2, 7, 10, 38, 24, 6.5, { sintomas: ['agrio'], padreId: 'demo-prep-esp-1' }),
    esp(3, 5, 9, 36, 29, 8, { sintomas: ['dulce', 'equilibrado'], padreId: 'demo-prep-esp-2', notas: 'Avellana y chocolate, buena crema.' }),
    esp(4, 3, 8, 36, 35, 6.5, { sintomas: ['amargo'], padreId: 'demo-prep-esp-3', notas: 'Demasiado fino: amargor al final.' }),
    esp(5, 0, 9, 38, 30, 8.5, { sintomas: ['dulce'], padreId: 'demo-prep-esp-3', bebida: { tipo: 'Flat white', leche: 'Entera', ml: 120 } }),
  ];
  // Días de reposo efectivos el día de cada preparación.
  const cafes = [guji, huila, cerrado];
  for (const p of preps) {
    const c = cafes.find((x) => x.id === p.cafeId) as Cafe;
    p.diasReposo = diasReposo(c, new Date(p.fecha!));
  }
  return { cafes, preps };
}

export async function hayDemo(): Promise<boolean> {
  return (await db.cafe_cafes.filter((c) => !!c.demo && !c.borrado).count()) > 0;
}

export async function cargarDemo(): Promise<void> {
  const { cafes, preps } = datosDemo();
  for (const c of cafes) await guardar<Cafe>('cafe_cafes', { ...c, borrado: null });
  for (const p of preps) await guardar<Preparacion>('cafe_preparaciones', { ...p, borrado: null });
}

/** Borra (de verdad) los datos de ejemplo: nunca se han sincronizado, no necesitan marca de borrado. */
export async function borrarDemo(): Promise<void> {
  await db.transaction('rw', db.cafe_cafes, db.cafe_preparaciones, async () => {
    await db.cafe_cafes.filter((c) => !!c.demo).delete();
    await db.cafe_preparaciones.filter((p) => !!p.demo).delete();
  });
  await escribirAjuste('cafe:demo', { borrado: true });
}

export async function iniciarCafe(): Promise<void> {
  ajustesCafe.value = await leerAjuste<AjustesCafe>('cafe', ajustesCafe.value);
  const sembrado = await db.ajustes.get('cafe:semillas');
  if (!sembrado) {
    for (const e of equipoInicial()) await guardar<Equipo>('cafe_equipo', e);
    for (const a of aguasIniciales()) await guardar<Agua>('cafe_aguas', a);
    await cargarDemo();
    await escribirAjuste('cafe:semillas', { fecha: Date.now() });
  }
}

export const nuevoId = () => ulid();
