// GYM · Ejercicios: el catálogo con buscador y filtros, y la ficha de cada ejercicio con tu récord,
// la evolución (1RM estimado o la mejor marca) y todo lo que has hecho.
import { signal } from '@preact/signals';
import { fechaCorta, parse } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { confirmar, mostrarToast } from '../../../ui/capas';
import { Campo, Selector } from '../../../ui/form';
import { LineaValores } from '../../../ui/Graficos';
import { Icono } from '../../../ui/Icono';
import { anterior, e1rm, historialEjercicio, marca, textoSerie } from '../calculos';
import { borrarPropio, catalogo, ejercicio, guardarSesion, listarSesiones, nuevoEjercicioSesion, seriesIniciales } from '../estado';
import { EQUIPOS, GRUPOS, nombreEquipo, nombreGrupo, type Equipo, type Grupo, type SesionGym } from '../tipos';
import { InsigniaGrupo, crearEjercicio, editarEjercicio, filtrar } from './comunes';

const busqueda = signal('');
const grupo = signal<Grupo | 'todos'>('todos');
const equipo = signal<Equipo | 'todos'>('todos');

const n1 = (x: number) => String(Math.round(x * 10) / 10).replace('.', ',');

export function EjerciciosGym() {
  const sesiones = useVivo(listarSesiones, []) || [];
  const lista = filtrar(catalogo(), busqueda.value, grupo.value, equipo.value);
  const hechos = new Set(sesiones.flatMap((s) => s.ejercicios.map((e) => e.ejercicioId)));
  return (
    <>
      <div class="sub-cabecera">
        <div class="buscador gym-buscador">
          <Icono n="buscar" t={18} />
          <input type="search" placeholder={`Buscar entre ${catalogo().length} ejercicios`} value={busqueda.value} onInput={(e) => (busqueda.value = (e.target as HTMLInputElement).value)} />
        </div>
        <button type="button" class="btn-mas" aria-label="Crear ejercicio" onClick={() => crearEjercicio(busqueda.value)}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      <div class="chips desplazables compactos">
        <button type="button" class="chip" aria-pressed={grupo.value === 'todos'} onClick={() => (grupo.value = 'todos')}>
          Todos
        </button>
        {GRUPOS.map(([g, n]) => (
          <button type="button" class="chip" aria-pressed={grupo.value === g} onClick={() => (grupo.value = g)}>
            {n}
          </button>
        ))}
      </div>
      <div class="lista gym-filtro-equipo">
        <Campo et="Material">
          <Selector<Equipo | 'todos'> opciones={[['todos', 'Todo'], ...EQUIPOS]} valor={equipo.value} cambiar={(v) => (equipo.value = v)} />
        </Campo>
      </div>
      <div class="lista rejilla-tarjetas">
        {lista.map((e) => (
          <a class="item" href={`#/gym/ejercicios/${e.id}`}>
            <InsigniaGrupo grupo={e.grupo} />
            <div class="item-txt">
              <div class="item-tit">{e.nombre}</div>
              <div class="item-meta">
                {nombreEquipo(e.equipo)}
                {e.secundarios.length ? ` · también ${e.secundarios.map((g) => nombreGrupo(g).toLowerCase()).join(', ')}` : ''}
              </div>
            </div>
            {hechos.has(e.id) && <span class="tag">hecho</span>}
          </a>
        ))}
      </div>
      {!lista.length && <div class="vacio">Ningún ejercicio coincide. Puedes crearlo con el botón +.</div>}
      <p class="pie">{lista.length} ejercicios. Los tuyos aparecen primero.</p>
    </>
  );
}

