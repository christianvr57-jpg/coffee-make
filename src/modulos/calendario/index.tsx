// Módulo CALENDARIO: turnos de la pareja (L, M, T, N) en una esquina de cada día y notas o
// recordatorios por día (citas, cosas que recordar, planes), sin horarios.
import { aCsv } from '../../core/archivos';
import { addDays, iso, parse } from '../../core/fechas';
import { diaActual } from '../../core/hoy';
import type { ModuloApp } from '../../core/modulos';
import { ir } from '../../core/router';
import { useVivo } from '../../core/vivo';
import { FilaBoton, Lista } from '../../ui/form';
import { Icono } from '../../ui/Icono';
import { ajustesCalendario, iniciarCalendario, leerNotas, leerTurnos, nombreTurnos, todasLasNotas } from './estado';
import { cuandoEs, proximas } from './logica';
import { nombreTurno, tipoNota } from './tipos';
import { AjustesCalendarioPantalla } from './vistas/Ajustes';
import { ChipTurno, IconoNota, abrirDia, fechaLarga } from './vistas/comunes';
import { ListaCalendario } from './vistas/Lista';
import { MesCalendario } from './vistas/Mes';

function WidgetCalendario() {
  const hoy = diaActual.value;
  const manana = iso(addDays(parse(hoy), 1));
  const turnos = useVivo(() => leerTurnos(hoy, manana), [hoy]);
  const notas = useVivo(() => leerNotas(hoy, iso(addDays(parse(hoy), 6))), [hoy]);
  if (!turnos || !notas) return null;
  const prox = proximas(notas, hoy, 7).filter((n) => !n.hecha).slice(0, 4);
  const th = turnos.get(hoy);
  const tm = turnos.get(manana);
  return (
    <div class="widget tema-calendario">
      <button type="button" class="widget-cab" onClick={() => ir('/calendario')}>
        <Icono n="semana" t={18} />
        <span>Calendario</span>
        <Icono n="chevron" t={14} clase="chev" />
      </button>
      {(th || tm) && (
        <div class="widget-turnos">
          {th && (
            <span>
              <ChipTurno t={th} /> {nombreTurnos()} hoy: <b>{nombreTurno(th).toLowerCase()}</b>
            </span>
          )}
          {tm && (
            <span>
              <ChipTurno t={tm} /> Mañana: <b>{nombreTurno(tm).toLowerCase()}</b>
            </span>
          )}
        </div>
      )}
      {prox.length ? (
        <ul class="widget-notas">
          {prox.map((n) => (
            <li>
              <button type="button" onClick={() => abrirDia(n.fecha)}>
                <IconoNota tipo={n.tipo} t={14} />
                <span>{n.texto}</span>
                <small>{cuandoEs(n.fecha, hoy)}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p class="widget-pie">Nada apuntado esta semana. Toca un día del calendario para añadir una cita o un recordatorio.</p>
      )}
    </div>
  );
}

/** Agenda de Inicio (ordenador e iPad): turno y notas del día. */
function AgendaCalendario({ fecha }: { fecha: string }) {
  const turnos = useVivo(() => leerTurnos(fecha, fecha), [fecha]);
  const notas = useVivo(() => leerNotas(fecha, fecha), [fecha]);
  if (!turnos || !notas) return null;
  const t = turnos.get(fecha);
  return (
    <button type="button" class="ag-calendario" onClick={() => abrirDia(fecha)} title="Turno y notas del día">
      {t && (
        <span class="ag-turno">
          <ChipTurno t={t} /> {nombreTurno(t)}
        </span>
      )}
      {notas.slice(0, 3).map((n) => (
        <span class={`ag-nota n-${n.tipo}${n.hecha ? ' hecha' : ''}`}>{n.texto}</span>
      ))}
      {notas.length > 3 && <span class="ag-resumen">y {notas.length - 3} más</span>}
      {!t && !notas.length && <span class="ag-nada">+</span>}
    </button>
  );
}

function AjustesCalendarioVista() {
  return (
    <Lista titulo="Calendario">
      <FilaBoton icono="semana" texto="Turnos y patrón rotativo" detalle={ajustesCalendario.value.nombre || undefined} chevron onClick={() => ir('/calendario/ajustes')} />
    </Lista>
  );
}

async function exportarCsv() {
  const notas = (await todasLasNotas()).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const turnos = await leerTurnos('0000', '9999');
  return [
    { nombre: 'calendario-notas.csv', contenido: aCsv(['Fecha', 'Tipo', 'Nota', 'Hecha'], notas.map((n) => [n.fecha, tipoNota(n.tipo).nombre, n.texto, n.hecha ? 'sí' : ''])) },
    { nombre: 'calendario-turnos.csv', contenido: aCsv(['Fecha', 'Turno'], [...turnos.entries()].sort().map(([f, t]) => [f, nombreTurno(t)])) },
  ];
}

export const moduloCalendario: ModuloApp = {
  id: 'calendario',
  nombre: 'Calendario',
  icono: 'semana',
  tema: 'tema-calendario',
  rutaInicio: '/calendario',
  secciones: [
    { id: 'mes', nombre: 'Mes', ruta: '/calendario' },
    { id: 'notas', nombre: 'Notas', ruta: '/calendario/notas' },
  ],
  rutas: [
    { patron: '/calendario', vista: MesCalendario },
    { patron: '/calendario/notas', vista: ListaCalendario },
    { patron: '/calendario/ajustes', vista: AjustesCalendarioPantalla },
  ],
  widgetInicio: WidgetCalendario,
  agendaDia: AgendaCalendario,
  accionesRapidas: [{ nombre: 'Calendario', icono: 'semana', ruta: '/calendario' }],
  ajustes: AjustesCalendarioVista,
  iniciar: iniciarCalendario,
  exportarCsv,
  async buscar(q) {
    const n = q.toLowerCase();
    const hoy = diaActual.value;
    return (await todasLasNotas())
      .filter((x) => x.texto.toLowerCase().includes(n))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .slice(0, 20)
      .map((x) => ({ titulo: x.texto, detalle: `${tipoNota(x.tipo).nombre} · ${fechaLarga(x.fecha)} (${cuandoEs(x.fecha, hoy)})`, ruta: '/calendario/notas', icono: 'semana' }));
  },
};
