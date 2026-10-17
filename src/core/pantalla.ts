// Tamaño de pantalla: en el ordenador (ventana ancha) la app cambia la barra de pestañas por una
// barra lateral y algunas vistas se reorganizan en columnas, tablas y calendarios.
import { signal } from '@preact/signals';

/** Ancho a partir del cual se usa el diseño de escritorio. */
export const ANCHO_ESCRITORIO = 1000;

const consulta = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(`(min-width: ${ANCHO_ESCRITORIO}px)`) : null;

export const escritorio = signal(!!consulta?.matches);

const alCambiar = (e: { matches: boolean }) => {
  escritorio.value = e.matches;
};
// Safari < 14 (iPad mini 2) solo tiene addListener.
if (consulta?.addEventListener) consulta.addEventListener('change', alCambiar);
else consulta?.addListener?.(alCambiar);
