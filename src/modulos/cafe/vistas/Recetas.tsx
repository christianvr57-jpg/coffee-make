// CAFÉ · Recetas: biblioteca (referencia + tuyas), ficha con pasos y fuente, y editor.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { borrar, guardar } from '../../../core/db';
import { fechaRelativa, segundosATexto } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../../../ui/capas';
import { Ajuste, Campo, Interruptor, Lista, Selector, Texto, fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { ratio, textoRatio } from '../calculos';
import { METODOS, esEspresso, metodo, type FasePlan } from '../datos/metodos';
import type { MetodoId, Preparacion, Receta } from '../modelo';
import { duplicarReceta, iniciosFases, objetivoDesdeFases, recetaDesdeMetodo, revisarReceta, vertidoEnFase } from '../recetas';
import { listarEquipo, listarPreparaciones, listarRecetas, obtenerReceta } from '../repositorio';
import { IconoMetodo, Nota, resumenReceta, textoMolienda } from './comunes';
import { prepararConReceta } from './Preparar';

const filtroMetodo = signal<MetodoId | 'todos'>('todos');
const autorCorto = (r: Receta) => r.autor?.split(' · ')[0];

function FilaReceta({ r, usos }: { r: Receta; usos: Preparacion[] }) {
  const mejor = usos.reduce<number | undefined>((m, p) => (p.puntuacion !== undefined && (m === undefined || p.puntuacion > m) ? p.puntuacion : m), undefined);
  return (
    <a class="item" href={`#/cafe/recetas/${r.id}`}>
      <IconoMetodo id={r.metodo} />
      <div class="item-txt">
        <div class="item-tit">{r.nombre}</div>
        <div class="item-meta">{[autorCorto(r), resumenReceta(r)].filter(Boolean).join(' · ')}</div>
        {usos.length > 0 && (
          <div class="item-chips">
            <span class="chip-estado">
              {usos.length} {usos.length === 1 ? 'vez' : 'veces'}
            </span>
          </div>
        )}
      </div>
      {mejor !== undefined ? <Nota p={mejor} /> : <Icono n="chevron" t={16} clase="chev" />}
    </a>
  );
}

export function Recetas() {
  const recetas = useVivo(listarRecetas, []);
  const preps = useVivo(listarPreparaciones, []) || [];
  const todas = recetas || [];
  const metodos = METODOS.filter((m) => todas.some((r) => r.metodo === m.id));
  const f = filtroMetodo.value;
  const lista = todas.filter((r) => f === 'todos' || r.metodo === f);
  const mias = lista.filter((r) => !r.referencia);
  const refs = lista.filter((r) => r.referencia);
  const usos = (id: string) => preps.filter((p) => p.recetaId === id);

  const crear = () => editarReceta(recetaDesdeMetodo(f === 'todos' ? 'v60' : f), null);

  return (
    <>
      <div class="sub-cabecera">
        <div class="chips desplazables">
          <button type="button" class="chip" aria-pressed={f === 'todos'} onClick={() => (filtroMetodo.value = 'todos')}>
            Todas
          </button>
          {metodos.map((m) => (
            <button type="button" class="chip" aria-pressed={f === m.id} onClick={() => (filtroMetodo.value = m.id)}>
              {m.nombre}
            </button>
          ))}
        </div>
        <button type="button" class="btn-mas" aria-label="Crear receta" onClick={crear}>
          <Icono n="anadir" t={24} />
        </button>
      </div>

      {mias.length > 0 && (
        <Lista titulo="Tus recetas">
          {mias.map((r) => (
            <FilaReceta r={r} usos={usos(r.id)} />
          ))}
        </Lista>
      )}

      {refs.length > 0 && (
        <Lista titulo="De referencia" pie="Recetas publicadas por sus autores, con enlace a la fuente. Duplica una para adaptarla a tu gusto.">
          {refs.map((r) => (
            <FilaReceta r={r} usos={usos(r.id)} />
          ))}
        </Lista>
      )}

      {recetas && lista.length === 0 && (
        <div class="vacio">
          <Icono n="receta" t={44} />
          <p>No hay recetas para este método.</p>
          <p class="pie">Crea la tuya con el botón +.</p>
        </div>
      )}
    </>
  );
}

/** Lista de pasos con hora de inicio, peso y vertido de cada uno. */
export function PasosReceta({ fases }: { fases: FasePlan[] }) {
  const inicios = iniciosFases(fases);
  return (
    <ol class="lista pasos-receta">
      {fases.map((f, i) => {
        const v = vertidoEnFase(fases, i);
        return (
          <li>
            <span class="pr-tiempo">{segundosATexto(inicios[i])}</span>
            <div class="pr-txt">
              <div class="pr-cab">
                <b>{f.nombre}</b>
                {f.aguaHasta !== undefined && (
                  <span class="pr-agua">
                    hasta {f.aguaHasta} g{v !== undefined && v !== f.aguaHasta ? ` (+${v})` : ''}
                  </span>
                )}
              </div>
              {f.instruccion && <p>{f.instruccion}</p>}
              <small>{f.duracion === null ? 'Avanzas tú' : `${f.duracion} s`}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function FichaReceta({ params }: { params: Record<string, string> }) {
  const r = useVivo(() => obtenerReceta(params.id).then((x) => x ?? null), [params.id]);
  const preps = useVivo(async () => (await listarPreparaciones()).filter((p) => p.recetaId === params.id), [params.id]) || [];
  const equipo = useVivo(listarEquipo, []) || [];

  if (r === undefined) return <BarraDetalle padre="/cafe/recetas" textoAtras="Recetas" />;
  if (!r) {
    return (
      <>
        <BarraDetalle padre="/cafe/recetas" textoAtras="Recetas" />
        <div class="vacio">Esta receta ya no existe.</div>
      </>
    );
  }
  const met = metodo(r.metodo);
  const esp = esEspresso(r.metodo);
  const propia = !r.referencia;
  const obj = r.tiempoObjetivo;
  const molinoPropio = propia && r.ajusteMolino !== undefined ? [textoMolienda({ molienda: r.ajusteMolino, molinoId: r.molinoId }, equipo), equipo.find((e) => e.id === r.molinoId)?.nombre].filter(Boolean).join(' · ') : undefined;
  const datos: [string, string | undefined][] = [
    ['Dosis', `${fmt(r.dosis)} g`],
    esp ? ['Salida', r.rendimiento ? `${fmt(r.rendimiento)} g` : undefined] : ['Agua', r.agua ? `${fmt(r.agua)} g` : undefined],
    ['Ratio', textoRatio(ratio(r))],
    ['Temperatura', r.temperatura ? (r.temperatura >= 99 ? `${r.temperatura} °C (recién hervida)` : `${r.temperatura} °C`) : esp ? 'La de tu máquina' : r.metodo === 'moka' ? 'Agua ya caliente' : undefined],
    ['Molienda', r.molienda],
    ['En tu C40', r.clicsC40 ? `${r.clicsC40[0]}-${r.clicsC40[1]} clics (estimación)` : undefined],
    ['Tu molienda', molinoPropio],
    [esp ? 'Cesta' : 'Filtro', r.filtro],
    ['Tiempo total', obj ? (esp ? `${obj[0]}-${obj[1]} s` : `${segundosATexto(obj[0])} – ${segundosATexto(obj[1])}`) : undefined],
  ];
  const notas = preps.filter((p) => p.puntuacion !== undefined).map((p) => p.puntuacion!);
  const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : undefined;
  const mejor = [...preps].filter((p) => p.puntuacion !== undefined).sort((a, b) => b.puntuacion! - a.puntuacion!)[0];

  const eliminar = async () => {
    if (!(await confirmar({ titulo: '¿Eliminar esta receta?', texto: 'Las preparaciones que hiciste con ella se conservan.', ok: 'Eliminar', peligro: true }))) return;
    await borrar('cafe_recetas', r.id);
    mostrarToast('Receta eliminada');
    ir('/cafe/recetas', true);
  };

  return (
    <>
      <BarraDetalle
        padre="/cafe/recetas"
        textoAtras="Recetas"
        derecha={
          propia ? (
            <button type="button" class="bd-accion" onClick={() => editarReceta(r, r)}>
              Editar
            </button>
          ) : undefined
        }
      />
      <div class="pagina">
        <section class="ficha-cab">
          <IconoMetodo id={r.metodo} tam={52} />
          <div class="fc-txt">
            <div class="sobre">
              {met.nombre} · {propia ? 'Tuya' : 'Referencia'}
            </div>
            <h1>{r.nombre}</h1>
            {r.autor && <div class="sub">{r.autor}</div>}
          </div>
        </section>
        {r.resumen && <p class="resumen-receta">{r.resumen}</p>}

        <div class="acciones-fila">
          <button type="button" class="boton-principal" onClick={() => prepararConReceta(r)}>
            <Icono n="cafe" t={20} /> Preparar
          </button>
          <button type="button" class="boton-secundario" onClick={() => editarReceta(duplicarReceta(r), null)}>
            <Icono n="copiar" t={20} /> {propia ? 'Duplicar' : 'Duplicar y ajustar'}
          </button>
        </div>

        <div class="tit-lista">Parámetros</div>
        <dl class="rejilla-datos">
          {datos.filter(([, v]) => v).map(([k, v]) => (
            <div>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {r.clicsC40 && <p class="pie">Los clics son una estimación de la app a partir de la molienda que describe el autor: tómalos como punto de partida y ajusta a tu gusto.</p>}

        {r.fases.length > 0 && !esp && (
          <>
            <div class="tit-lista">Pasos</div>
            <PasosReceta fases={r.fases} />
            <p class="pie">Pesos acumulados en la báscula para {fmt(r.agua)} g de agua. Si cambias la cantidad, el temporizador los escala.</p>
          </>
        )}

        {r.consejos.length > 0 && (
          <>
            <div class="tit-lista">{propia ? 'Consejos' : 'Consejos del autor'}</div>
            <ul class="lista bloque-texto consejos">
              {r.consejos.map((c) => (
                <li>{c}</li>
              ))}
            </ul>
          </>
        )}

        {r.notas && (
          <>
            <div class="tit-lista">Notas</div>
            <div class="lista bloque-texto">
              <p>{r.notas}</p>
            </div>
          </>
        )}

        {r.fuente && (
          <>
            <div class="tit-lista">Fuente</div>
            <div class="lista">
              <a class="item" href={r.fuente.url} target="_blank" rel="noopener noreferrer">
                <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
                  <Icono n="libro" t={20} />
                </span>
                <div class="item-txt">
                  <div class="item-tit">{r.fuente.titulo}</div>
                  <div class="item-meta">{new URL(r.fuente.url).hostname.replace(/^www\./, '')}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </a>
            </div>
            {!propia && <p class="pie">Cantidades, tiempos y temperatura contrastados con la fuente. La duración de los pasos sin cronometrar (remover, girar) es orientativa.</p>}
          </>
        )}

        <div class="tit-lista">Tus resultados</div>
        {preps.length === 0 ? (
          <p class="pie primero">Aún no la has preparado. Cuando lo hagas, aquí verás tus notas con ella.</p>
        ) : (
          <>
            <p class="pie primero">
              {preps.length} {preps.length === 1 ? 'vez' : 'veces'}
              {media !== undefined ? ` · media ${fmt(media)}/10` : ''}
              {mejor ? ` · tu mejor: ${fmt(mejor.puntuacion)}/10 con ${mejor.cafeNombre || 'café sin registrar'}` : ''}.
            </p>
            <div class="lista">
              {preps.slice(0, 6).map((p) => (
                <a class="item" href={`#/cafe/p/${p.id}`}>
                  <IconoMetodo id={p.metodo} />
                  <div class="item-txt">
                    <div class="item-tit">{p.cafeNombre || 'Sin registrar'}</div>
                    <div class="item-meta">
                      {fechaRelativa(p.fecha)} · {fmt(p.dosis)} g · {textoMolienda(p, equipo) || 'molienda sin anotar'}
                      {p.tiempoTotal ? ` · ${segundosATexto(p.tiempoTotal)}` : ''}
                    </div>
                  </div>
                  <Nota p={p.puntuacion} />
                </a>
              ))}
            </div>
          </>
        )}

        {propia && (
          <div class="lista separada">
            <button type="button" class="boton-fila peligro" onClick={eliminar}>
              <Icono n="papelera" t={22} /> Eliminar receta
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ---------- Editor ----------

function EditorPaso({ f, i, total, cambiar, mover, quitar }: { f: FasePlan; i: number; total: number; cambiar: (p: Partial<FasePlan>) => void; mover: (d: -1 | 1) => void; quitar: () => void }) {
  return (
    <div class="lista editor-paso">
      <div class="ep-cab">
        <b>Paso {i + 1}</b>
        <button type="button" class="btn-icono" aria-label="Subir paso" disabled={i === 0} onClick={() => mover(-1)}>
          <Icono n="chevronAbajo" t={18} clase="gira-arriba" />
        </button>
        <button type="button" class="btn-icono" aria-label="Bajar paso" disabled={i === total - 1} onClick={() => mover(1)}>
          <Icono n="chevronAbajo" t={18} />
        </button>
        <button type="button" class="btn-icono peligro" aria-label="Quitar paso" onClick={quitar}>
          <Icono n="papelera" t={18} />
        </button>
      </div>
      <Campo et="Nombre" col>
        <Texto valor={f.nombre} cambiar={(v) => cambiar({ nombre: v })} marcador="Bloom, vertido, drenaje…" />
      </Campo>
      <Campo et="Avanzar a mano" sub="Sin cuenta atrás: pasas tú al siguiente">
        <Interruptor valor={f.duracion === null} cambiar={(v) => cambiar({ duracion: v ? null : 30 })} />
      </Campo>
      {f.duracion !== null && (
        <Campo et="Duración">
          <Ajuste valor={f.duracion} cambiar={(v) => cambiar({ duracion: v ?? 0 })} paso={5} min={0} max={3600} unidad="s" dec={0} etiqueta="duración" />
        </Campo>
      )}
      <Campo et="Vierte hasta" sub="Peso acumulado; vacío si no hay que verter">
        <Ajuste valor={f.aguaHasta} cambiar={(v) => cambiar({ aguaHasta: v })} paso={10} min={0} unidad="g" dec={0} etiqueta="peso" />
      </Campo>
      <Campo et="Instrucción" col>
        <Texto multilinea filas={2} valor={f.instruccion} cambiar={(v) => cambiar({ instruccion: v })} marcador="Qué hacer en este paso" />
      </Campo>
    </div>
  );
}

function EditorReceta({ inicial, original, cerrar }: { inicial: Partial<Receta>; original: Receta | null; cerrar: () => void }) {
  const [f, setF] = useState<Partial<Receta>>(() => ({ ...inicial, fases: (inicial.fases || []).map((x) => ({ ...x })) }));
  const [consejos, setConsejos] = useState((inicial.consejos || []).join('\n'));
  const equipo = useVivo(listarEquipo, []) || [];
  const set = (p: Partial<Receta>) => setF((x) => ({ ...x, ...p }));
  const m = f.metodo || 'v60';
  const met = metodo(m);
  const esp = esEspresso(m);
  const fases = f.fases || [];
  const molinos = equipo.filter((e) => e.tipo === 'molino');
  const molino = equipo.find((e) => e.id === f.molinoId);
  const rev = revisarReceta(f);

  const setFases = (fn: (fs: FasePlan[]) => FasePlan[]) => setF((x) => ({ ...x, fases: fn(x.fases || []) }));
  const cambiarPaso = (i: number, p: Partial<FasePlan>) => setFases((fs) => fs.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const moverPaso = (i: number, d: -1 | 1) =>
    setFases((fs) => {
      const n = [...fs];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const quitarPaso = (i: number) => setFases((fs) => fs.filter((_, j) => j !== i));
  const anadirPaso = () => setFases((fs) => [...fs, { nombre: `Paso ${fs.length + 1}`, duracion: 30, instruccion: '' }]);
  const plantilla = async () => {
    if (fases.length && !(await confirmar({ titulo: '¿Sustituir los pasos?', texto: `Se cargan los pasos básicos de ${met.nombre} para ${fmt(f.dosis)} g y ${fmt(f.agua)} g.`, ok: 'Sustituir' }))) return;
    set({ fases: met.fases(f.dosis || met.dosis, f.agua || Math.round((f.dosis || met.dosis) * met.ratio)) });
  };
  const cambiarMetodo = (nuevo: MetodoId) => {
    const base = recetaDesdeMetodo(nuevo);
    set({ metodo: nuevo, dosis: base.dosis, agua: base.agua, rendimiento: base.rendimiento, temperatura: base.temperatura, molienda: base.molienda, filtro: base.filtro, fases: base.fases, clicsC40: undefined });
  };

  const guardarReceta = async () => {
    const datos: Partial<Receta> = { ...f, nombre: (f.nombre || '').trim(), consejos: consejos.split('\n').map((s) => s.trim()).filter(Boolean) };
    const r = revisarReceta(datos);
    if (r.errores.length) {
      await avisar('Revisa la receta', r.errores.join(' '));
      return false;
    }
    if (!esp) datos.tiempoObjetivo = objetivoDesdeFases(datos.fases || []) || datos.tiempoObjetivo;
    const reg = await guardar<Receta>('cafe_recetas', { ...datos, id: original?.id, creado: original?.creado, referencia: false, demo: false });
    mostrarToast(original ? 'Receta guardada' : 'Receta creada');
    if (!original) ir(`/cafe/recetas/${reg.id}`);
  };

  return (
    <Hoja titulo={original ? 'Editar receta' : 'Nueva receta'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Crear'} onGuardar={guardarReceta}>
      <Lista>
        <Campo et="Nombre" col>
          <Texto valor={f.nombre || ''} cambiar={(v) => set({ nombre: v })} marcador="V60 de diario, AeroPress dulce…" />
        </Campo>
        <Campo et="Método">
          <Selector opciones={METODOS.filter((x) => x.temporizador).map((x) => [x.id, x.nombre] as [MetodoId, string])} valor={m} cambiar={cambiarMetodo} />
        </Campo>
        <Campo et="Autor o inspiración" col>
          <Texto valor={f.autor || ''} cambiar={(v) => set({ autor: v || undefined })} marcador="Opcional" />
        </Campo>
      </Lista>

      <Lista titulo="Cantidades">
        <Campo et="Dosis de café">
          <Ajuste valor={f.dosis} cambiar={(v) => set({ dosis: v })} paso={0.5} min={1} unidad="g" etiqueta="dosis" />
        </Campo>
        {esp ? (
          <Campo et="Salida en taza">
            <Ajuste valor={f.rendimiento} cambiar={(v) => set({ rendimiento: v })} paso={1} min={1} unidad="g" etiqueta="salida" />
          </Campo>
        ) : (
          <Campo et="Agua total">
            <Ajuste valor={f.agua} cambiar={(v) => set({ agua: v })} paso={5} min={1} unidad="g" dec={0} etiqueta="agua" />
          </Campo>
        )}
        <Campo et="Ratio">
          <b class="ratio-valor">{textoRatio(ratio({ metodo: m, dosis: f.dosis || 0, agua: f.agua, rendimiento: f.rendimiento }))}</b>
        </Campo>
        <Campo et="Temperatura">
          <Ajuste valor={f.temperatura} cambiar={(v) => set({ temperatura: v })} paso={1} min={20} max={100} unidad="°C" etiqueta="temperatura" />
        </Campo>
        {esp && (
          <>
            <Campo et="Tiempo mínimo">
              <Ajuste valor={f.tiempoObjetivo?.[0]} cambiar={(v) => set({ tiempoObjetivo: [v ?? 25, f.tiempoObjetivo?.[1] ?? 30] })} paso={1} min={5} max={90} unidad="s" dec={0} etiqueta="tiempo mínimo" />
            </Campo>
            <Campo et="Tiempo máximo">
              <Ajuste valor={f.tiempoObjetivo?.[1]} cambiar={(v) => set({ tiempoObjetivo: [f.tiempoObjetivo?.[0] ?? 25, v ?? 30] })} paso={1} min={5} max={90} unidad="s" dec={0} etiqueta="tiempo máximo" />
            </Campo>
          </>
        )}
      </Lista>

      <Lista titulo="Molienda y filtro" pie="El molino y la posición se usan como punto de partida al preparar la receta.">
        <Campo et="Descripción" col>
          <Texto valor={f.molienda || ''} cambiar={(v) => set({ molienda: v || undefined })} marcador="Media-fina, como sal gruesa…" />
        </Campo>
        <Campo et="Molino">
          <Selector opciones={[['', 'Sin indicar'], ...molinos.map((x) => [x.id, x.nombre] as [string, string])]} valor={f.molinoId || ''} cambiar={(v) => set({ molinoId: v || undefined })} />
        </Campo>
        {f.molinoId && (
          <Campo et={molino?.molino?.escala === 'clics' ? 'Clics' : 'Posición'}>
            <Ajuste valor={f.ajusteMolino} cambiar={(v) => set({ ajusteMolino: v })} paso={molino?.molino?.paso || 1} min={molino?.molino?.min} max={molino?.molino?.max} dec={1} etiqueta="molienda" />
          </Campo>
        )}
        <Campo et={esp ? 'Cesta' : 'Filtro'}>
          <Selector opciones={[['', 'Sin indicar'], ...met.filtros.map((x) => [x, x] as [string, string])]} valor={f.filtro || ''} cambiar={(v) => set({ filtro: v || undefined })} />
        </Campo>
      </Lista>

      {!esp && (
        <>
          <div class="tit-lista">Pasos</div>
          {fases.map((x, i) => (
            <EditorPaso f={x} i={i} total={fases.length} cambiar={(p) => cambiarPaso(i, p)} mover={(d) => moverPaso(i, d)} quitar={() => quitarPaso(i)} />
          ))}
          <div class="lista">
            <button type="button" class="boton-fila" onClick={anadirPaso}>
              <Icono n="anadir" t={22} /> Añadir paso
            </button>
            <button type="button" class="boton-fila" onClick={plantilla}>
              <Icono n="reiniciar" t={22} /> Cargar los pasos básicos de {met.nombre}
            </button>
          </div>
          {(rev.avisos.length > 0 || rev.errores.some((e) => e.includes('peso'))) && (
            <div class="aviso-suave atencion">
              <Icono n="aviso" t={18} />
              <span>{[...rev.errores.filter((e) => e.includes('peso')), ...rev.avisos].join(' ')}</span>
            </div>
          )}
          {fases.length > 0 && <p class="pie">Tiempo total previsto: {segundosATexto(fases.reduce((s, x) => s + (x.duracion || 0), 0))}.</p>}
        </>
      )}

      <Lista titulo="Consejos y notas">
        <Campo et="Consejos" sub="Uno por línea" col>
          <Texto multilinea filas={3} valor={consejos} cambiar={setConsejos} marcador="Si sale agrio, muele más fino…" />
        </Campo>
        <Campo et="Notas" col>
          <Texto multilinea valor={f.notas || ''} cambiar={(v) => set({ notas: v || undefined })} marcador="Para qué cafés funciona, de dónde la sacaste…" />
        </Campo>
      </Lista>
    </Hoja>
  );
}

export const editarReceta = (inicial: Partial<Receta>, original: Receta | null) => abrirHoja((cerrar) => <EditorReceta inicial={inicial} original={original} cerrar={cerrar} />);
