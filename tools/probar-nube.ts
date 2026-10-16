// Prueba real de la sincronización contra GitHub, simulando dos dispositivos (iPhone y ordenador)
// con datos en memoria. Usa un archivo aparte (prueba-sync.json) y lo deja vacío al terminar.
//   NUBE_TOKEN=… NUBE_REPO=usuario/repo npx vite-node tools/probar-nube.ts
import { fusionar, type Datos } from '../src/core/fusion';
import { escribirNube, leerNube, type ConfigNube } from '../src/core/github';

const cfg: ConfigNube = { token: process.env.NUBE_TOKEN || '', repo: process.env.NUBE_REPO || 'christianvr57-jpg/coffee-make-datos' };
const ARCHIVO = 'prueba-sync.json';
if (!cfg.token) throw new Error('Falta NUBE_TOKEN');

const comprobar = (ok: boolean, que: string) => {
  console.log(`${ok ? '✓' : '✗'} ${que}`);
  if (!ok) process.exitCode = 1;
};

/** Un ciclo de sincronización de un «dispositivo» (igual que core/nube.ts, sin Dexie). */
async function sincronizar(local: Datos, mandaNube = false): Promise<Datos> {
  for (let i = 0; i < 4; i++) {
    const nube = await leerNube(cfg, undefined, ARCHIVO);
    const f = fusionar(local, nube.datos, mandaNube);
    for (const [t, filas] of Object.entries(f.paraLocal)) {
      const k = t === 'ajustes' ? 'clave' : 'id';
      local[t] = [...(local[t] || []).filter((x) => !filas.some((y) => y[k] === x[k])), ...filas];
    }
    if (!f.subir && nube.sha) return local;
    if (await escribirNube(cfg, f.resultado, nube.sha, 'prueba', ARCHIVO)) return local;
  }
  throw new Error('No se pudo escribir tras 4 intentos');
}

const t0 = Date.now();
// Punto de partida: archivo vacío.
const previo = await leerNube(cfg, undefined, ARCHIVO);
await escribirNube(cfg, {}, previo.sha, 'prueba', ARCHIVO);

const iphone: Datos = {
  running_registros: [{ id: 'r1', actualizado: t0, titulo: 'Rodaje 30 min · Ñ', km: 5.2 }],
  ajustes: [{ clave: 'cocina', valor: { ciclo: 8, nombre: 'del iPhone' }, actualizado: t0 }],
};
const pc: Datos = {
  ajustes: [{ clave: 'cocina', valor: { ciclo: 8, nombre: 'por defecto' }, actualizado: 1 }],
  cafe_preparaciones: [],
};

await sincronizar(iphone);
await sincronizar(pc, true);
comprobar(pc.running_registros?.some((x) => x.id === 'r1' && x.titulo === 'Rodaje 30 min · Ñ') === true, 'el ordenador recibe la sesión del iPhone (con tildes)');
comprobar((pc.ajustes.find((x) => x.clave === 'cocina')?.valor as { nombre: string }).nombre === 'del iPhone', 'los ajustes por defecto del ordenador no pisan los del iPhone');

// Cambio en el ordenador → aparece en el iPhone.
pc.cafe_preparaciones = [{ id: 'p1', actualizado: Date.now(), cafeNombre: 'Guji' }];
await sincronizar(pc);
await sincronizar(iphone);
comprobar(iphone.cafe_preparaciones?.some((x) => x.id === 'p1') === true, 'un café apuntado en el ordenador llega al iPhone');

// Borrado en el iPhone → desaparece en el ordenador.
iphone.cafe_preparaciones = iphone.cafe_preparaciones!.map((x) => ({ ...x, borrado: Date.now(), actualizado: Date.now() }));
await sincronizar(iphone);
await sincronizar(pc);
comprobar(!!pc.cafe_preparaciones.find((x) => x.id === 'p1')?.borrado, 'un borrado en el iPhone llega al ordenador');

// Los dos escriben a la vez: el segundo recibe un conflicto (409), relee, fusiona y no se pierde nada.
const a = await leerNube(cfg, undefined, ARCHIVO);
iphone.running_registros!.push({ id: 'r2', actualizado: Date.now(), titulo: 'Desde el iPhone' });
pc.running_registros!.push({ id: 'r3', actualizado: Date.now(), titulo: 'Desde el ordenador' });
await sincronizar(iphone);
const viejo = await escribirNube(cfg, fusionar(pc, a.datos).resultado, a.sha, 'prueba', ARCHIVO);
comprobar(viejo === null, 'escribir sobre una versión antigua se rechaza (conflicto)');
await sincronizar(pc);
await sincronizar(iphone);
const final = await leerNube(cfg, undefined, ARCHIVO);
const ids = (final.datos.running_registros || []).map((x) => x.id).sort();
comprobar(JSON.stringify(ids) === JSON.stringify(['r1', 'r2', 'r3']), `tras el conflicto la nube tiene todo (${ids.join(', ')})`);
comprobar(iphone.running_registros!.length === 3 && pc.running_registros!.length === 3, 'y los dos dispositivos también');

// Lectura condicional: sin cambios, GitHub responde 304.
const conEtag = await leerNube(cfg, undefined, ARCHIVO);
const otra = await leerNube(cfg, conEtag.etag, ARCHIVO);
comprobar(!!conEtag.etag && otra.sinCambios === true, 'si nada ha cambiado, la consulta responde «sin cambios» (304)');

await escribirNube(cfg, {}, final.sha, 'prueba', ARCHIVO).then(async (sha) => sha ?? escribirNube(cfg, {}, (await leerNube(cfg, undefined, ARCHIVO)).sha, 'prueba', ARCHIVO));
console.log(process.exitCode ? 'HAY FALLOS' : 'Todo correcto');
