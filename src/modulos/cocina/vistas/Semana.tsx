// COCINA · Semana: los 7 días con sus platos, el batch cooking y el equilibrio de la semana.
import { signal } from '@preact/signals';
import type { JSX } from 'preact';
import { addDays, DIAS, DIAS_CORTOS, fechaCorta, iso, lunesDe, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { escritorio } from '../../../core/pantalla';
import { Hoja, abrirHoja } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { useFlechas } from '../../../ui/teclado';
import { SEMANAS } from '../datos/menu';
import { receta } from '../datos/recetas';
import { ajustesCocina } from '../estado';
import { efectiva, equilibrio, planDia, planSemana, type PlanDia } from '../plan';
import { PROTEINAS, type Momento, type Receta } from '../tipos';
import { ComidasNino, MarcaGusto, TarjetaPlato, elegirCambio, fechaLarga, useCambios } from './comunes';
import { Lote } from './Hoy';

type Criterio = ReturnType<typeof equilibrio>[number];

/** Semanas de desplazamiento respecto a la actual. */
export const desplazamiento = signal(0);

function DiaDetalle({ fecha, cerrar }: { fecha: string; cerrar: () => void }) {
  const cambios = useCambios();
  if (!cambios) return null;
  const p = planDia(parse(fecha), ajustesCocina.value.inicio, cambios, ajustesCocina.value.ciclo);
  return (
    <Hoja titulo={fechaLarga(fecha)} cerrar={cerrar}>
      <div class="tit-lista">Adultos</div>
      <TarjetaPlato p={p} momento="comida" />
      <TarjetaPlato p={p} momento="cena" />
      <p class="pie">Postre: {p.postre}</p>
      <div class="tit-lista">El niño</div>
      <ComidasNino p={p} />
    </Hoja>
  );
}

function FilaDia({ p, hoy }: { p: PlanDia; hoy: string }) {
  const d = parse(p.fecha);
  return (
    <button type="button" class={`dia-cocina${p.fecha === hoy ? ' hoy' : ''}`} onClick={() => abrirHoja((cerrar) => <DiaDetalle fecha={p.fecha} cerrar={cerrar} />)}>
      <span class="dc-fecha">
        <b>{DIAS_CORTOS[p.dia]}</b>
        <span>{d.getDate()}</span>
      </span>
      <span class="dc-platos">
        <span>
          <em>Comida</em> {p.comida.nombre}
          {p.comidaCambiada && ' ✎'}
        </span>
        <span>
          <em>Cena</em> {p.cena.nombre}
          {p.cenaCambiada && ' ✎'}
        </span>
        <span class="dc-nino">
          <em>Niño</em> {p.desayuno ? `${p.desayuno.texto.split(' con ')[0]} · ` : ''}
          {p.merienda.texto.split(' y ')[0]}
        </span>
      </span>
      <Icono n="chevron" t={16} clase="chev" />
    </button>
  );
}

function Equilibrio({ crit }: { crit: Criterio[] }) {
  return (
    <div class="lista equilibrio">
      {crit.map((c) => (
        <div class={`eq-fila${c.ok ? '' : ' mal'}`}>
          <Icono n={c.ok ? 'check' : 'aviso'} t={16} />
          <span class="eq-nombre">{c.nombre}</span>
          <span class="eq-valor">
            {c.nombre === 'Verdura en cada comida y cena' ? (c.ok ? 'sí' : 'no') : c.nombre === 'Platos sin repetir' ? (c.ok ? 'sí' : 'no') : c.valor}
            <small> · {c.objetivo}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------- Ordenador: la semana como calendario y el ciclo completo ----------

function CeldaPlato({ p, momento }: { p: PlanDia; momento: Momento }) {
  const r = momento === 'comida' ? p.comida : p.cena;
  const cambiada = momento === 'comida' ? p.comidaCambiada : p.cenaCambiada;
  const sustituida = momento === 'comida' ? p.comidaSustituida : p.cenaSustituida;
  return (
    <div class="cs-plato">
      <a href={`#/cocina/recetas/${r.id}?m=${momento}`} title="Ver la receta">
        <b>{r.nombre}</b>
        <span class="cs-meta">
          <span class={`chip-proteina p-${r.proteina}`}>{PROTEINAS[r.proteina]}</span>
          <span>{r.minutos} min</span>
          {cambiada && <em>cambiado</em>}
          {sustituida && <em>sustituido</em>}
          <MarcaGusto id={r.id} />
        </span>
      </a>
      <button type="button" class="cs-cambiar" title={`Cambiar la ${momento} de este día`} aria-label={`Cambiar la ${momento}`} onClick={() => elegirCambio(p.fecha, momento, r, p.finde, cambiada, momento === 'comida' ? p.base.comida : p.base.cena)}>
        <Icono n="repetir" t={15} />
      </button>
    </div>
  );
}

function CeldaNino({ p }: { p: PlanDia }) {
  const filas: [string, string][] = [];
  if (p.desayuno) filas.push(['Desayuno', p.desayuno.texto]);
  filas.push(['Comida', p.finde ? 'La de los adultos, adaptada' : 'En el colegio']);
  filas.push(['Merienda', p.merienda.texto]);
  filas.push(['Cena', 'La de los adultos, adaptada']);
  return (
    <button type="button" class="cs-nino" title="Ver raciones y adaptación del niño" onClick={() => abrirHoja((cerrar) => <DiaDetalle fecha={p.fecha} cerrar={cerrar} />)}>
      {filas.map(([t, x]) => (
        <span>
          <small>{t}</small> {x}
        </span>
      ))}
    </button>
  );
}

/** Las semanas del ciclo de un vistazo (menú base, sin los cambios de días concretos). */
function CicloCompleto({ actual }: { actual: number }) {
  const ciclo = ajustesCocina.value.ciclo;
  const Plato = ({ id, m }: { id: string; m: Momento }) => {
    const r = receta(efectiva(id)) as Receta;
    return (
      <a class={`cc-plato p-${r.proteina}`} href={`#/cocina/recetas/${r.id}?m=${m}`} title={`${m === 'comida' ? 'Comida' : 'Cena'} · ${PROTEINAS[r.proteina]}`}>
        {r.nombre}
      </a>
    );
  };
  return (
    <>
      <div class="tit-lista">Todo el menú · {ciclo} semanas en rotación</div>
      <div class="tabla-marco">
        <table class="tabla ciclo-completo">
          <thead>
            <tr>
              <th>Sem.</th>
              {DIAS.slice(1).map((d) => (
                <th>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEMANAS.slice(0, ciclo).map((s, i) => (
              <tr class={i === actual ? 'actual' : ''}>
                <td class="cc-num">
                  <b>{s.numero}</b>
                  {i === actual && <small>ahora</small>}
                </td>
                {s.dias.map((d) => (
                  <td>
                    <Plato id={d.comida} m="comida" />
                    <Plato id={d.cena} m="cena" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="pie">
        En cada día, arriba la comida y abajo la cena. El color es la proteína principal:{' '}
        {Object.entries(PROTEINAS).map(([k, n], i) => (
          <>
            {i > 0 && ' · '}
            <span class={`cc-leyenda p-${k}`}>{n.toLowerCase()}</span>
          </>
        ))}
        . Incluye los platos sustituidos para siempre; los cambios de un día concreto se ven en la semana de arriba.
      </p>
    </>
  );
}

function SemanaEscritorio({ dias, lunes, hoy, crit, etiqueta }: { dias: PlanDia[]; lunes: Date; hoy: string; crit: Criterio[]; etiqueta: string }) {
  const filas: [string, (p: PlanDia) => JSX.Element][] = [
    ['Comida', (p) => <CeldaPlato p={p} momento="comida" />],
    ['Cena', (p) => <CeldaPlato p={p} momento="cena" />],
    ['El niño', (p) => <CeldaNino p={p} />],
    ['Postre', (p) => <span class="cs-postre">{p.postre.split(':')[0].replace(/\s*\(.*\)/, '').replace(/\.$/, '')}</span>],
  ];
  return (
    <>
      <div class="navegador-semana escritorio-nav">
        <button type="button" class="btn-icono" aria-label="Semana anterior" title="Semana anterior (←)" onClick={() => desplazamiento.value--}>
          <Icono n="chevronIzq" t={20} />
        </button>
        <div>
          <b>{etiqueta}</b>
          <span>
            {fechaCorta(lunes)} – {fechaCorta(addDays(lunes, 6))} · semana {dias[0].semana + 1} de {ajustesCocina.value.ciclo} del menú
          </span>
        </div>
        {desplazamiento.value !== 0 && (
          <button type="button" class="btn-texto" onClick={() => (desplazamiento.value = 0)}>
            Hoy
          </button>
        )}
        <button type="button" class="btn-icono" aria-label="Semana siguiente" title="Semana siguiente (→)" onClick={() => desplazamiento.value++}>
          <Icono n="chevron" t={20} />
        </button>
      </div>

      <div class="calendario-semana">
        <div class="cs-esquina" />
        {dias.map((p) => {
          const d = parse(p.fecha);
          return (
            <div class={`cs-dia${p.fecha === hoy ? ' hoy' : ''}`}>
              <b>{DIAS_CORTOS[p.dia]}</b>
              <span>{d.getDate()}</span>
            </div>
          );
        })}
        {filas.map(([t, celda]) => (
          <>
            <div class="cs-fila-tit">{t}</div>
            {dias.map((p) => (
              <div class={`cs-celda${p.fecha === hoy ? ' hoy' : ''}`}>{celda(p)}</div>
            ))}
          </>
        ))}
      </div>
      <p class="pie">Pulsa un plato para ver la receta, el icono de las flechas para cambiarlo ese día y la fila del niño para ver sus raciones. Con las flechas del teclado cambias de semana.</p>

      <div class="columnas">
        <div>
          <Lote semana={dias[0].semana} titulo="Preparación anticipada (el domingo anterior)" />
        </div>
        <div>
          <div class="tit-lista">Equilibrio de la semana</div>
          <Equilibrio crit={crit} />
          <p class="pie">
            <a class="enlace" href={`#/cocina/compra?lunes=${iso(lunes)}`}>
              Lista de la compra de esta semana →
            </a>
          </p>
        </div>
      </div>

      <CicloCompleto actual={dias[0].semana} />
    </>
  );
}

export function SemanaCocina() {
  const cambios = useCambios();
  useFlechas(() => desplazamiento.value--, () => desplazamiento.value++, escritorio.value);
  if (!cambios) return null;
  const hoy = diaActual.value;
  const lunes = addDays(lunesDe(parse(hoy)), 7 * desplazamiento.value);
  const dias = planSemana(lunes, ajustesCocina.value.inicio, cambios, ajustesCocina.value.ciclo);
  const crit = equilibrio(dias);
  const etiqueta = desplazamiento.value === 0 ? 'Esta semana' : desplazamiento.value === 1 ? 'La próxima semana' : desplazamiento.value === -1 ? 'La semana pasada' : `Semana del ${fechaCorta(lunes)}`;
  if (escritorio.value) return <SemanaEscritorio dias={dias} lunes={lunes} hoy={hoy} crit={crit} etiqueta={etiqueta} />;
  return (
    <>
      <div class="navegador-semana">
        <button type="button" class="btn-icono" aria-label="Semana anterior" onClick={() => desplazamiento.value--}>
          <Icono n="chevronIzq" t={20} />
        </button>
        <div>
          <b>{etiqueta}</b>
          <span>
            {fechaCorta(lunes)} – {fechaCorta(addDays(lunes, 6))} · semana {dias[0].semana + 1} de {ajustesCocina.value.ciclo} del menú
          </span>
        </div>
        <button type="button" class="btn-icono" aria-label="Semana siguiente" onClick={() => desplazamiento.value++}>
          <Icono n="chevron" t={20} />
        </button>
      </div>
      {desplazamiento.value !== 0 && (
        <button type="button" class="enlace-boton centrado" onClick={() => (desplazamiento.value = 0)}>
          Volver a esta semana
        </button>
      )}

      <div class="lista dias-cocina">
        {dias.map((p) => (
          <FilaDia p={p} hoy={hoy} />
        ))}
      </div>
      <p class="pie">Toca un día para ver las raciones del niño o cambiar un plato.</p>

      <Lote semana={dias[0].semana} titulo="Preparación anticipada (el domingo anterior)" />

      <div class="tit-lista">Equilibrio de la semana</div>
      <Equilibrio crit={crit} />
      <p class="pie">Si cambias platos, el equilibrio se recalcula. Criterios en la Guía.</p>
      <p class="pie">
        <a class="enlace" href={`#/cocina/compra?lunes=${iso(lunes)}`}>
          Lista de la compra de esta semana
        </a>
      </p>
    </>
  );
}
