// RUNNING · Plan: la semana del entrenador (sesiones, qué observar, cuándo modificar) y la visión
// general (objetivos, diagnóstico, hoja de ruta). Sin plan cargado, explica cómo cargarlo.
// En el ordenador, la semana es un calendario de 7 columnas y debajo está el bloque completo.
import { signal } from '@preact/signals';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { addDays, DIAS, DIAS_CORTOS, fechaCorta, iso, isoWeekday, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { escritorio } from '../../../core/pantalla';
import { consulta, ir } from '../../../core/router';
import { Hoja, abrirHoja, mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { useFlechas } from '../../../ui/teclado';
import { indiceSemanaActual } from '../calculos';
import { FASES_GENERICAS } from '../datos/guia';
import { datos, marcarSesion, plan, sesionHecha } from '../estado';
import { nombreTipo, type PlanEntrenador, type SemanaPlan, type SesionPlan } from '../tipos';
import { DetalleSesion, Plegable, metaSesion, zonasActuales } from './comunes';
import { abrirRegistro } from './Registro';
import { SemaforoHoy } from './Semaforo';

const semanaVista = signal<number | null>(null);

async function alternarHecha(s: SesionPlan) {
  const hecha = sesionHecha(s.id);
  const regId = datos.value.hechas[s.id];
  await marcarSesion(s.id, hecha ? null : typeof regId === 'string' ? regId : true);
  if (!hecha) mostrarToast('Sesión hecha. Ábrela para registrar cómo fue.');
}

function FilaSesion({ s, fecha }: { s: SesionPlan; fecha: string }) {
  const hecha = sesionHecha(s.id);
  const zonas = zonasActuales().ritmo?.zonas || null;
  const regId = datos.value.hechas[s.id];
  const descanso = s.tipo === 'descanso';
  return (
    <details class={`run-sesion tipo-${s.tipo}${hecha ? ' hecha' : ''}`}>
      <summary>
        {descanso ? (
          <span class="run-check vacio" />
        ) : (
          <button
            type="button"
            class={`run-check${hecha ? ' marcado' : ''}`}
            aria-label={hecha ? 'Desmarcar' : 'Marcar como hecha'}
            onClick={(e) => {
              e.preventDefault();
              alternarHecha(s);
            }}
          >
            {hecha && <Icono n="check" t={16} />}
          </button>
        )}
        <span class="run-sesion-txt">
          <b>{s.titulo}</b>
          <small>{metaSesion(s)}</small>
        </span>
        <Icono n="chevronAbajo" t={16} clase="mini-chev" />
      </summary>
      <div class="run-sesion-cuerpo">
        <DetalleSesion s={s} zonas={zonas} />
        {!descanso && (
          <button type="button" class="boton-secundario" onClick={() => abrirRegistro({ fecha, sesion: s })}>
            <Icono n="diario" t={18} /> {typeof regId === 'string' ? 'Ver registro' : 'Registrar cómo fue'}
          </button>
        )}
      </div>
    </details>
  );
}

/** Ficha de una sesión en una ventana (ordenador): detalle, marcar hecha y registrar. */
function HojaSesion({ s, fecha, cerrar }: { s: SesionPlan; fecha: string; cerrar: () => void }) {
  const hecha = sesionHecha(s.id);
  const regId = datos.value.hechas[s.id];
  const zonas = zonasActuales().ritmo?.zonas || null;
  const f = parse(fecha);
  const descanso = s.tipo === 'descanso';
  return (
    <Hoja titulo={s.titulo} cerrar={cerrar} textoCerrar="Cerrar">
      <p class="run-hoja-sobre">
        {DIAS[isoWeekday(f)]} {fechaCorta(f)} · {metaSesion(s)}
        {hecha ? ' · hecha' : ''}
      </p>
      <div class="lista bloque-texto">
        <DetalleSesion s={s} zonas={zonas} />
      </div>
      {!descanso && (
        <div class="acciones-fila">
          <button type="button" class="boton-secundario" onClick={() => alternarHecha(s)}>
            <Icono n={hecha ? 'reiniciar' : 'check'} t={18} /> {hecha ? 'Desmarcar' : 'Marcar como hecha'}
          </button>
          <button type="button" class="boton-principal" onClick={() => abrirRegistro({ fecha, sesion: s })}>
            <Icono n="diario" t={18} /> {typeof regId === 'string' ? 'Ver registro' : 'Registrar cómo fue'}
          </button>
        </div>
      )}
    </Hoja>
  );
}

const abrirSesion = (s: SesionPlan, fecha: string) => abrirHoja((cerrar) => <HojaSesion s={s} fecha={fecha} cerrar={cerrar} />);

function Navegador({ sem, idx, total }: { sem: SemanaPlan; idx: number; total: number }) {
  const lunes = parse(sem.lunes);
  const actual = indiceSemanaActual(plan.value?.plan?.semanas || [], parse(diaActual.value));
  return (
    <div class={`navegador-semana${escritorio.value ? ' escritorio-nav' : ''}`}>
      <button type="button" class="btn-icono" aria-label="Semana anterior" title="Semana anterior (←)" disabled={idx <= 0} onClick={() => (semanaVista.value = idx - 1)}>
        <Icono n="chevronIzq" t={20} />
      </button>
      <div>
        <b>
          {fechaCorta(lunes)} – {fechaCorta(addDays(lunes, 6))}
        </b>
        <span>{sem.fase}</span>
      </div>
      {escritorio.value && idx !== actual && (
        <button type="button" class="btn-texto" onClick={() => (semanaVista.value = actual)}>
          Esta semana
        </button>
      )}
      <button type="button" class="btn-icono" aria-label="Semana siguiente" title="Semana siguiente (→)" disabled={idx >= total - 1} onClick={() => (semanaVista.value = idx + 1)}>
        <Icono n="chevron" t={20} />
      </button>
    </div>
  );
}

function ListaTexto({ t, items }: { t: string; items?: string[] }) {
  return items?.length ? (
    <>
      <div class="tit-lista">{t}</div>
      <ul class="lista bloque-texto consejos">
        {items.map((x) => (
          <li>{x}</li>
        ))}
      </ul>
    </>
  ) : null;
}

function Semana({ sem, idx, total }: { sem: SemanaPlan; idx: number; total: number }) {
  const hoy = diaActual.value;
  return (
    <>
      <Navegador sem={sem} idx={idx} total={total} />
      {sem.diagnostico && (
        <div class="run-tarjeta">
          <span class="run-sobre">Diagnóstico</span>
          <p>{sem.diagnostico}</p>
        </div>
      )}
      {sem.objetivo && (
        <div class="run-tarjeta acento">
          <span class="run-sobre">Objetivo de la semana</span>
          <p>{sem.objetivo}</p>
        </div>
      )}
      {sem.dias.map((d) => {
        const f = parse(d.fecha);
        return (
          <section class={`run-dia${d.fecha === hoy ? ' hoy' : ''}`}>
            <div class="run-dia-cab">
              <b>{DIAS[f.getDay() || 7]}</b>
              <span>{fechaCorta(f)}</span>
              {d.fecha === hoy && <span class="run-hoy">Hoy</span>}
            </div>
            <div class="lista">
              {d.sesiones.map((s) => (
                <FilaSesion s={s} fecha={d.fecha} />
              ))}
            </div>
          </section>
        );
      })}
      <ListaTexto t="Qué observar" items={sem.observar} />
      <ListaTexto t="Cuándo modificar o cancelar" items={sem.modificar} />
      {sem.porque && (
        <>
          <div class="tit-lista">Por qué esta semana</div>
          <div class="lista bloque-texto">
            <p>{sem.porque}</p>
          </div>
        </>
      )}
    </>
  );
}

// ---------- Ordenador ----------

/** Tarjeta de una sesión dentro del calendario. */
function TarjetaSesion({ s, fecha, compacta = false }: { s: SesionPlan; fecha: string; compacta?: boolean }) {
  const hecha = sesionHecha(s.id);
  const descanso = s.tipo === 'descanso';
  return (
    <div class={`rc-sesion tipo-${s.tipo}${hecha ? ' hecha' : ''}${compacta ? ' compacta' : ''}`}>
      <button type="button" class="rc-cuerpo" title="Ver la sesión" onClick={() => abrirSesion(s, fecha)}>
        <small>{nombreTipo(s.tipo)}</small>
        <b>{s.titulo}</b>
        {!compacta && <span>{[s.duracion ? `${s.duracion} min` : '', s.km ? `~${String(s.km).replace('.', ',')} km` : '', s.zona].filter(Boolean).join(' · ')}</span>}
      </button>
      {!descanso && (
        <button type="button" class={`run-check${hecha ? ' marcado' : ''}`} title={hecha ? 'Desmarcar' : 'Marcar como hecha'} aria-label={hecha ? 'Desmarcar' : 'Marcar como hecha'} onClick={() => alternarHecha(s)}>
          {hecha && <Icono n="check" t={compacta ? 12 : 15} />}
        </button>
      )}
    </div>
  );
}

function SemanaEscritorio({ sem, idx, total }: { sem: SemanaPlan; idx: number; total: number }) {
  const hoy = diaActual.value;
  const lunes = parse(sem.lunes);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const f = addDays(lunes, i);
    const fecha = iso(f);
    return { f, fecha, sesiones: sem.dias.find((d) => d.fecha === fecha)?.sesiones || [] };
  });
  const minutos = sem.dias.flatMap((d) => d.sesiones).reduce((s, x) => s + (x.duracion || 0), 0);
  const km = sem.dias.flatMap((d) => d.sesiones).reduce((s, x) => s + (x.km || 0), 0);
  const todas = sem.dias.flatMap((d) => d.sesiones).filter((s) => s.tipo !== 'descanso');
  const hechas = todas.filter((s) => sesionHecha(s.id)).length;
  return (
    <>
      <Navegador sem={sem} idx={idx} total={total} />
      {(sem.diagnostico || sem.objetivo) && (
        <div class="columnas">
          {sem.diagnostico && (
            <div class="run-tarjeta">
              <span class="run-sobre">Diagnóstico</span>
              <p>{sem.diagnostico}</p>
            </div>
          )}
          {sem.objetivo && (
            <div class="run-tarjeta acento">
              <span class="run-sobre">Objetivo de la semana</span>
              <p>{sem.objetivo}</p>
            </div>
          )}
        </div>
      )}
      <div class="run-calendario">
        {dias.map((d) => (
          <div class={`rc-dia${d.fecha === hoy ? ' hoy' : ''}`}>
            <div class="rc-dia-cab">
              <b>{DIAS_CORTOS[isoWeekday(d.f)]}</b>
              <span>{d.f.getDate()}</span>
              {d.fecha === hoy && <em>Hoy</em>}
            </div>
            <div class="rc-sesiones">
              {d.sesiones.length ? d.sesiones.map((s) => <TarjetaSesion s={s} fecha={d.fecha} />) : <span class="ag-nada">—</span>}
            </div>
          </div>
        ))}
      </div>
      <p class="pie">
        {hechas} de {todas.length} sesiones hechas · {minutos} min planificados{km ? ` · ~${String(Math.round(km * 10) / 10).replace('.', ',')} km` : ''}. Pulsa una sesión para ver el detalle y registrarla; el círculo la marca como hecha.
      </p>
      <div class="paneles tres">
        {sem.observar?.length ? (
          <section>
            <ListaTexto t="Qué observar" items={sem.observar} />
          </section>
        ) : null}
        {sem.modificar?.length ? (
          <section>
            <ListaTexto t="Cuándo modificar o cancelar" items={sem.modificar} />
          </section>
        ) : null}
        {sem.porque && (
          <section>
            <div class="tit-lista">Por qué esta semana</div>
            <div class="lista bloque-texto">
              <p>{sem.porque}</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/** Todas las semanas del plan de un vistazo. */
function BloqueCompleto({ semanas, vista }: { semanas: SemanaPlan[]; vista: number }) {
  const hoy = diaActual.value;
  return (
    <>
      <div class="tit-lista">El plan completo · {semanas.length} semanas</div>
      <div class="tabla-marco">
        <table class="tabla bloque-run">
          <thead>
            <tr>
              <th>Semana</th>
              {DIAS.slice(1).map((d) => (
                <th>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semanas.map((s, i) => {
              const lunes = parse(s.lunes);
              return (
                <tr class={i === vista ? 'actual' : ''}>
                  <td class="br-sem">
                    <button type="button" onClick={() => (semanaVista.value = i)} title="Ver esta semana arriba">
                      <b>{fechaCorta(lunes)}</b>
                      <small>{s.fase}</small>
                    </button>
                  </td>
                  {Array.from({ length: 7 }, (_, j) => {
                    const f = addDays(lunes, j);
                    const fecha = iso(f);
                    const ses = s.dias.find((d) => d.fecha === fecha)?.sesiones || [];
                    return (
                      <td class={fecha === hoy ? 'hoy' : ''}>
                        {ses.map((x) => (
                          <TarjetaSesion s={x} fecha={fecha} compacta />
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------- Visión general ----------

function Objetivos({ o }: { o: NonNullable<PlanEntrenador['objetivos']> }) {
  return (
    <>
      <dl class="run-dl">
        {o.lista.map(([k, v]) => (
          <div>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {o.nota && <p class="ayuda">{o.nota}</p>}
      {o.prioridades?.length ? (
        <>
          <h4 class="run-h4">Prioridades</h4>
          <ul class="run-puntos">
            {o.prioridades.map((x) => (
              <li>{x}</li>
            ))}
          </ul>
        </>
      ) : null}
      {o.evaluacion?.length ? (
        <>
          <h4 class="run-h4">Cómo evaluamos</h4>
          <ul class="run-puntos">
            {o.evaluacion.map((x) => (
              <li>{x}</li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function Diagnostico({ d }: { d: NonNullable<PlanEntrenador['diagnostico']> }) {
  return (
    <>
      {d.conclusion && <p class="run-conclusion">{d.conclusion}</p>}
      {(d.hallazgos || []).map((h) => (
        <div class={`run-hallazgo nivel-${h.nivel}`}>
          <b>{h.titulo}</b>
          <p>{h.texto}</p>
        </div>
      ))}
      {d.fuente && <p class="ayuda">{d.fuente}</p>}
    </>
  );
}

function HojaDeRuta({ p }: { p: PlanEntrenador }) {
  return (
    <>
      {p.hojaDeRuta?.length ? (
        <ol class="run-pasos">
          {p.hojaDeRuta.map((x, i) => (
            <li class={x.estado}>
              <span class="run-num">{x.estado === 'hecho' ? '✓' : i + 1}</span>
              <div>
                <b>{x.paso}</b>
                <small>{x.texto}</small>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <h4 class="run-h4">Periodización</h4>
      <dl class="run-dl">
        {(p.fases?.length ? p.fases : FASES_GENERICAS.map((f) => ({ ...f, duracion: '' }))).map((f) => (
          <div>
            <dt>
              {f.nombre}
              {f.duracion ? ` · ${f.duracion}` : ''}
            </dt>
            <dd>{f.objetivo}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function VisionGeneral({ p }: { p: PlanEntrenador }) {
  const bloques: [string, string, ComponentChildren][] = [];
  if (p.objetivos) bloques.push(['Objetivos y prioridades', 'Realista, ambicioso e intermedios', <Objetivos o={p.objetivos} />]);
  if (p.diagnostico) bloques.push(['Diagnóstico inicial', 'Lo que dicen tus datos', <Diagnostico d={p.diagnostico} />]);
  bloques.push(['Hoja de ruta y fases', 'Dónde estamos', <HojaDeRuta p={p} />]);
  if (escritorio.value) {
    return (
      <>
        <h2 class="titulo-seccion">Visión general</h2>
        <div class="paneles tres vision-general">
          {bloques.map(([t, , c]) => (
            <section>
              <div class="tit-lista">{t}</div>
              <div class="lista bloque-texto">{c}</div>
            </section>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <div class="tit-lista">Visión general</div>
      <div class="lista run-plegables">
        {bloques.map(([t, sub, c]) => (
          <Plegable titulo={t} sub={sub}>
            {c}
          </Plegable>
        ))}
      </div>
    </>
  );
}

export function PlanRunning() {
  const p = plan.value;
  const semanas = p?.plan?.semanas || [];
  const idx = Math.min(Math.max(0, semanaVista.value ?? indiceSemanaActual(semanas, parse(diaActual.value))), Math.max(0, semanas.length - 1));
  useFlechas(
    () => (semanaVista.value = Math.max(0, idx - 1)),
    () => (semanaVista.value = Math.min(semanas.length - 1, idx + 1)),
    escritorio.value && semanas.length > 0,
  );

  // Desde la agenda de Inicio: #/running?sesion=ID abre esa semana y esa sesión.
  useEffect(() => {
    const id = consulta().get('sesion');
    if (!id) return;
    ir('/running', true);
    semanas.forEach((s, i) =>
      s.dias.forEach((d) =>
        d.sesiones.forEach((x) => {
          if (x.id !== id) return;
          semanaVista.value = i;
          if (escritorio.value) abrirSesion(x, d.fecha);
        }),
      ),
    );
  }, []);

  if (!p) {
    return (
      <>
        <div class="vacio run-vacio">
          <Icono n="running" t={44} />
          <p>
            <b>Aún no hay plan del entrenador en este dispositivo.</b>
          </p>
          <p class="pie">Cuando el entrenador publique el plan llegará con la app. También puedes pegarlo a mano.</p>
          <button type="button" class="boton-principal" onClick={() => ir('/running/entrenador')}>
            <Icono n="descargar" t={20} /> Cargar el plan
          </button>
        </div>
        <div class="tit-lista">Mientras tanto</div>
        <div class="lista">
          <a class="item" href="#/running/registro">
            <div class="item-txt">
              <div class="item-tit">Registrar sesiones</div>
              <div class="item-meta">Esfuerzo, sueño y molestias de cada entrenamiento</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
          <a class="item" href="#/running/zonas">
            <div class="item-txt">
              <div class="item-tit">Calcular tus zonas</div>
              <div class="item-meta">Ritmos y pulsaciones a partir de una marca</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        </div>
      </>
    );
  }
  const sem = semanas[idx];
  const hoySesiones = semanas.flatMap((s) => s.dias).find((d) => d.fecha === diaActual.value)?.sesiones || [];
  const entrenaHoy = hoySesiones.some((s) => s.tipo !== 'descanso') || !!datos.value.chequeos?.[diaActual.value];
  return (
    <>
      {entrenaHoy && <SemaforoHoy />}
      {sem ? (
        escritorio.value ? (
          <SemanaEscritorio sem={sem} idx={idx} total={semanas.length} />
        ) : (
          <Semana sem={sem} idx={idx} total={semanas.length} />
        )
      ) : (
        <div class="run-tarjeta acento">
          <span class="run-sobre">Fase actual</span>
          <p>Aún no hay plan semanal: primero, la auditoría inicial.</p>
          <button type="button" class="boton-secundario" onClick={() => ir('/running/auditoria')}>
            Ir a la auditoría
          </button>
        </div>
      )}
      {escritorio.value && semanas.length > 1 && <BloqueCompleto semanas={semanas} vista={idx} />}
      <VisionGeneral p={p} />
      <p class="pie">
        Plan del entrenador {p.actualizado ? `actualizado el ${fechaCorta(parse(p.actualizado))}` : 'cargado'}.{' '}
        <a class="enlace" href="#/running/entrenador">
          Actualizarlo
        </a>
      </p>
    </>
  );
}
