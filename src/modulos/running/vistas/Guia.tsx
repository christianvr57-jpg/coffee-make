// RUNNING · Guía: semáforo de molestias, biblioteca de sesiones con tus ritmos, fuerza y nutrición.
import { BIBLIOTECA, FUERZA, NUTRICION, SEMAFORO, SEMAFORO_NOTA } from '../datos/guia';
import { plan } from '../estado';
import { nombreTipo } from '../tipos';
import { DetalleSesion, Plegable, zonasActuales } from './comunes';

export function GuiaRunning() {
  const zonas = zonasActuales().ritmo?.zonas || null;
  const peso = plan.value?.perfil?.pesoKg;
  return (
    <>
      <div class="tit-lista">Semáforo de molestias</div>
      <div class="lista bloque-texto">
        {SEMAFORO.map((s) => (
          <div class={`run-semaforo ${s.nivel}`}>
            <b>{s.titulo}</b>
            <ul class="run-puntos">
              {s.puntos.map((p) => (
                <li>{p}</li>
              ))}
            </ul>
          </div>
        ))}
        <p class="ayuda">{SEMAFORO_NOTA}</p>
      </div>

      <div class="tit-lista">Sesiones clave para el 10K</div>
      <p class="pie primero">{zonas ? 'Con los ritmos de tus zonas actuales.' : 'Pon una marca en Zonas para ver tus ritmos.'} Es la biblioteca de sesiones, no tu plan: el plan semanal decide cuáles tocan y cuándo.</p>
      <div class="lista run-plegables">
        {BIBLIOTECA.map((s) => (
          <Plegable titulo={s.titulo} sub={nombreTipo(s.tipo)}>
            <DetalleSesion s={s} zonas={zonas} />
          </Plegable>
        ))}
      </div>

      <div class="tit-lista">Fuerza y prevención</div>
      <div class="lista run-plegables">
        <Plegable titulo="Programa de fuerza para corredores" sub="2 sesiones por semana">
          <ul class="run-puntos">
            {FUERZA.principios.map((p) => (
              <li>{p}</li>
            ))}
          </ul>
          {FUERZA.bloques.map((b) => (
            <>
              <h4 class="run-h4">{b.titulo}</h4>
              <dl class="run-dl">
                {b.ejercicios.map(([e, d]) => (
                  <div>
                    <dt>{e}</dt>
                    <dd>{d}</dd>
                  </div>
                ))}
              </dl>
            </>
          ))}
          <h4 class="run-h4">Adaptaciones según molestias</h4>
          <dl class="run-dl">
            {FUERZA.adaptaciones.map(([e, d]) => (
              <div>
                <dt>{e}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </Plegable>
      </div>

      <div class="tit-lista">Nutrición y recuperación</div>
      <div class="lista run-plegables">
        <Plegable titulo="Recomendaciones prácticas" sub="Con su nivel de evidencia">
          <dl class="run-dl">
            {NUTRICION.map((n) => (
              <div>
                <dt>{n.tema}</dt>
                <dd>
                  {n.texto}
                  {peso && n.porKg && (
                    <b class="run-calculo">
                      {' '}
                      Para tus {peso} kg: {Math.round(n.porKg.min * peso)}
                      {n.porKg.max ? `-${Math.round(n.porKg.max * peso)}` : ''} {n.porKg.unidad} {n.porKg.que}.
                    </b>
                  )}
                  <span class="run-evidencia">{n.evidencia}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p class="ayuda">Evidencia: «sólida» = metaanálisis o ensayos consistentes; «consenso» = posicionamientos de sociedades científicas; «hipótesis» = razonable pero sin pruebas directas.</p>
        </Plegable>
      </div>
    </>
  );
}
