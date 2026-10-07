// Registro del service worker (funcionamiento sin conexión) y aviso de versión nueva.
import { signal } from '@preact/signals';
import { registerSW } from 'virtual:pwa-register';

export const hayActualizacion = signal(false);
let actualizar: ((recargar?: boolean) => Promise<void>) | null = null;

export function registrarPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  actualizar = registerSW({
    immediate: true,
    onNeedRefresh() {
      hayActualizacion.value = true;
    },
  });
}

export function aplicarActualizacion(): void {
  actualizar?.(true);
}

export const esAppInstalada = () =>
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
