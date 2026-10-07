// Día actual como señal: si la app se queda abierta y cambia el día, las vistas se repintan.
import { signal } from '@preact/signals';
import { hoyISO } from './fechas';

export const diaActual = signal(hoyISO());

const revisar = () => {
  const d = hoyISO();
  if (d !== diaActual.value) diaActual.value = d;
};
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) revisar();
});
window.addEventListener('focus', revisar);
setInterval(revisar, 60_000);