export function FichaEjercicioGym({ params }: { params: Record<string, string> }) {
  const sesiones = useVivo(listarSesiones, []);
  const e = ejercicio(params.id);
  if (!e) {
    return (
      <>
        <BarraDetalle padre="/gym/ejercicios" textoAtras="Ejercicios" />
        <div class="vacio">Este ejercicio no existe.</div>
      </>
    );
  }
  const hist = sesiones ? historialEjercicio(sesiones, e) : [];
  const mejor = hist.length ? hist.reduce((b, h) => (h.mejor > b.mejor ? h : b)) : null;
  const mejorSerie = mejor ? mejor.series.reduce((b, s) => (marca(e.tipo, s) > marca(e.tipo, b) ? s : b)) : null;
  const pesoMax = e.tipo === 'peso' && hist.length ? Math.max(...hist.flatMap((h) => h.series.map((s) => s.peso || 0))) : 0;
  const enCurso = sesiones?.find((s) => !s.fin);

  const anadirAlEntreno = async (s: SesionGym) => {
    const nuevo = nuevoEjercicioSesion(e.id, seriesIniciales(anterior(sesiones || [], e.id, s.inicio), 3));
    await guardarSesion({ ...s, ejercicios: [...s.ejercicios, nuevo] });
    mostrarToast('Añadido al entreno en curso');
    ir(`/gym/sesion/${s.id}`);
  };

  return (
    <>
      <BarraDetalle padre="/gym/ejercicios" textoAtras="Ejercicios" />
      <div class="pagina">
        <div class="gym-ficha-cab">
          <InsigniaGrupo grupo={e.grupo} t={52} />
          <div>
            <h1 class="titulo-guia">{e.nombre}</h1>
            <p class="ayuda">
              {nombreGrupo(e.grupo)}
              {e.secundarios.length ? ` (también ${e.secundarios.map((g) => nombreGrupo(g).toLowerCase()).join(', ')})` : ''} · {nombreEquipo(e.equipo)}
            </p>
          </div>
        </div>
        {e.consejo && (
          <div class="aviso-suave">
            <Icono n="info" t={18} />
            <span>{e.consejo}</span>
          </div>
        )}
        {enCurso && !enCurso.ejercicios.some((x) => x.ejercicioId === e.id) && (
          <button type="button" class="boton-principal" style={{ marginTop: '14px' }} onClick={() => anadirAlEntreno(enCurso)}>
            <Icono n="anadir" t={20} /> Añadir al entreno en curso
          </button>
        )}

        {hist.length ? (
          <>
            <dl class="rejilla-datos" style={{ marginTop: '18px' }}>
              <div>
                <dt>Mejor serie</dt>
                <dd>{mejorSerie ? textoSerie(e.tipo, mejorSerie) : '—'}</dd>
              </div>
              {e.tipo === 'peso' && (
                <div>
                  <dt>1RM estimado</dt>
                  <dd>{n1(mejor!.mejor)} kg</dd>
                </div>
              )}
              {e.tipo === 'peso' && (
                <div>
                  <dt>Peso máximo</dt>
                  <dd>{n1(pesoMax)} kg</dd>
                </div>
              )}
              <div>
                <dt>Veces hecho</dt>
                <dd>{hist.length}</dd>
              </div>
            </dl>
            {hist.length >= 2 && (
              <>
                <div class="tit-lista">{e.tipo === 'peso' ? 'Evolución del 1RM estimado' : 'Evolución de la mejor serie'}</div>
                <div class="lista bloque-grafico">
                  <LineaValores titulo="Evolución" unidad={e.tipo === 'peso' ? '' : ''} puntos={hist.slice(-20).map((h) => ({ etiqueta: fechaCorta(parse(h.fecha)), valor: h.mejor }))} />
                  {e.tipo === 'peso' && <p class="ayuda">1RM estimado con la fórmula de Epley (peso × (1 + reps / 30)) de tu mejor serie de cada día. Orientativo: con más de 12 repeticiones pierde precisión.</p>}
                </div>
              </>
            )}
            <div class="tit-lista">Historial</div>
            <div class="lista">
              {[...hist].reverse().map((h) => (
                <a class="item" href={`#/gym/sesion/${h.sesionId}`}>
                  <div class="item-txt">
                    <div class="item-tit">{fechaCorta(parse(h.fecha))}</div>
                    <div class="item-meta">{h.series.map((s) => textoSerie(e.tipo, s)).join(' · ')}</div>
                  </div>
                  {e.tipo === 'peso' && <span class="tag">{n1(Math.max(...h.series.map((s) => e1rm(s.peso, s.reps))))}</span>}
                </a>
              ))}
            </div>
          </>
        ) : (
          <p class="pie" style={{ marginTop: '18px' }}>
            Aún no lo has hecho. Cuando lo apuntes en un entreno verás aquí tu récord y tu evolución.
          </p>
        )}

        {e.propio && (
          <div class="lista separada">
            <button type="button" class="boton-fila" onClick={() => editarEjercicio(e)}>
              <Icono n="editar" t={22} /> Editar ejercicio
            </button>
            <button
              type="button"
              class="boton-fila peligro"
              onClick={async () => {
                if (await confirmar({ titulo: '¿Borrar el ejercicio?', texto: 'Los entrenos donde aparece se conservan.', ok: 'Borrar', peligro: true })) {
                  await borrarPropio(e.id);
                  ir('/gym/ejercicios', true);
                }
              }}
            >
              <Icono n="papelera" t={22} /> Borrar ejercicio
            </button>
          </div>
        )}
      </div>
    </>
  );
}
