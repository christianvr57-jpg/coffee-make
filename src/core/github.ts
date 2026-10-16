// La «nube» es un archivo JSON en un repositorio privado de GitHub, leído y escrito con la API de
// contenidos. Cada escritura lleva el `sha` de la versión leída: si otro dispositivo ha escrito
// entre medias, GitHub la rechaza (409) y se vuelve a leer y fusionar.
import type { Datos } from './fusion';

export interface ConfigNube {
  /** Clave de acceso (token) de GitHub con permiso de lectura y escritura en el repositorio. */
  token: string;
  /** "usuario/repositorio". */
  repo: string;
}

export const ARCHIVO_NUBE = 'coffee-make.json';

export class ErrorNube extends Error {
  constructor(
    mensaje: string,
    public estado?: number,
  ) {
    super(mensaje);
  }
}

export function mensajeError(estado: number): string {
  if (estado === 401) return 'La clave de GitHub no es válida o ha caducado. Crea una nueva y vuelve a conectar.';
  if (estado === 403) return 'La clave no tiene permiso para escribir en el repositorio (hace falta «Contents: Read and write») o GitHub ha limitado las peticiones.';
  if (estado === 404) return 'No se encuentra el repositorio. Revisa el nombre y que la clave tenga acceso a él.';
  return `GitHub ha respondido con un error (${estado}). Se reintentará más tarde.`;
}

function peticion(cfg: ConfigNube, ruta: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${cfg.repo}${ruta}`, {
    ...init,
    // Sin caché del navegador: la API responde con max-age=60 y queremos siempre lo último.
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers as Record<string, string>),
    },
  });
}

/** Texto ⇄ base64 con UTF-8 (las tildes y eñes no caben en btoa directamente). */
export function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
export function deBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Comprueba la clave y el repositorio. Devuelve un mensaje de error o null si todo va bien. */
export async function comprobarRepo(cfg: ConfigNube): Promise<string | null> {
  const r = await peticion(cfg, '');
  if (!r.ok) return mensajeError(r.status);
  const j = (await r.json()) as { permissions?: { push?: boolean } };
  if (j.permissions && j.permissions.push === false) return mensajeError(403);
  return null;
}

export interface LecturaNube {
  /** null si el archivo aún no existe. */
  sha: string | null;
  datos: Datos;
  etag?: string;
  /** La nube no ha cambiado desde la última lectura (respuesta 304). */
  sinCambios?: boolean;
}

/** Lee el archivo de la nube. Con `etag`, si no ha cambiado GitHub responde 304 (y no gasta cupo). */
export async function leerNube(cfg: ConfigNube, etag?: string, archivo = ARCHIVO_NUBE): Promise<LecturaNube> {
  const r = await peticion(cfg, `/contents/${archivo}`, { headers: etag ? { 'If-None-Match': etag } : {} });
  if (r.status === 304) return { sha: null, datos: {}, sinCambios: true };
  if (r.status === 404) {
    // ¿Falta el archivo (primera vez) o el repositorio entero?
    const repo = await comprobarRepo(cfg);
    if (repo) throw new ErrorNube(repo, 404);
    return { sha: null, datos: {} };
  }
  if (!r.ok) throw new ErrorNube(mensajeError(r.status), r.status);
  const j = (await r.json()) as { sha: string; content?: string; encoding?: string; size?: number };
  let texto = j.content && j.encoding === 'base64' ? deBase64(j.content) : '';
  if (!texto && (j.size || 0) > 0) {
    // Más de 1 MB: la API no incluye el contenido y hay que pedirlo «en bruto».
    const raw = await peticion(cfg, `/contents/${archivo}`, { headers: { Accept: 'application/vnd.github.raw+json' } });
    if (!raw.ok) throw new ErrorNube(mensajeError(raw.status), raw.status);
    texto = await raw.text();
  }
  let datos: Datos = {};
  if (texto) {
    try {
      datos = (JSON.parse(texto) as { tablas?: Datos }).tablas || {};
    } catch {
      throw new ErrorNube('El archivo de la nube está dañado. No se ha tocado nada; revisa el repositorio.');
    }
  }
  return { sha: j.sha, datos, etag: r.headers.get('ETag') || undefined };
}

/** Escribe el archivo. Devuelve el nuevo sha, o null si otro dispositivo escribió antes (hay que releer). */
export async function escribirNube(cfg: ConfigNube, datos: Datos, sha: string | null, origen: string, archivo = ARCHIVO_NUBE): Promise<string | null> {
  const contenido = JSON.stringify({ app: 'coffee-make', version: 1, actualizado: new Date().toISOString(), origen, tablas: datos });
  const r = await peticion(cfg, `/contents/${archivo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Sincronización desde ${origen}`, content: aBase64(contenido), ...(sha ? { sha } : {}) }),
  });
  if (r.status === 409 || r.status === 422) return null;
  if (!r.ok) throw new ErrorNube(mensajeError(r.status), r.status);
  const j = (await r.json()) as { content: { sha: string } };
  return j.content.sha;
}
