// HOGAR · Tareas: listado por frecuencia y edición de tareas y coladas.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { DIAS, DIAS_CORTOS, DIAS_INICIAL, MESES, MESES_CORTOS, fechaCorta, isoWeekday, minutosATexto } from '../../../core/fechas';
import { Icono } from '../../../ui/Icono';
import { Hoja, abrirHoja, confirmar, elegir } from '../../../ui/capas';
import { Campo, Interruptor, Lista, Segmentado, Selector, Texto } from '../../../ui/form';
import { esPeriodica, proximaFecha } from '../calendario';
import { mesesActivos, sugerirPlan } from '../reparto';
import { ajustesHogar, eliminarElemento, guardarElemento, idNuevo, modelo, rutina } from '../estado';
import type { Colada, Frecuencia, Momento, Tarea } from '../tipos';
import { Insignia, claseCategoria } from './comunes';

const ORDINALES = ['', '1.ª', '2.ª', '3.ª', '4.ª'];
const SECCIONES: [string, string][] = [
  ['coladas', 'Coladas'],
  ['diaria', 'Diarias'],
  ['semanal', 'Semanales'],
  ['mensual', 'Mensuales'],
  ['trimestral', 'Trimestrales'],
  ['semestral', 'Semestrales'],
  ['anual', 'Anuales'],
];
const MOMENTOS: [Momento, string][] = [['manana', 'Mañana'], ['dia', 'Día'], ['fija', 'Fija'], ['noche', 'Noche']];
const NOMBRE_MOMENTO: Record<string, string> = { manana: 'Mañana', dia: 'Durante el día', fija: 'Tarea fija', noche: 'Noche' };
const FRECUENCIAS: [Frecuencia, string][] = [['diaria', 'Todos los días'], ['semanal', 'Cada semana'], ['mensual', 'Cada mes'], ['trimestral', 'Cada trimestre'], ['semestral', 'Cada semestre'], ['anual', 'Cada año']];
const plegadas = signal<Set<string>>(new Set());

