// Compartir o descargar archivos generados en el móvil (copias, CSV).

/** En iPhone abre la hoja de Compartir (Guardar en Archivos, AirDrop…); si no se puede, descarga. */
export async function entregarArchivo(nombre: string, contenido: string | Blob, tipo: string): Promise<'compartido' | 'descargado' | 'cancelado'> {
  const archivo = new File([contenido], nombre, { type: tipo });
  try {
    if (navigator.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: nombre });
      return 'compartido';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'cancelado';
  }
  const url = URL.createObjectURL(archivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'descargado';
}

/** Convierte filas a CSV (separador ";" y coma decimal, como lo espera Excel en español). */
export function aCsv(cabecera: string[], filas: (string | number | undefined | null)[][]): string {
  const celda = (v: string | number | undefined | null) => {
    if (v === undefined || v === null) return '';
    const s = typeof v === 'number' ? String(v).replace('.', ',') : v;
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [cabecera, ...filas].map((f) => f.map(celda).join(';')).join('\r\n');
}

export function blobADataUrl(b: Blob): Promise<string> {
  return new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => mal(r.error);
    r.readAsDataURL(b);
  });
}

export async function dataUrlABlob(url: string): Promise<Blob> {
  return (await fetch(url)).blob();
}

/** Reduce una foto a un tamaño razonable antes de guardarla. */
export async function comprimirImagen(archivo: File, lado = 1280, calidad = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((ok) => canvas.toBlob((b) => ok(b || archivo), 'image/jpeg', calidad));
}
