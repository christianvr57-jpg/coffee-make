// COCINA · Semana: los 7 días con sus platos, el batch cooking y el equilibrio de la semana.
import { signal } from '@preact/signals';
import { addDays, DIAS_CORTOS, fechaCorta, iso, lunesDe, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { Hoja, abrirHoja } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { ajustesCocina } from '../estado';
import { equilibrio, planDia, planSemana, type PlanDia } from '../plan';
import { ComidasNino, TarjetaPlato, fechaLarga, useCambios } from './comunes';
import { Lote } from './Hoy';

/** Semanas de desplazamiento respecto a la actual. */
export const desplazamiento = signal(0);

function DiaDetalle({ fecha, cerrar }: { fecha: string; cerrar: () => void }) {
  const cambios = useCambios();
  if (!cambios) return null;
  const p = planDia(parse(fecha), ajustesCocina.value.inicio, cambios, ajustesCocina.value.ciclo);
  return (
    <Hoja titulo={fechaLarga(fecha)} cerrar={cerrar}>
      <div class="tit-lista">Adultos</div>
      <TarjetaPlato momento="comida" r={p.comida} cambiada={p.comidaCambiada} fecha={p.fecha} finde={p.finde} />
      <TarjetaPlato momento="cena" r={p.cena} cambiada={p.cenaCambiada} fecha={p.fecha} finde={p.finde} />
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

export function SemanaCocina() {
  const cambios = useCambios();
  if (!cambios) return null;
  const hoy = diaActual.value;
  const lunes = addDays(lunesDe(parse(hoy)), 7 * desplazamiento.value);
  const dias = planSemana(lunes, ajustesCocina.value.inicio, cambios, ajustesCocina.value.ciclo);
  const crit = equilibrio(dias);
  const etiqueta = desplazamiento.value === 0 ? 'Esta semana' : desplazamiento.value === 1 ? 'La próxima semana' : desplazamiento.value === -1 ? 'La semana pasada' : `Semana del ${fechaCorta(lunes)}`;
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
      <p class="pie">Si cambias platos, el equilibrio se recalcula. Criterios en la Guía.</p>
      <p class="pie">
        <a class="enlace" href={`#/cocina/compra?lunes=${iso(lunes)}`}>
          Lista de la compra de esta semana
        </a>
      </p>
    </>
  );
}
