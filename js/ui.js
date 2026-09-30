// Piezas de interfaz compartidas por las vistas.
import { icono } from './icons.js';
import { categorias } from './store.js';
import { minutosATexto } from './schedule.js';

export const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTOS = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
export const DIAS_INICIAL = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const MESES_CORTOS = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const ORDINALES = ['', '1.ª', '2.ª', '3.ª', '4.ª'];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fechaLarga = (d) => `${d.getDate()} de ${MESES[d.getMonth() + 1]}`;
export const fechaCorta = (d) => `${d.getDate()} ${MESES_CORTOS[d.getMonth() + 1]}`;
export const diaCorto = (d) => DIAS_CORTOS[d.getDay() || 7];

export const nombreCategoria = (id) => (categorias()[id] ? categorias()[id].nombre : 'Casa');
export const claseCategoria = (id) => `cat-${categorias()[id] ? id : 'casa'}`;

export function insigniaCategoria(id, tam = 32) {
  const cat = categorias()[id] || categorias().casa;
  return `<span class="insignia ${claseCategoria(id)}" style="--tam:${tam}px">${icono(cat.icono, Math.round(tam * 0.58))}</span>`;
}

export function botonCheck(hecha) {
  return `<button class="check" type="button" role="checkbox" aria-checked="${hecha ? 'true' : 'false'}" aria-label="Marcar como hecha">
    <span class="check-aro"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="tick" d="M6 12.5l4 4 8-9"/></svg></span></button>`;
}

// Fila de tarea. it = { clave, titulo, categoria, minutos, notas, hecha, meta, cuenta, just }
export function htmlFila(it) {
  const notas = it.notas ? `<div class="fila-notas"><div><p>${esc(it.notas)}</p></div></div>` : '';
  const meta = [nombreCategoria(it.categoria), it.minutos ? minutosATexto(it.minutos) : '', it.meta].filter(Boolean).join(' · ');
  return `<li class="fila ${claseCategoria(it.categoria)}${it.hecha ? ' hecha' : ''}${it.notas ? ' con-notas' : ''}" data-clave="${esc(it.clave)}" data-titulo="${esc(it.titulo)}"${it.cuenta === false ? '' : ` data-cuenta="1" data-min="${it.minutos || 0}"`}>
    ${botonCheck(it.hecha)}
    <div class="fila-cuerpo" ${it.notas ? 'role="button" tabindex="0" aria-expanded="false"' : ''}>
      <div class="fila-titulo"><span class="tt">${esc(it.titulo)}</span></div>
      <div class="fila-meta"><span>${esc(meta)}</span>${it.notas ? icono('chevronAbajo', 13, 'mini-chev') : ''}</div>
      ${notas}
    </div>
    ${insigniaCategoria(it.categoria)}
  </li>`;
}

// Anillo de progreso (SVG). Se anima cambiando stroke-dashoffset.
export function htmlAnillo(fraccion, tam = 92, grosor = 10) {
  const c = tam / 2;
  const r = c - grosor / 2 - 1;
  const l = 2 * Math.PI * r;
  return `<svg class="anillo" width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}" data-long="${l}" aria-hidden="true">
    <circle class="anillo-pista" cx="${c}" cy="${c}" r="${r}" stroke-width="${grosor}" fill="none"/>
    <circle class="anillo-valor" cx="${c}" cy="${c}" r="${r}" stroke-width="${grosor}" fill="none" stroke-linecap="round"
      transform="rotate(-90 ${c} ${c})" stroke-dasharray="${l}" stroke-dashoffset="${l * (1 - fraccion)}"/></svg>`;
}
export function fijarAnillo(svg, fraccion) {
  const l = Number(svg.dataset.long);
  svg.querySelector('.anillo-valor').style.strokeDashoffset = String(l * (1 - fraccion));
}

// --- Aviso con "Deshacer" -------------------------------------------------------------------
let temporizadorToast = null;
export function mostrarToast(texto, accion, alAccion) {
  const el = document.getElementById('toast');
  clearTimeout(temporizadorToast);
  el.innerHTML = `<span class="toast-txt">${esc(texto)}</span>${accion ? `<button type="button" class="toast-btn">${esc(accion)}</button>` : ''}`;
  el.classList.add('visible');
  const btn = el.querySelector('.toast-btn');
  if (btn) btn.addEventListener('click', () => { ocultarToast(); alAccion && alAccion(); });
  temporizadorToast = setTimeout(ocultarToast, 4500);
}
export function ocultarToast() {
  clearTimeout(temporizadorToast);
  document.getElementById('toast').classList.remove('visible');
}

