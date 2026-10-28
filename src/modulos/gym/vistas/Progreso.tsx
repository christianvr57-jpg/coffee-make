// GYM · Historial y Progreso.
//  - Historial: todos los entrenos por mes.
//  - Progreso: entrenos, series y volumen por semana; series por músculo en los últimos 7 días
//    (referencia general: unas 10-20 series semanales por grupo para ganar músculo) y récords recientes.
import { addDays, fechaCorta, fechaRelativa, iso, minutosATexto, MESES, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { useVivo } from '../../../core/vivo';
import { Barras } from '../../../ui/Graficos';
import { Icono } from '../../../ui/Icono';
import { duracionMin, porSemana, recordsDeSesion, seriesHechas, seriesPorGrupo, textoSerie, volumenSesion } from '../calculos';
import { ejercicio, listarSesiones, nombreEjercicio } from '../estado';
import { GRUPOS } from '../tipos';

const kg = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kg`;

export function HistorialGym() {
  const sesiones = useVivo(listarSesiones, []);
  if (!sesiones) return null;
  const meses: { clave: string; nombre: string; items: typeof sesiones }[] = [];
  for (const s of sesiones) {
    const clave = s.fecha.slice(0, 7);
    const g = meses[meses.length - 1];
    if (g && g.clave === clave) g.items.push(s);
    else {
      const d = parse(s.fecha);
      meses.push({ clave, nombre: `${MESES[d.getMonth() + 1]} ${d.getFullYear()}`, items: [s] });
    }
  }
  if (!sesiones.length) {
    return (
      <div class="vacio">
        <Icono n="pesa" t={44} />
        <p>Aún no hay entrenos. Empieza uno desde «Entrenar».</p>
      </div>
    );
  }
  return (
    <>
      {meses.map((m) => (
        <section>
          <div class="tit-lista gym-tit">
            <span>{m.nombre}</span>
            <span class="cuenta">
              {m.items.length} {m.items.length === 1 ? 'entreno' : 'entrenos'}
            </span>
          </div>
          <div class="lista">
            {m.items.map((s) => (
              <a class="item" href={`#/gym/sesion/${s.id}`}>
                <div class="item-txt">
                  <div class="item-tit">
                    {s.nombre}
                    {!s.fin && <span class="tag">en curso</span>}
                  </div>
                  <div class="item-meta">
                    {fechaRelativa(s.fecha)} · {minutosATexto(duracionMin(s))} · {seriesHechas(s)} series · {kg(volumenSesion(s))}
                  </div>
                  <div class="item-meta gym-ejs-linea">{s.ejercicios.map((e) => nombreEjercicio(e.ejercicioId)).join(' · ')}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function ProgresoGym() {
  const sesiones = useVivo(listarSesiones, []);
  if (!sesiones) return null;
  const hoy = parse(diaActual.value);
  const semanas = porSemana(sesiones, hoy, 8);
  const actual = semanas[semanas.length - 1];
  const grupos = seriesPorGrupo(sesiones, iso(addDays(hoy, -6)), iso(hoy), ejercicio);
  const maxG = Math.max(20, ...grupos.values());
  const hace30 = iso(addDays(hoy, -30));
  const records = sesiones
    .filter((s) => s.fecha >= hace30)
    .flatMap((s) => recordsDeSesion(s, sesiones, ejercicio))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const etiqueta = (l: string, i: number) => (i === semanas.length - 1 ? 'esta' : fechaCorta(parse(l)));

  if (!sesiones.length) {
    return (
      <div class="vacio">
        <Icono n="grafico" t={44} />
        <p>En cuanto registres entrenos verás aquí tu evolución, el volumen por músculo y tus récords.</p>
      </div>
    );
  }

  return (
    <>
      <dl class="rejilla-datos">
        <div>
          <dt>Entrenos esta semana</dt>
          <dd>{actual.sesiones}</dd>
        </div>
        <div>
          <dt>Series esta semana</dt>
          <dd>{actual.series}</dd>
        </div>
        <div>
          <dt>Volumen esta semana</dt>
          <dd>{kg(actual.volumen)}</dd>
        </div>
        <div>
          <dt>Total de entrenos</dt>
          <dd>{sesiones.filter((s) => s.fin).length}</dd>
        </div>
      </dl>

      <div class="columnas">
        <div>
          <div class="tit-lista">Entrenos por semana</div>
          <div class="lista bloque-grafico">
            <Barras titulo="Entrenos por semana" datos={semanas.map((s, i) => ({ etiqueta: etiqueta(s.lunes, i), valor: s.sesiones }))} cadaEtiqueta={2} />
          </div>
          <div class="tit-lista">Volumen por semana (toneladas)</div>
          <div class="lista bloque-grafico">
            <Barras titulo="Volumen por semana" datos={semanas.map((s, i) => ({ etiqueta: etiqueta(s.lunes, i), valor: Math.round(s.volumen / 100) / 10 }))} cadaEtiqueta={2} />
            <p class="ayuda">Volumen = kilos × repeticiones de las series hechas (sin calentamientos).</p>
          </div>
        </div>
        <div>
          <div class="tit-lista">Series por músculo · últimos 7 días</div>
          <div class="lista bloque-texto barras-cat">
            {GRUPOS.filter(([g]) => g !== 'cardio' && grupos.get(g)).map(([g, n]) => {
              const v = grupos.get(g) || 0;
              return (
                <div class="bc-fila gym-bc">
                  <span class="bc-nombre">{n}</span>
                  <span class="bc-barra gym-objetivo">
                    <span style={{ width: `${(v / maxG) * 100}%` }} class={v >= 10 ? 'ok' : ''} />
                    <i style={{ left: `${(10 / maxG) * 100}%`, width: `${(10 / maxG) * 100}%` }} />
                  </span>
                  <span class="bc-valor">{String(Math.round(v * 2) / 2).replace('.', ',')}</span>
                </div>
              );
            })}
            {!grupos.size && <p class="ayuda">Esta semana aún no hay series.</p>}
            <p class="ayuda">La franja marca 10-20 series por semana, referencia habitual para ganar músculo. Los músculos secundarios de cada ejercicio cuentan como media serie.</p>
          </div>

          <div class="tit-lista">🏆 Récords del último mes</div>
          {records.length ? (
            <div class="lista">
              {records.slice(0, 12).map((r) => (
                <a class="item" href={`#/gym/ejercicios/${r.ejercicioId}`}>
                  <div class="item-txt">
                    <div class="item-tit">{nombreEjercicio(r.ejercicioId)}</div>
                    <div class="item-meta">
                      {textoSerie(ejercicio(r.ejercicioId)?.tipo || 'peso', r.serie)} · {fechaRelativa(r.fecha)}
                    </div>
                  </div>
                  <Icono n="chevron" t={16} clase="chev" />
                </a>
              ))}
            </div>
          ) : (
            <div class="lista bloque-texto">
              <p class="ayuda">Cuando superes tu mejor marca en un ejercicio (por 1RM estimado, repeticiones o tiempo) aparecerá aquí.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
