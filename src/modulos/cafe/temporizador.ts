// Motor del temporizador por fases (puro). Mide con la hora real (Date.now), no con un contador,
// así que no se desvía aunque el iPhone bloquee la pantalla o la app pase a segundo plano.
import type { FasePlan } from './datos/metodos';
import type { FaseReal } from './modelo';

export interface EstadoTemporizador {
  fases: FasePlan[];
  /** Marca de tiempo (ms) equivalente al inicio, ya descontadas las pausas. */
  inicio: number | null;
  pausadoEn: number | null;
  faseIdx: number;
  /** Segundo en el que empezó la fase actual. */
  inicioFase: number;
  reales: FaseReal[];
  marcas: { nombre: string; t: number }[];
  terminado: boolean;
  total?: number;
}

export const nuevoTemporizador = (fases: FasePlan[]): EstadoTemporizador => ({
  fases,
  inicio: null,
  pausadoEn: null,
  faseIdx: 0,
  inicioFase: 0,
  reales: [],
  marcas: [],
  terminado: false,
});

export function transcurrido(e: EstadoTemporizador, ahora: number): number {
  if (e.terminado && e.total !== undefined) return e.total;
  if (e.inicio === null) return 0;
  return ((e.pausadoEn ?? ahora) - e.inicio) / 1000;
}

export const iniciar = (e: EstadoTemporizador, ahora: number): EstadoTemporizador => ({ ...e, inicio: ahora, pausadoEn: null });

export function pausar(e: EstadoTemporizador, ahora: number): EstadoTemporizador {
  if (e.inicio === null || e.pausadoEn !== null) return e;
  return { ...e, pausadoEn: ahora };
}

export function reanudar(e: EstadoTemporizador, ahora: number): EstadoTemporizador {
  if (e.inicio === null || e.pausadoEn === null) return e;
  return { ...e, inicio: e.inicio + (ahora - e.pausadoEn), pausadoEn: null };
}

/** Cierra la fase actual y pasa a la siguiente (la última nunca se cierra sola). */
export function avanzar(e: EstadoTemporizador, ahora: number, enSegundo?: number): EstadoTemporizador {
  if (e.faseIdx >= e.fases.length - 1) return e;
  const t = enSegundo ?? transcurrido(e, ahora);
  const real: FaseReal = { nombre: e.fases[e.faseIdx].nombre, inicio: e.inicioFase, fin: t };
  return { ...e, reales: [...e.reales, real], faseIdx: e.faseIdx + 1, inicioFase: t };
}

/** Avanza solo las fases con duración cumplida. Devuelve el nuevo estado y si ha cambiado de fase. */
export function tic(e: EstadoTemporizador, ahora: number): { estado: EstadoTemporizador; cambio: boolean } {
  if (e.inicio === null || e.pausadoEn !== null || e.terminado) return { estado: e, cambio: false };
  let estado = e;
  let cambio = false;
  const t = transcurrido(e, ahora);
  // Puede haber varias fases cumplidas si la app estuvo en segundo plano.
  while (estado.faseIdx < estado.fases.length - 1) {
    const f = estado.fases[estado.faseIdx];
    if (f.duracion === null || t < estado.inicioFase + f.duracion) break;
    estado = avanzar(estado, ahora, estado.inicioFase + f.duracion);
    cambio = true;
  }
  return { estado, cambio };
}

export function marcar(e: EstadoTemporizador, nombre: string, ahora: number): EstadoTemporizador {
  return { ...e, marcas: [...e.marcas.filter((m) => m.nombre !== nombre), { nombre, t: transcurrido(e, ahora) }] };
}

export function terminar(e: EstadoTemporizador, ahora: number): EstadoTemporizador {
  const t = transcurrido(e, ahora);
  const actual = e.fases[e.faseIdx];
  const reales = actual ? [...e.reales, { nombre: actual.nombre, inicio: e.inicioFase, fin: t }] : e.reales;
  return { ...e, reales, terminado: true, total: t, pausadoEn: null };
}

/** Datos para pintar la fase actual. */
export function vistaFase(e: EstadoTemporizador, ahora: number) {
  const t = transcurrido(e, ahora);
  const fase = e.fases[e.faseIdx];
  const enFase = t - e.inicioFase;
  const restante = fase?.duracion != null ? fase.duracion - enFase : null;
  const progreso = fase?.duracion ? Math.min(1, enFase / fase.duracion) : null;
  const siguiente = e.fases[e.faseIdx + 1] || null;
  const ultima = e.faseIdx >= e.fases.length - 1;
  return { t, fase, enFase, restante, progreso, siguiente, ultima };
}
