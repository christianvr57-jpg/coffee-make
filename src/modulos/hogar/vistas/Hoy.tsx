// HOGAR · Hoy: lo que toca hoy, sin buscar nada.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { diaActual } from '../../../core/hoy';
import { DIAS, MESES, DIAS_CORTOS, fechaCorta, minutosATexto, parse, isoWeekday } from '../../../core/fechas';
import { Icono } from '../../../ui/Icono';
import { Anillo } from '../../../ui/Anillo';
import { planDelDia, elementosDelDia, type ItemColada, type ItemTarea } from '../calendario';
import { ajustesHogar, modelo, estaHecha, fechaHecha } from '../estado';
import { Check, FilaTarea, alternar, abiertas } from './comunes';

const GRUPOS = [
  ['manana', 'Mañana'],
  ['dia', 'A lo largo del día'],
  ['fija', 'Tarea fija del día'],
  ['noche', 'Noche'],
] as const;
const FRECUENCIA: Record<string, string> = { mensual: 'Mensual', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' };

/** Resumen del día reutilizado por la tarjeta de Inicio. */
export function resumenDia() {
  const fecha = parse(diaActual.value);
  const plan = planDelDia(modelo.value, ajustesHogar.value, fecha);
  const items = elementosDelDia(plan);
  const hechas = items.filter((i) => estaHecha(i.clave));
  const resta = items.filter((i) => !estaHecha(i.clave)).reduce((s, i) => s + i.minutos, 0);
  return { fecha, plan, items, total: items.length, hechas: hechas.length, resta };
}

function TarjetaColada({ it }: { it: ItemColada }) {
  const c = it.t;
  const hecha = estaHecha(it.clave);
  const abierta = abiertas.value.has(it.clave);
  const [anim, setAnim] = useState(false);
  const toggleAbierta = () => {
    const s = new Set(abiertas.value);
    if (abierta) s.delete(it.clave);
    else s.add(it.clave);
    abiertas.value = s;
  };
  const datos: [string, ComponentChildren][] = [
    ['Ropa', c.ropa?.length ? c.ropa.map((r) => <span>{r}</span>) : null],
    ['Programa', c.programa],
    ['Temperatura', c.temperatura],
    ['Centrifugado', c.centrifugado ? `${c.centrifugado} rpm` : null],
    ['Aditivos', c.aditivos],
    ['Tiempo', `${minutosATexto(c.minutos)} para poner y tender`],
  ];
  return (
    <section class={`colada${hecha ? ' hecha' : ''}${abierta ? ' abierta' : ''}${anim ? ' acaba-de' : ''}`}>
      <div class="colada-cab">
        <Check
          hecha={hecha}
          onClick={() => {
            if (alternar(it.clave, `colada ${c.titulo}`)) {
              setAnim(true);
              setTimeout(() => setAnim(false), 900);
            }
          }}
        />
        <div class="colada-cuerpo" role="button" aria-expanded={abierta} onClick={toggleAbierta}>
          <div class="sobre">
            <Icono n="lavadora" t={15} /> Colada del día
          </div>
          <div class="titulo">{c.titulo}</div>
          <div class="subt">{c.programa}</div>
        </div>
        <button type="button" class="colada-chev" aria-label="Ver detalles" onClick={toggleAbierta}>
          <Icono n="chevronAbajo" t={20} clase="mini-chev" />
        </button>
      </div>
      <div class="colada-det">
        <div>
          <div class="colada-int">
            <dl>
              {datos.filter(([, v]) => v).map(([k, v]) => (
                <div class="dato">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {c.notas?.length > 0 && (
              <ul class="colada-notas">
                {c.notas.map((n) => <li>{n}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Grupo({ titulo, icono, items, contar = true }: { titulo: string; icono: string; items: (ItemTarea & { meta?: string })[]; contar?: boolean }) {
  if (!items.length) return null;
  const cuenta = contar ? items.filter((i) => i.nueva !== false) : [];
  const hs = cuenta.filter((i) => estaHecha(i.clave)).length;
  return (
    <section class="grupo">
      <h2 class="grupo-tit">
        <Icono n={icono} t={16} />
        <span>{titulo}</span>
        <span class="cuenta">{cuenta.length ? `${hs}/${cuenta.length}` : ''}</span>
      </h2>
      <ul class="tarjeta">
        {items.map((it) => (
          <FilaTarea key={it.clave} clave={it.clave} titulo={it.t.titulo} categoria={it.t.categoria} minutos={it.minutos} notas={it.t.notas} meta={it.meta} />
        ))}
      </ul>
    </section>
  );
}

export function HoyHogar() {
  const { fecha, plan, total, hechas: nHechas, resta } = resumenDia();
  const hoy = diaActual.value;
  const frac = total ? nHechas / total : 0;
  const completo = total > 0 && nHechas === total;

  // Periódicas: las que saltan hoy cuentan; las arrastradas se ven pero no cuentan para el anillo.
  const periodicas = plan.periodicas
    .filter((p) => !estaHecha(p.clave) || fechaHecha(p.clave) === hoy)
    .map((p) => {
      const desde = parse(p.due!);
      return { ...p, meta: p.nueva ? FRECUENCIA[p.t.frecuencia] : `Desde el ${DIAS_CORTOS[isoWeekday(desde)]} ${fechaCorta(desde)}` };
    });
  const nada = !plan.coladas.length && !GRUPOS.some(([k]) => plan.grupos[k].length) && !periodicas.length;

  return (
    <>
      <header class="cabecera vertical">
        <div class="cab-fila">
          <div class="sobre">{DIAS[plan.wd]}</div>
          <span class="etiqueta acento">Semana {plan.tipo}</span>
        </div>
        <h1>
          {fecha.getDate()} de {MESES[fecha.getMonth() + 1]}
        </h1>
      </header>
      <section class={`resumen${completo ? ' completo' : ''}`}>
        <Anillo fraccion={frac}>
          {Math.round(frac * 100)}
          <small>%</small>
        </Anillo>
        <div class="resumen-txt">
          <div class="resumen-grande">{total ? (completo ? '¡Día completado!' : `${nHechas} de ${total} tareas`) : 'Día libre'}</div>
          <div class="resumen-sub">
            {completo ? (
              <>
                <Icono n="check" t={18} /> Todo hecho por hoy
              </>
            ) : total ? (
              <>
                <Icono n="reloj" t={18} /> Te quedan {minutosATexto(resta)}
              </>
            ) : (
              'Nada programado'
            )}
          </div>
        </div>
      </section>
      {plan.coladas.map((c) => <TarjetaColada key={c.clave} it={c} />)}
      {GRUPOS.map(([k, titulo]) => <Grupo key={k} titulo={titulo} icono={k} items={plan.grupos[k]} />)}
      <Grupo titulo="Periódicas" icono="periodicas" items={periodicas} />
      {nada && (
        <div class="vacio">
          <Icono n="hoy" t={40} />
          <p>No hay nada programado para hoy.</p>
        </div>
      )}
    </>
  );
}
