// HOGAR · Progreso: racha de días cumplidos, mapa de las últimas 12 semanas, % por semana y por
// categoría, y las tareas que más se escapan (para replantearlas o cambiarlas de día).
import { DIAS_INICIAL, fechaCorta, minutosATexto, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { Barras } from '../../../ui/Graficos';
import { Icono } from '../../../ui/Icono';
import { ajustesHogar, hechas, modelo } from '../estado';
import { UMBRAL_CUMPLIDO, cumplido, progreso } from '../progreso';
import { Insignia, nombreCategoria } from './comunes';

export function ProgresoHogar() {
  const hoy = parse(diaActual.value);
  const p = progreso(modelo.value, ajustesHogar.value, hechas.value, hoy);
  const semanaActual = p.semanas[p.semanas.length - 1]?.pct;
  const filas = Array.from({ length: p.semanas.length }, (_, s) => p.dias.slice(s * 7, s * 7 + 7));
  const conDatos = p.dias.filter((d) => d && d.total).length;

  return (
    <>
      <dl class="rejilla-datos progreso-cifras">
        <div>
          <dt>Racha</dt>
          <dd>
            {p.racha} <small>{p.racha === 1 ? 'día' : 'días'}</small>
          </dd>
        </div>
        <div>
          <dt>Mejor racha</dt>
          <dd>
            {p.mejorRacha} <small>{p.mejorRacha === 1 ? 'día' : 'días'}</small>
          </dd>
        </div>
        <div>
          <dt>Esta semana</dt>
          <dd>{semanaActual == null ? '—' : `${semanaActual} %`}</dd>
        </div>
        <div>
          <dt>Últimos 7 días</dt>
          <dd>{minutosATexto(p.minutos7)}</dd>
        </div>
      </dl>
      <p class="pie">Un día cuenta como cumplido con el {Math.round(UMBRAL_CUMPLIDO * 100)} % de lo que tocaba hecho. Hoy suma a la racha en cuanto lo alcances.</p>

      <div class="columnas">
        <div>
          <div class="tit-lista">Últimas 12 semanas</div>
          <div class="lista mapa-calor">
            <div class="mc-fila mc-cab">
              <span />
              {DIAS_INICIAL.slice(1).map((d) => (
                <span>{d}</span>
              ))}
            </div>
            {filas.map((semana, s) => (
              <div class="mc-fila">
                <span class="mc-sem">{fechaCorta(parse(p.semanas[s].lunes))}</span>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = semana[i];
                  if (d === undefined) return <span class="mc-dia futuro" />;
                  if (d === null || !d.total) return <span class="mc-dia vacio" title={d ? 'Nada programado' : 'Antes de empezar a usar la app'} />;
                  const f = d.hechas / d.total;
                  return (
                    <span
                      class={`mc-dia${cumplido(d) ? ' cumplido' : ''}${d.fecha === diaActual.value ? ' hoy' : ''}`}
                      style={{ '--f': f.toFixed(2) }}
                      title={`${fechaCorta(parse(d.fecha))}: ${d.hechas} de ${d.total}`}
                    />
                  );
                })}
              </div>
            ))}
            <p class="mc-leyenda">
              <span class="mc-dia" style={{ '--f': 0.15 }} /> poco <span class="mc-dia" style={{ '--f': 0.55 }} /> la mitad <span class="mc-dia cumplido" style={{ '--f': 1 }} /> cumplido
            </p>
          </div>
        </div>
        <div>
          <div class="tit-lista">Semana a semana</div>
          <div class="lista bloque-grafico">
            <Barras titulo="% hecho por semana" datos={p.semanas.map((s) => ({ etiqueta: fechaCorta(parse(s.lunes)), valor: s.pct ?? 0 }))} cadaEtiqueta={3} />
          </div>
        </div>
      </div>

      {conDatos > 0 ? (
        <div class="columnas">
          <div>
            <div class="tit-lista">Por categoría · últimos 28 días</div>
            <div class="lista bloque-texto barras-cat">
              {p.categorias.map((c) => (
                <div class="bc-fila">
                  <Insignia cat={c.categoria} tam={26} />
                  <span class="bc-nombre">{nombreCategoria(c.categoria)}</span>
                  <span class="bc-barra">
                    <span style={{ width: `${c.pct}%` }} />
                  </span>
                  <span class="bc-valor">{c.pct} %</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div class="tit-lista">Lo que más se escapa</div>
            {p.escapan.length ? (
              <div class="lista">
                {p.escapan.map((t) => (
                  <div class="item">
                    <Insignia cat={t.categoria} tam={32} />
                    <div class="item-txt">
                      <div class="item-tit">{t.titulo}</div>
                      <div class="item-meta">
                        Sin hacer {t.fallos} de {t.veces} {t.veces === 1 ? 'vez' : 'veces'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div class="lista bloque-texto">
                <p>Nada: todo lo programado se ha hecho. 👏</p>
              </div>
            )}
            <p class="pie">Si una tarea se escapa casi siempre, quizá está en un mal día o es demasiado frecuente: cámbiala en Tareas.</p>
          </div>
        </div>
      ) : (
        <div class="vacio">
          <Icono n="grafico" t={40} />
          <p>Aquí verás tu progreso en cuanto vayas marcando tareas.</p>
        </div>
      )}
    </>
  );
}
