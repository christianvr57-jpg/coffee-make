// Módulo CAFÉ: registro de preparaciones, temporizador, biblioteca de cafés y equipo.
import { aCsv } from '../../core/archivos';
import { fechaRelativa, iso, segundosATexto } from '../../core/fechas';
import type { ModuloApp } from '../../core/modulos';
import { ir } from '../../core/router';
import { useVivo } from '../../core/vivo';
import { confirmar, mostrarToast } from '../../ui/capas';
import { Campo, FilaBoton, Interruptor, Lista, fmt } from '../../ui/form';
import { Icono } from '../../ui/Icono';
import { estadoReposo, congelado, extraccion, ratio, textoRatio } from './calculos';
import { metodo } from './datos/metodos';
import { ajustesCafe, borrarDemo, cambiarAjustesCafe, cargarDemo, hayDemo, iniciarCafe, listarAguas, listarCafes, listarEquipo, listarPreparaciones } from './repositorio';
import { Cafes, FichaCafe } from './vistas/Cafes';
import { DetallePrep } from './vistas/DetallePrep';
import { Diario } from './vistas/Diario';
import { EquipoVista } from './vistas/Equipo';
import { Preparar, nuevaPreparacion } from './vistas/Preparar';
import { Resultado } from './vistas/Resultado';
import { Temporizador } from './vistas/Temporizador';
import { CataVista } from './vistas/Cata';
import { nombreSabor } from './datos/rueda';
import { DEFECTOS } from './datos/cata';
import { Nota, resumenPrep } from './vistas/comunes';

function WidgetCafe() {
  const preps = useVivo(listarPreparaciones, []) || [];
  const cafes = useVivo(listarCafes, []) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const ultima = preps[0];
  const enPunto = cafes.filter((c) => !c.terminado && !congelado(c) && (['filtro', 'espresso'] as const).some((u) => estadoReposo(c, u).estado === 'optimo'));
  return (
    <div class="widget tema-cafe">
      <button type="button" class="widget-cab" onClick={() => ir('/cafe')}>
        <Icono n="cafe" t={18} />
        <span>Café</span>
        <Icono n="chevron" t={14} clase="chev" />
      </button>
      <button type="button" class="boton-principal" onClick={() => nuevaPreparacion()}>
        <Icono n="cafe" t={20} /> Preparar café
      </button>
      {ultima && (
        <a class="widget-fila" href={`#/cafe/p/${ultima.id}`}>
          <div>
            <span class="wf-sobre">Última · {fechaRelativa(ultima.fecha).toLowerCase()}</span>
            <b>
              {metodo(ultima.metodo).nombre} · {ultima.cafeNombre || 'Sin registrar'}
            </b>
            <span class="wf-meta">{resumenPrep(ultima, equipo)}</span>
          </div>
          <Nota p={ultima.puntuacion} />
        </a>
      )}
      {enPunto.length > 0 && <p class="widget-pie">En su punto: {enPunto.map((c) => c.nombre).join(', ')}</p>}
    </div>
  );
}

function AjustesCafeVista() {
  const aj = ajustesCafe.value;
  const demo = useVivo(hayDemo, []);
  return (
    <>
      <Lista titulo="Café · Temporizador">
        <Campo et="Avisos sonoros" sub="Pitido en la cuenta atrás y al cambiar de fase. Con el iPhone en silencio puede no sonar.">
          <Interruptor valor={aj.sonido} cambiar={(v) => cambiarAjustesCafe({ sonido: v })} />
        </Campo>
        <Campo et="Mantener la pantalla encendida" sub="Mientras el temporizador está en marcha (iOS 18.4 o posterior)">
          <Interruptor valor={aj.pantallaEncendida} cambiar={(v) => cambiarAjustesCafe({ pantallaEncendida: v })} />
        </Campo>
      </Lista>
      <Lista titulo="Café · Equipo y datos">
        <FilaBoton icono="equipo" texto="Equipo y aguas" chevron onClick={() => ir('/cafe/equipo')} />
        {demo ? (
          <FilaBoton
            icono="papelera"
            texto="Borrar datos de ejemplo"
            peligro
            onClick={async () => {
              if (await confirmar({ titulo: '¿Borrar los datos de ejemplo?', ok: 'Borrar', peligro: true })) {
                await borrarDemo();
                mostrarToast('Datos de ejemplo borrados');
              }
            }}
          />
        ) : (
          <FilaBoton icono="reiniciar" texto="Volver a cargar los datos de ejemplo" onClick={async () => (await cargarDemo(), mostrarToast('Datos de ejemplo cargados'))} />
        )}
      </Lista>
    </>
  );
}

