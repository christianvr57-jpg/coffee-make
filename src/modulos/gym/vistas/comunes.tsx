// Piezas del Gym: buscador de ejercicios, crear un ejercicio propio y el temporizador de descanso.
import { signal } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';
import { pitido, prepararAudio } from '../../../core/dispositivo';
import { Hoja, abrirHoja, mostrarToast } from '../../../ui/capas';
import { Campo, Lista, Selector, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { ajustesGym, catalogo, guardarPropio } from '../estado';
import { EQUIPOS, GRUPOS, nombreEquipo, nombreGrupo, type Ejercicio, type Equipo, type Grupo, type TipoRegistro } from '../tipos';

/** Texto de búsqueda sin tildes. */
const normal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function filtrar(lista: Ejercicio[], q: string, grupo: Grupo | 'todos', equipo: Equipo | 'todos') {
  const n = normal(q.trim());
  return lista.filter((e) => (grupo === 'todos' || e.grupo === grupo || e.secundarios.includes(grupo)) && (equipo === 'todos' || e.equipo === equipo) && (!n || normal(`${e.nombre} ${nombreGrupo(e.grupo)} ${nombreEquipo(e.equipo)}`).includes(n)));
}

export function InsigniaGrupo({ grupo, t = 36 }: { grupo: string; t?: number }) {
  return (
    <span class={`insignia gym-g g-${grupo}`} style={{ '--tam': `${t}px` }}>
      <span>{nombreGrupo(grupo).slice(0, 2)}</span>
    </span>
  );
}

// ---------- Elegir ejercicio ----------

const ultimoGrupo = signal<Grupo | 'todos'>('todos');

function ElegirEjercicio({ cerrar, alElegir, varios }: { cerrar: () => void; alElegir: (ids: string[]) => void; varios: boolean }) {
  const [q, setQ] = useState('');
  const [equipo, setEquipo] = useState<Equipo | 'todos'>('todos');
  const [sel, setSel] = useState<string[]>([]);
  const lista = filtrar(catalogo(), q, ultimoGrupo.value, equipo);
  const tocar = (id: string) => {
    if (!varios) {
      alElegir([id]);
      cerrar();
    } else setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  return (
    <Hoja
      titulo={varios ? `Añadir ejercicios${sel.length ? ` (${sel.length})` : ''}` : 'Elegir ejercicio'}
      cerrar={cerrar}
      guardar={varios ? 'Añadir' : undefined}
      onGuardar={
        varios
          ? () => {
              if (!sel.length) return false;
              alElegir(sel);
            }
          : undefined
      }
    >
      <div class="buscador">
        <Icono n="buscar" t={18} />
        <input type="search" placeholder="Buscar: press, sentadilla, polea…" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      </div>
      <div class="chips desplazables compactos">
        <button type="button" class="chip" aria-pressed={ultimoGrupo.value === 'todos'} onClick={() => (ultimoGrupo.value = 'todos')}>
          Todos
        </button>
        {GRUPOS.map(([g, n]) => (
          <button type="button" class="chip" aria-pressed={ultimoGrupo.value === g} onClick={() => (ultimoGrupo.value = g)}>
            {n}
          </button>
        ))}
      </div>
      <div class="lista gym-filtro-equipo">
        <Campo et="Material">
          <Selector<Equipo | 'todos'> opciones={[['todos', 'Todo'], ...EQUIPOS]} valor={equipo} cambiar={setEquipo} />
        </Campo>
      </div>
      <div class="lista gym-lista-ej">
        {lista.slice(0, 120).map((e) => (
          <button type="button" class="item" aria-pressed={sel.includes(e.id)} onClick={() => tocar(e.id)}>
            {varios ? <span class={`casilla${sel.includes(e.id) ? ' marcada' : ''}`}>{sel.includes(e.id) && <Icono n="check" t={16} />}</span> : <InsigniaGrupo grupo={e.grupo} t={32} />}
            <div class="item-txt">
              <div class="item-tit">{e.nombre}</div>
              <div class="item-meta">
                {nombreGrupo(e.grupo)} · {nombreEquipo(e.equipo)}
                {e.propio ? ' · tuyo' : ''}
              </div>
            </div>
          </button>
        ))}
        {!lista.length && <p class="pie">Ninguno coincide.</p>}
      </div>
      <div class="lista separada">
        <button type="button" class="boton-fila" onClick={() => crearEjercicio(q, (id) => tocar(id))}>
          <Icono n="anadir" t={22} /> Crear ejercicio{q.trim() ? ` «${q.trim()}»` : ''}
        </button>
      </div>
    </Hoja>
  );
}

export const elegirEjercicio = (alElegir: (ids: string[]) => void, varios = true) => abrirHoja((cerrar) => <ElegirEjercicio cerrar={cerrar} alElegir={alElegir} varios={varios} />);

// ---------- Crear ejercicio propio ----------

const TIPOS: [TipoRegistro, string][] = [
  ['peso', 'Peso y repeticiones'],
  ['reps', 'Repeticiones (peso corporal)'],
  ['tiempo', 'Tiempo (isométricos)'],
  ['cardio', 'Minutos y km (cardio)'],
];

function CrearEjercicio({ cerrar, inicial, alCrear }: { cerrar: () => void; inicial: Partial<Ejercicio>; alCrear?: (id: string) => void }) {
  const [nombre, setNombre] = useState(inicial.nombre || '');
  const [grupo, setGrupo] = useState<Grupo>(inicial.grupo || 'pecho');
  const [equipo, setEquipo] = useState<Equipo>(inicial.equipo || 'maquina');
  const [tipo, setTipo] = useState<TipoRegistro>(inicial.tipo || 'peso');
  const [consejo, setConsejo] = useState(inicial.consejo || '');
  return (
    <Hoja
      titulo={inicial.id ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      cerrar={cerrar}
      guardar={inicial.id ? 'Guardar' : 'Crear'}
      onGuardar={async () => {
        if (!nombre.trim()) return false;
        const id = await guardarPropio({ id: inicial.id, nombre: nombre.trim(), grupo, equipo, tipo, secundarios: inicial.secundarios || [], consejo: consejo.trim() || undefined });
        mostrarToast(inicial.id ? 'Ejercicio guardado' : 'Ejercicio creado');
        alCrear?.(id);
      }}
    >
      <Lista>
        <Campo et="Nombre" col>
          <Texto valor={nombre} cambiar={setNombre} marcador="Por ejemplo: Press en máquina convergente" />
        </Campo>
        <Campo et="Músculo principal">
          <Selector<Grupo> opciones={GRUPOS} valor={grupo} cambiar={setGrupo} />
        </Campo>
        <Campo et="Material">
          <Selector<Equipo> opciones={EQUIPOS} valor={equipo} cambiar={setEquipo} />
        </Campo>
        <Campo et="Se apunta" col>
          <Selector<TipoRegistro> opciones={TIPOS} valor={tipo} cambiar={setTipo} />
        </Campo>
        <Campo et="Notas de técnica (opcional)" col>
          <Texto multilinea filas={3} valor={consejo} cambiar={setConsejo} marcador="Asiento en el 4, agarre neutro…" />
        </Campo>
      </Lista>
    </Hoja>
  );
}

export const crearEjercicio = (nombre = '', alCrear?: (id: string) => void) => abrirHoja((cerrar) => <CrearEjercicio cerrar={cerrar} inicial={{ nombre }} alCrear={alCrear} />);
export const editarEjercicio = (e: Ejercicio) => abrirHoja((cerrar) => <CrearEjercicio cerrar={cerrar} inicial={e} />);

// ---------- Descanso entre series ----------

export const descanso = signal<{ fin: number; total: number } | null>(null);

export function empezarDescanso(segundos = ajustesGym.value.descanso) {
  if (!segundos) return;
  prepararAudio();
  descanso.value = { fin: Date.now() + segundos * 1000, total: segundos };
}

const reloj = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

export function BarraDescanso() {
  const [ahora, setAhora] = useState(Date.now());
  const d = descanso.value;
  useEffect(() => {
    if (!d) return;
    let avisado = false;
    const t = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      if (!avisado && n >= d.fin) {
        avisado = true;
        if (ajustesGym.value.sonido) [0, 350, 700].forEach((ms) => setTimeout(() => pitido(true), ms));
        try {
          navigator.vibrate?.([250, 120, 250]);
        } catch {
          /* sin vibración */
        }
        setTimeout(() => {
          if (descanso.value === d) descanso.value = null;
        }, 4000);
      }
    }, 250);
    return () => clearInterval(t);
  }, [d]);
  if (!d) return null;
  const resta = Math.ceil((d.fin - ahora) / 1000);
  const frac = Math.min(1, Math.max(0, 1 - resta / d.total));
  const mover = (s: number) => (descanso.value = { fin: d.fin + s * 1000, total: Math.max(5, d.total + s) });
  return (
    <div class={`gym-descanso${resta <= 0 ? ' listo' : ''}`} role="timer">
      <span class="gd-barra" style={{ width: `${frac * 100}%` }} />
      <button type="button" onClick={() => mover(-15)} aria-label="Quitar 15 segundos">
        −15
      </button>
      <div>
        <small>{resta <= 0 ? '¡A por la siguiente!' : 'Descanso'}</small>
        <b>{resta <= 0 ? '0:00' : reloj(resta)}</b>
      </div>
      <button type="button" onClick={() => mover(15)} aria-label="Añadir 15 segundos">
        +15
      </button>
      <button type="button" onClick={() => (descanso.value = null)} aria-label="Saltar descanso">
        <Icono n="cerrar" t={18} />
      </button>
    </div>
  );
}
