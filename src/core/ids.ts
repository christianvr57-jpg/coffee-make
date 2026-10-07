// Identificadores ULID: se generan sin servidor, no se repiten entre dispositivos
// y se ordenan por fecha de creación. Es lo que permitirá sincronizar en el futuro.

const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32

function aleatorio(n: number): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += ALFABETO[b % 32];
  return s;
}

export function ulid(ahora = Date.now()): string {
  let t = ahora;
  let tiempo = '';
  for (let i = 0; i < 10; i++) {
    tiempo = ALFABETO[t % 32] + tiempo;
    t = Math.floor(t / 32);
  }
  return tiempo + aleatorio(16);
}
