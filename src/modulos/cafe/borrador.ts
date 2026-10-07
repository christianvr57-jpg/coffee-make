// Preparación en curso (configuración + temporizador). Se guarda en localStorage para que
// un cierre accidental de la app en mitad de la receta no pierda nada.
import { signal, effect } from '@preact/signals';
import type { Preparacion } from './modelo';
import type { EstadoTemporizador } from './temporizador';

export interface Borrador {
  prep: Partial<Preparacion> & { metodo: Preparacion['metodo']; sintomas: Preparacion['sintomas'] };
  /** Texto explicando de dónde salen los valores ("Tu última V60 con este café…"). */
  origen?: string;
  temporizador?: EstadoTemporizador;
  /** Id de preparación existente si se está editando. */
  editando?: string;
}

const CLAVE = 'coffee-make:borrador';

function leer(): Borrador | null {
  try {
    const t = localStorage.getItem(CLAVE);
    return t ? (JSON.parse(t) as Borrador) : null;
  } catch {
    return null;
  }
}

export const borrador = signal<Borrador | null>(leer());

effect(() => {
  const b = borrador.value;
  try {
    if (b) localStorage.setItem(CLAVE, JSON.stringify(b));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento */
  }
});

export function actualizarPrep(p: Partial<Preparacion>): void {
  if (!borrador.value) return;
  borrador.value = { ...borrador.value, prep: { ...borrador.value.prep, ...p } };
}
