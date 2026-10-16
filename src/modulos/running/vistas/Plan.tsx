// RUNNING · Plan: la semana del entrenador (sesiones, qué observar, cuándo modificar) y la visión
// general (objetivos, diagnóstico, hoja de ruta). Sin plan cargado, explica cómo cargarlo.
import { signal } from '@preact/signals';
import { addDays, DIAS, fechaCorta, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { ir } from '../../../core/router';
import { mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { indiceSemanaActual } from '../calculos';
import { FASES_GENERICAS } from '../datos/guia';
import { datos, marcarSesion, plan, sesionHecha } from '../estado';
import type { PlanEntrenador, SemanaPlan, SesionPlan } from '../tipos';
import { DetalleSesion, Plegable, metaSesion, zonasActuales } from './comunes';
import { abrirRegistro } from './Registro';

const semanaVista = signal<number | null>(null);

function FilaSesion({ s, fecha }: { s: SesionPlan; fecha: string }) {
  const hecha = sesionHecha(s.id);
  const zonas = zonasActuales().ritmo?.zonas || null;
  const regId = datos.value.hechas[s.id];
  const descanso = s.tipo === 'descanso';
  const alternar = async () => {
    await marcarSesion(s.id, hecha ? null : typeof regId === 'string' ? regId : true);
    if (!hecha) mostrarToast('Sesión hecha. Ábrela para registrar cómo fue.');
  };
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
              alternar();
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

function Semana({ sem, idx, total }: { sem: SemanaPlan; idx: number; total: number }) {
  const lunes = parse(sem.lunes);
  const hoy = diaActual.value;
  const Lista = ({ t, items }: { t: string; items?: string[] }) =>
    items?.length ? (
      <>
        <div class="tit-lista">{t}</div>
        <ul class="lista bloque-texto consejos">
          {items.map((x) => (
            <li>{x}</li>
          ))}
        </ul>
      </>
    ) : null;
  return (
    <>
      <div class="navegador-semana">
        <button type="button" class="btn-icono" aria-label="Semana anterior" disabled={idx <= 0} onClick={() => (semanaVista.value = idx - 1)}>
          <Icono n="chevronIzq" t={20} />
        </button>
        <div>
          <b>
            {fechaCorta(lunes)} – {fechaCorta(addDays(lunes, 6))}
          </b>
          <span>{sem.fase}</span>
        </div>
        <button type="button" class="btn-icono" aria-label="Semana siguiente" disabled={idx >= total - 1} onClick={() => (semanaVista.value = idx + 1)}>
          <Icono n="chevron" t={20} />
        </button>
      </div>
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
      <Lista t="Qué observar" items={sem.observar} />
      <Lista t="Cuándo modificar o cancelar" items={sem.modificar} />
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

function VisionGeneral({ p }: { p: PlanEntrenador }) {
  const d = p.diagnostico;
  const o = p.objetivos;
  return (
    <>
      <div class="tit-lista">Visión general</div>
      <div class="lista run-plegables">
        {o && (
          <Plegable titulo="Objetivos y prioridades" sub="Realista, ambicioso e intermedios">
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
          </Plegable>
        )}
        {d && (
          <Plegable titulo="Diagnóstico inicial" sub="Lo que dicen tus datos">
            {d.conclusion && <p class="run-conclusion">{d.conclusion}</p>}
            {(d.hallazgos || []).map((h) => (
              <div class={`run-hallazgo nivel-${h.nivel}`}>
                <b>{h.titulo}</b>
                <p>{h.texto}</p>
              </div>
            ))}
            {d.fuente && <p class="ayuda">{d.fuente}</p>}
          </Plegable>
        )}
        <Plegable titulo="Hoja de ruta y fases" sub="Dónde estamos">
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
        </Plegable>
      </div>
    </>
  );
}

export function PlanRunning() {
  const p = plan.value;
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
  const semanas = p.plan?.semanas || [];
  const idx = semanaVista.value ?? indiceSemanaActual(semanas, parse(diaActual.value));
  const sem = semanas[Math.min(Math.max(0, idx), semanas.length - 1)];
  return (
    <>
      {sem ? (
        <Semana sem={sem} idx={Math.min(Math.max(0, idx), semanas.length - 1)} total={semanas.length} />
      ) : (
        <div class="run-tarjeta acento">
          <span class="run-sobre">Fase actual</span>
          <p>Aún no hay plan semanal: primero, la auditoría inicial.</p>
          <button type="button" class="boton-secundario" onClick={() => ir('/running/auditoria')}>
            Ir a la auditoría
          </button>
        </div>
      )}
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
