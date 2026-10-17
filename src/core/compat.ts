// Compatibilidad con navegadores antiguos, sobre todo el iPad mini 2 (se queda en iOS 12 / Safari 12),
// que se usa como pantalla en la nevera. Se importa lo primero en main.tsx.
//  - Rellena lo que Safari 12 no trae (matchAll, addEventListener en matchMedia, scrollTo con
//    opciones, AudioContext sin prefijo).
//  - Si el navegador no sabe separar con `gap` en flexbox (Safari < 14.1), marca <html class="sin-gap">
//    para que se usen los márgenes de respaldo que genera tools/compat-css.ts.
/* eslint-disable @typescript-eslint/no-explicit-any */

if (typeof window !== 'undefined') {
  const w = window as any;
  if (typeof w.globalThis === 'undefined') w.globalThis = w;
  // Preact y Dexie lo usan; llegó en Safari 12.1 (iOS 12.2): por si el iPad no está actualizado.
  if (!w.queueMicrotask) w.queueMicrotask = (f: () => void) => Promise.resolve().then(f);
}

if (!(String.prototype as any).matchAll) {
  (String.prototype as any).matchAll = function* (this: string, re: RegExp) {
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = r.exec(this))) {
      yield m;
      if (m[0] === '') r.lastIndex++;
    }
  };
}

// matchMedia(...).addEventListener('change') llegó en Safari 14; antes era addListener.
const MQL = typeof window !== 'undefined' && (window as any).MediaQueryList;
if (MQL && !MQL.prototype.addEventListener && MQL.prototype.addListener) {
  MQL.prototype.addEventListener = function (tipo: string, f: any) {
    if (tipo === 'change') this.addListener(f);
  };
  MQL.prototype.removeEventListener = function (tipo: string, f: any) {
    if (tipo === 'change') this.removeListener(f);
  };
}

// scrollTo({ top, behavior }) llegó en Safari 14.
if (typeof document !== 'undefined' && !('scrollBehavior' in document.documentElement.style)) {
  const original = window.scrollTo.bind(window);
  (window as any).scrollTo = (a?: number | ScrollToOptions, b?: number) => {
    if (a && typeof a === 'object') original(a.left ?? window.scrollX, a.top ?? window.scrollY);
    else original(a as number, b as number);
  };
}

if (typeof window !== 'undefined' && !(window as any).AudioContext && (window as any).webkitAudioContext) {
  (window as any).AudioContext = (window as any).webkitAudioContext;
}

/** ¿Respeta el navegador `gap` en flexbox? */
function hayGapFlex(): boolean {
  const caja = document.createElement('div');
  caja.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';
  caja.appendChild(document.createElement('div'));
  caja.appendChild(document.createElement('div'));
  document.body.appendChild(caja);
  const ok = caja.scrollHeight === 1;
  caja.remove();
  return ok;
}

if (typeof document !== 'undefined') {
  const marcar = () => {
    if (!hayGapFlex()) document.documentElement.classList.add('sin-gap');
  };
  if (document.body) marcar();
  else document.addEventListener('DOMContentLoaded', marcar);
}

export {};
