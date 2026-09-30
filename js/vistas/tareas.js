// Vista TAREAS: listado por frecuencia y edición.
import { modelo, categorias, guardarTarea, eliminarTarea, idNuevo, ajustes } from '../store.js';
import { proximaFecha, minutosATexto, esPeriodica } from '../schedule.js';
import { sugerirPlan, mesesActivos } from '../planner.js';
import { icono } from '../icons.js';
import { DIAS, DIAS_CORTOS, DIAS_INICIAL, MESES, MESES_CORTOS, ORDINALES, esc, fechaCorta, claseCategoria, insigniaCategoria, nombreCategoria, abrirHoja, confirmar, elegir } from '../ui.js';

const SECCIONES = [
  ['coladas', 'Coladas'],
  ['diaria', 'Diarias'],
  ['semanal', 'Semanales'],
  ['mensual', 'Mensuales'],
  ['trimestral', 'Trimestrales'],
  ['semestral', 'Semestrales'],
  ['anual', 'Anuales'],
];
const MOMENTOS = [['manana', 'Mañana'], ['dia', 'Durante el día'], ['fija', 'Tarea fija'], ['noche', 'Noche']];
const NOMBRE_MOMENTO = Object.fromEntries(MOMENTOS);
const FRECUENCIAS = [['diaria', 'Todos los días'], ['semanal', 'Cada semana'], ['mensual', 'Cada mes'], ['trimestral', 'Cada trimestre'], ['semestral', 'Cada semestre'], ['anual', 'Cada año']];
const plegadas = new Set();
let raiz = null;

