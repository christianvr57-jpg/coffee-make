// RUNNING · Registro: lo que entrenaste y cómo estás (esfuerzo, sueño, molestias), carga de las
// últimas 4 semanas y un resumen para pegarle al entrenador.
import { useState } from 'preact/hooks';
import { addDays, DIAS, fechaCorta, fechaLarga, hoyISO, iso, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { db } from '../../../core/db';
import { escritorio } from '../../../core/pantalla';
import { useVivo } from '../../../core/vivo';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../../../ui/capas';
import { Campo, Lista, Numero, Selector, Texto, fmt } from '../../../ui/form';
import { Barras } from '../../../ui/Graficos';
import { Icono } from '../../../ui/Icono';
import { cargaSesion, formatoRitmo, resumenCarga, ritmoMedio } from '../calculos';
import { datos, eliminarRegistro, guardarRegistro, listarRegistros, plan } from '../estado';
import { cumplimiento, evolucion, nivelChequeo } from '../seguimiento';
import { MOLESTIAS, TIPOS, esCarrera, nombreTipo, type RegistroRun, type SesionPlan, type TipoSesion } from '../tipos';
import { copiarTexto, kmTxt } from './comunes';

const fechaTxt = (s: string) => {
  const d = parse(s);
  return `${DIAS[d.getDay() || 7].toLowerCase()} ${fechaCorta(d)}`;
};

const escala = (min: number, max: number): [string, string][] => [['', '—'], ...Array.from({ length: max - min + 1 }, (_, i) => [String(min + i), String(min + i)] as [string, string])];

function EditorRegistro({ inicial, cerrar }: { inicial: Partial<RegistroRun>; cerrar: () => void }) {
  const [r, setR] = useState<Partial<RegistroRun>>(inicial);
  const set = (p: Partial<RegistroRun>) => setR((x) => ({ ...x, ...p }));
  const num = (v: string) => (v === '' ? undefined : Number(v));
  const existe = !!inicial.id;
  return (
    <Hoja
      titulo={existe ? 'Editar sesión' : 'Registrar sesión'}
      cerrar={cerrar}
      guardar="Guardar"
      onGuardar={async () => {
        if (!r.fecha) return false;
        await guardarRegistro(r);
        mostrarToast(existe ? 'Registro actualizado' : 'Sesión registrada');
      }}
    >
      <Lista>
        <Campo et="Fecha">
          <input type="date" class="fecha" value={r.fecha || ''} onInput={(e) => set({ fecha: (e.target as HTMLInputElement).value })} />
        </Campo>
        <Campo et="Tipo">
          <Selector<TipoSesion> opciones={TIPOS} valor={(TIPOS.some(([k]) => k === r.tipo) ? r.tipo : 'otro') as TipoSesion} cambiar={(v) => set({ tipo: v })} />
        </Campo>
        <Campo et="Título o sesión" col>
          <Texto valor={r.titulo || ''} cambiar={(v) => set({ titulo: v })} marcador="p. ej. 4 × 6 min umbral" />
        </Campo>
      </Lista>
      <Lista titulo="Datos">
        <Campo et="Duración">
          <Numero valor={r.minutos} cambiar={(v) => set({ minutos: v })} unidad="min" dec={0} />
        </Campo>
        <Campo et="Distancia">
          <Numero valor={r.km} cambiar={(v) => set({ km: v })} unidad="km" dec={2} />
        </Campo>
        <Campo et="FC media">
          <Numero valor={r.fc} cambiar={(v) => set({ fc: v })} unidad="ppm" dec={0} />
        </Campo>
        <Campo et="Esfuerzo (RPE 0-10)" sub="0 reposo · 3-4 fácil · 7 duro · 10 máximo">
          <Selector opciones={escala(0, 10)} valor={r.rpe === undefined ? '' : String(r.rpe)} cambiar={(v) => set({ rpe: num(v) })} />
        </Campo>
      </Lista>
      <Lista titulo="Recuperación">
        <Campo et="Sueño anoche">
          <Numero valor={r.sueno} cambiar={(v) => set({ sueno: v })} unidad="h" dec={1} />
        </Campo>
        <Campo et="Calidad del sueño (1-5)">
          <Selector opciones={escala(1, 5)} valor={r.calidad === undefined ? '' : String(r.calidad)} cambiar={(v) => set({ calidad: num(v) })} />
        </Campo>
        {MOLESTIAS.map(([k, n]) => (
          <Campo et={`${n} (0-10)`}>
            <Selector opciones={escala(0, 10)} valor={r[k] === undefined ? '' : String(r[k])} cambiar={(v) => set({ [k]: num(v) })} />
          </Campo>
        ))}
      </Lista>
      <Lista titulo="Notas">
        <Campo col>
          <Texto multilinea filas={4} valor={r.notas || ''} cambiar={(v) => set({ notas: v || undefined })} marcador="Sensaciones, calor, viento, qué salió bien o mal" />
        </Campo>
      </Lista>
      {existe && (
        <div class="lista separada">
          <button
            type="button"
            class="boton-fila peligro"
            onClick={async () => {
              if (!(await confirmar({ titulo: '¿Eliminar este registro?', ok: 'Eliminar', peligro: true }))) return;
              await eliminarRegistro(inicial as RegistroRun);
              mostrarToast('Registro eliminado');
              cerrar();
            }}
          >
            <Icono n="papelera" t={22} /> Eliminar registro
          </button>
        </div>
      )}
    </Hoja>
  );
}

/** Abre el registro de una sesión del plan (o uno nuevo, o uno existente). */
export async function abrirRegistro(o: { registro?: RegistroRun; fecha?: string; sesion?: SesionPlan }) {
  let inicial: Partial<RegistroRun> | undefined = o.registro;
  if (!inicial && o.sesion) {
    const vinculado = datos.value.hechas[o.sesion.id];
    if (typeof vinculado === 'string') inicial = (await db.running_registros.get(vinculado)) || undefined;
    if (!inicial) {
      const s = o.sesion;
      // Si la registras antes de su día (la adelantaste), se apunta con la fecha de hoy.
      inicial = { fecha: o.fecha && o.fecha <= hoyISO() ? o.fecha : hoyISO(), tipo: s.tipo === 'fuerza' ? 'gimnasio' : s.tipo === 'descanso' || s.tipo === 'movilidad' ? 'otro' : s.tipo, titulo: s.titulo, minutos: s.duracion, km: s.km, sesionId: s.id };
    }
  }
  const valor = inicial || { fecha: o.fecha || hoyISO(), tipo: 'rodaje' as TipoSesion };
  abrirHoja((cerrar) => <EditorRegistro inicial={valor} cerrar={cerrar} />);
}

function textoResumen(regs: RegistroRun[], hoy: Date): string {
  const r = resumenCarga(regs, hoy);
  const desde = iso(addDays(hoy, -13));
  const recientes = regs.filter((x) => x.fecha >= desde).reverse();
  const lineas = [`RESUMEN RUNNING · ${fechaLarga(hoy)}`, '', `Km por semana (últimas 4): ${r.semanas.map((s) => kmTxt(s.km)).join(' · ')}`];
  lineas.push(`Carga 7 d: ${Math.round(r.aguda)} · media semanal 28 d: ${Math.round(r.cronica)}${r.ratio != null ? ` · A:C ${r.ratio.toFixed(2)}` : ''}`);
  lineas.push('', 'Sesiones de los últimos 14 días:');
  if (!recientes.length) lineas.push('(ninguna registrada)');
  for (const x of recientes) {
    const rit = ritmoMedio(x);
    const partes = [
      fechaTxt(x.fecha), x.titulo || nombreTipo(x.tipo), x.minutos ? `${x.minutos} min` : '', x.km ? `${x.km} km` : '', rit && esCarrera(x.tipo) ? `${formatoRitmo(rit)}/km` : '',
      x.fc ? `FC ${x.fc}` : '', x.rpe != null ? `RPE ${x.rpe}` : '', x.sueno ? `sueño ${x.sueno} h${x.calidad ? ` (${x.calidad}/5)` : ''}` : '',
    ];
    const dolor = MOLESTIAS.filter(([k]) => x[k] != null).map(([k, n]) => `${n} ${x[k]}/10`).join(', ');
    lineas.push(`- ${partes.filter(Boolean).join(' · ')}${dolor ? ` · molestias: ${dolor}` : ''}${cargaSesion(x) ? ` · carga ${cargaSesion(x)}` : ''}`);
    if (x.notas) lineas.push(`  ${x.notas}`);
  }
  const cumple = cumplimiento(plan.value?.plan?.semanas || [], regs, datos.value.hechas, hoy).slice(-2);
  if (cumple.length) {
    lineas.push('', 'Plan frente a lo hecho:');
    for (const c of cumple) lineas.push(`- Semana del ${fechaTxt(c.lunes)}: ${c.hechas}/${c.planificadas} sesiones · ${c.minHechos}/${c.minPlan} min · ${kmTxt(c.kmHechos)}/${kmTxt(c.kmPlan)} km`);
  }
  const semaforos = Object.entries(datos.value.chequeos || {})
    .filter(([f]) => f >= desde)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  if (semaforos.length) {
    lineas.push('', 'Semáforo antes de entrenar:');
    for (const [f, c] of semaforos) lineas.push(`- ${fechaTxt(f)}: ${nivelChequeo(c)} · molestia ${c.molestia}/10${c.peor ? ' · peor al levantarse' : ''}${c.alarma ? ' · SEÑAL DE ALARMA' : ''}`);
  }
  return lineas.join('\n');
}

/** Plan frente a lo hecho, semana a semana, y evolución de molestias y sueño. */
function Seguimiento({ regs, hoy }: { regs: RegistroRun[]; hoy: Date }) {
  const cumple = cumplimiento(plan.value?.plan?.semanas || [], regs, datos.value.hechas, hoy);
  const evo = evolucion(regs, datos.value.chequeos || {}, hoy);
  const hayEvo = evo.some((e) => e.molestia != null || e.sueno != null);
  return (
    <>
      {cumple.length > 0 && (
        <>
          <div class="tit-lista">Plan frente a lo hecho</div>
          <div class="lista cumplimiento">
            {cumple.map((c) => {
              const pct = c.planificadas ? c.hechas / c.planificadas : 0;
              return (
                <div class="cu-fila">
                  <div class="cu-sem">
                    <b>{fechaTxt(c.lunes)}</b>
                    <small>{c.fase}</small>
                  </div>
                  <div class="cu-datos">
                    <span class={pct >= 0.8 ? 'bien' : pct >= 0.5 ? 'medio' : 'mal'}>
                      {c.hechas}/{c.planificadas} sesiones
                    </span>
                    <span>
                      {c.minHechos}/{c.minPlan} min
                    </span>
                    <span>
                      {kmTxt(c.kmHechos)}/{kmTxt(c.kmPlan)} km
                    </span>
                  </div>
                  <span class="cu-barra">
                    <span style={{ width: `${Math.min(100, pct * 100)}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
          <p class="pie">Sesiones marcadas como hechas en el plan; minutos y km, de lo que has registrado.</p>
        </>
      )}
      {hayEvo && (
        <>
          <div class="tit-lista">Evolución · últimas 8 semanas</div>
          <div class="lista bloque-grafico">
            <Barras titulo="Molestia máxima por semana (0-10)" datos={evo.map((e, i) => ({ etiqueta: i === evo.length - 1 ? 'últ. 7 d' : fechaCorta(parse(e.desde)), valor: e.molestia ?? 0 }))} cadaEtiqueta={2} />
            <p class="ayuda">Molestia máxima de cada semana (registros y semáforo). Lo que buscamos: que baje o se quede en 0-2.</p>
            <Barras titulo="Sueño medio por semana (h)" datos={evo.map((e, i) => ({ etiqueta: i === evo.length - 1 ? 'últ. 7 d' : fechaCorta(parse(e.desde)), valor: e.sueno ?? 0 }))} cadaEtiqueta={2} />
            <p class="ayuda">Horas de sueño de media en las noches que registraste. Menos de 7 h seguidas pesan en la recuperación.</p>
          </div>
        </>
      )}
    </>
  );
}

export function RegistroRunning() {
  const regs = useVivo(listarRegistros, []);
  if (!regs) return null;
  const hoy = parse(diaActual.value);
  const r = resumenCarga(regs, hoy);
  const ult7 = regs.filter((x) => x.fecha >= iso(addDays(hoy, -6)));
  const molestias = MOLESTIAS.map(([k, n]) => {
    const vals = ult7.filter((x) => typeof x[k] === 'number').map((x) => x[k] as number);
    return [n, vals.length ? Math.max(...vals) : null] as const;
  });

  const copiar = async () => {
    const t = textoResumen(regs, hoy);
    if (await copiarTexto(t)) mostrarToast('Resumen copiado: pégalo en el chat con el entrenador');
    else await avisar('No se pudo copiar', t);
  };

  const resumen = (
    <>
      <div class="tit-lista">Km de carrera · últimas 4 semanas</div>
      <div class="lista bloque-grafico">
        <Barras titulo="Km por semana" datos={r.semanas.map((s, i) => ({ etiqueta: i === 3 ? 'últ. 7 d' : fechaCorta(parse(s.desde)), valor: Math.round(s.km * 10) / 10 }))} />
      </div>

      <dl class="rejilla-datos">
        <div>
          <dt>Carga 7 días</dt>
          <dd>
            {Math.round(r.aguda)} <small>min × RPE</small>
          </dd>
        </div>
        <div>
          <dt>Media 28 días</dt>
          <dd>
            {Math.round(r.cronica)} <small>por semana</small>
          </dd>
        </div>
        <div>
          <dt>Aguda : crónica</dt>
          <dd>{r.ratio == null ? <small>Necesita 4 semanas de registros (llevas {r.historialDias} días)</small> : fmt(r.ratio, 2)}</dd>
        </div>
        <div>
          <dt>Monotonía</dt>
          <dd>{r.monotonia == null ? <small>Sin datos</small> : fmt(r.monotonia, 1)}</dd>
        </div>
      </dl>
      {r.ratio != null && (
        <p class="pie">{r.ratio > 1.5 ? 'Subida brusca de carga respecto a tu media: vigila molestias y sueño.' : r.ratio < 0.8 ? 'Carga por debajo de lo habitual.' : 'Carga estable respecto a tu media.'}</p>
      )}

      <div class="tit-lista">Molestias · máximo de los últimos 7 días</div>
      <div class="lista">
        {molestias.map(([n, v]) => (
          <Campo et={n}>
            <span class={`run-dolor ${v == null ? '' : v <= 2 ? 'verde' : v <= 5 ? 'ambar' : 'rojo'}`}>{v == null ? '—' : `${v}/10`}</span>
          </Campo>
        ))}
      </div>
      <p class="pie">Ninguna métrica predice lesiones por sí sola. La relación aguda:crónica y la monotonía solo indican cambios bruscos o semanas sin contraste; se leen junto con las molestias, el sueño y las sensaciones.</p>
    </>
  );
  const botonResumen = (
    <>
      <div class="lista separada">
        <button type="button" class="boton-fila" onClick={copiar}>
          <Icono n="subir" t={22} /> Copiar resumen para el entrenador
        </button>
      </div>
      <p class="pie">Pégalo en el chat con Claude cuando quieras la revisión semanal.</p>
    </>
  );

  if (escritorio.value) {
    return (
      <>
        <div class="sub-cabecera">
          <div class="sub">Tras cada entreno: esfuerzo, sueño y molestias. Ritmos y FC puedes copiarlos de tu reloj.</div>
          <button type="button" class="boton-principal auto" onClick={() => abrirRegistro({})}>
            <Icono n="anadir" t={20} /> Registrar sesión
          </button>
        </div>
        <div class="columnas izq">
          <div>
            {resumen}
            {botonResumen}
          </div>
          <div>
            <div class="tit-lista">Sesiones registradas ({regs.length})</div>
            {regs.length ? <TablaRegistros regs={regs} /> : <div class="vacio">Aún no hay sesiones registradas. Pulsa «Registrar sesión» después de entrenar.</div>}
            <Seguimiento regs={regs} hoy={hoy} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div class="sub-cabecera">
        <div class="sub">Tras cada entreno: esfuerzo, sueño y molestias. Ritmos y FC puedes copiarlos de tu reloj.</div>
        <button type="button" class="btn-mas" aria-label="Registrar sesión" onClick={() => abrirRegistro({})}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      {resumen}
      <Seguimiento regs={regs} hoy={hoy} />

      <div class="tit-lista">Sesiones</div>
      {regs.length ? (
        <div class="lista">
          {regs.map((x) => {
            const rit = ritmoMedio(x);
            const meta = [fechaTxt(x.fecha), x.minutos ? `${x.minutos} min` : '', x.km ? `${kmTxt(x.km)} km` : '', rit && esCarrera(x.tipo) ? `${formatoRitmo(rit)}/km` : '', x.fc ? `${x.fc} ppm` : '', x.rpe != null ? `RPE ${x.rpe}` : '']
              .filter(Boolean)
              .join(' · ');
            return (
              <button type="button" class="item" onClick={() => abrirRegistro({ registro: x })}>
                <span class="insignia" style={{ '--tam': '36px' }}>
                  <Icono n={esCarrera(x.tipo) ? 'running' : 'pulso'} t={20} />
                </span>
                <div class="item-txt">
                  <div class="item-tit">{x.titulo || nombreTipo(x.tipo)}</div>
                  <div class="item-meta">{meta}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            );
          })}
        </div>
      ) : (
        <div class="vacio">
          <Icono n="running" t={40} />
          <p>Aún no has registrado sesiones. Pulsa + después de entrenar: lo importante es el RPE, el sueño y las molestias.</p>
        </div>
      )}
      {botonResumen}
    </>
  );
}

/** Ordenador: todas las sesiones en una tabla (pulsa una fila para editarla). */
function TablaRegistros({ regs }: { regs: RegistroRun[] }) {
  const dolorMax = (x: RegistroRun) => {
    const vals = MOLESTIAS.filter(([k]) => typeof x[k] === 'number').map(([k, n]) => [n, x[k] as number] as const);
    if (!vals.length) return null;
    return vals.reduce((a, b) => (b[1] > a[1] ? b : a));
  };
  return (
    <div class="tabla-marco">
      <table class="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Sesión</th>
            <th class="num">Min</th>
            <th class="num">Km</th>
            <th class="num">Ritmo</th>
            <th class="num">FC</th>
            <th class="num">RPE</th>
            <th class="num">Carga</th>
            <th class="num">Sueño</th>
            <th>Molestia</th>
          </tr>
        </thead>
        <tbody>
          {regs.map((x) => {
            const rit = ritmoMedio(x);
            const dolor = dolorMax(x);
            return (
              <tr class="clic" onClick={() => abrirRegistro({ registro: x })} title={x.notas || 'Editar'}>
                <td class="sec">{fechaTxt(x.fecha)}</td>
                <td class="titulo-celda">
                  {x.titulo || nombreTipo(x.tipo)}
                  <small>
                    {nombreTipo(x.tipo)}
                    {x.notas ? ' · con notas' : ''}
                  </small>
                </td>
                <td class="num">{x.minutos ?? ''}</td>
                <td class="num">{x.km ? kmTxt(x.km) : ''}</td>
                <td class="num">{rit && esCarrera(x.tipo) ? formatoRitmo(rit) : ''}</td>
                <td class="num">{x.fc ?? ''}</td>
                <td class="num">{x.rpe ?? ''}</td>
                <td class="num">{cargaSesion(x) || ''}</td>
                <td class="num">{x.sueno ? `${fmt(x.sueno, 1)} h` : ''}</td>
                <td>{dolor ? <span class={`run-dolor ${dolor[1] <= 2 ? 'verde' : dolor[1] <= 5 ? 'ambar' : 'rojo'}`}>{`${dolor[0]} ${dolor[1]}`}</span> : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { textoResumen };
