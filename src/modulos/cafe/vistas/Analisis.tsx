// CAFÉ · Análisis: resumen, ritmo, evolución de la nota, lo aprendido, gustos, ajuste fino,
// mejores recetas por café y método, control chart y comparador.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { Hoja, abrirHoja, avisar } from '../../../ui/capas';
import { Segmentado, Selector, fmt } from '../../../ui/form';
import { Barras, Dispersion, LineaNotas } from '../../../ui/Graficos';
import { Icono } from '../../../ui/Icono';
import { aprendizajes, consejoCompra, preferencias, type Grupo } from '../aprendizaje';
import { extraccion } from '../calculos';
import { metodo } from '../datos/metodos';
import { combosAjuste, enPeriodo, evolucionNota, media, mejoresRecetas, porMetodo, porSemana, puntosAjuste, resumen } from '../estadisticas';
import type { MetodoId, Preparacion } from '../modelo';
import { listarCafes, listarEquipo, listarPreparaciones } from '../repositorio';
import { ControlChart } from './ControlChart';
import { IconoMetodo, Nota, resumenPrep } from './comunes';

const periodo = signal<'30' | '90' | 'todo'>('90');

function Cifra({ etiqueta, valor, sub }: { etiqueta: string; valor: string; sub?: string }) {
  return (
    <div>
      <dt>{etiqueta}</dt>
      <dd>
        {valor}
        {sub && <small> {sub}</small>}
      </dd>
    </div>
  );
}