const textoDias = (dias = []) => {
  const d = [...dias].sort((a, b) => a - b);
  if (d.length === 1) return DIAS[d[0]];
  if (d.length === 7) return 'Todos los días';
  const n = d.map((x) => DIAS_CORTOS[x]);
  const cap = n.map((s, i) => (i === 0 ? s[0].toUpperCase() + s.slice(1) : s));
  return `${cap.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
};

function metaTarea(t) {
  const partes = [];
  const min = t.minutos ? minutosATexto(t.minutos) : '';
  if (t.frecuencia === 'diaria') {
    partes.push(t.cadaDias > 1 ? `Cada ${t.cadaDias} días` : 'Todos los días', NOMBRE_MOMENTO[t.momento] || '');
  } else if (t.frecuencia === 'semanal') {
    partes.push(textoDias(t.dias), t.semana ? `semana ${t.semana}` : '', t.momento === 'noche' ? 'noche' : '');
  } else if (esPeriodica(t)) {
    const p = t.plan || { semana: 1, dia: 1, mes: 1 };
    partes.push(`${ORDINALES[p.semana]} semana, ${DIAS[p.dia].toLowerCase()}`);
    if (t.frecuencia !== 'mensual') partes.push(mesesActivos(t).map((m) => MESES_CORTOS[m]).join(', '));
    else if (t.meses) partes.push(t.meses.map((m) => MESES_CORTOS[m]).join(', '));
    const prox = proximaFecha(t, new Date(), ajustes());
    if (prox) partes.push(`próx. ${fechaCorta(prox)}`);
  }
  if (min) partes.push(min);
  return partes.filter(Boolean).join(' · ');
}

function filaItem(t) {
  const inactiva = t.requiere === 'camaBaja' && !ajustes().camaBaja;
  return `<button type="button" class="item ${claseCategoria(t.categoria)}${inactiva ? ' inactiva' : ''}" data-id="${esc(t.id)}" data-tipo="tarea">
    ${insigniaCategoria(t.categoria, 36)}
    <div class="item-txt"><div class="item-tit">${esc(t.titulo)}${t.requiere === 'camaBaja' ? '<span class="tag">Cama baja</span>' : ''}</div>
    <div class="item-meta">${esc(metaTarea(t))}</div></div>${icono('chevron', 16, 'chev')}</button>`;
}

function filaColada(c) {
  const sem = c.semana ? ` · semana ${c.semana}` : '';
  return `<button type="button" class="item cat-ropa" data-id="${esc(c.id)}" data-tipo="colada">
    ${insigniaCategoria('ropa', 36)}
    <div class="item-txt"><div class="item-tit">${esc(c.titulo)}</div>
    <div class="item-meta">${DIAS[c.dia]}${sem} · ${esc(c.programa || '')}</div></div>${icono('chevron', 16, 'chev')}</button>`;
}

export function renderTareas(el) {
  raiz = el;
  const m = modelo();
  const hoy = new Date();
  const aj = ajustes();
  const secciones = SECCIONES.map(([k, titulo]) => {
    let items;
    if (k === 'coladas') {
      items = [...m.coladas].sort((a, b) => a.dia - b.dia || String(a.semana).localeCompare(String(b.semana))).map(filaColada);
    } else {
      let ts = m.tareas.filter((t) => t.frecuencia === k);
      if (k === 'semanal') ts = ts.sort((a, b) => Math.min(...(a.dias || [8])) - Math.min(...(b.dias || [8])));
      else if (k !== 'diaria') ts = ts.sort((a, b) => {
        const fa = proximaFecha(a, hoy, aj);
        const fb = proximaFecha(b, hoy, aj);
        return (fa ? fa.getTime() : Infinity) - (fb ? fb.getTime() : Infinity);
      });
      items = ts.map(filaItem);
    }
    if (!items.length) return '';
    return `<section class="seccion${plegadas.has(k) ? ' plegada' : ''}" data-sec="${k}">
      <button type="button" class="seccion-btn"><span class="t">${titulo}</span><span class="n">${items.length}</span>${icono('chevronAbajo', 18)}</button>
      <div class="tarjeta">${items.join('')}</div></section>`;
  }).join('');
  el.innerHTML = `
    <header class="cabecera">
      <div><h1>Tareas</h1><div class="sub">Toca una tarea para editarla</div></div>
      <button type="button" class="btn-mas" data-a="nueva" aria-label="Añadir tarea">${icono('mas', 24)}</button>
    </header>${secciones}`;
}

// ---------- Editor ----------

const opcionesSel = (pares, actual) => pares.map(([v, t]) => `<option value="${v}"${String(v) === String(actual) ? ' selected' : ''}>${esc(t)}</option>`).join('');

function mesesDelPeriodo(frecuencia) {
  if (frecuencia === 'trimestral') return [[1, '1.er mes'], [2, '2.º mes'], [3, '3.er mes']].map(([v, t]) => [v, `${t} del trimestre`]);
  if (frecuencia === 'semestral') return [1, 2, 3, 4, 5, 6].map((v) => [v, `${v}.º mes del semestre`]);
  return MESES.slice(1).map((n, i) => [i + 1, n[0].toUpperCase() + n.slice(1)]);
}

function minutosPaso(v, dir) {
  const base = dir > 0 ? v : v - 1;
  const paso = base < 10 ? 1 : base < 60 ? 5 : 10;
  return Math.min(480, Math.max(1, v + dir * paso));
}

function htmlPaso(v) {
  return `<div class="paso"><button type="button" data-paso="-1" aria-label="Menos tiempo">${icono('menos', 20)}</button>
    <output data-out="minutos">${minutosATexto(v)}</output>
    <button type="button" data-paso="1" aria-label="Más tiempo">${icono('mas', 20)}</button></div>`;
}

function editarTarea(t) {
  const nueva = !t;
  const hoyWd = new Date().getDay() || 7;
  const f = t ? JSON.parse(JSON.stringify(t)) : { id: idNuevo('t'), titulo: '', categoria: 'casa', frecuencia: 'semanal', momento: 'fija', dias: [hoyWd], minutos: 10, notas: '' };
  if (!f.momento) f.momento = 'fija';
  if (!f.dias) f.dias = [hoyWd];
  const cats = Object.entries(categorias());
  const periodica = () => esPeriodica(f);

  const html = `
    <div class="lista"><div class="campo col"><span class="et">Nombre</span>
      <input type="text" name="titulo" value="${esc(f.titulo)}" placeholder="Por ejemplo: Limpiar el horno" autocomplete="off" enterkeyhint="done"></div></div>
    <div class="tit-lista">Categoría</div>
    <div class="lista"><div class="campo col"><div class="chips" data-campo="categoria">
      ${cats.map(([id, c]) => `<button type="button" class="chip ${claseCategoria(id)}" data-v="${id}" aria-pressed="${f.categoria === id}">${icono(c.icono, 18)}${esc(c.nombre)}</button>`).join('')}
    </div></div></div>
    <div class="tit-lista">Cuándo</div>
    <div class="lista">
      <div class="campo"><label for="f-frec">Frecuencia</label><select id="f-frec" name="frecuencia">${opcionesSel(FRECUENCIAS, f.frecuencia)}</select></div>
      <div class="campo" data-si="diaria"><label for="f-cada">Se repite</label><select id="f-cada" name="cadaDias">${opcionesSel([[1, 'Cada día'], [2, 'Cada 2 días'], [3, 'Cada 3 días']], f.cadaDias || 1)}</select></div>
      <div class="campo col" data-si="diaria,semanal"><span class="et">Momento del día</span>
        <div class="segmentado" data-campo="momento">${MOMENTOS.map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${f.momento === v}">${v === 'dia' ? 'Día' : n === 'Tarea fija' ? 'Fija' : n}</button>`).join('')}</div></div>
      <div class="campo col" data-si="semanal"><span class="et">Días de la semana</span>
        <div class="dias-sel" data-campo="dias">${[1, 2, 3, 4, 5, 6, 7].map((d) => `<button type="button" data-v="${d}" aria-label="${DIAS[d]}" aria-pressed="${f.dias.includes(d)}">${DIAS_INICIAL[d]}</button>`).join('')}</div></div>
      <div class="campo col" data-si="semanal"><span class="et">Semanas</span>
        <div class="segmentado" data-campo="semana">${[['', 'Todas'], ['A', 'Solo A'], ['B', 'Solo B']].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${(f.semana || '') === v}">${n}</button>`).join('')}</div></div>
      <div class="campo" data-si="trimestral,semestral,anual"><label for="f-mes">Mes</label><select id="f-mes" name="mes"></select></div>
      <div class="campo" data-si="mensual,trimestral,semestral,anual"><label for="f-sem">Semana del mes</label><select id="f-sem" name="semana-mes">${opcionesSel([1, 2, 3, 4].map((n) => [n, `${ORDINALES[n]} semana`]), (f.plan || {}).semana || 1)}</select></div>
      <div class="campo" data-si="mensual,trimestral,semestral,anual"><label for="f-dia">Día</label><select id="f-dia" name="dia">${opcionesSel([1, 2, 3, 4, 5, 6, 7].map((n) => [n, DIAS[n]]), (f.plan || {}).dia || 1)}</select></div>
      <div class="campo col" data-si="mensual,trimestral,semestral,anual"><div class="ayuda" data-out="plan"></div>
        <button type="button" class="boton-fino" data-a2="auto">Repartir automáticamente</button></div>
    </div>
    <div class="tit-lista">Detalles</div>
    <div class="lista">
      <div class="campo"><span class="et">Tiempo estimado</span>${htmlPaso(f.minutos || 10)}</div>
      <div class="campo col"><span class="et">Notas</span><textarea name="notas" rows="3" placeholder="Opcional">${esc(f.notas || '')}</textarea></div>
      <div class="campo"><div class="et">Solo con cama baja<small>Aparece únicamente si el interruptor de Ajustes está activo</small></div>
        <label class="interruptor"><input type="checkbox" name="requiere"${f.requiere === 'camaBaja' ? ' checked' : ''}><span></span></label></div>
    </div>
    ${nueva ? '' : `<div class="lista" style="margin-top:22px"><button type="button" class="boton-fila peligro" data-a2="borrar">${icono('papelera', 22)}Eliminar tarea</button></div>`}`;

  const hoja = abrirHoja({
    titulo: nueva ? 'Nueva tarea' : 'Editar tarea',
    html,
    guardar: nueva ? 'Añadir' : 'Guardar',
    onMostrar: (h, cerrar) => {
      const q = (s) => h.querySelector(s);
      const sync = () => {
        h.querySelectorAll('[data-si]').forEach((n) => { n.hidden = !n.dataset.si.split(',').includes(f.frecuencia); });
        const selMes = q('[name=mes]');
        if (periodica() && f.frecuencia !== 'mensual') {
          selMes.innerHTML = opcionesSel(mesesDelPeriodo(f.frecuencia), (f.plan || {}).mes || 1);
        }
        if (periodica()) {
          const p = f.plan || (f.plan = { mes: 1, semana: 1, dia: 1 });
          const prox = proximaFecha({ ...f }, new Date(), ajustes());
          let cuando;
          if (f.frecuencia === 'mensual') cuando = `Cada mes, ${ORDINALES[p.semana]} semana, ${DIAS[p.dia].toLowerCase()}`;
          else cuando = `${mesesActivos(f).map((m) => MESES[m]).join(', ')}: ${ORDINALES[p.semana]} semana, ${DIAS[p.dia].toLowerCase()}`;
          q('[data-out=plan]').innerHTML = `<b>${esc(cuando)}</b>${prox ? `<br>Próxima vez: ${DIAS[prox.getDay() || 7].toLowerCase()} ${fechaCorta(prox)}. Se queda visible hasta que la marques o termine el periodo.` : ''}`;
        }
        q('[data-out=minutos]').textContent = minutosATexto(f.minutos);
      };
      const asegurarPlan = () => {
        if (!periodica()) return;
        if (!f.plan) f.plan = { mes: 1, semana: 1, dia: 1 };
        const max = f.frecuencia === 'trimestral' ? 3 : f.frecuencia === 'semestral' ? 6 : f.frecuencia === 'anual' ? 12 : 1;
        f.plan.mes = Math.min(f.plan.mes || 1, max);
      };
      sync();
      h.addEventListener('input', (e) => {
        if (e.target.name === 'titulo') f.titulo = e.target.value;
        else if (e.target.name === 'notas') f.notas = e.target.value;
      });
      h.addEventListener('change', (e) => {
        const n = e.target.name;
        if (n === 'frecuencia') {
          f.frecuencia = e.target.value;
          if (periodica()) {
            asegurarPlan();
            if (!t || !t.plan) f.plan = sugerirPlan(modelo(), { ...f, plan: undefined, mes: 1 });
          }
        } else if (n === 'cadaDias') f.cadaDias = Number(e.target.value);
        else if (n === 'mes') f.plan.mes = Number(e.target.value);
        else if (n === 'semana-mes') f.plan.semana = Number(e.target.value);
        else if (n === 'dia') f.plan.dia = Number(e.target.value);
        else if (n === 'requiere') f.requiere = e.target.checked ? 'camaBaja' : undefined;
        sync();
      });
      h.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const campo = btn.closest('[data-campo]');
        if (campo) {
          const k = campo.dataset.campo;
          if (k === 'dias') {
            const d = Number(btn.dataset.v);
            f.dias = f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d];
            btn.setAttribute('aria-pressed', String(f.dias.includes(d)));
          } else {
            f[k] = btn.dataset.v || undefined;
            campo.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          }
        } else if (btn.dataset.paso) {
          f.minutos = minutosPaso(f.minutos || 10, Number(btn.dataset.paso));
          sync();
        } else if (btn.dataset.a2 === 'auto') {
          asegurarPlan();
          f.plan = sugerirPlan(modelo(), { ...f, plan: undefined, mes: f.plan.mes });
          q('[name=semana-mes]').value = f.plan.semana;
          q('[name=dia]').value = f.plan.dia;
          sync();
        } else if (btn.dataset.a2 === 'borrar') {
          if (await confirmar({ titulo: '¿Eliminar esta tarea?', texto: 'Puedes recuperarla con «Restablecer tareas» en Ajustes.', ok: 'Eliminar', peligro: true })) {
            eliminarTarea(f.id);
            cerrar();
            renderTareas(raiz);
          }
        }
      });
    },
    onGuardar: (h) => {
      const titulo = (f.titulo || '').trim();
      const campoNombre = h.querySelector('[name=titulo]').closest('.campo');
      if (!titulo) return marcarError(campoNombre, h.querySelector('[name=titulo]'));
      if (f.frecuencia === 'semanal' && !f.dias.length) return marcarError(h.querySelector('[data-campo=dias]').closest('.campo'));
      const r = { id: f.id, titulo, categoria: f.categoria, frecuencia: f.frecuencia, minutos: f.minutos || 10 };
      if (f.notas && f.notas.trim()) r.notas = f.notas.trim();
      if (f.requiere) r.requiere = f.requiere;
      if (f.frecuencia === 'diaria') {
        r.momento = f.momento;
        if (f.cadaDias > 1) r.cadaDias = f.cadaDias;
      } else if (f.frecuencia === 'semanal') {
        r.momento = f.momento;
        r.dias = [...f.dias].sort((a, b) => a - b);
        if (f.semana) r.semana = f.semana;
      } else {
        r.plan = f.plan;
        if (f.frecuencia === 'mensual' && f.meses) r.meses = f.meses;
      }
      guardarTarea(r);
      renderTareas(raiz);
      return true;
    },
  });
  return hoja;
}

function marcarError(campo, input) {
  campo.classList.remove('error');
  void campo.offsetWidth;
  campo.classList.add('error');
  if (input) input.focus();
  return false;
}

function editarColada(c) {
  const nueva = !c;
  const f = c ? JSON.parse(JSON.stringify(c)) : { id: idNuevo('c'), dia: new Date().getDay() || 7, semana: null, titulo: '', ropa: [], programa: '', temperatura: '', centrifugado: '', aditivos: '', minutos: 12, notas: [] };
  const html = `
    <div class="lista">
      <div class="campo col"><span class="et">Nombre</span><input type="text" name="titulo" value="${esc(f.titulo)}" placeholder="Por ejemplo: Toallas y paños" autocomplete="off"></div>
      <div class="campo"><label for="c-dia">Día</label><select id="c-dia" name="dia">${opcionesSel([1, 2, 3, 4, 5, 6, 7].map((n) => [n, DIAS[n]]), f.dia)}</select></div>
      <div class="campo col"><span class="et">Semanas</span>
        <div class="segmentado" data-campo="semana">${[['', 'Todas'], ['A', 'Solo A'], ['B', 'Solo B']].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${(f.semana || '') === v}">${n}</button>`).join('')}</div></div>
    </div>
    <div class="tit-lista">Lavado</div>
    <div class="lista">
      <div class="campo col"><span class="et">Programa</span><input type="text" name="programa" value="${esc(f.programa)}" placeholder="30° + Sanytol, sin suavizante"></div>
      <div class="campo col"><span class="et">Temperatura</span><input type="text" name="temperatura" value="${esc(f.temperatura)}" placeholder="30°"></div>
      <div class="campo col"><span class="et">Centrifugado (rpm)</span><input type="text" name="centrifugado" value="${esc(f.centrifugado)}" placeholder="600-800"></div>
      <div class="campo col"><span class="et">Aditivos</span><textarea name="aditivos" rows="2" placeholder="Opcional">${esc(f.aditivos)}</textarea></div>
    </div>
    <div class="tit-lista">Qué lleva</div>
    <div class="lista"><div class="campo col"><span class="et">Una prenda o grupo por línea</span><textarea name="ropa" rows="3">${esc((f.ropa || []).join('\n'))}</textarea></div></div>
    <div class="tit-lista">Notas</div>
    <div class="lista"><div class="campo col"><span class="et">Una nota por línea</span><textarea name="notas" rows="4">${esc((f.notas || []).join('\n'))}</textarea></div>
      <div class="campo"><span class="et">Tiempo para poner y tender</span>${htmlPaso(f.minutos || 12)}</div></div>
    ${nueva ? '' : `<div class="lista" style="margin-top:22px"><button type="button" class="boton-fila peligro" data-a2="borrar">${icono('papelera', 22)}Eliminar colada</button></div>`}`;

  abrirHoja({
    titulo: nueva ? 'Nueva colada' : 'Editar colada',
    html,
    guardar: nueva ? 'Añadir' : 'Guardar',
    onMostrar: (h, cerrar) => {
      h.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.closest('[data-campo]')) {
          f.semana = btn.dataset.v || null;
          btn.closest('[data-campo]').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        } else if (btn.dataset.paso) {
          f.minutos = minutosPaso(f.minutos || 12, Number(btn.dataset.paso));
          h.querySelector('[data-out=minutos]').textContent = minutosATexto(f.minutos);
        } else if (btn.dataset.a2 === 'borrar') {
          if (await confirmar({ titulo: '¿Eliminar esta colada?', texto: 'Puedes recuperarla con «Restablecer tareas» en Ajustes.', ok: 'Eliminar', peligro: true })) {
            eliminarTarea(f.id);
            cerrar();
            renderTareas(raiz);
          }
        }
      });
    },
    onGuardar: (h) => {
      const v = (n) => h.querySelector(`[name=${n}]`).value.trim();
      if (!v('titulo')) return marcarError(h.querySelector('[name=titulo]').closest('.campo'), h.querySelector('[name=titulo]'));
      const lineas = (n) => h.querySelector(`[name=${n}]`).value.split('\n').map((s) => s.trim()).filter(Boolean);
      guardarTarea({
        id: f.id, dia: Number(h.querySelector('[name=dia]').value), semana: f.semana || null, titulo: v('titulo'),
        ropa: lineas('ropa'), programa: v('programa'), temperatura: v('temperatura'), centrifugado: v('centrifugado'),
        aditivos: v('aditivos'), minutos: f.minutos || 12, notas: lineas('notas'),
      });
      renderTareas(raiz);
      return true;
    },
  });
}

export function eventosTareas(el) {
  el.addEventListener('click', async (e) => {
    if (el.dataset.vista !== 'tareas') return;
    const sec = e.target.closest('.seccion-btn');
    if (sec) {
      const s = sec.closest('.seccion');
      const plegada = s.classList.toggle('plegada');
      if (plegada) plegadas.add(s.dataset.sec);
      else plegadas.delete(s.dataset.sec);
      return;
    }
    if (e.target.closest('[data-a=nueva]')) {
      const r = await elegir({ titulo: 'Añadir', opciones: ['Nueva tarea', 'Nueva colada'] });
      if (r === 0) editarTarea(null);
      else if (r === 1) editarColada(null);
      return;
    }
    const item = e.target.closest('.item');
    if (!item) return;
    const m = modelo();
    if (item.dataset.tipo === 'colada') editarColada(m.coladas.find((c) => c.id === item.dataset.id));
    else editarTarea(m.tareas.find((t) => t.id === item.dataset.id));
  });
}
