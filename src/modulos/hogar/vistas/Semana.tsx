// HOGAR · Semana: los siete días con sus tareas y su colada.
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { diaActual } from '../../../core/hoy';
import { DIAS, addDays, fechaCorta, iso, lunesDe, minutosATexto, parse } from '../../../core/fechas';
import { Icono } from '../../../ui/Icono';
import { planDelDia, tipoSemana } from '../calendario';
import { ajustesHogar, modelo, estaHecha } from '../estado';
import { FilaTarea } from './comunes';

const FRECUENCIA: Record<string, string> = { mensual: 'Mensual', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' };
export const desfaseSemana = signal(0);
const rutinaAbierta = signal<Set<string>>(new Set());

function Dia({ fecha }: { fecha: Date }) {
  const hoy = diaActual.value;
  const dia = iso(fecha);
  const plan = planDelDia(modelo.value, ajustesHogar.value, fecha);
  const g = plan.grupos;
  const diarias = [...g.manana, ...g.dia, ...g.noche].filter((i) => i.t.frecuencia === 'diaria');
  const fijas = [...g.manana, ...g.dia, ...g.fija, ...g.noche].filter((i) => i.t.frecuencia !== 'diaria');
  const periodicas = plan.periodicas.filter((p) => p.nueva);
  const todos = [...plan.coladas, ...diarias, ...fijas, ...periodicas];
  const hechas = todos.filter((i) => estaHecha(i.clave)).length;
  const minutos = todos.reduce((s, i) => s + i.minutos, 0);
  const completo = todos.length > 0 && hechas === todos.length;
  const abierta = rutinaAbierta.value.has(dia);
  const toggle = () => {
    const s = new Set(rutinaAbierta.value);
    if (abierta) s.delete(dia);
    else s.add(dia);
    rutinaAbierta.value = s;
  };
  return (
    <section class={`dia${dia === hoy ? ' hoy' : ''}${completo ? ' completo' : ''}${abierta ? ' rutina-abierta' : ''}`} data-fecha={dia}>
      <header class="dia-cab">
        <div>
          <span class="nombre">{DIAS[plan.wd]}</span>
          <span class="fecha">{fechaCorta(fecha)}</span>
        </div>
        {dia === hoy && <span class="pildora">Hoy</span>}
        <div class="lado">
          <b>
            {hechas}/{todos.length}
          </b>
          {minutosATexto(minutos)}
        </div>
      </header>
      <ul>
        {plan.coladas.map((c) => (
          <FilaTarea key={c.clave} clave={c.clave} titulo={`Colada: ${c.t.titulo}`} categoria="ropa" minutos={c.minutos} meta={c.t.programa} clase="colada-fila" />
        ))}
        {fijas.map((i) => (
          <FilaTarea key={i.clave} clave={i.clave} titulo={i.t.titulo} categoria={i.t.categoria} minutos={i.minutos} notas={i.t.notas} meta={i.t.momento === 'noche' ? 'Por la noche' : ''} />
        ))}
        {periodicas.map((i) => (
          <FilaTarea key={i.clave} clave={i.clave} titulo={i.t.titulo} categoria={i.t.categoria} minutos={i.minutos} notas={i.t.notas} meta={FRECUENCIA[i.t.frecuencia]} />
        ))}
      </ul>
      {diarias.length > 0 && (
        <>
          <button type="button" class="rutina-btn" onClick={toggle} aria-expanded={abierta}>
            <Icono n="hoy" t={20} />
            <span>Rutina diaria</span>
            <span class="cuenta">
              {diarias.filter((i) => estaHecha(i.clave)).length}/{diarias.length}
            </span>
            <Icono n="chevronAbajo" t={18} />
          </button>
          {abierta && (
            <ul class="rutina-lista">
              {diarias.map((i) => (
                <FilaTarea key={i.clave} clave={i.clave} titulo={i.t.titulo} categoria={i.t.categoria} minutos={i.minutos} notas={i.t.notas} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export function SemanaHogar() {
  const lunes = addDays(lunesDe(parse(diaActual.value)), desfaseSemana.value * 7);
  const domingo = addDays(lunes, 6);
  const tipo = tipoSemana(lunes, ajustesHogar.value);
  const raiz = useRef<HTMLDivElement>(null);

  // Al entrar en la semana actual, lleva la vista al día de hoy.
  useEffect(() => {
    if (desfaseSemana.value !== 0) return;
    const el = raiz.current?.querySelector<HTMLElement>('.dia.hoy');
    if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 150) });
  }, []);

  const mover = (n: number) => {
    desfaseSemana.value = n === 0 ? 0 : desfaseSemana.value + n;
    window.scrollTo(0, 0);
  };

  return (
    <div ref={raiz}>
      <div class="sub-cabecera">
        <div>
          <div class="sobre">
            {fechaCorta(lunes)} – {fechaCorta(domingo)}
          </div>
          <div class="sub">
            Semana {tipo} · {tipo === 'A' ? 'toca cambiar sábanas' : 'toca lavar blancos'}
          </div>
        </div>
        <div class="nav-semana">
          <button type="button" class="btn-icono" aria-label="Semana anterior" onClick={() => mover(-1)}>
            <Icono n="chevronIzq" t={20} />
          </button>
          {desfaseSemana.value !== 0 && (
            <button type="button" class="btn-texto" onClick={() => mover(0)}>
              Hoy
            </button>
          )}
          <button type="button" class="btn-icono" aria-label="Semana siguiente" onClick={() => mover(1)}>
            <Icono n="chevron" t={20} />
          </button>
        </div>
      </div>
      {Array.from({ length: 7 }, (_, i) => (
        <Dia key={iso(addDays(lunes, i))} fecha={addDays(lunes, i)} />
      ))}
    </div>
  );
}
