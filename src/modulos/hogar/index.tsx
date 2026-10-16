// Módulo HOGAR: rutina de la casa (coladas, diarias, semanales y periódicas).
import { addDays, parse } from '../../core/fechas';
import { diaActual } from '../../core/hoy';
import { ir } from '../../core/router';
import type { ModuloApp } from '../../core/modulos';
import { Icono } from '../../ui/Icono';
import { Anillo } from '../../ui/Anillo';
import { minutosATexto } from '../../core/fechas';
import { Campo, Interruptor, Lista, Segmentado, FilaBoton } from '../../ui/form';
import { confirmar, mostrarToast } from '../../ui/capas';
import { elementosDelDia, planDelDia, tipoSemana } from './calendario';
import { ajustesHogar, cambiarAjustesHogar, iniciarHogar, migrarLocalStorage, modelo, restablecerTareas, estaHecha } from './estado';
import { HoyHogar, resumenDia } from './vistas/Hoy';
import { SemanaHogar } from './vistas/Semana';
import { TareasHogar } from './vistas/Tareas';
import { lunesDe, iso } from '../../core/fechas';

function WidgetHogar() {
  const { total, hechas, resta, plan, items } = resumenDia();
  const pendientes = items.filter((i) => !estaHecha(i.clave)).slice(0, 3);
  const frac = total ? hechas / total : 0;
  return (
    <button type="button" class="widget tema-hogar" onClick={() => ir('/hogar')}>
      <div class="widget-cab">
        <Icono n="hogar" t={18} />
        <span>Hogar</span>
        <span class="widget-extra">Semana {plan.tipo}</span>
      </div>
      <div class="widget-hogar">
        <Anillo fraccion={frac} tam={64} grosor={8}>
          {Math.round(frac * 100)}
          <small>%</small>
        </Anillo>
        <div class="widget-txt">
          <b>{total && hechas === total ? '¡Día completado!' : `${hechas} de ${total} tareas`}</b>
          <span>{total && hechas < total ? `Te quedan ${minutosATexto(resta)}` : 'Todo hecho por hoy'}</span>
          {plan.coladas[0] && <span class="widget-linea">Colada: {plan.coladas[0].t.titulo}</span>}
        </div>
      </div>
      {pendientes.length > 0 && (
        <ul class="widget-lista">
          {pendientes.map((p) => (
            <li>{p.tipo === 'colada' ? `Colada: ${p.t.titulo}` : p.t.titulo}</li>
          ))}
        </ul>
      )}
    </button>
  );
}

/** Agenda de Inicio (ordenador): colada, tarea fija y periódicas del día, y cuántas tareas hay. */
function AgendaHogar({ fecha }: { fecha: string }) {
  const plan = planDelDia(modelo.value, ajustesHogar.value, parse(fecha));
  const items = elementosDelDia(plan);
  const hechas = items.filter((i) => estaHecha(i.clave)).length;
  const destacadas = [
    ...plan.coladas.map((c) => ({ clave: c.clave, sobre: 'Colada', titulo: c.t.titulo })),
    ...plan.grupos.fija.map((t) => ({ clave: t.clave, sobre: 'Tarea del día', titulo: t.t.titulo })),
    ...plan.periodicas.filter((p) => p.nueva).map((t) => ({ clave: t.clave, sobre: 'Periódica', titulo: t.t.titulo })),
  ];
  return (
    <>
      {destacadas.slice(0, 3).map((x) => (
        <a class={`ag-item${estaHecha(x.clave) ? ' hecho' : ''}`} href="#/hogar/semana">
          <small>{x.sobre}</small>
          <span>{x.titulo}</span>
        </a>
      ))}
      {items.length > 0 && (
        <span class="ag-resumen">
          {destacadas.length > 3 ? `y ${destacadas.length - 3} más · ` : ''}
          {hechas}/{items.length} tareas · {minutosATexto(items.reduce((s, i) => s + i.minutos, 0))}
        </span>
      )}
    </>
  );
}

