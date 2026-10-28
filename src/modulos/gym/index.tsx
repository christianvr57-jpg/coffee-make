// Módulo GYM: entrenos con kg y repeticiones (o tiempo y cardio), catálogo amplio de ejercicios con
// y sin peso, rutinas propias y plantillas, descanso automático, récords y progreso.
import { aCsv } from '../../core/archivos';
import { fechaRelativa, minutosATexto, parse } from '../../core/fechas';
import { diaActual } from '../../core/hoy';
import type { ModuloApp } from '../../core/modulos';
import { ir } from '../../core/router';
import { useVivo } from '../../core/vivo';
import { Campo, FilaBoton, Interruptor, Lista, Selector } from '../../ui/form';
import { Icono } from '../../ui/Icono';
import { duracionMin, porSemana, seriesHechas, textoSerie, volumenSesion } from './calculos';
import { ajustesGym, cambiarAjustesGym, catalogo, ejercicio, iniciarGym, listarSesiones, nombreEjercicio } from './estado';
import { nombreEquipo, nombreGrupo } from './tipos';
import { EjerciciosGym, FichaEjercicioGym } from './vistas/Ejercicios';
import { EntrenarGym } from './vistas/Entrenar';
import { HistorialGym, ProgresoGym } from './vistas/Progreso';
import { SesionGymVista } from './vistas/Sesion';

const kg = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kg`;

function WidgetGym() {
  const sesiones = useVivo(listarSesiones, []);
  if (!sesiones) return null;
  const enCurso = sesiones.find((s) => !s.fin);
  const semana = porSemana(sesiones, parse(diaActual.value), 1)[0];
  const ultima = sesiones.find((s) => s.fin);
  return (
    <div class="widget tema-gym">
      <button type="button" class="widget-cab" onClick={() => ir('/gym')}>
        <Icono n="pesa" t={18} />
        <span>Gym</span>
        <span class="widget-extra">
          {semana.sesiones} {semana.sesiones === 1 ? 'entreno' : 'entrenos'} esta semana
        </span>
      </button>
      {enCurso ? (
        <button type="button" class="boton-principal" onClick={() => ir(`/gym/sesion/${enCurso.id}`)}>
          <Icono n="play" t={20} /> Seguir con «{enCurso.nombre}» · {minutosATexto(duracionMin(enCurso))}
        </button>
      ) : (
        <button type="button" class="boton-secundario" onClick={() => ir('/gym')}>
          <Icono n="play" t={20} /> Empezar entreno
        </button>
      )}
      {ultima && (
        <a class="widget-fila" href={`#/gym/sesion/${ultima.id}`}>
          <div>
            <span class="wf-sobre">Último · {fechaRelativa(ultima.fecha).toLowerCase()}</span>
            <b>{ultima.nombre}</b>
            <span class="wf-meta">
              {seriesHechas(ultima)} series · {kg(volumenSesion(ultima))} · {minutosATexto(duracionMin(ultima))}
            </span>
          </div>
        </a>
      )}
    </div>
  );
}

/** Agenda de Inicio (ordenador e iPad): entrenos de ese día. */
function AgendaGym({ fecha }: { fecha: string }) {
  const sesiones = useVivo(listarSesiones, []);
  const del = (sesiones || []).filter((s) => s.fecha === fecha);
  if (!del.length) return null;
  return (
    <>
      {del.map((s) => (
        <a class={`ag-item${s.fin ? ' hecho-gym' : ''}`} href={`#/gym/sesion/${s.id}`}>
          <small>{s.fin ? `${seriesHechas(s)} series` : 'En curso'}</small>
          <span>{s.nombre}</span>
        </a>
      ))}
    </>
  );
}

function AjustesGymVista() {
  const aj = ajustesGym.value;
  return (
    <Lista titulo="Gym" pie="El descanso empieza solo al marcar una serie como hecha.">
      <Campo et="Descanso entre series">
        <Selector<number> opciones={[[0, 'Sin temporizador'], [45, '45 s'], [60, '1 min'], [90, '1 min 30 s'], [120, '2 min'], [150, '2 min 30 s'], [180, '3 min'], [240, '4 min']]} valor={aj.descanso} cambiar={(v) => cambiarAjustesGym({ descanso: v })} />
      </Campo>
      <Campo et="Pitido al acabar el descanso">
        <Interruptor valor={aj.sonido} cambiar={(v) => cambiarAjustesGym({ sonido: v })} etiqueta="Pitido al acabar el descanso" />
      </Campo>
      <FilaBoton icono="pesa" texto="Catálogo de ejercicios" detalle={`${catalogo().length}`} chevron onClick={() => ir('/gym/ejercicios')} />
    </Lista>
  );
}

async function exportarCsv() {
  const sesiones = (await listarSesiones()).slice().reverse();
  const filas: (string | number | undefined)[][] = [];
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      const def = ejercicio(e.ejercicioId);
      e.series.forEach((x, i) => {
        if (!x.hecha) return;
        filas.push([s.fecha, s.nombre, nombreEjercicio(e.ejercicioId), i + 1, x.tipo || 'normal', x.peso, x.reps, x.segundos, x.minutos, x.km, def ? textoSerie(def.tipo, x) : '']);
      });
    }
  }
  return [{ nombre: 'gym-series.csv', contenido: aCsv(['Fecha', 'Entreno', 'Ejercicio', 'Serie', 'Tipo', 'Kg', 'Reps', 'Segundos', 'Minutos', 'Km', 'Resumen'], filas) }];
}

export const moduloGym: ModuloApp = {
  id: 'gym',
  nombre: 'Gym',
  icono: 'pesa',
  tema: 'tema-gym',
  rutaInicio: '/gym',
  secciones: [
    { id: 'entrenar', nombre: 'Entrenar', ruta: '/gym' },
    { id: 'historial', nombre: 'Historial', ruta: '/gym/historial' },
    { id: 'ejercicios', nombre: 'Ejercicios', ruta: '/gym/ejercicios' },
    { id: 'progreso', nombre: 'Progreso', ruta: '/gym/progreso' },
  ],
  rutas: [
    { patron: '/gym', vista: EntrenarGym },
    { patron: '/gym/historial', vista: HistorialGym },
    { patron: '/gym/ejercicios', vista: EjerciciosGym },
    { patron: '/gym/ejercicios/:id', vista: FichaEjercicioGym },
    { patron: '/gym/progreso', vista: ProgresoGym },
    { patron: '/gym/sesion/:id', vista: SesionGymVista },
  ],
  widgetInicio: WidgetGym,
  agendaDia: AgendaGym,
  accionesRapidas: [{ nombre: 'Empezar entreno', icono: 'pesa', ruta: '/gym' }],
  ajustes: AjustesGymVista,
  iniciar: iniciarGym,
  exportarCsv,
  async buscar(q) {
    const n = q.toLowerCase();
    const ejs = catalogo()
      .filter((e) => e.nombre.toLowerCase().includes(n))
      .slice(0, 15)
      .map((e) => ({ titulo: e.nombre, detalle: `Gym · ${nombreGrupo(e.grupo)} · ${nombreEquipo(e.equipo)}`, ruta: `/gym/ejercicios/${e.id}`, icono: 'pesa' }));
    const ses = (await listarSesiones())
      .filter((s) => `${s.nombre} ${s.notas || ''}`.toLowerCase().includes(n))
      .slice(0, 10)
      .map((s) => ({ titulo: s.nombre, detalle: `Gym · entreno · ${fechaRelativa(s.fecha)}`, ruta: `/gym/sesion/${s.id}`, icono: 'pesa' }));
    return [...ejs, ...ses];
  },
};