function textoDias(dias: number[] = []): string {
  const d = [...dias].sort((a, b) => a - b);
  if (d.length === 1) return DIAS[d[0]];
  if (d.length === 7) return 'Todos los días';
  const n = d.map((x) => DIAS_CORTOS[x]);
  n[0] = n[0][0].toUpperCase() + n[0].slice(1);
  return `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
}

function metaTarea(t: Tarea): string {
  const partes: string[] = [];
  if (t.frecuencia === 'diaria') partes.push(t.cadaDias && t.cadaDias > 1 ? `Cada ${t.cadaDias} días` : 'Todos los días', NOMBRE_MOMENTO[t.momento || 'fija']);
  else if (t.frecuencia === 'semanal') partes.push(textoDias(t.dias), t.semana ? `semana ${t.semana}` : '', t.momento === 'noche' ? 'noche' : '');
  else {
    const p = t.plan || { semana: 1, dia: 1, mes: 1 };
    partes.push(`${ORDINALES[p.semana]} semana, ${DIAS[p.dia].toLowerCase()}`);
    if (t.frecuencia !== 'mensual') partes.push(mesesActivos(t).map((m) => MESES_CORTOS[m]).join(', '));
    else if (t.meses) partes.push(t.meses.map((m) => MESES_CORTOS[m]).join(', '));
    const prox = proximaFecha(t, new Date());
    if (prox) partes.push(`próx. ${fechaCorta(prox)}`);
  }
  if (t.minutos) partes.push(minutosATexto(t.minutos));
  return partes.filter(Boolean).join(' · ');
}

export function TareasHogar() {
  const m = modelo.value;
  const aj = ajustesHogar.value;
  const hoy = new Date();
  const alternarSeccion = (k: string) => {
    const s = new Set(plegadas.value);
    if (s.has(k)) s.delete(k);
    else s.add(k);
    plegadas.value = s;
  };
  const nueva = async () => {
    const r = await elegir('Añadir', ['Nueva tarea', 'Nueva colada']);
    if (r === 0) editarTarea(null);
    else if (r === 1) editarColada(null);
  };
  return (
    <>
      <div class="sub-cabecera">
        <div class="sub">Toca una tarea para editarla</div>
        <button type="button" class="btn-mas" aria-label="Añadir tarea" onClick={nueva}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      {SECCIONES.map(([k, titulo]) => {
        let filas;
        if (k === 'coladas') {
          filas = [...m.coladas]
            .sort((a, b) => a.dia - b.dia || String(a.semana).localeCompare(String(b.semana)))
            .map((c) => (
              <button type="button" class="item cat-ropa" onClick={() => editarColada(c)}>
                <Insignia cat="ropa" tam={36} />
                <div class="item-txt">
                  <div class="item-tit">{c.titulo}</div>
                  <div class="item-meta">
                    {DIAS[c.dia]}
                    {c.semana ? ` · semana ${c.semana}` : ''} · {c.programa}
                  </div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            ));
        } else {
          let ts = m.tareas.filter((t) => t.frecuencia === k);
          if (k === 'semanal') ts = ts.sort((a, b) => Math.min(...(a.dias || [8])) - Math.min(...(b.dias || [8])));
          else if (k !== 'diaria') ts = ts.sort((a, b) => (proximaFecha(a, hoy)?.getTime() ?? Infinity) - (proximaFecha(b, hoy)?.getTime() ?? Infinity));
          filas = ts.map((t) => {
            const inactiva = t.requiere === 'camaBaja' && !aj.camaBaja;
            return (
              <button type="button" class={`item ${claseCategoria(t.categoria)}${inactiva ? ' inactiva' : ''}`} onClick={() => editarTarea(t)}>
                <Insignia cat={t.categoria} tam={36} />
                <div class="item-txt">
                  <div class="item-tit">
                    {t.titulo}
                    {t.requiere === 'camaBaja' && <span class="tag">Cama baja</span>}
                  </div>
                  <div class="item-meta">{metaTarea(t)}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            );
          });
        }
        if (!filas.length) return null;
        return (
          <section class={`seccion${plegadas.value.has(k) ? ' plegada' : ''}`}>
            <button type="button" class="seccion-btn" onClick={() => alternarSeccion(k)}>
              <span class="t">{titulo}</span>
              <span class="n">{filas.length}</span>
              <Icono n="chevronAbajo" t={18} />
            </button>
            <div class="tarjeta">{filas}</div>
          </section>
        );
      })}
    </>
  );
}

// ---------- Editor de tareas ----------

const pasoMinutos = (v: number, dir: number) => {
  const base = dir > 0 ? v : v - 1;
  const paso = base < 10 ? 1 : base < 60 ? 5 : 10;
  return Math.min(480, Math.max(1, v + dir * paso));
};

function mesesDelPeriodo(f: Frecuencia): [number, string][] {
  if (f === 'trimestral') return [[1, '1.er mes del trimestre'], [2, '2.º mes del trimestre'], [3, '3.er mes del trimestre']];
  if (f === 'semestral') return [1, 2, 3, 4, 5, 6].map((v) => [v, `${v}.º mes del semestre`]);
  return MESES.slice(1).map((n, i) => [i + 1, n[0].toUpperCase() + n.slice(1)]);
}

function EditorTarea({ original, cerrar }: { original: Tarea | null; cerrar: () => void }) {
  const hoyWd = isoWeekday(new Date());
  const [f, setF] = useState<Tarea>(() =>
    original
      ? { ...original, momento: original.momento || 'fija', dias: original.dias || [hoyWd] }
      : { id: idNuevo(), titulo: '', categoria: 'casa', frecuencia: 'semanal', momento: 'fija', dias: [hoyWd], minutos: 10 },
  );
  const [error, setError] = useState('');
  const set = (p: Partial<Tarea>) => setF((x) => ({ ...x, ...p }));
  const periodica = esPeriodica(f);
  const plan = f.plan || { mes: 1, semana: 1, dia: 1 };
  const setPlan = (p: Partial<typeof plan>) => set({ plan: { ...plan, ...p } });

  const cambiarFrecuencia = (fr: Frecuencia) => {
    const nuevo: Partial<Tarea> = { frecuencia: fr };
    if (fr in { mensual: 1, trimestral: 1, semestral: 1, anual: 1 }) {
      const max = fr === 'trimestral' ? 3 : fr === 'semestral' ? 6 : fr === 'anual' ? 12 : 1;
      nuevo.plan = original?.plan ? { ...original.plan, mes: Math.min(original.plan.mes, max) } : sugerirPlan(modelo.value, { ...f, frecuencia: fr, plan: undefined, mes: 1 });
    }
    set(nuevo);
  };

  const prox = periodica ? proximaFecha({ ...f, plan }, new Date()) : null;
  const cuando = periodica
    ? f.frecuencia === 'mensual'
      ? `Cada mes, ${ORDINALES[plan.semana]} semana, ${DIAS[plan.dia].toLowerCase()}`
      : `${mesesActivos({ ...f, plan }).map((m) => MESES[m]).join(', ')}: ${ORDINALES[plan.semana]} semana, ${DIAS[plan.dia].toLowerCase()}`
    : '';

  const guardarTarea = async () => {
    const titulo = f.titulo.trim();
    if (!titulo) return setError('titulo'), false;
    if (f.frecuencia === 'semanal' && !f.dias?.length) return setError('dias'), false;
    const r: Tarea = { id: f.id, titulo, categoria: f.categoria, frecuencia: f.frecuencia, minutos: f.minutos || 10 };
    if (f.notas?.trim()) r.notas = f.notas.trim();
    if (f.requiere) r.requiere = f.requiere;
    if (f.frecuencia === 'diaria') {
      r.momento = f.momento;
      if (f.cadaDias && f.cadaDias > 1) r.cadaDias = f.cadaDias;
    } else if (f.frecuencia === 'semanal') {
      r.momento = f.momento;
      r.dias = [...(f.dias || [])].sort((a, b) => a - b);
      if (f.semana) r.semana = f.semana;
    } else {
      r.plan = plan;
      if (f.frecuencia === 'mensual' && f.meses) r.meses = f.meses;
    }
    await guardarElemento('tarea', r);
  };

  const borrar = async () => {
    if (await confirmar({ titulo: '¿Eliminar esta tarea?', texto: 'Puedes recuperarla con «Restablecer tareas» en Ajustes.', ok: 'Eliminar', peligro: true })) {
      await eliminarElemento('tarea', f.id);
      cerrar();
    }
  };

  return (
    <Hoja titulo={original ? 'Editar tarea' : 'Nueva tarea'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Añadir'} onGuardar={guardarTarea}>
      <Lista>
        <Campo et="Nombre" col clase={error === 'titulo' ? 'error' : ''}>
          <Texto valor={f.titulo} cambiar={(v) => set({ titulo: v })} marcador="Por ejemplo: Limpiar el horno" />
        </Campo>
      </Lista>
      <Lista titulo="Categoría">
        <Campo col>
          <div class="chips">
            {Object.entries(rutina.categorias).map(([id, c]) => (
              <button type="button" class={`chip ${claseCategoria(id)}`} aria-pressed={f.categoria === id} onClick={() => set({ categoria: id })}>
                <Icono n={c.icono} t={18} />
                {c.nombre}
              </button>
            ))}
          </div>
        </Campo>
      </Lista>
      <Lista titulo="Cuándo">
        <Campo et="Frecuencia">
          <Selector opciones={FRECUENCIAS} valor={f.frecuencia} cambiar={cambiarFrecuencia} />
        </Campo>
        {f.frecuencia === 'diaria' && (
          <Campo et="Se repite">
            <Selector opciones={[[1, 'Cada día'], [2, 'Cada 2 días'], [3, 'Cada 3 días']]} valor={f.cadaDias || 1} cambiar={(v) => set({ cadaDias: v })} />
          </Campo>
        )}
        {(f.frecuencia === 'diaria' || f.frecuencia === 'semanal') && (
          <Campo et="Momento del día" col>
            <Segmentado opciones={MOMENTOS} valor={f.momento || 'fija'} cambiar={(v) => set({ momento: v })} />
          </Campo>
        )}
        {f.frecuencia === 'semanal' && (
          <>
            <Campo et="Días de la semana" col clase={error === 'dias' ? 'error' : ''}>
              <div class="dias-sel">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    type="button"
                    aria-label={DIAS[d]}
                    aria-pressed={f.dias?.includes(d)}
                    onClick={() => set({ dias: f.dias?.includes(d) ? f.dias.filter((x) => x !== d) : [...(f.dias || []), d] })}
                  >
                    {DIAS_INICIAL[d]}
                  </button>
                ))}
              </div>
            </Campo>
            <Campo et="Semanas" col>
              <Segmentado<'' | 'A' | 'B'> opciones={[['', 'Todas'], ['A', 'Solo A'], ['B', 'Solo B']]} valor={f.semana || ''} cambiar={(v) => set({ semana: v || undefined })} />
            </Campo>
          </>
        )}
        {periodica && (
          <>
            {f.frecuencia !== 'mensual' && (
              <Campo et="Mes">
                <Selector opciones={mesesDelPeriodo(f.frecuencia)} valor={plan.mes} cambiar={(v) => setPlan({ mes: v })} />
              </Campo>
            )}
            <Campo et="Semana del mes">
              <Selector opciones={[1, 2, 3, 4].map((n) => [n, `${ORDINALES[n]} semana`] as [number, string])} valor={plan.semana} cambiar={(v) => setPlan({ semana: v })} />
            </Campo>
            <Campo et="Día">
              <Selector opciones={[1, 2, 3, 4, 5, 6, 7].map((n) => [n, DIAS[n]] as [number, string])} valor={plan.dia} cambiar={(v) => setPlan({ dia: v })} />
            </Campo>
            <Campo col>
              <div class="ayuda">
                <b>{cuando}</b>
                {prox && (
                  <>
                    <br />
                    Próxima vez: {DIAS[isoWeekday(prox)].toLowerCase()} {fechaCorta(prox)}. Se queda visible hasta que la marques o termine el periodo.
                  </>
                )}
              </div>
              <button type="button" class="boton-fino" onClick={() => set({ plan: sugerirPlan(modelo.value, { ...f, plan: undefined, mes: plan.mes }) })}>
                Repartir automáticamente
              </button>
            </Campo>
          </>
        )}
      </Lista>
      <Lista titulo="Detalles">
        <Campo et="Tiempo estimado">
          <PasoMinutos valor={f.minutos || 10} cambiar={(v) => set({ minutos: v })} />
        </Campo>
        <Campo et="Notas" col>
          <Texto multilinea valor={f.notas || ''} cambiar={(v) => set({ notas: v })} marcador="Opcional" />
        </Campo>
        <Campo et="Solo con cama baja" sub="Aparece únicamente si el interruptor de Ajustes está activo">
          <Interruptor valor={f.requiere === 'camaBaja'} cambiar={(v) => set({ requiere: v ? 'camaBaja' : undefined })} />
        </Campo>
      </Lista>
      {original && (
        <div class="lista separada">
          <button type="button" class="boton-fila peligro" onClick={borrar}>
            <Icono n="papelera" t={22} />
            Eliminar tarea
          </button>
        </div>
      )}
    </Hoja>
  );
}

// El paso de minutos del hogar usa saltos variables (1, 5 o 10 min).
function PasoMinutos({ valor, cambiar }: { valor: number; cambiar: (v: number) => void }) {
  return (
    <div class="paso">
      <button type="button" aria-label="Menos tiempo" onClick={() => cambiar(pasoMinutos(valor, -1))}>
        <Icono n="menos" t={20} />
      </button>
      <output>{minutosATexto(valor)}</output>
      <button type="button" aria-label="Más tiempo" onClick={() => cambiar(pasoMinutos(valor, 1))}>
        <Icono n="anadir" t={20} />
      </button>
    </div>
  );
}

function EditorColada({ original, cerrar }: { original: Colada | null; cerrar: () => void }) {
  const [f, setF] = useState<Colada>(
    () => original || { id: idNuevo(), dia: isoWeekday(new Date()), semana: null, titulo: '', ropa: [], programa: '', temperatura: '', centrifugado: '', aditivos: '', minutos: 12, notas: [] },
  );
  const [ropa, setRopa] = useState(f.ropa.join('\n'));
  const [notas, setNotas] = useState(f.notas.join('\n'));
  const [error, setError] = useState(false);
  const set = (p: Partial<Colada>) => setF((x) => ({ ...x, ...p }));
  const lineas = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  const guardarColada = async () => {
    if (!f.titulo.trim()) return setError(true), false;
    await guardarElemento('colada', { ...f, titulo: f.titulo.trim(), ropa: lineas(ropa), notas: lineas(notas) });
  };
  const borrar = async () => {
    if (await confirmar({ titulo: '¿Eliminar esta colada?', texto: 'Puedes recuperarla con «Restablecer tareas» en Ajustes.', ok: 'Eliminar', peligro: true })) {
      await eliminarElemento('colada', f.id);
      cerrar();
    }
  };

  return (
    <Hoja titulo={original ? 'Editar colada' : 'Nueva colada'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Añadir'} onGuardar={guardarColada}>
      <Lista>
        <Campo et="Nombre" col clase={error ? 'error' : ''}>
          <Texto valor={f.titulo} cambiar={(v) => set({ titulo: v })} marcador="Por ejemplo: Toallas y paños" />
        </Campo>
        <Campo et="Día">
          <Selector opciones={[1, 2, 3, 4, 5, 6, 7].map((n) => [n, DIAS[n]] as [number, string])} valor={f.dia} cambiar={(v) => set({ dia: v })} />
        </Campo>
        <Campo et="Semanas" col>
          <Segmentado<'' | 'A' | 'B'> opciones={[['', 'Todas'], ['A', 'Solo A'], ['B', 'Solo B']]} valor={f.semana || ''} cambiar={(v) => set({ semana: v || null })} />
        </Campo>
      </Lista>
      <Lista titulo="Lavado">
        <Campo et="Programa" col>
          <Texto valor={f.programa} cambiar={(v) => set({ programa: v })} marcador="30° + Sanytol, sin suavizante" />
        </Campo>
        <Campo et="Temperatura" col>
          <Texto valor={f.temperatura} cambiar={(v) => set({ temperatura: v })} marcador="30°" />
        </Campo>
        <Campo et="Centrifugado (rpm)" col>
          <Texto valor={f.centrifugado} cambiar={(v) => set({ centrifugado: v })} marcador="600-800" />
        </Campo>
        <Campo et="Aditivos" col>
          <Texto multilinea filas={2} valor={f.aditivos} cambiar={(v) => set({ aditivos: v })} marcador="Opcional" />
        </Campo>
      </Lista>
      <Lista titulo="Qué lleva">
        <Campo et="Una prenda o grupo por línea" col>
          <Texto multilinea valor={ropa} cambiar={setRopa} />
        </Campo>
      </Lista>
      <Lista titulo="Notas">
        <Campo et="Una nota por línea" col>
          <Texto multilinea filas={4} valor={notas} cambiar={setNotas} />
        </Campo>
        <Campo et="Tiempo para poner y tender">
          <PasoMinutos valor={f.minutos || 12} cambiar={(v) => set({ minutos: v })} />
        </Campo>
      </Lista>
      {original && (
        <div class="lista separada">
          <button type="button" class="boton-fila peligro" onClick={borrar}>
            <Icono n="papelera" t={22} />
            Eliminar colada
          </button>
        </div>
      )}
    </Hoja>
  );
}

const editarTarea = (t: Tarea | null) => abrirHoja((cerrar) => <EditorTarea original={t} cerrar={cerrar} />);
const editarColada = (c: Colada | null) => abrirHoja((cerrar) => <EditorColada original={c} cerrar={cerrar} />);