function AjustesHogarVista() {
  const aj = ajustesHogar.value;
  const hoy = parse(diaActual.value);
  const actual = tipoSemana(hoy, aj);
  const siguiente = tipoSemana(addDays(hoy, 7), aj);
  const fijarTipo = (tipo: 'A' | 'B') =>
    cambiarAjustesHogar({ semanaAncla: aj.semanaAuto ? { lunes: iso(lunesDe(new Date())), tipo } : { ...aj.semanaAncla, tipo } });
  return (
    <>
      <Lista
        titulo="Hogar · Semana A / B"
        pie={
          aj.semanaAuto
            ? `La semana que viene será la ${siguiente}. Si no coincide con la realidad, cambia la de esta semana y el resto se ajusta solo.`
            : 'Con la alternancia desactivada, todas las semanas serán de este tipo.'
        }
      >
        <Campo et="Alternar automáticamente" sub="Cada lunes cambia entre A (sábanas) y B (blancos)">
          <Interruptor valor={aj.semanaAuto} cambiar={(v) => cambiarAjustesHogar({ semanaAuto: v })} />
        </Campo>
        <Campo et={aj.semanaAuto ? 'Esta semana es' : 'Semana fija'} col>
          <Segmentado<'A' | 'B'> opciones={[['A', 'A · Sábanas'], ['B', 'B · Blancos']]} valor={actual} cambiar={fijarTipo} />
        </Campo>
      </Lista>
      <Lista titulo="Hogar · Bebé">
        <Campo et="Cama baja del niño" sub="Activa el aspirado del suelo de su habitación cada dos días">
          <Interruptor valor={aj.camaBaja} cambiar={(v) => cambiarAjustesHogar({ camaBaja: v })} />
        </Campo>
      </Lista>
      <Lista titulo="Hogar · Rutina">
        <FilaBoton
          icono="reiniciar"
          texto="Restablecer tareas a la rutina original"
          onClick={async () => {
            if (await confirmar({ titulo: '¿Restablecer las tareas?', texto: 'Se deshacen tus ediciones, altas y bajas. El progreso y los ajustes se mantienen.', ok: 'Restablecer', peligro: true })) {
              await restablecerTareas();
              mostrarToast('Tareas restablecidas');
            }
          }}
        />
      </Lista>
    </>
  );
}

export const moduloHogar: ModuloApp = {
  id: 'hogar',
  nombre: 'Hogar',
  icono: 'hogar',
  tema: 'tema-hogar',
  rutaInicio: '/hogar',
  secciones: [
    { id: 'hoy', nombre: 'Hoy', ruta: '/hogar' },
    { id: 'semana', nombre: 'Semana', ruta: '/hogar/semana' },
    { id: 'tareas', nombre: 'Tareas', ruta: '/hogar/tareas' },
  ],
  rutas: [
    { patron: '/hogar', vista: HoyHogar },
    { patron: '/hogar/semana', vista: SemanaHogar },
    { patron: '/hogar/tareas', vista: TareasHogar },
  ],
  widgetInicio: WidgetHogar,
  agendaDia: AgendaHogar,
  accionesRapidas: [{ nombre: 'Tareas de hoy', icono: 'hogar', ruta: '/hogar' }],
  ajustes: AjustesHogarVista,
  async iniciar() {
    await iniciarHogar();
    await migrarLocalStorage();
  },
  async buscar(q) {
    const n = q.toLowerCase();
    const m = modelo.value;
    return [
      ...m.tareas.filter((t) => t.titulo.toLowerCase().includes(n) || t.notas?.toLowerCase().includes(n)).map((t) => ({ titulo: t.titulo, detalle: 'Tarea del hogar', ruta: '/hogar/tareas', icono: 'hogar' })),
      ...m.coladas.filter((c) => `${c.titulo} ${c.ropa.join(' ')}`.toLowerCase().includes(n)).map((c) => ({ titulo: `Colada: ${c.titulo}`, detalle: 'Hogar', ruta: '/hogar/tareas', icono: 'lavadora' })),
    ];
  },
};
