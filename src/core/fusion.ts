// Fusión de los datos de dos dispositivos (este y la nube), registro a registro.
//
// Cada registro lleva `actualizado` (milisegundos) y los borrados se guardan como marcas (`borrado`),
// así que basta con quedarse, para cada id, con la versión más reciente: «la última escritura gana».
// Lo que solo existe en un lado se conserva siempre. En la primera sincronización de un dispositivo
// se puede decidir qué lado manda en los empates de verdad (mismo registro con contenidos distintos).

export interface Fila {
  actualizado?: number;
  [campo: string]: unknown;
}

/** Tabla → filas. La tabla `ajustes` se identifica por `clave`; el resto, por `id`. */
export type Datos = Record<string, Fila[]>;

export const claveDe = (tabla: string): string => (tabla === 'ajustes' ? 'clave' : 'id');

export interface Fusion {
  /** Lo que debe quedar en la nube. */
  resultado: Datos;
  /** Filas de la nube que hay que escribir en este dispositivo. */
  paraLocal: Datos;
  /** Si la nube no tiene ya exactamente el resultado. */
  subir: boolean;
}

const igual = (a: Fila, b: Fila) => JSON.stringify(a) === JSON.stringify(b);

/**
 * @param mandaNube en un conflicto (mismo registro, distinto contenido), la nube gana aunque la
 *   versión local sea más reciente. Se usa en la primera sincronización de un dispositivo nuevo,
 *   para que sus valores por defecto no pisen los datos reales.
 */
export function fusionar(local: Datos, nube: Datos, mandaNube = false): Fusion {
  const resultado: Datos = {};
  const paraLocal: Datos = {};
  let subir = false;
  for (const tabla of new Set([...Object.keys(local), ...Object.keys(nube)])) {
    const k = claveDe(tabla);
    const l = new Map((local[tabla] || []).map((f) => [String(f[k]), f]));
    const n = new Map((nube[tabla] || []).map((f) => [String(f[k]), f]));
    const salida: Fila[] = [];
    const entran: Fila[] = [];
    for (const id of new Set([...l.keys(), ...n.keys()])) {
      const a = l.get(id);
      const b = n.get(id);
      if (a && !b) {
        salida.push(a);
        subir = true;
      } else if (b && !a) {
        salida.push(b);
        entran.push(b);
      } else if (a && b) {
        if (igual(a, b)) {
          salida.push(b);
          continue;
        }
        const ganaNube = mandaNube || (b.actualizado || 0) >= (a.actualizado || 0);
        if (ganaNube) {
          salida.push(b);
          entran.push(b);
        } else {
          salida.push(a);
          subir = true;
        }
      }
    }
    resultado[tabla] = salida;
    if (entran.length) paraLocal[tabla] = entran;
  }
  return { resultado, paraLocal, subir };
}
