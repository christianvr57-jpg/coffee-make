// Módulos instalados en la app. Para añadir un proyecto nuevo: impórtalo y añádelo aquí.
import { signal } from '@preact/signals';
import type { ModuloApp } from './modulos';
import { escribirAjuste, leerAjuste } from './db';
import { moduloHogar } from '../modulos/hogar';
import { moduloCafe } from '../modulos/cafe';
import { moduloCocina } from '../modulos/cocina';
import { moduloRunning } from '../modulos/running';

export const MODULOS: ModuloApp[] = [moduloHogar, moduloCocina, moduloCafe, moduloRunning];

/** Máximo de módulos en la barra inferior (con Inicio y Más caben 5 pestañas). */
export const MAX_FIJADOS = 3;
const FIJADOS_INICIALES = ['hogar', 'cocina', 'cafe'];

/** Módulos fijados en la barra inferior; el resto se abre desde «Más». Se eligen en Ajustes. */
export const fijados = signal<string[]>(FIJADOS_INICIALES);

export async function cargarFijados(): Promise<void> {
  const v = await leerAjuste<{ ids: string[] }>('app:fijados', { ids: FIJADOS_INICIALES });
  const validos = v.ids.filter((id) => MODULOS.some((m) => m.id === id)).slice(0, MAX_FIJADOS);
  fijados.value = validos.length ? validos : FIJADOS_INICIALES;
}

export async function cambiarFijados(ids: string[]): Promise<void> {
  // Se guardan en el orden de MODULOS para que la barra no cambie de orden al elegir.
  const ordenados = MODULOS.map((m) => m.id).filter((id) => ids.includes(id)).slice(0, MAX_FIJADOS);
  fijados.value = ordenados;
  await escribirAjuste('app:fijados', { ids: ordenados });
}
