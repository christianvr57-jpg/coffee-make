// Diagnóstico de extracción (puro, con pruebas en tests/diagnostico.test.ts).
// A partir de lo que notas (agrio, amargo, aguado…), el tiempo, el TDS si lo hay y el reposo,
// sugiere UN cambio cada vez y explica por qué. Criterio clásico de barista:
//   - Extracción (cuánto se ha disuelto del café): molienda, tiempo de contacto, temperatura, agitación.
//   - Concentración (cuánto café hay en la taza): ratio café/agua.
import { diagnosticoControl, estadoReposo, extraccion, ratio, usoParaReposo } from './calculos';
import { metodo } from './datos/metodos';
import type { Cafe, Equipo, Preparacion } from './modelo';

export interface Sugerencia {
  id: string;
  tipo: 'ajuste' | 'tecnica' | 'aviso' | 'bien';
  titulo: string;
  /** Qué hacer, concreto. */
  accion: string;
  /** Por qué funciona. */
  porque: string;
  /** Cambio aplicable a la siguiente preparación. */
  cambio?: Partial<Preparacion>;
}

export interface Diagnostico {
  lectura: string;
  sugerencias: Sugerencia[];
}

const fmt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** Un paso de molienda razonable según la escala del molino. */
function pasoMolienda(molino?: Equipo): { paso: number; texto: (dir: 'fino' | 'grueso', n: number) => string } {
  const m = molino?.molino;
  if (m?.escala === 'clics') return { paso: 2, texto: (dir, n) => `${n} clics más ${dir}` };
  if (m?.escala === 'numero') return { paso: 1, texto: (dir, n) => `${n} punto más ${dir} (${dir === 'fino' ? 'número más bajo' : 'número más alto'})` };
  return { paso: 1, texto: (dir) => `un poco más ${dir}` };
}

function cambioMolienda(p: Partial<Preparacion>, molino: Equipo | undefined, dir: 'fino' | 'grueso'): { accion: string; cambio?: Partial<Preparacion> } {
  const { paso, texto } = pasoMolienda(molino);
  if (p.molienda === undefined) return { accion: `Muele ${texto(dir, paso)}.` };
  let nuevo = p.molienda + (dir === 'fino' ? -paso : paso);
  if (molino?.molino) nuevo = Math.max(molino.molino.min, Math.min(molino.molino.max, nuevo));
  return { accion: `Muele ${texto(dir, paso)}: de ${fmt(p.molienda)} a ${fmt(nuevo)}.`, cambio: { molienda: nuevo } };
}

