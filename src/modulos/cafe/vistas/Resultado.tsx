// CAFÉ · Resultado: lo que salió (tiempo, gramos, TDS) y cómo estaba. También sirve para editar.
import { useEffect, useState } from 'preact/hooks';
import { guardar, db } from '../../../core/db';
import { segundosATexto } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { mostrarToast } from '../../../ui/capas';
import { Ajuste, Campo, Lista, Numero, Selector, Texto, fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { borrador, actualizarPrep } from '../borrador';
import { diferencias, extraccion, ratio, textoRatio, diagnosticoControl } from '../calculos';
import { BEBIDAS_LECHE, LECHES, SINTOMAS, textoPuntuacion } from '../datos/catalogos';
import { metodo, esEspresso } from '../datos/metodos';
import type { Preparacion, Sintoma } from '../modelo';
import { listarEquipo, listarCafes, listarAguas, nuevoId } from '../repositorio';
import { ControlChart } from './ControlChart';
import { textoMolienda } from './comunes';

/** Campo de tiempo m:ss editable. */
function CampoTiempo({ valor, cambiar }: { valor?: number; cambiar: (s: number | undefined) => void }) {
  const [txt, setTxt] = useState(valor !== undefined ? segundosATexto(valor) : '');
  useEffect(() => {
    setTxt(valor !== undefined ? segundosATexto(valor) : '');
  }, [valor === undefined]);
  return (
    <span class="numero">
      <input
        type="text"
        inputMode="numeric"
        placeholder="m:ss"
        value={txt}
        onInput={(e) => {
          const t = (e.target as HTMLInputElement).value;
          setTxt(t);
          const m = t.match(/^(\d+)(?::(\d{1,2}))?$/);
          if (!m) return cambiar(undefined);
          cambiar(m[2] !== undefined ? Number(m[1]) * 60 + Number(m[2]) : Number(m[1]));
        }}
      />
    </span>
  );
}

export function Puntuacion({ valor, cambiar }: { valor?: number; cambiar: (v: number) => void }) {
  return (
    <div class="puntuacion">
      <div class="pt-cab">
        <b class={`pt-num${valor === undefined ? ' vacia' : ''}`}>{valor !== undefined ? fmt(valor) : '–'}</b>
        <span>{valor !== undefined ? textoPuntuacion(valor) : 'Desliza para puntuar'}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="0.5"
        value={valor ?? 6}
        aria-label="Puntuación de 1 a 10"
        onInput={(e) => cambiar(Number((e.target as HTMLInputElement).value))}
      />
      <div class="pt-escala">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

export function Sintomas({ valor, cambiar }: { valor: Sintoma[]; cambiar: (v: Sintoma[]) => void }) {
  const [ayuda, setAyuda] = useState<Sintoma | null>(null);
  const info = SINTOMAS.find((s) => s.id === ayuda);
  return (
    <>
      <div class="chips">
        {SINTOMAS.map((s) => (
          <button
            type="button"
            class={`chip sintoma ${s.tipo}`}
            aria-pressed={valor.includes(s.id)}
            onClick={() => {
              cambiar(valor.includes(s.id) ? valor.filter((x) => x !== s.id) : [...valor, s.id]);
              setAyuda(s.id);
            }}
          >
            {s.nombre}
          </button>
        ))}
      </div>
      {info && <p class="ayuda">{`${info.nombre}: ${info.ayuda}`}</p>}
    </>
  );
}

export function Resultado() {
  const b = borrador.value;
  const equipo = useVivo(listarEquipo, []) || [];
  const cafes = useVivo(listarCafes, []) || [];
  const aguas = useVivo(listarAguas, []) || [];
  const padre = useVivo(async () => (b?.prep.padreId ? db.cafe_preparaciones.get(b.prep.padreId) : undefined), [b?.prep.padreId]);
  const [verTds, setVerTds] = useState(!!b?.prep.tds);

  useEffect(() => {
    if (!borrador.value) ir('/cafe', true);
  }, []);
  if (!b) return null;
  const p = b.prep;
  const esp = esEspresso(p.metodo);
  const met = metodo(p.metodo);
  const ey = extraccion(p as Preparacion);
  const cambios = padre ? diferencias(p, padre) : [];
  const nombreVar = (clave: string, v: unknown) => {
    if (v === undefined || v === null || v === '') return '—';
    if (clave === 'molinoId' || clave === 'cafeteraId') return equipo.find((e) => e.id === v)?.nombre || '—';
    if (clave === 'aguaId') return aguas.find((a) => a.id === v)?.nombre || '—';
    if (clave === 'cafeId') return cafes.find((c) => c.id === v)?.nombre || '—';
    if (clave === 'metodo') return metodo(v as never).nombre;
    return typeof v === 'number' ? fmt(v) : String(v);
  };

  const guardarPrep = async () => {
    const id = b.editando || nuevoId();
    const datos: Partial<Preparacion> = { ...p, id, fecha: p.fecha || Date.now(), sintomas: p.sintomas || [], demo: false };
    await guardar<Preparacion>('cafe_preparaciones', datos);
    borrador.value = null;
    mostrarToast(b.editando ? 'Preparación actualizada' : 'Preparación guardada');
    ir(`/cafe/p/${id}`, true);
  };

  return (
    <>
      <BarraDetalle titulo={b.editando ? 'Editar' : 'Resultado'} padre={b.editando ? `/cafe/p/${b.editando}` : '/cafe/preparar'} textoAtras={b.editando ? 'Cancelar' : 'Ajustes'} />
      <div class="pagina">
        <section class="resumen-prep">
          <div>
            <b>{met.nombre}</b>
            <span>{p.cafeNombre || 'Café sin registrar'}</span>
          </div>
          <div class="rp-datos">
            {fmt(p.dosis)} g · {textoRatio(ratio(p as Preparacion))} · {textoMolienda(p as Preparacion, equipo) || 'molienda sin anotar'}
            {p.temperatura ? ` · ${p.temperatura} °C` : ''}
          </div>
        </section>

        {cambios.length > 0 && (
          <div class={`aviso-suave${cambios.length > 1 ? ' atencion' : ''}`}>
            <Icono n={cambios.length > 1 ? 'aviso' : 'repetir'} t={18} />
            <span>
              {cambios.length === 1 ? 'Respecto a la anterior has cambiado ' : `Has cambiado ${cambios.length} variables: `}
              {cambios.map((c, i) => (
                <>
                  {i > 0 && ', '}
                  <b>
                    {c.nombre.toLowerCase()} ({nombreVar(c.clave, c.antes)} → {nombreVar(c.clave, c.ahora)})
                  </b>
                </>
              ))}
              {cambios.length > 1 ? '. Con más de un cambio a la vez no sabrás cuál ha tenido efecto.' : '.'}
            </span>
          </div>
        )}

        {b.editando && (
          <Lista titulo="Receta">
            <Campo et="Dosis">
              <Ajuste valor={p.dosis} cambiar={(v) => actualizarPrep({ dosis: v })} paso={0.5} min={1} unidad="g" etiqueta="dosis" />
            </Campo>
            {!esp && (
              <Campo et="Agua">
                <Ajuste valor={p.agua} cambiar={(v) => actualizarPrep({ agua: v })} paso={5} min={1} unidad="g" etiqueta="agua" />
              </Campo>
            )}
            <Campo et="Molienda">
              <Ajuste valor={p.molienda} cambiar={(v) => actualizarPrep({ molienda: v })} paso={1} min={0} etiqueta="molienda" />
            </Campo>
            <Campo et="Temperatura">
              <Ajuste valor={p.temperatura} cambiar={(v) => actualizarPrep({ temperatura: v })} paso={1} min={20} max={100} unidad="°C" etiqueta="temperatura" />
            </Campo>
          </Lista>
        )}

        <Lista titulo="Cómo salió">
          <Campo et="Tiempo total">
            <CampoTiempo valor={p.tiempoTotal} cambiar={(v) => actualizarPrep({ tiempoTotal: v })} />
          </Campo>
          {esp ? (
            <>
              <Campo et="Salida real" sub="Peso del espresso en la taza">
                <Ajuste valor={p.rendimiento} cambiar={(v) => actualizarPrep({ rendimiento: v })} paso={0.5} min={1} unidad="g" etiqueta="salida" />
              </Campo>
              <Campo et="Primera gota" sub="Segundos desde que pulsas">
                <Ajuste valor={p.primeraGota} cambiar={(v) => actualizarPrep({ primeraGota: v })} paso={1} min={0} unidad="s" etiqueta="primera gota" />
              </Campo>
              <Campo et="Presión máxima" sub="La del manómetro, si te fijas">
                <Ajuste valor={p.presion} cambiar={(v) => actualizarPrep({ presion: v })} paso={0.5} min={0} max={20} unidad="bar" etiqueta="presión" />
              </Campo>
            </>
          ) : (
            <Campo et="Bebida pesada" sub="Opcional; si no, se estima">
              <Numero valor={p.rendimiento} cambiar={(v) => actualizarPrep({ rendimiento: v })} unidad="g" />
            </Campo>
          )}
        </Lista>

        <Lista titulo="¿Qué tal?">
          <Campo col>
            <Puntuacion valor={p.puntuacion} cambiar={(v) => actualizarPrep({ puntuacion: v })} />
          </Campo>
          <Campo et="¿Cómo lo notas?" sub="Marca lo que reconozcas; toca una opción para ver qué significa" col>
            <Sintomas valor={p.sintomas || []} cambiar={(v) => actualizarPrep({ sintomas: v })} />
          </Campo>
          <Campo et="Notas" col>
            <Texto multilinea valor={p.notas || ''} cambiar={(v) => actualizarPrep({ notas: v || undefined })} marcador="Sabores, sensaciones, qué cambiarías…" />
          </Campo>
        </Lista>

        {esp && (
          <Lista titulo="Bebida">
            <Campo et="Tipo">
              <Selector opciones={BEBIDAS_LECHE.map((x) => [x, x] as [string, string])} valor={p.bebida?.tipo || 'Solo'} cambiar={(v) => actualizarPrep({ bebida: v === 'Solo' ? undefined : { ...(p.bebida || {}), tipo: v } })} />
            </Campo>
            {p.bebida && (
              <>
                <Campo et="Leche">
                  <Selector opciones={LECHES.map((x) => [x, x] as [string, string])} valor={p.bebida.leche || 'Entera'} cambiar={(v) => actualizarPrep({ bebida: { ...p.bebida!, leche: v } })} />
                </Campo>
                <Campo et="Cantidad de leche">
                  <Ajuste valor={p.bebida.ml} cambiar={(v) => actualizarPrep({ bebida: { ...p.bebida!, ml: v } })} paso={10} min={0} unidad="ml" etiqueta="leche" />
                </Campo>
              </>
            )}
          </Lista>
        )}

        <div class="tit-lista">Refractómetro</div>
        <div class="lista">
          {!verTds ? (
            <button type="button" class="boton-fila" onClick={() => setVerTds(true)}>
              <Icono n="gota" t={22} /> Añadir TDS medido
            </button>
          ) : (
            <>
              <Campo et="TDS" sub="% de sólidos disueltos">
                <Numero valor={p.tds} cambiar={(v) => actualizarPrep({ tds: v })} unidad="%" dec={2} />
              </Campo>
              {ey !== undefined && p.tds && (
                <Campo col>
                  <div class="ayuda">
                    Extracción: <b>{fmt(ey, 1)} %</b> · {(() => {
                      const d = diagnosticoControl(p.tds!, ey, esp ? 'espresso' : 'filtro');
                      return `${d.fuerza === 'ideal' ? 'concentración ideal' : d.fuerza}, ${d.ext === 'ideal' ? 'extracción ideal' : d.ext}`;
                    })()}
                  </div>
                  <ControlChart tipo={esp ? 'espresso' : 'filtro'} puntos={[{ tds: p.tds, ey, actual: true }]} />
                </Campo>
              )}
            </>
          )}
        </div>
        <p class="pie">No hace falta para usar la app. Si algún día tienes refractómetro, la extracción y el control chart se calculan solos.</p>

        <div class="acciones-fijas">
          <button type="button" class="boton-principal" onClick={guardarPrep}>
            <Icono n="check" t={22} /> {b.editando ? 'Guardar cambios' : 'Guardar preparación'}
          </button>
        </div>
      </div>
    </>
  );
}
