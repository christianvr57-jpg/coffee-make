// GYM · Entreno: cada ejercicio con sus series (kg y repeticiones, o lo que toque), lo que hiciste la
// última vez al lado, la sugerencia de progresión y el descanso automático al marcar una serie.
// Al terminar, el resumen con duración, volumen y récords.
import { useEffect, useRef, useState } from 'preact/hooks';
import { fechaCorta, minutosATexto, parse } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja, confirmar, elegir, mostrarToast } from '../../../ui/capas';
import { Campo, Lista, Numero, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { anterior, duracionMin, efectivas, recordsDeSesion, seriesHechas, sugerencia, textoSerie, volumenSesion } from '../calculos';
import { borrarSesion, ejercicio, guardarRutina, guardarSesion, leerSesion, listarSesiones, nombreEjercicio, nuevoEjercicioSesion, seriesIniciales } from '../estado';
import { nombreEquipo, nombreGrupo, type EjercicioSesion, type SerieGym, type SesionGym, type TipoSerie } from '../tipos';
import { BarraDescanso, descanso, elegirEjercicio, empezarDescanso } from './comunes';

const kg = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kg`;
const SIGUIENTE_TIPO: Record<TipoSerie, TipoSerie> = { normal: 'calentamiento', calentamiento: 'fallo', fallo: 'drop', drop: 'normal' };
const LETRA: Record<TipoSerie, string> = { normal: '', calentamiento: 'C', fallo: 'F', drop: 'D' };

function FilaSerie({ s, i, numero, previa, tipo, cambiar, quitar }: { s: SerieGym; i: number; numero: number; previa?: SerieGym; tipo: string; cambiar: (p: Partial<SerieGym>) => void; quitar: () => void }) {
  const t = s.tipo || 'normal';
  const marcar = () => {
    if (s.hecha) return cambiar({ hecha: false });
    // Si no has escrito nada, se da por buena la de la última vez.
    const relleno: Partial<SerieGym> = {};
    if (previa) {
      if (s.peso === undefined && previa.peso !== undefined) relleno.peso = previa.peso;
      if (s.reps === undefined && previa.reps !== undefined) relleno.reps = previa.reps;
      if (s.segundos === undefined && previa.segundos !== undefined) relleno.segundos = previa.segundos;
      if (s.minutos === undefined && previa.minutos !== undefined) relleno.minutos = previa.minutos;
      if (s.km === undefined && previa.km !== undefined) relleno.km = previa.km;
    }
    cambiar({ ...relleno, hecha: true });
    if (tipo !== 'cardio') empezarDescanso();
  };
  return (
    <div class={`gs-fila${s.hecha ? ' hecha' : ''} tipo-${t}`}>
      <button type="button" class="gs-num" title="Tipo de serie: normal, calentamiento, al fallo o drop set" onClick={() => cambiar({ tipo: SIGUIENTE_TIPO[t] })} onDblClick={quitar}>
        {LETRA[t] || numero}
      </button>
      <span class="gs-prev">{previa ? textoSerie(tipo as never, previa) : '—'}</span>
      {tipo === 'peso' && (
        <>
          <Numero valor={s.peso} cambiar={(v) => cambiar({ peso: v })} dec={2} marcador={previa?.peso !== undefined ? String(previa.peso).replace('.', ',') : 'kg'} />
          <Numero valor={s.reps} cambiar={(v) => cambiar({ reps: v === undefined ? undefined : Math.round(v) })} dec={0} marcador={previa?.reps !== undefined ? String(previa.reps) : 'reps'} />
        </>
      )}
      {tipo === 'reps' && (
        <>
          <Numero valor={s.peso} cambiar={(v) => cambiar({ peso: v })} dec={2} marcador={previa?.peso ? String(previa.peso) : '+kg'} />
          <Numero valor={s.reps} cambiar={(v) => cambiar({ reps: v === undefined ? undefined : Math.round(v) })} dec={0} marcador={previa?.reps !== undefined ? String(previa.reps) : 'reps'} />
        </>
      )}
      {tipo === 'tiempo' && (
        <>
          <Numero valor={s.peso} cambiar={(v) => cambiar({ peso: v })} dec={2} marcador={previa?.peso ? String(previa.peso) : '+kg'} />
          <Numero valor={s.segundos} cambiar={(v) => cambiar({ segundos: v === undefined ? undefined : Math.round(v) })} dec={0} marcador={previa?.segundos !== undefined ? String(previa.segundos) : 's'} />
        </>
      )}
      {tipo === 'cardio' && (
        <>
          <Numero valor={s.minutos} cambiar={(v) => cambiar({ minutos: v })} dec={1} marcador={previa?.minutos !== undefined ? String(previa.minutos) : 'min'} />
          <Numero valor={s.km} cambiar={(v) => cambiar({ km: v })} dec={2} marcador={previa?.km !== undefined ? String(previa.km).replace('.', ',') : 'km'} />
        </>
      )}
      <button type="button" class={`gs-check${s.hecha ? ' marcado' : ''}`} aria-label={s.hecha ? `Desmarcar serie ${i + 1}` : `Marcar serie ${i + 1} como hecha`} onClick={marcar}>
        <Icono n="check" t={18} />
      </button>
    </div>
  );
}

const CABECERAS: Record<string, [string, string]> = { peso: ['kg', 'Reps'], reps: ['+kg', 'Reps'], tiempo: ['+kg', 'Seg'], cardio: ['Min', 'Km'] };

function TarjetaEjercicio({ e, idx, total, sesion, previas, cambiar, mover, quitar }: { e: EjercicioSesion; idx: number; total: number; sesion: SesionGym; previas: SesionGym[]; cambiar: (x: EjercicioSesion) => void; mover: (d: number) => void; quitar: () => void }) {
  const def = ejercicio(e.ejercicioId);
  const tipo = def?.tipo || 'peso';
  const prev = anterior(previas, e.ejercicioId, sesion.inicio);
  const prevEf = prev.filter((s) => s.tipo !== 'calentamiento');
  const consejo = def ? sugerencia(prev, e.objetivo, def) : null;
  let n = 0;
  const numeros = e.series.map((s) => (s.tipo === 'calentamiento' ? 0 : ++n));
  const setSerie = (i: number, p: Partial<SerieGym>) => cambiar({ ...e, series: e.series.map((s, j) => (j === i ? { ...s, ...p } : s)) });
  const anadirSerie = () => {
    const ultima = e.series[e.series.length - 1];
    cambiar({ ...e, series: [...e.series, { peso: ultima?.peso, reps: ultima?.reps, segundos: ultima?.segundos, minutos: ultima?.minutos, km: ultima?.km, hecha: false }] });
  };
  const menu = async () => {
    const ops = ['Añadir una nota', 'Mover arriba', 'Mover abajo', 'Quitar la última serie', 'Quitar el ejercicio'];
    const r = await elegir(def?.nombre || 'Ejercicio', ops);
    if (r === 0) abrirHoja((cerrar) => <HojaNota inicial={e.nota || ''} cerrar={cerrar} guardar={(nota) => cambiar({ ...e, nota: nota || undefined })} />);
    if (r === 1 && idx > 0) mover(-1);
    if (r === 2 && idx < total - 1) mover(1);
    if (r === 3 && e.series.length > 1) cambiar({ ...e, series: e.series.slice(0, -1) });
    if (r === 4 && (await confirmar({ titulo: '¿Quitar el ejercicio?', texto: 'Se quitan también sus series de este entreno.', ok: 'Quitar', peligro: true }))) quitar();
  };
  const [cab1, cab2] = CABECERAS[tipo];
  const hechas = efectivas(e.series).length;
  return (
    <section class="gym-ej">
      <header class="ge-cab">
        <a class="ge-nombre" href={`#/gym/ejercicios/${e.ejercicioId}`}>
          <b>{nombreEjercicio(e.ejercicioId)}</b>
          <small>
            {def ? `${nombreGrupo(def.grupo)} · ${nombreEquipo(def.equipo)}` : ''}
            {e.objetivo ? ` · objetivo ${e.objetivo}` : ''}
            {` · ${hechas}/${numeros.filter(Boolean).length} series`}
          </small>
        </a>
        <button type="button" class="btn-icono" aria-label="Opciones del ejercicio" onClick={menu}>
          <Icono n="mas" t={20} />
        </button>
      </header>
      {e.nota && <p class="ge-nota">{e.nota}</p>}
      {consejo && <p class="ge-sugerencia">{consejo}</p>}
      <div class="gs-tabla">
        <div class="gs-fila gs-cab">
          <span>Serie</span>
          <span>Anterior</span>
          <span>{cab1}</span>
          <span>{cab2}</span>
          <span />
        </div>
        {e.series.map((s, i) => (
          <FilaSerie
            s={s}
            i={i}
            numero={numeros[i]}
            previa={prevEf[numeros[i] - 1] || (s.tipo === 'calentamiento' ? prev.find((p) => p.tipo === 'calentamiento') : undefined)}
            tipo={tipo}
            cambiar={(p) => setSerie(i, p)}
            quitar={() => e.series.length > 1 && cambiar({ ...e, series: e.series.filter((_, j) => j !== i) })}
          />
        ))}
      </div>
      <button type="button" class="ge-anadir" onClick={anadirSerie}>
        <Icono n="anadir" t={18} /> Añadir serie
      </button>
    </section>
  );
}

