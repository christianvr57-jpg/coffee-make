// Enrutado por hash (#/cafe/cafes/123): funciona en GitHub Pages sin configurar el servidor.
import { signal } from '@preact/signals';

const leer = () => decodeURI(location.hash.replace(/^#/, '')) || '/';

export const ruta = signal<string>(leer());

window.addEventListener('hashchange', () => {
  ruta.value = leer();
});

/** Navega a una ruta. `reemplazar` evita dejar la ruta actual en el historial. */
export function ir(destino: string, reemplazar = false): void {
  const url = `#${destino}`;
  if (reemplazar) history.replaceState(history.state, '', url);
  else history.pushState({ app: true }, '', url);
  ruta.value = leer();
}

/** Vuelve atrás; si no hay historial propio, sube al padre de la ruta. */
export function atras(padre: string): void {
  if (history.state && (history.state as { app?: boolean }).app) history.back();
  else ir(padre, true);
}

/** Compara "/cafe/cafes/:id" con una ruta y devuelve los parámetros, o null. */
export function coincide(patron: string, path: string): Record<string, string> | null {
  const a = patron.split('/').filter(Boolean);
  const b = path.split('?')[0].split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = b[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

/** Parámetros de consulta: "#/cafe/preparar?repetir=ID" */
export function consulta(): URLSearchParams {
  const q = ruta.value.split('?')[1] || '';
  return new URLSearchParams(q);
}
