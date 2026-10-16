// RUNNING · Zonas: ritmos (VDOT de Daniels) y frecuencia cardíaca (porcentajes de Friel sobre la FC
// de umbral), a partir de una marca y de tus pulsaciones. Y cuándo guiarse por cada cosa.
import { useState } from 'preact/hooks';
import { mostrarToast } from '../../../ui/capas';
import { Campo, FilaBoton, Lista, Numero, Selector, Texto, fmt } from '../../../ui/form';
import { formatoRitmo, leerTiempo } from '../calculos';
import { GUIARSE } from '../datos/guia';
import { cambiarZonas, plan, restablecerZonas } from '../estado';
import { zonasActuales } from './comunes';

export function ZonasRunning() {
  const z = zonasActuales();
  const d = z.datos;
  const [marca, setMarca] = useState(d.marca || '');
  const marcaValida = !marca.trim() || !!leerTiempo(marca);
  return (
    <>
      <div class="columnas">
        <div>
          <div class="run-tarjeta ambar">
            <span class="run-sobre">Zonas provisionales</span>
            <p>Salen de una marca y de una FC de umbral. Si llevas semanas sin correr, los ritmos de calidad estarán por encima de tu forma actual. Recalcúlalas tras un test o una carrera.</p>
          </div>

          <Lista titulo="Datos de referencia">
            <Campo et="Marca de referencia">
              <Selector<number>
                opciones={[
                  [5000, '5K'],
                  [10000, '10K'],
                  [21097, 'Media maratón'],
                ]}
                valor={Number(d.distancia) || 10000}
                cambiar={(v) => cambiarZonas({ distancia: v })}
              />
            </Campo>
            <Campo et="Tiempo (mm:ss)" clase={marcaValida ? '' : 'error'}>
              <Texto
                valor={marca}
                cambiar={(v) => {
                  setMarca(v);
                  if (!v.trim() || leerTiempo(v)) cambiarZonas({ marca: v.trim() || undefined });
                }}
                marcador="41:00"
              />
            </Campo>
            <Campo et="FC de umbral">
              <Numero valor={d.fcUmbral} cambiar={(v) => cambiarZonas({ fcUmbral: v && v > 80 ? Math.round(v) : undefined })} unidad="ppm" dec={0} />
            </Campo>
            <Campo et="FC máxima">
              <Numero valor={d.fcMax} cambiar={(v) => cambiarZonas({ fcMax: v && v > 100 ? Math.round(v) : undefined })} unidad="ppm" dec={0} />
            </Campo>
          </Lista>
          {z.ritmo && (
            <p class="pie">
              VDOT estimado: <b>{fmt(z.ritmo.vdot, 1)}</b> (fórmula de Daniels y Gilbert). Es una referencia de rendimiento en carrera, no tu VO2max de laboratorio.
            </p>
          )}
        </div>
        <div>
          <div class="tit-lista">Zonas de ritmo (min/km)</div>
          {z.ritmo ? (
            <div class="lista">
              {z.ritmo.zonas.map((x) => (
                <div class="run-zona">
                  <span class="run-zid">{x.id}</span>
                  <div>
                    <b>{x.nombre}</b>
                    <small>{x.uso}</small>
                  </div>
                  <span class="run-zval">
                    {formatoRitmo(x.desde)}–{formatoRitmo(x.hasta)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p class="pie">Introduce una marca válida (mm:ss).</p>
          )}

          <div class="tit-lista">Zonas de frecuencia cardíaca (ppm)</div>
          {z.fc ? (
            <div class="lista">
              {z.fc.map((x) => (
                <div class="run-zona">
                  <span class="run-zid">{x.id}</span>
                  <div>
                    <b>{x.nombre}</b>
                    <small>{x.uso}</small>
                  </div>
                  <span class="run-zval">{!x.min ? `< ${(x.max as number) + 1}` : x.max == null ? `≥ ${x.min}` : `${x.min}–${x.max}`}</span>
                </div>
              ))}
            </div>
          ) : (
            <p class="pie">Introduce tu FC de umbral.</p>
          )}
          <p class="pie">Ritmo y FC no son intercambiables: la FC sube con el calor, la deshidratación y la fatiga, y tarda en responder en esfuerzos cortos.</p>
        </div>
      </div>

      <div class="tit-lista">Cuándo guiarte por qué</div>
      <div class="lista run-plegables rejilla-pares">
        {GUIARSE.map((g) => (
          <div class="run-par">
            <b>{g.sesion}</b>
            <p>{g.como}</p>
          </div>
        ))}
      </div>

      {plan.value?.perfil?.zonas && (
        <div class="lista separada">
          <FilaBoton
            icono="reiniciar"
            texto="Volver a los valores del entrenador"
            onClick={async () => {
              await restablecerZonas();
              setMarca(String(plan.value?.perfil?.zonas?.marca || ''));
              mostrarToast('Zonas restablecidas');
            }}
          />
        </div>
      )}
    </>
  );
}