// --- Diálogo de confirmación (estilo alerta de iOS) ------------------------------------------
export function confirmar({ titulo, texto = '', ok = 'Aceptar', peligro = false, cancelar = 'Cancelar' }) {
  return new Promise((resolver) => {
    const fondo = document.createElement('div');
    fondo.className = 'dialogo-fondo';
    fondo.innerHTML = `<div class="dialogo" role="alertdialog" aria-modal="true">
      <div class="dialogo-txt"><h3>${esc(titulo)}</h3>${texto ? `<p>${esc(texto)}</p>` : ''}</div>
      <div class="dialogo-botones">${cancelar ? `<button type="button" data-r="0">${esc(cancelar)}</button>` : ''}
      <button type="button" data-r="1" class="${peligro ? 'peligro' : 'principal'}">${esc(ok)}</button></div></div>`;
    document.body.appendChild(fondo);
    requestAnimationFrame(() => fondo.classList.add('visible'));
    const cerrar = (v) => {
      fondo.classList.remove('visible');
      setTimeout(() => fondo.remove(), 200);
      resolver(v);
    };
    fondo.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) cerrar(b.dataset.r === '1');
      else if (e.target === fondo && cancelar) cerrar(false);
    });
  });
}

// --- Hoja inferior (editor) ---------------------------------------------------------------------
export function abrirHoja({ titulo, html, guardar = 'Guardar', onGuardar, onMostrar }) {
  const fondo = document.createElement('div');
  fondo.className = 'hoja-fondo';
  fondo.innerHTML = `<div class="hoja" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
    <div class="hoja-asa"></div>
    <header class="hoja-cab">
      <button type="button" class="hoja-btn" data-a="cancelar">Cancelar</button>
      <h2>${esc(titulo)}</h2>
      <button type="button" class="hoja-btn fuerte" data-a="guardar">${esc(guardar)}</button>
    </header>
    <div class="hoja-cuerpo">${html}</div></div>`;
  document.body.appendChild(fondo);
  document.documentElement.classList.add('bloqueado');
  requestAnimationFrame(() => fondo.classList.add('visible'));
  const cerrar = () => {
    fondo.classList.remove('visible');
    document.documentElement.classList.remove('bloqueado');
    setTimeout(() => fondo.remove(), 280);
  };
  fondo.addEventListener('click', (e) => {
    if (e.target === fondo) return cerrar();
    const b = e.target.closest('[data-a]');
    if (!b) return;
    if (b.dataset.a === 'cancelar') cerrar();
    else if (b.dataset.a === 'guardar') {
      const r = onGuardar ? onGuardar(fondo) : true;
      if (r !== false) cerrar();
    }
  });
  if (onMostrar) onMostrar(fondo, cerrar);
  return { el: fondo, cerrar };
}

// --- Selector de opciones (estilo hoja de acciones de iOS) ------------------------------------
export function elegir({ titulo, opciones }) {
  return new Promise((resolver) => {
    const fondo = document.createElement('div');
    fondo.className = 'dialogo-fondo';
    fondo.innerHTML = `<div class="dialogo" role="dialog" aria-modal="true">
      <div class="dialogo-txt"><h3>${esc(titulo)}</h3></div>
      <div class="dialogo-botones">${opciones.map((o, i) => `<button type="button" data-r="${i}" class="principal">${esc(o)}</button>`).join('')}
      <button type="button" data-r="-1">Cancelar</button></div></div>`;
    document.body.appendChild(fondo);
    requestAnimationFrame(() => fondo.classList.add('visible'));
    const cerrar = (v) => {
      fondo.classList.remove('visible');
      setTimeout(() => fondo.remove(), 200);
      resolver(v);
    };
    fondo.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) cerrar(Number(b.dataset.r));
      else if (e.target === fondo) cerrar(-1);
    });
  });
}