/** `objetivo`: tiempo total esperado de la receta seguida; si no hay, el orientativo del método. */
export function diagnosticar(p: Partial<Preparacion> & Pick<Preparacion, 'metodo'>, ctx: { cafe?: Cafe; molino?: Equipo; objetivo?: [number, number] } = {}): Diagnostico {
  const met = metodo(p.metodo);
  const esp = p.metodo === 'espresso';
  const fam = met.familia;
  const s = new Set(p.sintomas || []);
  const sug: Sugerencia[] = [];
  const r = ratio(p as Preparacion);
  const t = p.tiempoTotal;
  const [tMin, tMax] = ctx.objetivo || met.tiempoObjetivo || [0, Infinity];
  const rapido = t !== undefined && t < tMin;
  const lento = t !== undefined && t > tMax;
  const tueste = ctx.cafe?.tueste;

  // 1. Dirección de la extracción y de la concentración.
  let ext: 'sub' | 'sobre' | 'desigual' | 'ok' | null = null;
  let conc: 'debil' | 'fuerte' | 'ok' | null = null;
  const ey = extraccion(p as Preparacion);
  if (p.tds && ey !== undefined) {
    const d = diagnosticoControl(p.tds, ey, esp ? 'espresso' : 'filtro');
    ext = d.ext === 'subextraído' ? 'sub' : d.ext === 'sobreextraído' ? 'sobre' : 'ok';
    conc = d.fuerza === 'débil' ? 'debil' : d.fuerza === 'fuerte' ? 'fuerte' : 'ok';
  }
  const malo = s.has('amargo') || s.has('astringente');
  if (s.has('agrio') && malo) ext = 'desigual';
  else if (ext === null && s.has('agrio')) ext = 'sub';
  else if (ext === null && malo) ext = 'sobre';
  if (conc === null && s.has('aguado')) conc = 'debil';
  if (conc === null && s.has('intenso')) conc = 'fuerte';

  // 2. Reposo.
  if (ctx.cafe) {
    const rep = estadoReposo(ctx.cafe, usoParaReposo(ctx.cafe, p.metodo));
    if (rep.estado === 'temprano' && rep.dias !== undefined && (ext !== null || s.has('plano'))) {
      sug.push({
        id: 'fresco', tipo: 'aviso', titulo: 'El café aún está muy fresco',
        accion: `Lleva ${rep.dias} días y su punto para ${esp ? 'espresso' : 'filtro'} empieza hacia el día ${rep.min}. Espera unos días${esp ? '' : ' o alarga el bloom'}.`,
        porque: 'Tras el tueste el café suelta CO₂ durante días. Ese gas estorba al agua y la extracción sale irregular: sabores agrios o ásperos aunque la receta sea buena.',
      });
    }
    if (rep.estado === 'tarde' && (s.has('plano') || s.has('aguado'))) {
      sug.push({
        id: 'pasado', tipo: 'aviso', titulo: 'Puede que el café esté pasado',
        accion: `Lleva ${rep.dias} días desde el tueste. Si sabe plano, prueba a moler más fino o subir 1-2 °C para compensar.`,
        porque: 'Con el tiempo el café pierde aromáticos volátiles y sabe más plano. Extraer un poco más ayuda, pero no lo devuelve a su mejor momento.',
      });
    }
  }

  // 3. Extracción.
  if (ext === 'desigual') {
    sug.push({
      id: 'desigual', tipo: 'tecnica', titulo: 'Extracción desigual',
      accion: esp
        ? 'Reparte bien el café en el portafiltro (remueve con una aguja), apisona recto y con la misma fuerza.'
        : 'Vierte más suave y uniforme, sin chorro fuerte contra el papel, y da un giro suave al final para aplanar la cama.',
      porque: 'Agrio y amargo/astringente a la vez indican que parte del café se ha extraído de más y otra de menos: el agua ha encontrado caminos preferentes (canalización) o la agitación ha sido irregular.',
    });
  } else if (ext === 'sub') {
    const porque = 'El agrio indica subextracción: los ácidos se disuelven primero y los azúcares y compuestos que los equilibran aún no han salido. Hay que extraer más: más superficie (moler más fino), más tiempo o más temperatura.';
    if (esp) {
      if (rapido || t === undefined) {
        const m = cambioMolienda(p, ctx.molino, 'fino');
        sug.push({ id: 'sub-fino', tipo: 'ajuste', titulo: 'Más fino', accion: `${m.accion}${t !== undefined ? ` Ha salido en ${t} s y el objetivo orientativo es ${tMin}-${tMax} s.` : ''}`, porque, cambio: m.cambio });
      } else if (r && p.dosis && r < 2.3) {
        const salida = Math.round(p.dosis * (r + 0.3));
        sug.push({ id: 'sub-ratio', tipo: 'ajuste', titulo: 'Saca más espresso', accion: `El tiempo está bien: alarga la salida de ${fmt(p.rendimiento || 0)} a ${salida} g (ratio 1:${fmt(salida / p.dosis)}).`, porque, cambio: { rendimiento: salida } });
      } else if ((p.temperatura || 93) < 96) {
        const temp = Math.min(96, (p.temperatura || 93) + 2);
        sug.push({ id: 'sub-temp', tipo: 'ajuste', titulo: 'Más temperatura', accion: `Sube la temperatura a ${temp} °C.`, porque, cambio: { temperatura: temp } });
      }
    } else if ((fam === 'inmersion' || fam === 'hibrido') && !rapido) {
      sug.push({ id: 'sub-tiempo', tipo: 'tecnica', titulo: 'Más tiempo de infusión', accion: 'Alarga la infusión unos 30 segundos.', porque });
    } else if (lento && (p.temperatura || 93) < 96) {
      // Ya tarda mucho: moler más fino lo alargaría aún más; mejor más temperatura.
      const temp = Math.min(96, (p.temperatura || 93) + 2);
      sug.push({ id: 'sub-temp', tipo: 'ajuste', titulo: 'Más temperatura', accion: `Ya tarda bastante, así que no muelas más fino: sube el agua a ${temp} °C.`, porque, cambio: { temperatura: temp } });
    } else {
      const m = cambioMolienda(p, ctx.molino, 'fino');
      sug.push({ id: 'sub-fino', tipo: 'ajuste', titulo: 'Más fino', accion: `${m.accion}${rapido ? ` Ha tardado ${Math.floor(t! / 60)}:${String(t! % 60).padStart(2, '0')}, por debajo de lo previsto.` : ''}`, porque, cambio: m.cambio });
    }
  } else if (ext === 'sobre') {
    const porque = 'Amargor y sequedad suelen venir de extraer de más: tras los azúcares salen compuestos más pesados, amargos y astringentes. Hay que extraer menos: moler más grueso, menos tiempo o menos temperatura.';
    if ((tueste === 'oscuro' || tueste === 'medio-oscuro') && s.has('amargo')) {
      const temp = Math.max(85, (p.temperatura || 93) - 3);
      sug.push({
        id: 'oscuro', tipo: 'ajuste', titulo: 'Tueste oscuro: menos temperatura', accion: `Baja el agua a ${temp} °C.`, cambio: { temperatura: temp },
        porque: 'En tuestes oscuros parte del amargor viene del propio tueste y se extrae con mucha facilidad. Con agua menos caliente sale menos amargor sin perder dulzor.',
      });
    } else if (esp) {
      if (lento || t === undefined) {
        const m = cambioMolienda(p, ctx.molino, 'grueso');
        sug.push({ id: 'sobre-grueso', tipo: 'ajuste', titulo: 'Más grueso', accion: `${m.accion}${t !== undefined ? ` Ha tardado ${t} s y el objetivo orientativo es ${tMin}-${tMax} s.` : ''}`, porque, cambio: m.cambio });
      } else if (r && p.dosis && r > 1.8) {
        const salida = Math.round(p.dosis * (r - 0.3));
        sug.push({ id: 'sobre-ratio', tipo: 'ajuste', titulo: 'Corta antes', accion: `El tiempo está bien: corta la salida en ${salida} g en vez de ${fmt(p.rendimiento || 0)}.`, porque, cambio: { rendimiento: salida } });
      } else {
        const temp = Math.max(88, (p.temperatura || 93) - 2);
        sug.push({ id: 'sobre-temp', tipo: 'ajuste', titulo: 'Menos temperatura', accion: `Baja la temperatura a ${temp} °C.`, porque, cambio: { temperatura: temp } });
      }
    } else if (s.has('astringente') && !lento && fam === 'percolacion') {
      sug.push({ id: 'agitacion', tipo: 'tecnica', titulo: 'Menos agitación', accion: 'Vierte más bajo y suave, sin remover, y evita que el agua golpee el papel.', porque: `${porque} La astringencia en filtro suele venir de remover o verter con mucha fuerza, que arrastra partículas finas.` });
    } else if (rapido || ((fam === 'inmersion' || fam === 'hibrido') && !lento)) {
      // Ya va rápido (o el tiempo lo fijas tú): moler más grueso no es la palanca; baja la temperatura.
      const temp = Math.max(85, (p.temperatura || 93) - 2);
      sug.push({ id: 'sobre-temp', tipo: 'ajuste', titulo: 'Menos temperatura', accion: `Baja el agua a ${temp} °C.`, porque, cambio: { temperatura: temp } });
    } else {
      const m = cambioMolienda(p, ctx.molino, 'grueso');
      sug.push({ id: 'sobre-grueso', tipo: 'ajuste', titulo: 'Más grueso', accion: `${m.accion}${lento ? ` Ha tardado ${Math.floor(t! / 60)}:${String(t! % 60).padStart(2, '0')}, por encima de lo previsto.` : ''}`, porque, cambio: m.cambio });
    }
  }

  // 4. Concentración (independiente de la extracción).
  if (conc === 'debil' && p.dosis && r) {
    const porque = 'Aguado es poca concentración: hay poco café disuelto por cada gramo de agua. Se corrige con el ratio (más café o menos agua), no necesariamente moliendo más fino.';
    if (esp) {
      const salida = Math.round(p.dosis * Math.max(1.3, r - 0.3));
      sug.push({ id: 'conc-debil', tipo: 'ajuste', titulo: 'Más concentrado', accion: `Corta la salida en ${salida} g (ratio 1:${fmt(salida / p.dosis)}).`, porque, cambio: { rendimiento: salida } });
    } else {
      const agua = Math.round(p.dosis * Math.max(12, r - 1.5));
      sug.push({ id: 'conc-debil', tipo: 'ajuste', titulo: 'Menos agua', accion: `Usa ${agua} g de agua para ${fmt(p.dosis)} g de café (ratio 1:${fmt(agua / p.dosis)}).`, porque, cambio: { agua } });
    }
  } else if (conc === 'fuerte' && p.dosis && r) {
    const porque = 'Demasiado fuerte es mucha concentración. Se corrige con el ratio: más agua por gramo de café.';
    if (esp) {
      const salida = Math.round(p.dosis * (r + 0.4));
      sug.push({ id: 'conc-fuerte', tipo: 'ajuste', titulo: 'Más largo', accion: `Alarga la salida a ${salida} g, o añade agua caliente a la taza.`, porque, cambio: { rendimiento: salida } });
    } else {
      const agua = Math.round(p.dosis * (r + 1.3));
      sug.push({ id: 'conc-fuerte', tipo: 'ajuste', titulo: 'Más agua', accion: `Usa ${agua} g de agua (ratio 1:${fmt(agua / p.dosis)}).`, porque, cambio: { agua } });
    }
  }

  // 5. Plano sin otra causa clara.
  if (s.has('plano') && !sug.some((x) => x.id === 'pasado')) {
    const temp = Math.min(96, (p.temperatura || 93) + 2);
    sug.push({
      id: 'plano', tipo: 'ajuste', titulo: 'Dale más vida', accion: `Sube el agua a ${temp} °C. Si usas agua muy pobre en minerales, prueba otra con algo más de mineralización.`,
      porque: 'Un café plano, sin defectos claros, suele estar algo corto de extracción o preparado con agua sin apenas minerales: el calcio y el magnesio ayudan a extraer sabor.',
      cambio: { temperatura: temp },
    });
  }

  // 6. Todo bien.
  const defectos = ['agrio', 'amargo', 'astringente', 'aguado', 'plano', 'intenso'].some((x) => s.has(x as never));
  if (!defectos && (s.has('dulce') || s.has('equilibrado') || (p.puntuacion || 0) >= 8)) {
    sug.push({
      id: 'bien', tipo: 'bien', titulo: 'Vas bien',
      accion: 'Repite esta receta. Si quieres afinar, cambia una sola cosa pequeña (1 clic o 1 °C) y compara.',
      porque: 'Cuando una taza es dulce y equilibrada, la extracción está en su zona. A partir de aquí se ajusta por gusto, no por defecto.',
    });
  }

  let lectura: string;
  if (ext === 'desigual') lectura = 'Extracción desigual';
  else if (ext === 'sub') lectura = 'Apunta a subextracción';
  else if (ext === 'sobre') lectura = 'Apunta a sobreextracción';
  else if (conc === 'debil') lectura = 'Poca concentración';
  else if (conc === 'fuerte') lectura = 'Demasiada concentración';
  else if (sug.some((x) => x.tipo === 'bien')) lectura = 'Buena extracción';
  else if (!s.size) lectura = 'Marca cómo lo notas para recibir sugerencias';
  else lectura = 'Sin desajustes claros';

  // Prioridad: primero lo que explica la causa (reposo, técnica), luego un único ajuste de extracción.
  return { lectura, sugerencias: sug.slice(0, 3) };
}