function BarrasGrupo({ titulo, grupos }: { titulo: string; grupos: Grupo[] }) {
  const g = grupos.slice(0, 4);
  if (!g.length) return null;
  return (
    <div class="grupo-gustos">
      <div class="gg-tit">{titulo}</div>
      {g.map((x) => (
        <div class="gg-fila">
          <span class="gg-nombre">{x.nombre}</span>
          <span class="gg-barra">
            <span style={{ width: `${(x.media / 10) * 100}%` }} />
          </span>
          <span class="gg-valor">
            {fmt(x.media)}
            <small> · {x.n}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

const textoKg = (g: number) => (g >= 1000 ? `${fmt(g / 1000, 2)} kg` : `${fmt(g, 0)} g`);
const euros = (x?: number) => (x === undefined ? '—' : `${x.toFixed(2).replace('.', ',')} €`);

export function Analisis() {
  const todas = useVivo(listarPreparaciones, []);
  const cafes = useVivo(listarCafes, []) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const [metodoNota, setMetodoNota] = useState<MetodoId | 'todos'>('todos');
  const [combo, setCombo] = useState(0);
  if (!todas) return null;

  if (todas.length === 0) {
    return (
      <div class="vacio">
        <Icono n="grafico" t={44} />
        <p>Aún no hay preparaciones que analizar.</p>
        <p class="pie">En cuanto registres unas cuantas, aquí verás tu evolución, lo que te funciona y tus mejores recetas.</p>
      </div>
    );
  }

  const dias = periodo.value === 'todo' ? null : Number(periodo.value);
  const preps = enPeriodo(todas, dias);
  const r = resumen(preps, cafes);
  const semanas = porSemana(todas, 12);
  const metodosUsados = [...new Set(todas.map((p) => p.metodo))];
  const evol = evolucionNota(metodoNota === 'todos' ? preps : preps.filter((p) => p.metodo === metodoNota));
  const primeras = media(evol.slice(0, 5).map((e) => e.nota));
  const ultimas = media(evol.slice(-5).map((e) => e.nota));
  const aprendido = aprendizajes(todas);
  const gustos = preferencias(todas, cafes);
  const consejo = consejoCompra(gustos);
  const combos = combosAjuste(todas);
  const c = combos[Math.min(combo, combos.length - 1)];
  const molinoC = c ? equipo.find((e) => e.id === c.molinoId) : undefined;
  const puntos = c ? puntosAjuste(todas, c.cafeId, c.metodo, c.molinoId) : [];
  const mejorAjuste = puntos.reduce<(typeof puntos)[number] | undefined>((b, p) => (!b || p.y > b.y || (p.y === b.y && p.t > b.t) ? p : b), undefined);
  const recientes = new Set([...puntos].sort((a, b) => b.t - a.t).slice(0, 1).map((p) => p.id));
  const metodos = porMetodo(preps);
  const mejores = mejoresRecetas(todas, cafes);
  const conTds = preps.filter((p) => p.tds && p.metodo !== 'espresso' && extraccion(p) !== undefined);

  return (
    <>
      <div class="sub-cabecera">
        <Segmentado<'30' | '90' | 'todo'> opciones={[['30', '30 días'], ['90', '90 días'], ['todo', 'Todo']]} valor={periodo.value} cambiar={(v) => (periodo.value = v)} />
        <button type="button" class="btn-mas" aria-label="Comparar preparaciones" onClick={() => elegirParaComparar()}>
          <Icono n="copiar" t={22} />
        </button>
      </div>

      <dl class="rejilla-datos">
        <Cifra etiqueta="Preparaciones" valor={String(r.n)} />
        <Cifra etiqueta="Cafés distintos" valor={String(r.cafes)} />
        <Cifra etiqueta="Nota media" valor={r.media !== undefined ? fmt(r.media) : '—'} sub={r.media !== undefined ? '/10' : undefined} />
        <Cifra etiqueta="Café molido" valor={textoKg(r.gramos)} />
        <Cifra etiqueta="Gasto estimado" valor={euros(r.coste)} sub={r.conCoste && r.conCoste < r.n ? `(${r.conCoste} de ${r.n})` : undefined} />
        <Cifra etiqueta="Coste por taza" valor={euros(r.costeTaza)} />
      </dl>
      {r.conCoste < r.n && <p class="pie">El gasto solo cuenta los cafés con precio y peso del paquete anotados.</p>}

      <div class="tit-lista">Ritmo · últimas 12 semanas</div>
      <div class="lista bloque-grafico">
        <Barras titulo="Preparaciones por semana" datos={semanas.map((s) => ({ etiqueta: s.etiqueta, valor: s.n }))} cadaEtiqueta={3} />
      </div>

      <div class="tit-lista">Evolución de la nota</div>
      <div class="lista bloque-grafico">
        {metodosUsados.length > 1 && (
          <div class="chips desplazables compactos">
            <button type="button" class="chip" aria-pressed={metodoNota === 'todos'} onClick={() => setMetodoNota('todos')}>
              Todos
            </button>
            {metodosUsados.map((m) => (
              <button type="button" class="chip" aria-pressed={metodoNota === m} onClick={() => setMetodoNota(m)}>
                {metodo(m).nombre}
              </button>
            ))}
          </div>
        )}
        {evol.length >= 2 ? (
          <>
            <LineaNotas titulo="Notas en el tiempo" puntos={evol} />
            <p class="ayuda">
              Puntos: cada preparación. Línea: media de las últimas 5.
              {evol.length >= 10 && primeras !== undefined && ultimas !== undefined
                ? ` Tus 5 primeras: ${fmt(primeras)} de media; tus 5 últimas: ${fmt(ultimas)}.${ultimas > primeras + 0.3 ? ' Vas mejorando.' : ''}`
                : ''}
            </p>
          </>
        ) : (
          <p class="ayuda">Puntúa al menos dos preparaciones en este periodo para ver la evolución.</p>
        )}
      </div>

      <div class="tit-lista">Lo que vas aprendiendo</div>
      <div class="lista bloque-texto">
        {aprendido.length ? (
          aprendido.slice(0, 5).map((a) => (
            <p class="aprendizaje">
              <Icono n={a.media >= 0.25 ? 'check' : a.media <= -0.25 ? 'aviso' : 'info'} t={16} clase={a.media >= 0.25 ? 'bien' : a.media <= -0.25 ? 'mal' : ''} />
              <span>{a.texto}</span>
            </p>
          ))
        ) : (
          <p class="ayuda">Cuando repitas una preparación cambiando una sola cosa (botón «Repetir»), aquí verás qué cambios te suben la nota. Hacen falta al menos dos repeticiones del mismo cambio.</p>
        )}
        {aprendido.length > 0 && <p class="ayuda">Son tendencias de tus propios registros, no reglas: con pocos datos pueden deberse al azar o al día.</p>}
      </div>

      <div class="tit-lista">Tus gustos</div>
      <div class="lista bloque-texto">
        {gustos.cafesPuntuados < 2 ? (
          <p class="ayuda">Con al menos dos cafés puntuados verás aquí qué orígenes, procesos y tuestes te gustan más.</p>
        ) : (
          <>
            <BarrasGrupo titulo="Proceso" grupos={gustos.procesos} />
            <BarrasGrupo titulo="Origen" grupos={gustos.paises} />
            <BarrasGrupo titulo="Tueste" grupos={gustos.tuestes} />
            {gustos.sabores.length > 0 && (
              <p class="ayuda">
                En tus tazas de 8 o más aparecen sobre todo: <b>{gustos.sabores.slice(0, 3).map((s) => s.nombre.toLowerCase()).join(', ')}</b>.
              </p>
            )}
            <p class="ayuda">Nota media de cada café y número de cafés. {consejo || 'Con más cafés distintos la app te sugerirá qué buscar al comprar.'}</p>
          </>
        )}
      </div>

      {c && (
        <>
          <div class="tit-lista">Ajuste fino de la molienda</div>
          <div class="lista bloque-grafico">
            {combos.length > 1 && (
              <Selector
                opciones={combos.map((x, i) => [i, `${x.cafeNombre} · ${metodo(x.metodo).nombre}`] as [number, string])}
                valor={Math.min(combo, combos.length - 1)}
                cambiar={setCombo}
              />
            )}
            <Dispersion
              titulo="Molienda frente a nota"
              puntos={puntos.map((p) => ({ x: p.x, y: p.y, reciente: recientes.has(p.id) }))}
              etiquetaX={molinoC?.molino?.escala === 'clics' ? `Clics en ${molinoC.nombre} (más fino ←  → más grueso)` : `Posición${molinoC ? ` en ${molinoC.nombre}` : ''} (más fino ←  → más grueso)`}
            />
            {mejorAjuste && (
              <p class="ayuda">
                {c.cafeNombre} con {metodo(c.metodo).nombre}: tu mejor nota ({fmt(mejorAjuste.y)}) fue con la molienda en <b>{fmt(mejorAjuste.x)}</b>. El punto con borde es el más reciente.
              </p>
            )}
          </div>
        </>
      )}

      <div class="tit-lista">Por método</div>
      <div class="lista">
        {metodos.map((m) => (
          <div class="item">
            <IconoMetodo id={m.metodo} />
            <div class="item-txt">
              <div class="item-tit">{metodo(m.metodo).nombre}</div>
              <div class="item-meta">
                {m.n} {m.n === 1 ? 'preparación' : 'preparaciones'}
                {m.media !== undefined ? ` · media ${fmt(m.media)}` : ''}
              </div>
            </div>
            <Nota p={m.mejor?.puntuacion} />
          </div>
        ))}
      </div>
      <p class="pie">A la derecha, tu mejor nota con cada método en el periodo.</p>

      <div class="tit-lista">Tu mejor receta de cada café</div>
      <div class="lista">
        {mejores.slice(0, 15).map((m) => (
          <a class={`item${m.terminado ? ' inactiva' : ''}`} href={`#/cafe/p/${m.mejor.id}`}>
            <IconoMetodo id={m.metodo} />
            <div class="item-txt">
              <div class="item-tit">
                {m.cafeNombre} · {metodo(m.metodo).nombre}
              </div>
              <div class="item-meta">
                {resumenPrep(m.mejor, equipo)}
                {m.mejor.temperatura ? ` · ${m.mejor.temperatura} °C` : ''}
              </div>
            </div>
            <Nota p={m.mejor.puntuacion} />
          </a>
        ))}
      </div>
      <p class="pie">Una fila por café y método, con tu preparación mejor puntuada (de siempre). Ábrela para repetirla o guardarla como receta.</p>

      {conTds.length > 0 && (
        <>
          <div class="tit-lista">Control chart · filtro</div>
          <div class="lista bloque-grafico">
            <ControlChart tipo="filtro" puntos={conTds.map((p) => ({ tds: p.tds!, ey: extraccion(p)! }))} />
          </div>
        </>
      )}

      <div class="lista separada">
        <button type="button" class="boton-fila" onClick={() => elegirParaComparar()}>
          <Icono n="copiar" t={22} /> Comparar preparaciones
        </button>
      </div>
    </>
  );
}

// ---------- Elegir preparaciones para comparar ----------

function ElegirComparar({ cerrar, inicial }: { cerrar: () => void; inicial: string[] }) {
  const preps = useVivo(listarPreparaciones, []) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const [sel, setSel] = useState<string[]>(inicial);
  const alternar = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id]));
  const comparar = async () => {
    if (sel.length < 2) {
      await avisar('Elige al menos dos', 'Puedes comparar dos o tres preparaciones.');
      return false;
    }
    ir(`/cafe/comparar?ids=${sel.join(',')}`);
  };
  return (
    <Hoja titulo={`Comparar (${sel.length}/3)`} cerrar={cerrar} guardar="Comparar" onGuardar={comparar}>
      <div class="lista">
        {preps.slice(0, 60).map((p: Preparacion) => (
          <button type="button" class="item" aria-pressed={sel.includes(p.id)} onClick={() => alternar(p.id)}>
            <span class={`casilla${sel.includes(p.id) ? ' marcada' : ''}`}>{sel.includes(p.id) && <Icono n="check" t={16} />}</span>
            <div class="item-txt">
              <div class="item-tit">
                {metodo(p.metodo).nombre} · {p.cafeNombre || 'Sin registrar'}
              </div>
              <div class="item-meta">
                {new Date(p.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {resumenPrep(p, equipo)}
              </div>
            </div>
            <Nota p={p.puntuacion} />
          </button>
        ))}
      </div>
    </Hoja>
  );
}

export const elegirParaComparar = (inicial: string[] = []) => abrirHoja((cerrar) => <ElegirComparar cerrar={cerrar} inicial={inicial} />);
