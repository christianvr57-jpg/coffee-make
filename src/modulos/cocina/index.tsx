// Módulo COCINA: menú semanal familiar (2 adultos y un niño de 1 año) en 4 semanas de rotación,
// lista de la compra, recetas con adaptación para el niño y guía con fuentes.
import { aCsv } from '../../core/archivos';
import { addDays, DIAS, iso, lunesDe, parse } from '../../core/fechas';
import { diaActual } from '../../core/hoy';
import type { ModuloApp } from '../../core/modulos';
import { ir } from '../../core/router';
import { useVivo } from '../../core/vivo';
import { confirmar, mostrarToast } from '../../ui/capas';
import { Campo, FilaBoton, Lista, Segmentado } from '../../ui/form';
import { Icono } from '../../ui/Icono';
import { DESAYUNOS, MERIENDAS, SEMANAS } from './datos/menu';
import { RECETAS, receta } from './datos/recetas';
import { ajustesCocina, cambiarAjustesCocina, iniciarCocina, leerCambios, restablecerCambios } from './estado';
import { inicioParaSemana, listaCompra, planDia, planSemana, semanaDelCiclo } from './plan';
import { CATEGORIAS } from './tipos';
import { CompraCocina } from './vistas/Compra';
import { GuiaCocina } from './vistas/Guia';
import { HoyCocina } from './vistas/Hoy';
import { FichaRecetaCocina, RecetasCocina } from './vistas/Recetas';
import { SemanaCocina } from './vistas/Semana';

function WidgetCocina() {
  const cambios = useVivo(leerCambios, []);
  if (!cambios) return null;
  const p = planDia(parse(diaActual.value), ajustesCocina.value.inicio, cambios);
  return (
    <button type="button" class="widget tema-cocina" onClick={() => ir('/cocina')}>
      <div class="widget-cab">
        <Icono n="cocina" t={18} />
        <span>Cocina</span>
        <span class="widget-extra">Menú {p.semana + 1} de 4</span>
      </div>
      <div class="widget-menu">
        <div>
          <span class="wf-sobre">Comida</span>
          <b>{p.comida.nombre}</b>
        </div>
        <div>
          <span class="wf-sobre">Cena</span>
          <b>{p.cena.nombre}</b>
        </div>
        <div>
          <span class="wf-sobre">Niño · merienda</span>
          <span class="wm-nino">{p.merienda.texto}</span>
        </div>
      </div>
      {p.dia === 7 && <p class="widget-pie">Hoy toca el batch cooking de la semana.</p>}
    </button>
  );
}

function AjustesCocinaVista() {
  const hoy = parse(diaActual.value);
  const actual = semanaDelCiclo(hoy, ajustesCocina.value.inicio);
  return (
    <Lista titulo="Cocina" pie="Si el menú no va con la semana que te toca, elige aquí cuál es la de esta semana: el ciclo sigue desde ella.">
      <Campo et="Esta semana es la del menú" col>
        <Segmentado<number> opciones={[0, 1, 2, 3].map((n) => [n, `${n + 1}`] as [number, string])} valor={actual} cambiar={(n) => cambiarAjustesCocina({ inicio: inicioParaSemana(hoy, n) })} />
      </Campo>
      <FilaBoton
        icono="reiniciar"
        texto="Deshacer todos los cambios de platos"
        onClick={async () => {
          if (await confirmar({ titulo: '¿Deshacer los cambios de platos?', texto: 'Todos los días vuelven a su plato del menú.', ok: 'Deshacer', peligro: true })) {
            await restablecerCambios();
            mostrarToast('Menú original restablecido');
          }
        }}
      />
    </Lista>
  );
}

async function exportarCsv() {
  const menu = aCsv(
    ['Semana', 'Día', 'Comida (adultos)', 'Cena (adultos)', 'Niño: desayuno', 'Niño: comida', 'Niño: merienda', 'Niño: cena'],
    SEMANAS.flatMap((s) =>
      s.dias.map((d, i) => {
        const finde = i >= 5;
        return [
          s.numero, DIAS[i + 1], receta(d.comida)?.nombre, receta(d.cena)?.nombre, DESAYUNOS.find((x) => x.id === d.desayuno)?.texto || '',
          finde ? `${receta(d.comida)?.nombre} (adaptada)` : 'En el colegio', MERIENDAS.find((x) => x.id === d.merienda)?.texto, `${receta(d.cena)?.nombre} (adaptada)`,
        ];
      }),
    ),
  );
  const cambios = await leerCambios();
  const lunes = lunesDe(parse(diaActual.value));
  const compra = aCsv(
    ['Categoría', 'Artículo', 'Para'],
    listaCompra(planSemana(lunes, ajustesCocina.value.inicio, cambios)).map((a) => [CATEGORIAS.find(([c]) => c === a.c)?.[1], a.nombre, a.usos.join(', ')]),
  );
  return [
    { nombre: 'cocina-menu-4-semanas.csv', contenido: menu },
    { nombre: `cocina-compra-${iso(lunes)}.csv`, contenido: compra },
  ];
}

export const moduloCocina: ModuloApp = {
  id: 'cocina',
  nombre: 'Cocina',
  icono: 'cocina',
  tema: 'tema-cocina',
  rutaInicio: '/cocina',
  secciones: [
    { id: 'hoy', nombre: 'Hoy', ruta: '/cocina' },
    { id: 'semana', nombre: 'Semana', ruta: '/cocina/semana' },
    { id: 'compra', nombre: 'Compra', ruta: '/cocina/compra' },
    { id: 'recetas', nombre: 'Recetas', ruta: '/cocina/recetas' },
    { id: 'guia', nombre: 'Guía', ruta: '/cocina/guia' },
  ],
  rutas: [
    { patron: '/cocina', vista: HoyCocina },
    { patron: '/cocina/semana', vista: SemanaCocina },
    { patron: '/cocina/compra', vista: CompraCocina },
    { patron: '/cocina/recetas', vista: RecetasCocina },
    { patron: '/cocina/recetas/:id', vista: FichaRecetaCocina },
    { patron: '/cocina/guia', vista: GuiaCocina },
  ],
  widgetInicio: WidgetCocina,
  accionesRapidas: [{ nombre: 'Lista de la compra', icono: 'cocina', ruta: '/cocina/compra' }],
  ajustes: AjustesCocinaVista,
  iniciar: iniciarCocina,
  exportarCsv,
  async buscar(q) {
    const n = q.toLowerCase();
    const hoy = parse(diaActual.value);
    const proximos = Array.from({ length: 14 }, (_, i) => addDays(hoy, i));
    return RECETAS.filter((r) => `${r.nombre} ${r.ingredientes.map((x) => x.n).join(' ')}`.toLowerCase().includes(n))
      .slice(0, 20)
      .map((r) => {
        const cuando = proximos.find((d) => {
          const s = SEMANAS[semanaDelCiclo(d, ajustesCocina.value.inicio)].dias[(d.getDay() || 7) - 1];
          return s.comida === r.id || s.cena === r.id;
        });
        return { titulo: r.nombre, detalle: `Receta${cuando ? ` · toca el ${DIAS[cuando.getDay() || 7].toLowerCase()} ${cuando.getDate()}` : ''}`, ruta: `/cocina/recetas/${r.id}`, icono: 'cocina' };
      });
  },
};
