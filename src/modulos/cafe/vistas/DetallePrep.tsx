// CAFÉ · Detalle de una preparación.
import { borrar, db } from '../../../core/db';
import { fechaRelativa, horaCorta, laDel, segundosATexto } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { confirmar, mostrarToast } from '../../../ui/capas';
import { fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { borrador } from '../borrador';
import { diferencias, extraccion, ratio, textoRatio, diagnosticoControl } from '../calculos';
import { SINTOMAS, textoPuntuacion } from '../datos/catalogos';
import { metodo, esEspresso } from '../datos/metodos';
import type { Preparacion } from '../modelo';
import { listarAguas, listarEquipo } from '../repositorio';
import { ControlChart } from './ControlChart';
import { IconoMetodo, Nota, textoMolienda } from './comunes';
import { repetirPreparacion } from './Preparar';
import { TarjetaDiagnostico } from './Diagnostico';
import { ResumenCata } from './ResumenCata';

export function DetallePrep({ params }: { params: Record<string, string> }) {
  const p = useVivo(() => db.cafe_preparaciones.get(params.id).then((x) => x ?? null), [params.id]);
  const padre = useVivo(async () => (p?.padreId ? db.cafe_preparaciones.get(p.padreId) : undefined), [p?.padreId]);
  const hijas = useVivo(async () => (p ? (await db.cafe_preparaciones.where('padreId').equals(p.id).toArray()).filter((x) => !x.borrado) : []), [p?.id]) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const aguas = useVivo(listarAguas, []) || [];

  if (p === undefined) return <BarraDetalle padre="/cafe" textoAtras="Café" />;
  if (!p || p.borrado) {
    return (
      <>
        <BarraDetalle padre="/cafe" textoAtras="Café" />
        <div class="vacio">Esta preparación ya no existe.</div>
      </>
    );
  }
  const met = metodo(p.metodo);
  const esp = esEspresso(p.metodo);
  const ey = extraccion(p);
  const cambios = padre ? diferencias(p, padre) : [];
  const nombreEq = (id?: string) => equipo.find((e) => e.id === id)?.nombre;
  const datos: [string, string | undefined][] = [
    ['Dosis', `${fmt(p.dosis)} g`],
    esp ? ['Salida', p.rendimiento ? `${fmt(p.rendimiento)} g` : undefined] : ['Agua', p.agua ? `${fmt(p.agua)} g` : undefined],
    ['Ratio', textoRatio(ratio(p))],
    ['Molienda', [textoMolienda(p, equipo), nombreEq(p.molinoId)].filter(Boolean).join(' · ') || undefined],
    ['Temperatura', p.temperatura ? `${p.temperatura} °C` : undefined],
    ['Tiempo', p.tiempoTotal ? segundosATexto(p.tiempoTotal) : undefined],
    ['Primera gota', p.primeraGota ? `${p.primeraGota} s` : undefined],
    ['Preinfusión', p.preinfusion ? `${p.preinfusion} s` : undefined],
    ['Presión', p.presion ? `${fmt(p.presion)} bar` : undefined],
    ['Cafetera', nombreEq(p.cafeteraId)],
    [esp ? 'Cesta' : 'Filtro', p.filtro],
    ['Agua', aguas.find((a) => a.id === p.aguaId)?.nombre],
    ['Reposo', p.diasReposo !== undefined ? `${p.diasReposo} días desde el tueste` : undefined],
    ['Bebida', p.bebida ? `${p.bebida.tipo}${p.bebida.leche ? ` · ${p.bebida.leche}` : ''}${p.bebida.ml ? ` · ${p.bebida.ml} ml` : ''}` : undefined],
    ['TDS', p.tds ? `${fmt(p.tds, 2)} %` : undefined],
    ['Extracción', ey !== undefined ? `${fmt(ey, 1)} %` : undefined],
  ];

  const editar = () => {
    borrador.value = { prep: { ...p, sintomas: p.sintomas || [] }, editando: p.id };
    ir('/cafe/preparar/resultado');
  };
  const eliminar = async () => {
    if (!(await confirmar({ titulo: '¿Eliminar esta preparación?', ok: 'Eliminar', peligro: true }))) return;
    await borrar('cafe_preparaciones', p.id);
    mostrarToast('Preparación eliminada');
    ir('/cafe', true);
  };

  return (
    <>
      <BarraDetalle padre="/cafe" textoAtras="Café" derecha={<button type="button" class="bd-accion" onClick={editar}>Editar</button>} />
      <div class="pagina">
        <section class="ficha-cab">
          <IconoMetodo id={p.metodo} tam={52} />
          <div class="fc-txt">
            <div class="sobre">
              {fechaRelativa(p.fecha)} · {horaCorta(p.fecha)}
            </div>
            <h1>{met.nombre}</h1>
            <div class="sub">
              {p.cafeId ? (
                <a href={`#/cafe/cafes/${p.cafeId}`} class="enlace">
                  {p.cafeNombre}
                </a>
              ) : (
                p.cafeNombre || 'Café sin registrar'
              )}
            </div>
          </div>
          <div class="fc-nota">
            <Nota p={p.puntuacion} grande />
            <small>{p.puntuacion !== undefined ? textoPuntuacion(p.puntuacion) : 'Sin puntuar'}</small>
          </div>
        </section>

        <div class="acciones-fila">
          <button type="button" class="boton-principal" onClick={() => repetirPreparacion(p)}>
            <Icono n="repetir" t={20} /> Repetir
          </button>
          <button type="button" class="boton-secundario" onClick={() => ir(`/cafe/p/${p.id}/cata`)}>
            <Icono n="estrella" t={20} /> {p.cata ? 'Editar cata' : 'Catar a fondo'}
          </button>
        </div>


        {(p.sintomas?.length > 0 || p.notas) && (
          <div class="lista bloque-texto">
            {p.sintomas?.length > 0 && (
              <div class="chips">
                {p.sintomas.map((s) => {
                  const info = SINTOMAS.find((x) => x.id === s)!;
                  return <span class={`chip sintoma ${info.tipo}`} aria-pressed="true">{info.nombre}</span>;
                })}
              </div>
            )}
            {p.notas && <p>{p.notas}</p>}
          </div>
        )}

        {p.cata && <ResumenCata cata={p.cata} />}

        {(p.sintomas?.length > 0 || p.tds) && (
          <>
            <div class="tit-lista">Diagnóstico</div>
            <TarjetaDiagnostico prep={p} onProbar={(cambio) => repetirPreparacion(p, cambio)} />
          </>
        )}

        {cambios.length > 0 && padre && (
          <div class="aviso-suave">
            <Icono n="repetir" t={18} />
            <span>
              Viene de{' '}
              <a class="enlace" href={`#/cafe/p/${padre.id}`}>
                {laDel(padre.fecha)} ({padre.puntuacion !== undefined ? `${fmt(padre.puntuacion)}/10` : 'sin nota'})
              </a>
              . Cambiaste: {cambios.map((c) => c.nombre.toLowerCase()).join(', ')}.
              {padre.puntuacion !== undefined && p.puntuacion !== undefined && (
                <b> {p.puntuacion > padre.puntuacion ? ' Mejoró.' : p.puntuacion < padre.puntuacion ? ' Empeoró.' : ' Igual nota.'}</b>
              )}
            </span>
          </div>
        )}

        <div class="tit-lista">Parámetros</div>
        <dl class="rejilla-datos">
          {datos.filter(([, v]) => v).map(([k, v]) => (
            <div>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {p.fases && p.fases.length > 0 && (
          <>
            <div class="tit-lista">Fases reales</div>
            <ol class="lista lista-fases">
              {p.fases.map((f) => (
                <li>
                  <span>{f.nombre}</span>
                  <span>
                    {segundosATexto(f.inicio)} – {segundosATexto(f.fin)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {p.tds && ey !== undefined && (
          <>
            <div class="tit-lista">Control chart</div>
            <div class="lista bloque-texto">
              <p class="ayuda">
                {(() => {
                  const d = diagnosticoControl(p.tds, ey, esp ? 'espresso' : 'filtro');
                  return `Concentración ${d.fuerza === 'ideal' ? 'ideal' : d.fuerza} y ${d.ext === 'ideal' ? 'extracción ideal' : d.ext}.`;
                })()}
              </p>
              <ControlChart tipo={esp ? 'espresso' : 'filtro'} puntos={[{ tds: p.tds, ey, actual: true }]} />
            </div>
          </>
        )}

        {hijas.length > 0 && (
          <>
            <div class="tit-lista">Siguientes intentos</div>
            <div class="lista">
              {hijas.map((h: Preparacion) => (
                <a class="item" href={`#/cafe/p/${h.id}`}>
                  <IconoMetodo id={h.metodo} />
                  <div class="item-txt">
                    <div class="item-tit">{fechaRelativa(h.fecha)}</div>
                    <div class="item-meta">Cambió: {diferencias(h, p).map((c) => c.nombre.toLowerCase()).join(', ') || 'nada'}</div>
                  </div>
                  <Nota p={h.puntuacion} />
                </a>
              ))}
            </div>
          </>
        )}

        <div class="lista separada">
          <button type="button" class="boton-fila peligro" onClick={eliminar}>
            <Icono n="papelera" t={22} /> Eliminar preparación
          </button>
        </div>
      </div>
    </>
  );
}