function HojaNota({ inicial, cerrar, guardar }: { inicial: string; cerrar: () => void; guardar: (t: string) => void }) {
  const [t, setT] = useState(inicial);
  return (
    <Hoja titulo="Nota" cerrar={cerrar} guardar="Guardar" onGuardar={() => guardar(t.trim())}>
      <Lista>
        <Campo col>
          <Texto multilinea filas={4} valor={t} cambiar={setT} marcador="Asiento en el 4, molestia en el hombro, agarre…" />
        </Campo>
      </Lista>
    </Hoja>
  );
}

function Resumen({ s, previas }: { s: SesionGym; previas: SesionGym[] }) {
  const records = recordsDeSesion(s, previas, ejercicio);
  return (
    <div class="gym-resumen">
      <div class="gr-cab">
        <Icono n="check" t={22} />
        <div>
          <b>Entreno terminado</b>
          <small>
            {fechaCorta(parse(s.fecha))} · {minutosATexto(duracionMin(s))}
          </small>
        </div>
      </div>
      <dl class="rejilla-datos">
        <div>
          <dt>Ejercicios</dt>
          <dd>{s.ejercicios.filter((e) => efectivas(e.series).length).length}</dd>
        </div>
        <div>
          <dt>Series</dt>
          <dd>{seriesHechas(s)}</dd>
        </div>
        <div>
          <dt>Volumen</dt>
          <dd>{kg(volumenSesion(s))}</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>{minutosATexto(duracionMin(s))}</dd>
        </div>
      </dl>
      {records.length > 0 && (
        <div class="gr-records">
          <span class="run-sobre">🏆 Récords de hoy</span>
          {records.map((r) => (
            <p>
              <b>{nombreEjercicio(r.ejercicioId)}</b>: {textoSerie(ejercicio(r.ejercicioId)?.tipo || 'peso', r.serie)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function SesionGymVista({ params }: { params: Record<string, string> }) {
  const [s, setS] = useState<SesionGym | null>(null);
  const previas = useVivo(listarSesiones, []) || [];
  const pendiente = useRef<SesionGym | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    leerSesion(params.id).then((x) => setS(x && !x.borrado ? x : null));
  }, [params.id]);
  // Reloj de la duración (cada 30 s) mientras está en curso.
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  // Guarda al salir lo que quede pendiente.
  useEffect(
    () => () => {
      clearTimeout(temporizador.current);
      if (pendiente.current) guardarSesion(pendiente.current);
    },
    [],
  );

  if (!s) {
    return (
      <>
        <BarraDetalle padre="/gym" textoAtras="Gym" />
        <div class="vacio">Cargando el entreno… Si no aparece, puede que se haya borrado.</div>
      </>
    );
  }

  const cambiar = (nuevo: SesionGym) => {
    setS(nuevo);
    pendiente.current = nuevo;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      if (pendiente.current) guardarSesion(pendiente.current);
      pendiente.current = null;
    }, 700);
  };
  const setEj = (i: number, e: EjercicioSesion) => cambiar({ ...s, ejercicios: s.ejercicios.map((x, j) => (j === i ? e : x)) });
  const mover = (i: number, d: number) => {
    const xs = [...s.ejercicios];
    const [x] = xs.splice(i, 1);
    xs.splice(i + d, 0, x);
    cambiar({ ...s, ejercicios: xs });
  };
  const anadir = () =>
    elegirEjercicio((ids) => {
      const nuevos = ids.map((id) => nuevoEjercicioSesion(id, seriesIniciales(anterior(previas, id, s.inicio), 3)));
      cambiar({ ...s, ejercicios: [...s.ejercicios, ...nuevos] });
    });
  const terminar = async () => {
    const sin = s.ejercicios.reduce((t, e) => t + e.series.filter((x) => !x.hecha).length, 0);
    if (!(await confirmar({ titulo: '¿Terminar el entreno?', texto: sin ? `Hay ${sin} series sin marcar: no cuentan.` : 'Se guarda con la hora de ahora.', ok: 'Terminar' }))) return;
    const fin = { ...s, fin: Date.now() };
    clearTimeout(temporizador.current);
    pendiente.current = null;
    setS(await guardarSesion(fin));
    descanso.value = null;
    window.scrollTo({ top: 0 });
  };
  const guardarComoRutina = async () => {
    const r = await guardarRutina({
      nombre: s.nombre,
      ejercicios: s.ejercicios.map((e) => ({ ejercicioId: e.ejercicioId, series: Math.max(1, efectivas(e.series).length || e.series.length), reps: e.objetivo || '8-12' })),
    });
    mostrarToast(`Rutina «${r.nombre}» guardada`);
  };
  const borrar = async () => {
    if (!(await confirmar({ titulo: '¿Borrar este entreno?', texto: 'Se borra con todas sus series.', ok: 'Borrar', peligro: true }))) return;
    clearTimeout(temporizador.current);
    pendiente.current = null;
    await borrarSesion(s.id);
    descanso.value = null;
    ir('/gym', true);
  };

  return (
    <>
      <BarraDetalle
        padre="/gym"
        textoAtras="Gym"
        titulo={s.fin ? 'Entreno' : `En curso · ${minutosATexto(duracionMin(s, ahora))}`}
        derecha={
          !s.fin ? (
            <button type="button" class="bd-accion" onClick={terminar}>
              Terminar
            </button>
          ) : undefined
        }
      />
      <div class="pagina gym-sesion">
        {s.fin && <Resumen s={s} previas={previas} />}
        <div class="gym-nombre">
          <input type="text" value={s.nombre} aria-label="Nombre del entreno" onInput={(e) => cambiar({ ...s, nombre: (e.target as HTMLInputElement).value })} />
          <input type="date" class="fecha" value={s.fecha} aria-label="Fecha" onInput={(e) => cambiar({ ...s, fecha: (e.target as HTMLInputElement).value })} />
        </div>

        {s.ejercicios.map((e, i) => (
          <TarjetaEjercicio
            e={e}
            idx={i}
            total={s.ejercicios.length}
            sesion={s}
            previas={previas}
            cambiar={(x) => setEj(i, x)}
            mover={(d) => mover(i, d)}
            quitar={() => cambiar({ ...s, ejercicios: s.ejercicios.filter((_, j) => j !== i) })}
          />
        ))}
        {!s.ejercicios.length && (
          <div class="vacio">
            <Icono n="pesa" t={44} />
            <p>Añade el primer ejercicio.</p>
          </div>
        )}

        <div class="acciones-fijas">
          <button type="button" class="boton-secundario grande" onClick={anadir}>
            <Icono n="anadir" t={22} /> Añadir ejercicios
          </button>
          {!s.fin && (
            <button type="button" class="boton-principal grande" onClick={terminar}>
              <Icono n="check" t={22} /> Terminar entreno
            </button>
          )}
        </div>

        <Lista titulo="Notas del entreno">
          <Campo col>
            <Texto multilinea filas={3} valor={s.notas || ''} cambiar={(v) => cambiar({ ...s, notas: v || undefined })} marcador="Cómo te has encontrado, molestias, energía…" />
          </Campo>
        </Lista>
        <div class="lista separada">
          <button type="button" class="boton-fila" onClick={guardarComoRutina}>
            <Icono n="copiar" t={22} /> Guardar como rutina
          </button>
          <button type="button" class="boton-fila peligro" onClick={borrar}>
            <Icono n="papelera" t={22} /> Borrar entreno
          </button>
        </div>
        <p class="pie">Toca el número de una serie para marcarla como calentamiento (C), al fallo (F) o drop set (D); las de calentamiento no cuentan. Al marcar una serie empieza el descanso.</p>
      </div>
      {!s.fin && <BarraDescanso />}
      {s.fin && descanso.value && <BarraDescanso />}
    </>
  );
}
