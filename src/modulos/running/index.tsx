// Módulo RUNNING: entrenador de 10K. Plan semanal del entrenador (cargado en el dispositivo),
// registro de sesiones con carga y molestias, zonas de ritmo y FC, auditoría inicial y guía.
import { aCsv } from '../../core/archivos';
import { diaActual } from '../../core/hoy';
import type { ModuloApp } from '../../core/modulos';
import { ir } from '../../core/router';
import { FilaBoton, Lista } from '../../ui/form';
import { Icono } from '../../ui/Icono';
import { cargaSesion, formatoRitmo, ritmoMedio } from './calculos';
import { BIBLIOTECA } from './datos/guia';
import { iniciarRunning, listarRegistros, plan, sesionHecha } from './estado';
import { MOLESTIAS, esCarrera, nombreTipo } from './tipos';
import { AuditoriaRunning } from './vistas/Auditoria';
import { metaSesion } from './vistas/comunes';
import { EntrenadorRunning } from './vistas/Entrenador';
import { GuiaRunning } from './vistas/Guia';
import { PlanRunning } from './vistas/Plan';
import { RegistroRunning } from './vistas/Registro';
import { ZonasRunning } from './vistas/Zonas';

/** Sesiones del plan para una fecha. */
export function sesionesDelDia(fecha: string) {
  for (const s of plan.value?.plan?.semanas || []) for (const d of s.dias) if (d.fecha === fecha) return d.sesiones;
  return [];
}

function WidgetRunning() {
  const hoy = diaActual.value;
  const ses = sesionesDelDia(hoy);
  return (
    <button type="button" class="widget tema-running" onClick={() => ir('/running')}>
      <div class="widget-cab">
        <Icono n="running" t={18} />
        <span>Running</span>
        <Icono n="chevron" t={14} clase="chev" />
      </div>
      {!plan.value ? (
        <p class="widget-pie">Carga el plan de tu entrenador para ver aquí la sesión de cada día.</p>
      ) : ses.length ? (
        <div class="widget-menu">
          {ses.map((s) => (
            <div>
              <span class="wf-sobre">{sesionHecha(s.id) ? 'Hecha ✓' : 'Hoy'}</span>
              <b>{s.titulo}</b>
              <span class="wm-nino">{metaSesion(s)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p class="widget-pie">Hoy no hay sesión en el plan.</p>
      )}
    </button>
  );
}

function AjustesRunningVista() {
  const p = plan.value;
  return (
    <Lista titulo="Running">
      <FilaBoton icono="running" texto="Plan del entrenador" detalle={p ? `${p.plan?.semanas?.length || 0} semanas` : 'Sin cargar'} chevron onClick={() => ir('/running/entrenador')} />
    </Lista>
  );
}

async function exportarCsv() {
  const regs = await listarRegistros();
  return [
    {
      nombre: 'running-sesiones.csv',
      contenido: aCsv(
        ['Fecha', 'Tipo', 'Sesión', 'Minutos', 'Km', 'Ritmo (min/km)', 'FC media', 'RPE', 'Carga (min×RPE)', 'Sueño (h)', 'Calidad sueño', ...MOLESTIAS.map(([, n]) => `${n} (0-10)`), 'Notas'],
        regs.map((r) => {
          const rit = ritmoMedio(r);
          return [
            r.fecha, nombreTipo(r.tipo), r.titulo, r.minutos, r.km, rit && esCarrera(r.tipo) ? formatoRitmo(rit) : '', r.fc, r.rpe, cargaSesion(r) || '', r.sueno, r.calidad,
            ...MOLESTIAS.map(([k]) => r[k]), r.notas,
          ];
        }),
      ),
    },
  ];
}

export const moduloRunning: ModuloApp = {
  id: 'running',
  nombre: 'Running',
  icono: 'running',
  tema: 'tema-running',
  rutaInicio: '/running',
  secciones: [
    { id: 'plan', nombre: 'Plan', ruta: '/running' },
    { id: 'registro', nombre: 'Registro', ruta: '/running/registro' },
    { id: 'zonas', nombre: 'Zonas', ruta: '/running/zonas' },
    { id: 'auditoria', nombre: 'Auditoría', ruta: '/running/auditoria' },
    { id: 'guia', nombre: 'Guía', ruta: '/running/guia' },
  ],
  rutas: [
    { patron: '/running', vista: PlanRunning },
    { patron: '/running/registro', vista: RegistroRunning },
    { patron: '/running/zonas', vista: ZonasRunning },
    { patron: '/running/auditoria', vista: AuditoriaRunning },
    { patron: '/running/guia', vista: GuiaRunning },
    { patron: '/running/entrenador', vista: EntrenadorRunning },
  ],
  widgetInicio: WidgetRunning,
  accionesRapidas: [{ nombre: 'Registrar entreno', icono: 'running', ruta: '/running/registro' }],
  ajustes: AjustesRunningVista,
  iniciar: iniciarRunning,
  exportarCsv,
  async buscar(q) {
    const n = q.toLowerCase();
    const delPlan = (plan.value?.plan?.semanas || []).flatMap((s) => s.dias.flatMap((d) => d.sesiones.map((x) => ({ ...x, fecha: d.fecha }))));
    return [
      ...delPlan.filter((s) => s.titulo.toLowerCase().includes(n)).slice(0, 10).map((s) => ({ titulo: s.titulo, detalle: `Running · plan · ${s.fecha}`, ruta: '/running', icono: 'running' })),
      ...BIBLIOTECA.filter((s) => s.titulo.toLowerCase().includes(n)).map((s) => ({ titulo: s.titulo, detalle: 'Running · guía', ruta: '/running/guia', icono: 'running' })),
    ];
  },
};
