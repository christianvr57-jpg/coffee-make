// Vista SEMANA: los siete días con sus tareas y su colada.
import { ajustes, modelo, estaHecha, marcar, desmarcar } from '../store.js';
import { planDelDia, iso, addDays, lunesDe, tipoSemana, minutosATexto } from '../schedule.js';
import { icono } from '../icons.js';
import { DIAS, fechaCorta, htmlFila, mostrarToast, ocultarToast } from '../ui.js';

let raiz = null;
let desfase = 0; // semanas respecto a la actual
const rutinaAbierta = new Set(); // fechas con la rutina diaria desplegada
const FRECUENCIA = { mensual: 'Mensual', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' };

function itemsDelDia(fecha) {
  const plan = planDelDia(modelo(), ajustes(), fecha);
  const diarias = [...plan.grupos.manana, ...plan.grupos.dia, ...plan.grupos.noche].filter((i) => i.t.frecuencia === 'diaria');
  const fijas = [...plan.grupos.manana, ...plan.grupos.dia, ...plan.grupos.fija, ...plan.grupos.noche].filter((i) => i.t.frecuencia !== 'diaria');
  const periodicas = plan.periodicas.filter((p) => p.nueva);
  return { plan, diarias, fijas, periodicas };
}

function htmlDia(fecha, just = '') {
  const hoy = iso(new Date());
  const dia = iso(fecha);
  const { plan, diarias, fijas, periodicas } = itemsDelDia(fecha);
  const todos = [...plan.coladas, ...diarias, ...fijas, ...periodicas];
  const hechas = todos.filter((i) => estaHecha(i.clave)).length;
  const minutos = todos.reduce((s, i) => s + i.minutos, 0);
  const completo = todos.length > 0 && hechas === todos.length;
  const marca = (it, extra = {}) => htmlFila({
    clave: it.clave, titulo: extra.titulo || it.t.titulo, categoria: it.categoria || it.t.categoria, minutos: it.minutos,
    notas: extra.notas === undefined ? it.t.notas : extra.notas, hecha: estaHecha(it.clave), meta: extra.meta,
  }).replace('class="fila ', `class="fila${just === it.clave ? ' acaba-de' : ''}${extra.clase ? ` ${extra.clase}` : ''} `);

  const coladas = plan.coladas.map((c) => marca(c, { titulo: `Colada: ${c.t.titulo}`, notas: '', meta: c.t.programa, clase: 'colada-fila' }));
  const rutina = diarias.length
    ? `<button type="button" class="rutina-btn" data-rutina="${dia}">${icono('hoy', 20)}<span>Rutina diaria</span>
        <span class="cuenta">${diarias.filter((i) => estaHecha(i.clave)).length}/${diarias.length}</span>${icono('chevronAbajo', 18)}</button>
       <ul class="rutina-lista">${diarias.map((i) => marca(i)).join('')}</ul>`
    : '';
  return `<section class="dia${dia === hoy ? ' hoy' : ''}${completo ? ' completo' : ''}${rutinaAbierta.has(dia) ? ' rutina-abierta' : ''}" data-fecha="${dia}">
    <header class="dia-cab">
      <div><span class="nombre">${DIAS[plan.wd]}</span><span class="fecha">${fechaCorta(fecha)}</span></div>
      ${dia === hoy ? '<span class="pildora">Hoy</span>' : ''}
      <div class="lado"><b>${hechas}/${todos.length}</b>${minutosATexto(minutos)}</div>
    </header>
    <ul>${coladas.join('')}${fijas.map((i) => marca(i, { meta: i.t.momento === 'noche' ? 'Por la noche' : '' })).join('')}${periodicas.map((i) => marca(i, { meta: FRECUENCIA[i.t.frecuencia] })).join('')}</ul>
    ${rutina}
  </section>`;
}

export function renderSemana(el, { conservar = false } = {}) {
  raiz = el;
  const hoy = new Date();
  const lunes = addDays(lunesDe(hoy), desfase * 7);
  const domingo = addDays(lunes, 6);
  const tipo = tipoSemana(lunes, ajustes());
  const dias = Array.from({ length: 7 }, (_, i) => htmlDia(addDays(lunes, i))).join('');
  el.innerHTML = `
    <header class="cabecera">
      <div>
        <div class="sobre">${fechaCorta(lunes)} – ${fechaCorta(domingo)}</div>
        <h1>Semana</h1>
        <div class="sub">Semana ${tipo} · ${tipo === 'A' ? 'toca cambiar sábanas' : 'toca lavar blancos'}</div>
      </div>
      <div class="nav-semana">
        <button type="button" class="btn-icono" data-nav="-1" aria-label="Semana anterior">${icono('chevronIzq', 20)}</button>
        ${desfase !== 0 ? '<button type="button" class="btn-texto" data-nav="0">Hoy</button>' : ''}
        <button type="button" class="btn-icono" data-nav="1" aria-label="Semana siguiente">${icono('chevron', 20)}</button>
      </div>
    </header>
    ${dias}`;
  if (!conservar) {
    const hoyEl = el.querySelector('.dia.hoy');
    if (hoyEl && desfase === 0) {
      requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, hoyEl.offsetTop - 90), behavior: 'auto' }));
    } else window.scrollTo(0, 0);
  }
}

function alternar(fila) {
  const clave = fila.dataset.clave;
  const hecha = !estaHecha(clave);
  if (hecha) marcar(clave, iso(new Date()));
  else desmarcar(clave);
  const tarjeta = fila.closest('.dia');
  const fecha = tarjeta.dataset.fecha;
  const [y, m, d] = fecha.split('-').map(Number);
  const nueva = document.createElement('div');
  nueva.innerHTML = htmlDia(new Date(y, m - 1, d, 12), hecha ? clave : '');
  tarjeta.replaceWith(nueva.firstElementChild);
  if (hecha) {
    mostrarToast(`Hecho: ${fila.dataset.titulo}`, 'Deshacer', () => {
      desmarcar(clave);
      if (raiz) renderSemana(raiz, { conservar: true });
    });
  } else ocultarToast();
}

export function eventosSemana(el) {
  el.addEventListener('click', (e) => {
    if (el.dataset.vista !== 'semana') return;
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      desfase = nav.dataset.nav === '0' ? 0 : desfase + Number(nav.dataset.nav);
      renderSemana(el);
      window.scrollTo(0, 0);
      return;
    }
    const rut = e.target.closest('.rutina-btn');
    if (rut) {
      const tarjeta = rut.closest('.dia');
      const abierta = tarjeta.classList.toggle('rutina-abierta');
      if (abierta) rutinaAbierta.add(tarjeta.dataset.fecha);
      else rutinaAbierta.delete(tarjeta.dataset.fecha);
      return;
    }
    const fila = e.target.closest('.fila');
    if (!fila) return;
    if (e.target.closest('.check')) return alternar(fila);
    if (e.target.closest('.fila-cuerpo')) {
      if (fila.classList.contains('con-notas')) {
        const abierta = fila.classList.toggle('abierta');
        const c = fila.querySelector('[aria-expanded]');
        if (c) c.setAttribute('aria-expanded', String(abierta));
      } else alternar(fila);
    }
  });
}

export const reiniciarSemana = () => { desfase = 0; };
