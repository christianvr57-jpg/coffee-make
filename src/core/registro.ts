// Módulos instalados en la app. Para añadir un proyecto nuevo: impórtalo y añádelo aquí.
// Cada módulo se puede activar o desactivar en Ajustes; uno desactivado no aparece en ningún sitio
// (barra, Inicio, buscador…) pero sus datos se conservan y se siguen sincronizando.
import { computed, signal } from '@preact/signals';
import type { ModuloApp } from './modulos';
import { escribirAjuste, leerAjuste } from './db';
import { moduloHogar } from '../modulos/hogar';
import { moduloCafe } from '../modulos/cafe';
import { moduloCocina } from '../modulos/cocina';
import { moduloRunning } from '../modulos/running';
import { moduloCalendario } from '../modulos/calendario';
import { moduloGym } from '../modulos/gym';

export const MODULOS: ModuloApp[] = [moduloHogar, moduloCocina, moduloRunning, moduloGym, moduloCalendario, moduloCafe];

/** Desactivados de serie (se activan en Ajustes → Módulos). */
const OCULTOS_INICIALES = ['cafe'];
export const ocultos = signal<string[]>(OCULTOS_INICIALES);

/** Módulos activos, en orden. */
export const visibles = computed(() => MODULOS.filter((m) => !ocultos.value.includes(m.id)));
export const estaActivo = (id: string) => !ocultos.value.includes(id);

export async function cargarModulos(): Promise<void> {
  const v = await leerAjuste<{ ocultos: string[] }>('app:modulos', { ocultos: OCULTOS_INICIALES });
  ocultos.value = v.ocultos.filter((id) => MODULOS.some((m) => m.id === id));
}

export async function activarModulo(id: string, activo: boolean): Promise<void> {
  const nuevos = activo ? ocultos.value.filter((x) => x !== id) : [...new Set([...ocultos.value, id])];
  // Siempre queda al menos un módulo activo.
  if (nuevos.length >= MODULOS.length) return;
  ocultos.value = nuevos;
  await escribirAjuste('app:modulos', { ocultos: nuevos });
}

/** Máximo de módulos en la barra inferior (con Inicio y Más caben 5 pestañas). */
export const MAX_FIJADOS = 3;
const FIJADOS_INICIALES = ['hogar', 'cocina', 'running'];

/** Módulos elegidos para la barra inferior. Se eligen en Ajustes. */
export const fijados = signal<string[]>(FIJADOS_INICIALES);

/** Los que se ven en la barra: los elegidos que estén activos y, si sobra hueco, el resto de activos. */
export const modulosBarra = computed(() => {
  const v = visibles.value;
  const barra = v.filter((m) => fijados.value.includes(m.id));
  for (const m of v) if (barra.length < MAX_FIJADOS && !barra.includes(m)) barra.push(m);
  return v.filter((m) => barra.includes(m));
});

export async function cargarFijados(): Promise<void> {
  await cargarModulos();
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
