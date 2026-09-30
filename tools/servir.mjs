// Servidor estático mínimo para desarrollo (sin caché). Uso: node tools/servir.mjs [puerto]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const puerto = Number(process.argv[2]) || 8123;
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = join(raiz, normalize(ruta));
    if (!archivo.startsWith(raiz)) throw new Error('fuera');
    if (!(await stat(archivo)).isFile()) throw new Error('no es archivo');
    res.writeHead(200, { 'Content-Type': tipos[extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(archivo));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
}).listen(puerto, '127.0.0.1', () => console.log(`http://localhost:${puerto}/`));
