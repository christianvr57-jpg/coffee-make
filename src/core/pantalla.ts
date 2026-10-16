// Tamaño de pantalla: en el ordenador (ventana ancha) la app cambia la barra de pestañas por una
// barra lateral y algunas vistas se reorganizan en columnas, tablas y calendarios.
import { signal } from '@preact/signals';

/** Ancho a partir del cual se usa el diseño de escritorio. */
export const ANCHO_ESCRITORIO = 1000;

const consulta = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(`(min-width: ${ANCHO_ESCRITORIO}px)`) : null;

export const escritorio = signal(!!consulta?.matches);

consulta?.addEventListener('change', (e) => {
  escritorio.value = e.matches;
});