async function exportarCsv() {
  const [preps, cafes, equipo, aguas] = await Promise.all([listarPreparaciones(), listarCafes(), listarEquipo(), listarAguas()]);
  const nombre = (id?: string) => equipo.find((e) => e.id === id)?.nombre;
  const fp = aCsv(
    ['Fecha', 'Hora', 'Café', 'Método', 'Dosis (g)', 'Agua (g)', 'Salida/bebida (g)', 'Ratio', 'Molino', 'Molienda', 'Temperatura (°C)', 'Tiempo', 'Primera gota (s)', 'Preinfusión (s)', 'Presión (bar)', 'Agua', 'Filtro', 'Días de reposo', 'TDS (%)', 'Extracción (%)', 'Puntuación', 'Sensaciones', 'Sabores', 'Defectos', 'Bebida', 'Notas'],
    preps.map((p) => {
      const d = new Date(p.fecha);
      const ey = extraccion(p);
      return [
        iso(d), `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`, p.cafeNombre, metodo(p.metodo).nombre, p.dosis, p.agua, p.rendimiento, textoRatio(ratio(p)),
        nombre(p.molinoId), p.molienda, p.temperatura, p.tiempoTotal ? segundosATexto(p.tiempoTotal) : '', p.primeraGota, p.preinfusion, p.presion,
        aguas.find((a) => a.id === p.aguaId)?.nombre, p.filtro, p.diasReposo, p.tds, ey !== undefined ? Math.round(ey * 10) / 10 : undefined, p.puntuacion,
        (p.sintomas || []).join(', '), (p.cata?.sabores || []).map(nombreSabor).join(', '), (p.cata?.defectos || []).map((d) => DEFECTOS.find((x) => x.id === d)?.nombre || d).join(', '), p.bebida ? `${p.bebida.tipo} ${p.bebida.leche || ''} ${p.bebida.ml || ''}`.trim() : '', p.notas,
      ];
    }),
  );
  const fc = aCsv(
    ['Nombre', 'Tostador', 'País', 'Región', 'Productor', 'Altitud mín.', 'Altitud máx.', 'Variedades', 'Procesos', 'Tueste', 'Uso', 'Fecha de tueste', 'Fecha de apertura', 'Peso (g)', 'Precio (€)', 'Notas del tostador', 'Terminado'],
    cafes.map((c) => [c.nombre, c.tostador, c.pais, c.region, c.productor, c.altitudMin, c.altitudMax, c.variedades.join(', '), c.procesos.join(', '), c.tueste, c.uso, c.fechaTueste, c.fechaApertura, c.pesoG, c.precio, c.notasTostador.join(', '), c.terminado ? 'sí' : 'no']),
  );
  return [
    { nombre: 'cafe-preparaciones.csv', contenido: fp },
    { nombre: 'cafe-cafes.csv', contenido: fc },
  ];
}

export const moduloCafe: ModuloApp = {
  id: 'cafe',
  nombre: 'Café',
  icono: 'cafe',
  tema: 'tema-cafe',
  rutaInicio: '/cafe',
  secciones: [
    { id: 'diario', nombre: 'Diario', ruta: '/cafe' },
    { id: 'cafes', nombre: 'Cafés', ruta: '/cafe/cafes' },
    { id: 'equipo', nombre: 'Equipo', ruta: '/cafe/equipo' },
  ],
  rutas: [
    { patron: '/cafe', vista: Diario },
    { patron: '/cafe/cafes', vista: Cafes },
    { patron: '/cafe/equipo', vista: EquipoVista },
    { patron: '/cafe/cafes/:id', vista: FichaCafe },
    { patron: '/cafe/preparar', vista: Preparar },
    { patron: '/cafe/preparar/temporizador', vista: Temporizador, pantallaCompleta: true },
    { patron: '/cafe/preparar/resultado', vista: Resultado },
    { patron: '/cafe/p/:id', vista: DetallePrep },
    { patron: '/cafe/p/:id/cata', vista: CataVista },
  ],
  widgetInicio: WidgetCafe,
  accionesRapidas: [{ nombre: 'Preparar café', icono: 'cafe', ruta: '/cafe/preparar' }],
  ajustes: AjustesCafeVista,
  iniciar: iniciarCafe,
  exportarCsv,
  async buscar(q) {
    const n = q.toLowerCase();
    const [cafes, preps] = await Promise.all([listarCafes(), listarPreparaciones()]);
    return [
      ...cafes
        .filter((c) => [c.nombre, c.tostador, c.pais, c.region, c.productor, ...c.variedades, ...c.procesos, ...c.notasTostador].join(' ').toLowerCase().includes(n))
        .map((c) => ({ titulo: c.nombre, detalle: `Café · ${c.tostador}`, ruta: `/cafe/cafes/${c.id}`, icono: 'grano' })),
      ...preps
        .filter((p) => `${p.cafeNombre} ${metodo(p.metodo).nombre} ${p.notas || ''} ${(p.cata?.sabores || []).map(nombreSabor).join(' ')}`.toLowerCase().includes(n))
        .slice(0, 20)
        .map((p) => ({ titulo: `${metodo(p.metodo).nombre} · ${p.cafeNombre || 'Sin registrar'}`, detalle: `${fechaRelativa(p.fecha)}${p.puntuacion !== undefined ? ` · ${fmt(p.puntuacion)}/10` : ''}`, ruta: `/cafe/p/${p.id}`, icono: metodo(p.metodo).icono })),
    ];
  },
};
