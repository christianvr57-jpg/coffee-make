// GYM · Entrenar: el entreno en curso (o empezar uno), la semana, tus rutinas y las plantillas.
import { useState } from 'preact/hooks';
import { fechaRelativa, minutosATexto, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { Hoja, abrirHoja, confirmar, elegir, mostrarToast } from '../../../ui/capas';
import { Campo, Lista, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { diasDesdeUltima, duracionMin, porSemana, seriesHechas, volumenSesion } from '../calculos';
import { PLANTILLAS } from '../datos/plantillas';
import { borrarRutina, empezarSesion, guardarRutina, listarRutinas, listarSesiones, nombreEjercicio } from '../estado';
import type { EjercicioRutina, RutinaGym } from '../tipos';
import { elegirEjercicio } from './comunes';

const kg = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kg`;

async function empezar(nombre: string, ejercicios: EjercicioRutina[] = [], rutinaId?: string) {
  const enCurso = (await listarSesiones()).find((s) => !s.fin);
  if (enCurso && !(await confirmar({ titulo: 'Ya hay un entreno en curso', texto: `«${enCurso.nombre}» sigue abierto. ¿Empezar otro de todas formas?`, ok: 'Empezar otro', cancelar: 'Volver' }))) {
    ir(`/gym/sesion/${enCurso.id}`);
    return;
  }
  const id = await empezarSesion(nombre, ejercicios, rutinaId);
  ir(`/gym/sesion/${id}`);
}

// ---------- Editor de rutinas ----------

function EditorRutina({ inicial, cerrar }: { inicial: Partial<RutinaGym>; cerrar: () => void }) {
  const [nombre, setNombre] = useState(inicial.nombre || '');
  const [ejs, setEjs] = useState<EjercicioRutina[]>(inicial.ejercicios || []);
  const set = (i: number, p: Partial<EjercicioRutina>) => setEjs((xs) => xs.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const mover = (i: number, d: number) =>
    setEjs((xs) => {
      if (i + d < 0 || i + d >= xs.length) return xs;
      const ys = [...xs];
      const [x] = ys.splice(i, 1);
      ys.splice(i + d, 0, x);
      return ys;
    });
  return (
    <Hoja
      titulo={inicial.id ? 'Editar rutina' : 'Nueva rutina'}
      cerrar={cerrar}
      guardar="Guardar"
      onGuardar={async () => {
        if (!nombre.trim() || !ejs.length) return false;
        await guardarRutina({ ...inicial, nombre: nombre.trim(), ejercicios: ejs });
        mostrarToast('Rutina guardada');
      }}
    >
      <Lista>
        <Campo et="Nombre" col>
          <Texto valor={nombre} cambiar={setNombre} marcador="Lunes · torso" />
        </Campo>
      </Lista>
      <div class="tit-lista">Ejercicios</div>
      <div class="lista">
        {ejs.map((e, i) => (
          <div class="rutina-ej">
            <div class="re-nombre">
              <b>{nombreEjercicio(e.ejercicioId)}</b>
              <div class="re-ajustes">
                <label>
                  Series
                  <input type="number" inputMode="numeric" min={1} max={10} value={e.series} onInput={(x) => set(i, { series: Math.max(1, Number((x.target as HTMLInputElement).value) || 1) })} />
                </label>
                <label>
                  Reps
                  <input type="text" value={e.reps} onInput={(x) => set(i, { reps: (x.target as HTMLInputElement).value })} />
                </label>
              </div>
            </div>
            <div class="re-botones">
              <button type="button" aria-label="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                <Icono n="chevronIzq" t={16} />
              </button>
              <button type="button" aria-label="Bajar" onClick={() => mover(i, 1)} disabled={i === ejs.length - 1}>
                <Icono n="chevron" t={16} />
              </button>
              <button type="button" aria-label="Quitar" onClick={() => setEjs((xs) => xs.filter((_, j) => j !== i))}>
                <Icono n="papelera" t={16} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" class="boton-fila" onClick={() => elegirEjercicio((ids) => setEjs((xs) => [...xs, ...ids.map((id) => ({ ejercicioId: id, series: 3, reps: '8-12' }))]))}>
          <Icono n="anadir" t={22} /> Añadir ejercicios
        </button>
      </div>
      <p class="pie">Reps admite rangos («8-12»), un número, «30 s» o «al fallo». Con un rango, la app te sugiere cuándo subir el peso.</p>
    </Hoja>
  );
}

export const editarRutina = (r: Partial<RutinaGym> = {}) => abrirHoja((cerrar) => <EditorRutina inicial={r} cerrar={cerrar} />);

// ---------- Vista ----------

function FilaRutina({ nombre, detalle, ejercicios, onEmpezar, onEditar }: { nombre: string; detalle: string; ejercicios: EjercicioRutina[]; onEmpezar: () => void; onEditar?: () => void }) {
  return (
    <div class="rutina-fila">
      <button type="button" class="rf-cuerpo" onClick={onEditar || onEmpezar}>
        <b>{nombre}</b>
        <small>{detalle}</small>
        <span class="rf-ejs">{ejercicios.map((e) => nombreEjercicio(e.ejercicioId)).join(' · ')}</span>
      </button>
      <button type="button" class="rf-empezar" aria-label={`Empezar ${nombre}`} onClick={onEmpezar}>
        <Icono n="play" t={18} />
      </button>
    </div>
  );
}

export function EntrenarGym() {
  const sesiones = useVivo(listarSesiones, []);
  const rutinas = useVivo(listarRutinas, []) || [];
  if (!sesiones) return null;
  const hoy = diaActual.value;
  const enCurso = sesiones.find((s) => !s.fin);
  const semana = porSemana(sesiones, parse(hoy), 1)[0];
  const ultimas = sesiones.filter((s) => s.fin).slice(0, 3);
  const dias = diasDesdeUltima(sesiones, hoy);

  return (
    <>
      {enCurso ? (
        <button type="button" class="gym-encurso" onClick={() => ir(`/gym/sesion/${enCurso.id}`)}>
          <span class="ge-pulso" />
          <div>
            <small>Entreno en curso · {minutosATexto(duracionMin(enCurso))}</small>
            <b>{enCurso.nombre}</b>
            <span>
              {seriesHechas(enCurso)} series hechas · {enCurso.ejercicios.length} ejercicios
            </span>
          </div>
          <Icono n="chevron" t={22} />
        </button>
      ) : (
        <button type="button" class="boton-principal grande" onClick={() => empezar('Entreno libre')}>
          <Icono n="play" t={22} /> Empezar entreno vacío
        </button>
      )}

      <dl class="rejilla-datos gym-semana">
        <div>
          <dt>Esta semana</dt>
          <dd>
            {semana.sesiones} <small>{semana.sesiones === 1 ? 'entreno' : 'entrenos'}</small>
          </dd>
        </div>
        <div>
          <dt>Series</dt>
          <dd>{semana.series}</dd>
        </div>
        <div>
          <dt>Volumen</dt>
          <dd>{kg(semana.volumen)}</dd>
        </div>
        <div>
          <dt>Último</dt>
          <dd>{dias == null ? <small>Aún ninguno</small> : dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`}</dd>
        </div>
      </dl>

      <div class="columnas">
        <div>
          <div class="tit-lista gym-tit">
            <span>Tus rutinas</span>
            <button type="button" class="enlace-boton" onClick={() => editarRutina()}>
              + Nueva
            </button>
          </div>
          {rutinas.length ? (
            <div class="lista">
              {rutinas.map((r) => (
                <FilaRutina
                  nombre={r.nombre}
                  detalle={`${r.ejercicios.length} ejercicios · ${r.ejercicios.reduce((t, e) => t + e.series, 0)} series`}
                  ejercicios={r.ejercicios}
                  onEmpezar={() => empezar(r.nombre, r.ejercicios, r.id)}
                  onEditar={async () => {
                    const op = await elegir(r.nombre, ['Empezar entreno', 'Editar rutina', 'Borrar rutina']);
                    if (op === 0) empezar(r.nombre, r.ejercicios, r.id);
                    if (op === 1) editarRutina(r);
                    if (op === 2 && (await confirmar({ titulo: `¿Borrar «${r.nombre}»?`, texto: 'Los entrenos que hiciste con ella se conservan.', ok: 'Borrar', peligro: true }))) await borrarRutina(r.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div class="lista bloque-texto">
              <p class="ayuda">Crea tus propias rutinas o parte de una plantilla y adáptala (pulsa una plantilla para duplicarla).</p>
            </div>
          )}

          {ultimas.length > 0 && (
            <>
              <div class="tit-lista">Últimos entrenos</div>
              <div class="lista">
                {ultimas.map((s) => (
                  <a class="item" href={`#/gym/sesion/${s.id}`}>
                    <div class="item-txt">
                      <div class="item-tit">{s.nombre}</div>
                      <div class="item-meta">
                        {fechaRelativa(s.fecha)} · {minutosATexto(duracionMin(s))} · {seriesHechas(s)} series · {kg(volumenSesion(s))}
                      </div>
                    </div>
                    <Icono n="chevron" t={16} clase="chev" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <div class="tit-lista">Plantillas para empezar</div>
          <div class="lista">
            {PLANTILLAS.map((p) => (
              <FilaRutina
                nombre={p.nombre}
                detalle={p.descripcion}
                ejercicios={p.ejercicios}
                onEmpezar={() => empezar(p.nombre, p.ejercicios)}
                onEditar={async () => {
                  const op = await elegir(p.nombre, ['Empezar entreno', 'Duplicar como rutina mía']);
                  if (op === 0) empezar(p.nombre, p.ejercicios);
                  if (op === 1) editarRutina({ nombre: p.nombre, ejercicios: p.ejercicios.map((e) => ({ ...e })) });
                }}
              />
            ))}
          </div>
          <p class="pie">Pautas generales para empezar: 2-4 series por ejercicio dejando 1-3 repeticiones en reserva, y subir peso cuando llegues al máximo del rango en todas las series.</p>
        </div>
      </div>
    </>
  );
}
