// Registro del service worker (funcionamiento sin conexión) y actualizaciones.
//
// En iPhone, una app instalada solo busca versión nueva cuando se abre desde cero, y aun así se
// queda con la antigua hasta la siguiente apertura. Para evitarlo:
//  - se busca versión nueva al abrir, al volver a la app y cada hora;
//  - si aparece nada más abrirla o volver a ella (sin que estés haciendo nada), se aplica sola;
//  - si aparece mientras la usas, se avisa en Inicio («Hay una versión nueva») para no cortarte.
import { signal } from '@preact/signals';
import { registerSW } from 'virtual:pwa-register';

export const hayActualizacion = signal(false);
let actualizar: ((recargar?: boolean) => Promise<void>) | null = null;
let registro: ServiceWorkerRegistration | undefined;

/** Momento en que la app se abrió o volvió a primer plano. */
let activaDesde = Date.now();
const MARGEN_MS = 10_000;

/** Algo en marcha que no conviene cortar con una recarga (p. ej. el temporizador del café). */
function hayTareaEnCurso(): boolean {
  try {
    const b = JSON.parse(localStorage.getItem('coffee-make:borrador') || 'null');
    return !!(b?.temporizador?.inicio && !b.temporizador.terminado);
  } catch {
    return false;
  }
}

function buscarVersion() {
  registro?.update().catch(() => {
    /* sin conexión */
  });
}

export function registrarPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  actualizar = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (Date.now() - activaDesde < MARGEN_MS && !hayTareaEnCurso()) actualizar?.(true);
      else hayActualizacion.value = true;
    },
    onRegisteredSW(_url, r) {
      registro = r;
      setInterval(buscarVersion, 60 * 60 * 1000);
    },
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    activaDesde = Date.now();
    buscarVersion();
  });
}

export function aplicarActualizacion(): void {
  actualizar?.(true);
}

export const esAppInstalada = () =>
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
