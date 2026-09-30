// Vista HOY: lo que toca hoy, sin buscar nada.
import { ajustes, modelo, estaHecha, fechaHecha, marcar, desmarcar } from '../store.js';
import { planDelDia, iso, minutosATexto } from '../schedule.js';
import { icono } from '../icons.js';
import { DIAS, MESES, DIAS_CORTOS, fechaCorta, esc, htmlFila, botonCheck, htmlAnillo, fijarAnillo, mostrarToast, ocultarToast } from '../ui.js';
import { parse } from '../schedule.js';

const GRUPOS = [
  ['manana', 'Mañana', 'manana'],
  ['dia', 'A lo largo del día', 'dia'],
  ['fija', 'Tarea fija del día', 'fija'],
  ['noche', 'Noche', 'noche'],
];
const FRECUENCIA = { mensual: 'Mensual', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' };

let raiz = null;
let diaMostrado = '';
const abiertas = new Set(); // filas y colada desplegadas (sobreviven a repintados)

export const diaActual = () => diaMostrado;

function htmlColada(it) {
  const c = it.t;
  const hecha = estaHecha(it.clave);
  const datos = [
    ['Ropa', c.ropa && c.ropa.length ? `<span>${c.ropa.map(esc).join('</span><span>')}</span>` : ''],
    ['Programa', esc(c.programa)],
    ['Temperatura', esc(c.temperatura)],
    ['Centrifugado', c.centrifugado ? `${esc(c.centrifugado)} rpm` : ''],
    ['Aditivos', esc(c.aditivos)],
    ['Tiempo', `${minutosATexto(c.minutos)} para poner y tender`],
  ].filter(([, v]) => v);
  const notas = (c.notas || []).map((n) => `<li>${esc(n)}</li>`).join('');
  const abierta = abiertas.has(it.clave);
  return `<section class="colada${hecha ? ' hecha' : ''}${abierta ? ' abierta' : ''}" data-clave="${esc(it.clave)}" data-titulo="colada ${esc(c.titulo)}" data-cuenta="1" data-min="${it.minutos}">
    <div class="colada-cab">
      ${botonCheck(hecha)}
      <div class="colada-cuerpo" role="button" tabindex="0" aria-expanded="${abierta}">
        <div class="sobre">${icono('lavadora', 15)} Colada del día</div>
        <div class="titulo">${esc(c.titulo)}</div>
        <div class="subt">${esc(c.programa)}</div>
      </div>
      ${icono('chevronAbajo', 20, 'mini-chev')}
    </div>
    <div class="colada-det"><div><div class="colada-int">
      <dl>${datos.map(([k, v]) => `<div class="dato"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      ${notas ? `<ul class="colada-notas">${notas}</ul>` : ''}
    </div></div></div>
  </section>`;
}

function filaDe(it, hoy) {
  return htmlFila({
    clave: it.clave, titulo: it.t.titulo, categoria: it.t.categoria, minutos: it.minutos, notas: it.t.notas,
    hecha: estaHecha(it.clave), meta: it.meta, cuenta: it.cuenta,
  });
}

function htmlGrupo(clave, titulo, icon, filas) {
  return `<section class="grupo" data-grupo="${clave}">
    <h2 class="grupo-tit">${icono(icon, 16)}<span>${titulo}</span><span class="cuenta"></span></h2>
    <ul class="tarjeta">${filas.join('')}</ul></section>`;
}

export function renderHoy(el) {
  raiz = el;
  const ahora = new Date();
  const hoy = iso(ahora);
  diaMostrado = hoy;
  const aj = ajustes();
  const plan = planDelDia(modelo(), aj, ahora);

  const grupos = GRUPOS.map(([k, titulo, icon]) => {
    const filas = plan.grupos[k].map((it) => filaDe(it, hoy));
    return filas.length ? htmlGrupo(k, titulo, icon, filas) : '';
  }).join('');

  // Periódicas: las que saltan hoy cuentan para el anillo; las arrastradas se muestran aparte del cómputo.
  const per = plan.periodicas
    .filter((p) => !estaHecha(p.clave) || fechaHecha(p.clave) === hoy)
    .map((p) => {
      const desde = parse(p.due);
      return {
        ...p,
        cuenta: p.nueva,
        meta: p.nueva ? FRECUENCIA[p.t.frecuencia] : `Desde el ${DIAS_CORTOS[desde.getDay() || 7]} ${fechaCorta(desde)}`,
      };
    });
  const periodicas = per.length ? htmlGrupo('periodicas', 'Periódicas', 'periodicas', per.map((it) => filaDe(it, hoy))) : '';

  const colada = plan.coladas.map(htmlColada).join('');
  const vacio = !plan.coladas.length && !grupos && !periodicas
    ? `<div class="vacio">${icono('hoy', 40)}<p>No hay nada programado para hoy.</p></div>` : '';

  el.innerHTML = `
    <header class="cabecera vertical">
      <div class="cab-fila">
        <div class="sobre">${DIAS[plan.wd]}</div>
        <span class="etiqueta acento">Semana ${plan.tipo}</span>
      </div>
      <h1>${ahora.getDate()} de ${MESES[ahora.getMonth() + 1]}</h1>
    </header>
    <section class="resumen" id="resumen">
      <div class="anillo-caja">${htmlAnillo(0)}<div class="anillo-centro"><span id="pct">0<small>%</small></span></div></div>
      <div class="resumen-txt">
        <div class="resumen-grande" id="res-cuenta"></div>
        <div class="resumen-sub" id="res-resta"></div>
      </div>
    </section>
    ${colada}${grupos}${periodicas}${vacio}`;
  pintarResumen(false);
}

// Recalcula anillo, tiempo restante y contadores de grupo a partir de lo que hay en pantalla.
function pintarResumen(anim = true) {
  if (!raiz) return;
  const contables = [...raiz.querySelectorAll('[data-cuenta]')];
  const total = contables.length;
  let hechas = 0;
  let resta = 0;
  for (const f of contables) {
    if (f.classList.contains('hecha')) hechas++;
    else resta += Number(f.dataset.min) || 0;
  }
  const frac = total ? hechas / total : 0;
  const completo = total > 0 && hechas === total;
  const res = raiz.querySelector('#resumen');
  res.classList.toggle('completo', completo);
  fijarAnillo(res.querySelector('.anillo'), frac);
  raiz.querySelector('#pct').innerHTML = `${Math.round(frac * 100)}<small>%</small>`;
  raiz.querySelector('#res-cuenta').textContent = total
    ? (completo ? '¡Día completado!' : `${hechas} de ${total} tareas`)
    : 'Día libre';
  raiz.querySelector('#res-resta').innerHTML = completo
    ? `${icono('check', 18)} Todo hecho por hoy`
    : (total ? `${icono('reloj', 18)} Te quedan ${minutosATexto(resta)}` : 'Nada programado');
  raiz.querySelectorAll('.grupo').forEach((g) => {
    const items = [...g.querySelectorAll('[data-cuenta]')];
    const hs = items.filter((f) => f.classList.contains('hecha')).length;
    g.querySelector('.cuenta').textContent = items.length ? `${hs}/${items.length}` : '';
  });
}

function alternar(el) {
  const clave = el.dataset.clave;
  const hecha = !estaHecha(clave);
  if (hecha) marcar(clave, iso(new Date()));
  else desmarcar(clave);
  el.classList.toggle('hecha', hecha);
  el.querySelector('.check').setAttribute('aria-checked', String(hecha));
  if (hecha) {
    el.classList.add('acaba-de');
    setTimeout(() => el.classList.remove('acaba-de'), 900);
    mostrarToast(`Hecho: ${el.dataset.titulo}`, 'Deshacer', () => {
      const actual = raiz && raiz.querySelector(`[data-clave="${CSS.escape(clave)}"]`);
      if (actual) alternar(actual);
      else desmarcar(clave);
    });
  } else {
    ocultarToast();
  }
  pintarResumen(true);
}

function desplegar(el, clave) {
  const abierta = !el.classList.contains('abierta');
  el.classList.toggle('abierta', abierta);
  const cuerpo = el.querySelector('[aria-expanded]');
  if (cuerpo) cuerpo.setAttribute('aria-expanded', String(abierta));
  if (abierta) abiertas.add(clave);
  else abiertas.delete(clave);
}

export function eventosHoy(el) {
  el.addEventListener('click', (e) => {
    if (el.dataset.vista !== 'hoy') return;
    const check = e.target.closest('.check');
    const fila = e.target.closest('.fila');
    const colada = e.target.closest('.colada');
    if (check) {
      alternar((fila || colada));
    } else if (colada && e.target.closest('.colada-cab')) {
      desplegar(colada, colada.dataset.clave);
    } else if (fila && e.target.closest('.fila-cuerpo')) {
      if (fila.classList.contains('con-notas')) desplegar(fila, fila.dataset.clave);
      else alternar(fila);
    }
  });
  el.addEventListener('keydown', (e) => {
    if (el.dataset.vista !== 'hoy') return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) {
      e.preventDefault();
      e.target.click();
    }
  });
}
