// CAFÉ · Preparar: elegir café y método y fijar los parámetros antes del temporizador.
import { useEffect } from 'preact/hooks';
import { fechaRelativa, laDel } from '../../../core/fechas';
import { consulta, ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja } from '../../../ui/capas';
import { Ajuste, Campo, Lista, Selector, fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { borrador, actualizarPrep, type Borrador, type RecetaElegida } from '../borrador';
import { ratio, textoRatio, usoParaReposo, diasReposo } from '../calculos';
import { METODOS, metodo, esEspresso } from '../datos/metodos';
import { textoPuntuacion } from '../datos/catalogos';
import type { Cafe, Equipo, MetodoId, Preparacion, Receta } from '../modelo';
import { ID_C40, ID_G3006, ID_G5, listarAguas, listarCafes, listarEquipo, listarPreparaciones, listarRecetas, obtenerReceta, ultimaReferencia } from '../repositorio';
import { ChipReposo, IconoMetodo, descripcionCafe, resumenReceta, textoMolienda } from './comunes';

const RATIOS_FILTRO = [15, 16, 16.7, 17];
const RATIOS_ESPRESSO: [number, string][] = [[1.5, 'Ristretto'], [2, 'Normale'], [2.5, '1:2,5'], [3, 'Lungo']];

/** Valores de partida para un café y método: tu última preparación igual, o los del método. */
export async function construirBorrador(cafeId: string | undefined, m: MetodoId, cafes?: Cafe[]): Promise<Borrador> {
  const met = metodo(m);
  const esp = esEspresso(m);
  const ref = await ultimaReferencia(cafeId, m);
  const lista = cafes || (await listarCafes());
  const cafe = lista.find((c) => c.id === cafeId);
  const base = { metodo: m, cafeId, cafeNombre: cafe?.nombre, sintomas: [] as Preparacion['sintomas'] };
  if (ref) {
    const mismoCafe = !!cafeId && ref.cafeId === cafeId;
    return {
      prep: {
        ...base, dosis: ref.dosis, agua: esp ? undefined : ref.agua, rendimiento: esp ? ref.rendimiento : undefined,
        molinoId: ref.molinoId, molienda: ref.molienda, temperatura: ref.temperatura, aguaId: ref.aguaId, filtro: ref.filtro,
        cafeteraId: ref.cafeteraId, preinfusion: ref.preinfusion, padreId: mismoCafe ? ref.id : undefined,
      },
      origen: mismoCafe
        ? `Partiendo de tu última preparación con ${met.nombre} y este café (${fechaRelativa(ref.fecha).toLowerCase()}${ref.puntuacion ? `, ${fmt(ref.puntuacion)}/10` : ''}). Cambia solo una cosa para saber qué funciona.`
        : `Partiendo de tu última preparación con ${met.nombre}, que fue con otro café: si cambia el tueste o el proceso, revisa la molienda.`,
    };
  }
  return {
    prep: {
      ...base, dosis: met.dosis, agua: esp ? undefined : Math.round(met.dosis * met.ratio), rendimiento: esp ? met.dosis * met.ratio : undefined,
      molinoId: esp ? ID_G5 : ID_C40, molienda: !esp && met.clicsC40 ? Math.round((met.clicsC40[0] + met.clicsC40[1]) / 2) : undefined,
      temperatura: met.temperatura, aguaId: 'agua-debil', filtro: met.filtros[0], cafeteraId: esp ? ID_G3006 : undefined, preinfusion: esp ? 5 : undefined,
    },
    origen: `Valores de partida para ${met.nombre}. Molienda: ${met.descripcionMolienda.toLowerCase()}${met.clicsC40 && !esp ? ` (orientativo en el C40: ${met.clicsC40[0]}-${met.clicsC40[1]} clics)` : ''}.`,
  };
}

/** Empieza una preparación nueva: con el café indicado o con el último que usaste. */
export async function nuevaPreparacion(cafeId?: string, m?: MetodoId): Promise<void> {
  const preps = await listarPreparaciones();
  const cafes = (await listarCafes()).filter((c) => !c.terminado);
  const ultima = preps.find((p) => !cafeId || p.cafeId === cafeId);
  const cafe = cafeId || (ultima?.cafeId && cafes.some((c) => c.id === ultima.cafeId) ? ultima.cafeId : cafes[0]?.id);
  const met = m || ultima?.metodo || 'v60';
  borrador.value = await construirBorrador(cafe, met, cafes);
  ir('/cafe/preparar');
}

/** Repite una preparación; con `cambio`, aplica ya la sugerencia del diagnóstico. */
export async function repetirPreparacion(p: Preparacion, cambio?: Partial<Preparacion>): Promise<void> {
  const desde = `${laDel(p.fecha)}${p.puntuacion ? ` (${fmt(p.puntuacion)}/10)` : ''}`;
  const r = await obtenerReceta(p.recetaId);
  borrador.value = {
    prep: {
      metodo: p.metodo, cafeId: p.cafeId, cafeNombre: p.cafeNombre, dosis: p.dosis, agua: p.agua, rendimiento: p.rendimiento, molinoId: p.molinoId,
      molienda: p.molienda, temperatura: p.temperatura, aguaId: p.aguaId, filtro: p.filtro, cafeteraId: p.cafeteraId, preinfusion: p.preinfusion,
      bebida: p.bebida, padreId: p.id, recetaId: r ? r.id : undefined, sintomas: [], ...(cambio || {}),
    },
    origen: cambio
      ? `Repitiendo ${desde} con el ajuste sugerido ya aplicado. Deja el resto igual.`
      : `Repitiendo ${desde}. Cambia solo una variable para saber qué efecto tiene.`,
    receta: r ? recetaElegida(r) : undefined,
  };
  ir('/cafe/preparar');
}

export const recetaElegida = (r: Receta): RecetaElegida => ({ id: r.id, nombre: r.nombre, autor: r.autor, metodo: r.metodo, agua: r.agua, fases: r.fases, tiempoObjetivo: r.tiempoObjetivo });
const autorCorto = (r: Receta) => r.autor?.split(' · ')[0];

/**
 * Aplica una receta a un borrador. Si ya la hiciste con este café, parte de tu última vez
 * (molienda incluida); si no, de las cantidades del autor y una molienda de partida.
 */
export async function aplicarReceta(b: Borrador, r: Receta): Promise<Borrador> {
  const esp = esEspresso(r.metodo);
  const preps = await listarPreparaciones();
  const cafeId = b.prep.cafeId;
  const mismoCafe = cafeId ? preps.find((x) => x.recetaId === r.id && x.cafeId === cafeId) : undefined;
  const base = { metodo: r.metodo, cafeId, cafeNombre: b.prep.cafeNombre, recetaId: r.id, sintomas: [] as Preparacion['sintomas'] };
  const receta = recetaElegida(r);
  if (mismoCafe) {
    const x = mismoCafe;
    return {
      prep: {
        ...base, dosis: x.dosis, agua: esp ? undefined : x.agua, rendimiento: esp ? x.rendimiento : undefined, molinoId: x.molinoId, molienda: x.molienda,
        temperatura: x.temperatura, aguaId: x.aguaId, filtro: x.filtro, cafeteraId: x.cafeteraId, preinfusion: x.preinfusion, padreId: x.id,
      },
      origen: `Receta «${r.nombre}». Partiendo de tu última vez con ella y este café (${laDel(x.fecha)}${x.puntuacion ? `, ${fmt(x.puntuacion)}/10` : ''}).`,
      receta,
    };
  }
  const otroCafe = preps.find((x) => x.recetaId === r.id);
  let molinoId = b.prep.molinoId;
  let molienda = b.prep.molienda;
  let nota = '';
  if (otroCafe?.molienda !== undefined) {
    molinoId = otroCafe.molinoId;
    molienda = otroCafe.molienda;
    nota = ` Molienda de tu última vez con esta receta (${laDel(otroCafe.fecha)}), que fue con otro café: revísala si cambia el tueste.`;
  } else if (r.molinoId && r.ajusteMolino !== undefined) {
    molinoId = r.molinoId;
    molienda = r.ajusteMolino;
  } else if (r.clicsC40 && !esp) {
    molinoId = ID_C40;
    molienda = Math.round((r.clicsC40[0] + r.clicsC40[1]) / 2);
    nota = ` Molienda ${r.molienda?.toLowerCase() || ''}: en tu C40 empieza por ${molienda} clics (estimación de la app, no del autor).`;
  }
  return {
    prep: {
      ...base, dosis: r.dosis, agua: esp ? undefined : r.agua, rendimiento: esp ? r.rendimiento : undefined, molinoId, molienda,
      temperatura: r.temperatura ?? b.prep.temperatura, aguaId: b.prep.aguaId, filtro: r.filtro ?? b.prep.filtro, cafeteraId: b.prep.cafeteraId, preinfusion: b.prep.preinfusion,
    },
    origen: `Receta «${r.nombre}»${autorCorto(r) ? ` de ${autorCorto(r)}` : ''}, pensada para ${fmt(r.dosis)} g.${nota}`,
    receta,
  };
}

/** Empieza una preparación con una receta (desde su ficha). */
export async function prepararConReceta(r: Receta): Promise<void> {
  const preps = await listarPreparaciones();
  const cafes = (await listarCafes()).filter((c) => !c.terminado);
  const ultima = preps[0];
  const cafe = ultima?.cafeId && cafes.some((c) => c.id === ultima.cafeId) ? ultima.cafeId : cafes[0]?.id;
  borrador.value = await aplicarReceta(await construirBorrador(cafe, r.metodo, cafes), r);
  ir('/cafe/preparar');
}

function ElegirReceta({ cerrar, m, actual, elegir }: { cerrar: () => void; m: MetodoId; actual?: string; elegir: (r: Receta | null) => void }) {
  const recetas = (useVivo(listarRecetas, []) || []).filter((r) => r.metodo === m);
  return (
    <Hoja titulo={`Recetas de ${metodo(m).nombre}`} cerrar={cerrar}>
      <div class="lista">
        <button type="button" class="item" onClick={() => (elegir(null), cerrar())}>
          <IconoMetodo id={m} />
          <div class="item-txt">
            <div class="item-tit">Sin receta</div>
            <div class="item-meta">Pasos básicos del método</div>
          </div>
          {!actual && <Icono n="check" t={18} clase="marca-elegida" />}
        </button>
        {recetas.map((r) => (
          <button type="button" class="item" onClick={() => (elegir(r), cerrar())}>
            <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
              <Icono n="receta" t={20} />
            </span>
            <div class="item-txt">
              <div class="item-tit">{r.nombre}</div>
              <div class="item-meta">{[autorCorto(r) || (r.referencia ? '' : 'Tuya'), resumenReceta(r)].filter(Boolean).join(' · ')}</div>
            </div>
            {actual === r.id && <Icono n="check" t={18} clase="marca-elegida" />}
          </button>
        ))}
      </div>
      {recetas.length === 0 && <p class="pie">Aún no hay recetas para este método. Puedes crear la tuya desde la pestaña Recetas.</p>}
    </Hoja>
  );
}

function ElegirCafe({ cerrar, cafes, uso, elegir }: { cerrar: () => void; cafes: Cafe[]; uso: 'filtro' | 'espresso'; elegir: (id?: string) => void }) {
  return (
    <Hoja titulo="Elegir café" cerrar={cerrar}>
      <div class="lista">
        {cafes.map((c) => (
          <button type="button" class="item" onClick={() => (elegir(c.id), cerrar())}>
            <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
              <Icono n="grano" t={21} />
            </span>
            <div class="item-txt">
              <div class="item-tit">{c.nombre}</div>
              <div class="item-meta">
                {c.tostador} · {descripcionCafe(c)}
              </div>
              <ChipReposo cafe={c} uso={uso} />
            </div>
          </button>
        ))}
        <button type="button" class="item" onClick={() => (elegir(undefined), cerrar())}>
          <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
            <Icono n="cafe" t={21} />
          </span>
          <div class="item-txt">
            <div class="item-tit">Sin registrar</div>
            <div class="item-meta">Un café que no está en tu biblioteca</div>
          </div>
        </button>
      </div>
      <p class="pie">Los cafés terminados no aparecen. Puedes añadir cafés nuevos desde la pestaña Cafés.</p>
    </Hoja>
  );
}

export function Preparar() {
  const cafes = useVivo(async () => (await listarCafes()).filter((c) => !c.terminado), []) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const aguas = useVivo(listarAguas, []) || [];
  const preps = useVivo(listarPreparaciones, []) || [];
  const b = borrador.value;

  useEffect(() => {
    const q = consulta();
    if (q.get('cafe')) nuevaPreparacion(q.get('cafe')!, undefined);
    else if (!borrador.value) nuevaPreparacion();
  }, []);

  if (!b) return <div class="vacio">Preparando…</div>;
  const p = b.prep;
  const met = metodo(p.metodo);
  const esp = esEspresso(p.metodo);
  const cafe = cafes.find((c) => c.id === p.cafeId);
  const uso = usoParaReposo(cafe || {}, p.metodo);
  const molinos = equipo.filter((e) => e.tipo === 'molino');
  const molino: Equipo | undefined = equipo.find((e) => e.id === p.molinoId);
  const cafeteras = equipo.filter((e) => e.tipo === 'cafetera');
  const r = ratio(p as Preparacion);

  // Mejor resultado conocido con este café y método (para orientar).
  const mejor = preps
    .filter((x) => x.cafeId && x.cafeId === p.cafeId && x.metodo === p.metodo && x.puntuacion !== undefined)
    .sort((a, b2) => (b2.puntuacion || 0) - (a.puntuacion || 0))[0];

  const cambiarCafe = async (id?: string) => {
    let nb = await construirBorrador(id, p.metodo, cafes);
    // Mantiene la receta elegida al cambiar de café.
    const r = await obtenerReceta(b.receta?.id);
    if (r && r.metodo === p.metodo) nb = await aplicarReceta(nb, r);
    borrador.value = nb;
  };
  const cambiarMetodo = async (m: MetodoId) => {
    borrador.value = await construirBorrador(p.cafeId, m, cafes);
  };
  const cambiarReceta = async (r: Receta | null) => {
    const nb = await construirBorrador(p.cafeId, r ? r.metodo : p.metodo, cafes);
    borrador.value = r ? await aplicarReceta(nb, r) : nb;
  };
  const fijarRatio = (x: number) => {
    if (!p.dosis) return;
    if (esp) actualizarPrep({ rendimiento: Math.round(p.dosis * x * 10) / 10 });
    else actualizarPrep({ agua: Math.round(p.dosis * x) });
  };
  const fijarDosis = (d: number | undefined) => {
    // Mantiene el ratio al cambiar la dosis.
    if (d && r) {
      if (esp) actualizarPrep({ dosis: d, rendimiento: Math.round(d * r * 10) / 10 });
      else actualizarPrep({ dosis: d, agua: Math.round(d * r) });
    } else actualizarPrep({ dosis: d });
  };

  const empezar = (conTemporizador: boolean) => {
    if (!p.dosis) return;
    const cafeSel = cafes.find((c) => c.id === p.cafeId);
    actualizarPrep({ diasReposo: cafeSel ? diasReposo(cafeSel) : undefined, cafeNombre: cafeSel?.nombre });
    if (conTemporizador && met.temporizador) ir('/cafe/preparar/temporizador');
    else ir('/cafe/preparar/resultado');
  };

  return (
    <>
      <BarraDetalle titulo="Preparar" padre="/cafe" textoAtras="Café" />
      <div class="pagina">
        <Lista titulo="Café">
          <button
            type="button"
            class="item"
            onClick={() => abrirHoja((cerrar) => <ElegirCafe cerrar={cerrar} cafes={cafes} uso={uso} elegir={cambiarCafe} />)}
          >
            <span class="insignia insignia-cafe" style={{ '--tam': '40px' }}>
              <Icono n="grano" t={24} />
            </span>
            <div class="item-txt">
              <div class="item-tit">{cafe ? cafe.nombre : 'Sin registrar'}</div>
              {cafe ? (
                <>
                  <div class="item-meta">
                    {cafe.tostador} · {descripcionCafe(cafe)}
                  </div>
                  <ChipReposo cafe={cafe} uso={uso} />
                </>
              ) : (
                <div class="item-meta">Toca para elegir de tu biblioteca</div>
              )}
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </button>
        </Lista>

        <div class="tit-lista">Método</div>
        <div class="metodos">
          {METODOS.map((m) => (
            <button type="button" class="metodo-btn" aria-pressed={m.id === p.metodo} onClick={() => cambiarMetodo(m.id)}>
              <Icono n={m.icono} t={26} />
              <span>{m.nombre}</span>
            </button>
          ))}
        </div>

        {met.temporizador && (
          <div class="lista fila-receta">
            <button
              type="button"
              class="item"
              onClick={() => abrirHoja((cerrar) => <ElegirReceta cerrar={cerrar} m={p.metodo} actual={b.receta?.id} elegir={cambiarReceta} />)}
            >
              <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
                <Icono n="receta" t={20} />
              </span>
              <div class="item-txt">
                <div class="item-tit">{b.receta ? b.receta.nombre : 'Sin receta'}</div>
                <div class="item-meta">{b.receta ? `Pasos de la receta${b.receta.autor ? ` · ${b.receta.autor.split(' · ')[0]}` : ''}` : 'Pasos básicos del método · toca para elegir una receta'}</div>
              </div>
              <Icono n="chevron" t={16} clase="chev" />
            </button>
          </div>
        )}

        {b.origen && (
          <p class="aviso-suave">
            <Icono n="info" t={18} />
            <span>{b.origen}</span>
          </p>
        )}
        {mejor && (
          <p class="aviso-suave exito">
            <Icono n="estrella" t={18} />
            <span>
              Tu mejor resultado con {met.nombre} y este café: <b>{fmt(mejor.puntuacion)}/10</b> ({textoPuntuacion(mejor.puntuacion).toLowerCase()}) con {fmt(mejor.dosis)} g,{' '}
              {textoRatio(ratio(mejor))}, {textoMolienda(mejor, equipo) || 'molienda sin anotar'}
              {mejor.temperatura ? `, ${mejor.temperatura} °C` : ''}.
            </span>
          </p>
        )}

        <Lista titulo="Cantidades" pie={b.receta && b.receta.agua && p.agua && Math.abs(p.agua / b.receta.agua - 1) > 0.02 ? `Los vertidos de la receta se escalan a ${fmt(p.agua)} g. Los tiempos no cambian: con mucha más o menos cantidad, el drenaje tardará distinto.` : undefined}>
          <Campo et="Dosis de café">
            <Ajuste valor={p.dosis} cambiar={fijarDosis} paso={0.5} min={1} unidad="g" etiqueta="dosis" />
          </Campo>
          {esp ? (
            <Campo et="Salida objetivo" sub="Peso del espresso en la taza">
              <Ajuste valor={p.rendimiento} cambiar={(v) => actualizarPrep({ rendimiento: v })} paso={1} min={1} unidad="g" etiqueta="salida" />
            </Campo>
          ) : (
            <Campo et="Agua">
              <Ajuste valor={p.agua} cambiar={(v) => actualizarPrep({ agua: v })} paso={5} min={1} unidad="g" etiqueta="agua" />
            </Campo>
          )}
          <Campo et="Ratio" sub={esp ? 'Café : salida' : 'Café : agua'} col>
            <div class="ratio-fila">
              <b class="ratio-valor">{textoRatio(r)}</b>
              <div class="chips compactos">
                {esp
                  ? RATIOS_ESPRESSO.map(([x, n]) => (
                      <button type="button" class="chip" aria-pressed={!!r && Math.abs(r - x) < 0.05} onClick={() => fijarRatio(x)}>
                        {n}
                      </button>
                    ))
                  : RATIOS_FILTRO.map((x) => (
                      <button type="button" class="chip" aria-pressed={!!r && Math.abs(r - x) < 0.05} onClick={() => fijarRatio(x)}>
                        {textoRatio(x)}
                      </button>
                    ))}
              </div>
            </div>
          </Campo>
        </Lista>

        <Lista titulo="Molienda" pie={molino?.molino?.escala === 'clics' ? 'Clics contados desde las muelas cerradas del todo.' : undefined}>
          <Campo et="Molino">
            <Selector opciones={[['', 'Sin indicar'], ...molinos.map((m) => [m.id, m.nombre] as [string, string])]} valor={p.molinoId || ''} cambiar={(v) => actualizarPrep({ molinoId: v || undefined })} />
          </Campo>
          <Campo et={molino?.molino?.escala === 'clics' ? 'Clics' : 'Posición'} sub={molino?.molino ? `Rango ${molino.molino.min}-${molino.molino.max}` : undefined}>
            <Ajuste
              valor={p.molienda}
              cambiar={(v) => actualizarPrep({ molienda: v })}
              paso={molino?.molino?.paso || 1}
              min={molino?.molino?.min}
              max={molino?.molino?.max}
              dec={1}
              etiqueta="molienda"
            />
          </Campo>
        </Lista>

        <Lista titulo="Agua y equipo">
          <Campo et="Temperatura">
            <Ajuste valor={p.temperatura} cambiar={(v) => actualizarPrep({ temperatura: v })} paso={1} min={20} max={100} unidad="°C" etiqueta="temperatura" />
          </Campo>
          <Campo et="Agua">
            <Selector opciones={[['', 'Sin indicar'], ...aguas.map((a) => [a.id, a.nombre] as [string, string])]} valor={p.aguaId || ''} cambiar={(v) => actualizarPrep({ aguaId: v || undefined })} />
          </Campo>
          <Campo et={esp ? 'Cesta' : 'Filtro'}>
            <Selector opciones={[['', 'Sin indicar'], ...met.filtros.map((f) => [f, f] as [string, string])]} valor={p.filtro || ''} cambiar={(v) => actualizarPrep({ filtro: v || undefined })} />
          </Campo>
          {esp && (
            <>
              <Campo et="Cafetera">
                <Selector opciones={[['', 'Sin indicar'], ...cafeteras.map((m) => [m.id, m.nombre] as [string, string])]} valor={p.cafeteraId || ''} cambiar={(v) => actualizarPrep({ cafeteraId: v || undefined })} />
              </Campo>
              <Campo et="Preinfusión" sub="La programada en la máquina">
                <Ajuste valor={p.preinfusion} cambiar={(v) => actualizarPrep({ preinfusion: v })} paso={1} min={0} max={30} unidad="s" etiqueta="preinfusión" />
              </Campo>
            </>
          )}
        </Lista>

        <div class="acciones-fijas">
          {met.temporizador ? (
            <>
              <button type="button" class="boton-principal" onClick={() => empezar(true)}>
                <Icono n="crono" t={22} /> Ir al temporizador
              </button>
              <button type="button" class="boton-secundario" onClick={() => empezar(false)}>
                Registrar sin temporizador
              </button>
            </>
          ) : (
            <button type="button" class="boton-principal" onClick={() => empezar(false)}>
              <Icono n="diario" t={22} /> Registrar
            </button>
          )}
        </div>
      </div>
    </>
  );
}

