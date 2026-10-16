// COCINA · Recetas: biblioteca con buscador y filtro por proteína, y ficha de cada receta.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { consulta, ir } from '../../../core/router';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Segmentado, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { RECETAS, receta } from '../datos/recetas';
import { apariciones } from '../plan';
import { CATEGORIAS, PROTEINAS, type Momento, type Proteina, type Receta } from '../tipos';
import { ajustesCocina, gustosCocina, valorarReceta } from '../estado';
import { nombrePersona, nutrientesReceta, racionesReceta, redondear, tablaCantidades, textoCantidad } from '../raciones';
import { NUTRICION } from '../datos/nutricion';
import { Etiquetas } from './comunes';

const busqueda = signal('');
const filtro = signal<Proteina | 'todas' | 'favoritas'>('todas');

export function RecetasCocina() {
  const q = busqueda.value.trim().toLowerCase();
  const val = gustosCocina.value.valoraciones;
  const pasaFiltro = (r: Receta) => (filtro.value === 'todas' ? true : filtro.value === 'favoritas' ? val[r.id] === 1 : r.proteina === filtro.value);
  const lista = RECETAS.filter((r) => pasaFiltro(r) && (!q || `${r.nombre} ${r.ingredientes.map((x) => x.n).join(' ')}`.toLowerCase().includes(q))).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );
  const nFav = Object.values(val).filter((v) => v === 1).length;
  return (
    <>
      <div class="buscador-guia">
        <Icono n="buscar" t={18} />
        <Texto valor={busqueda.value} cambiar={(v) => (busqueda.value = v)} marcador="Buscar plato o ingrediente" />
      </div>
      <div class="chips desplazables compactos filtro-proteina">
        <button type="button" class="chip" aria-pressed={filtro.value === 'todas'} onClick={() => (filtro.value = 'todas')}>
          Todas
        </button>
        <button type="button" class="chip" aria-pressed={filtro.value === 'favoritas'} onClick={() => (filtro.value = 'favoritas')}>
          ♥ Os gustan{nFav ? ` (${nFav})` : ''}
        </button>
        {(Object.keys(PROTEINAS) as Proteina[]).map((p) => (
          <button type="button" class="chip" aria-pressed={filtro.value === p} onClick={() => (filtro.value = p)}>
            {PROTEINAS[p]}
          </button>
        ))}
      </div>
      <div class="lista rejilla-tarjetas">
        {lista.map((r) => (
          <a class="item" href={`#/cocina/recetas/${r.id}`}>
            <div class="item-txt">
              <div class="item-tit">{r.nombre}</div>
              <Etiquetas r={r} />
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        ))}
      </div>
      {lista.length === 0 && <div class="vacio">{filtro.value === 'favoritas' ? 'Aún no habéis marcado ninguna receta como favorita: hazlo desde su ficha.' : 'No hay recetas con esa búsqueda.'}</div>}
      <p class="pie">{RECETAS.length} recetas: todas forman parte del menú de 8 semanas.</p>
    </>
  );
}

/** Tabla de gramos por persona (raciones por kcal activadas). */
function Cantidades({ r, momento, cambiarMomento }: { r: Receta; momento: Momento; cambiarMomento: (m: Momento) => void }) {
  const aj = ajustesCocina.value.raciones;
  const tabla = tablaCantidades(r, momento, aj, aj.ninoEnCompra);
  const rs = racionesReceta(r, momento, aj);
  const conGramos = tabla.filter((t) => t.total !== undefined);
  const alGusto = tabla.filter((t) => t.total === undefined).map((t) => t.ingrediente.n);
  const legumbres = conGramos.filter((t) => NUTRICION[t.ingrediente.n]?.kcalCocida);
  /** En la tabla, solo gramos (o huevos); las equivalencias van debajo. */
  const corto = (n: string, g: number) => (n === 'Huevos' ? textoCantidad(n, g) : `${redondear(g)} g`);
  return (
    <>
      <div class="tit-lista">Cantidades</div>
      <div class="lista bloque-texto">
        <Segmentado<Momento> opciones={[['comida', 'Como comida'], ['cena', 'Como cena']]} valor={momento} cambiar={cambiarMomento} />
        <div class="tabla-cantidades" style={{ '--cols': aj.personas.length + 1 }}>
          <div class="tc-fila tc-cab">
            <span>Ingrediente</span>
            {aj.personas.map((p, i) => (
              <span>{nombrePersona(p, i)}</span>
            ))}
            <span>Total</span>
          </div>
          {conGramos.map((t) => (
            <div class="tc-fila">
              <span class="tc-ing">{t.ingrediente.n}</span>
              {t.porPersona.map((g) => (
                <span>{g ? corto(t.ingrediente.n, g) : ''}</span>
              ))}
              <span class="tc-total">{corto(t.ingrediente.n, t.total!)}</span>
            </div>
          ))}
          <div class="tc-fila tc-pie">
            <span>Energía</span>
            {rs.map((x) => (
              <span>{Math.round(x.kcal)} kcal</span>
            ))}
            <span />
          </div>
          <div class="tc-fila tc-pie">
            <span>Proteína</span>
            {rs.map((x) => (
              <span>{Math.round(x.prot)} g</span>
            ))}
            <span />
          </div>
        </div>
        {legumbres.map((t) => (
          <p class="ayuda">
            {t.ingrediente.n}: {textoCantidad(t.ingrediente.n, t.total!)} en total. Si usas legumbre ya cocida o de bote, pesa la cantidad en cocido.
          </p>
        ))}
        {alGusto.length > 0 && <p class="ayuda">Al gusto: {alGusto.join(', ').toLowerCase()}.</p>}
        <p class="ayuda">
          Peso en crudo y limpio. Cada uno: {momento === 'comida' ? aj.pctComida : aj.pctCena} % de sus kcal del día.
          {aj.ninoEnCompra ? ' El total incluye ¼ de ración para el niño.' : ''} Sal, al final y solo en la parte de los adultos.
        </p>
      </div>
    </>
  );
}

export function FichaRecetaCocina({ params }: { params: Record<string, string> }) {
  const r = receta(params.id);
  const aj = ajustesCocina.value;
  const enMenu = r ? apariciones(r.id) : [];
  const [momento, setMomento] = useState<Momento>((consulta().get('m') as Momento) || (enMenu[0]?.endsWith('cena') ? 'cena' : 'comida'));
  if (!r) {
    return (
      <>
        <BarraDetalle padre="/cocina/recetas" textoAtras="Recetas" />
        <div class="vacio">Esta receta no existe.</div>
      </>
    );
  }
  const donde = apariciones(r.id);
  return (
    <>
      <BarraDetalle padre="/cocina/recetas" textoAtras="Recetas" />
      <div class="pagina ancha-receta">
        <h1 class="titulo-guia">{r.nombre}</h1>
        <div class="ficha-etiquetas">
          <Etiquetas r={r} />
        </div>
        {r.acompanamiento && <p class="resumen-receta">Acompañamiento: {r.acompanamiento.toLowerCase()}.</p>}

        <div class="ficha-acciones">
          <button type="button" class="boton-principal auto" onClick={() => ir(`/cocina/cocinar/${r.id}?m=${momento}`)}>
            <Icono n="crono" t={20} /> Cocinar paso a paso
          </button>
          <div class="segmentado gusto" role="group" aria-label="¿Os gusta?">
            <button type="button" aria-pressed={gustosCocina.value.valoraciones[r.id] === 1} onClick={() => valorarReceta(r.id, gustosCocina.value.valoraciones[r.id] === 1 ? 0 : 1)}>
              ♥ Nos gusta
            </button>
            <button type="button" aria-pressed={gustosCocina.value.valoraciones[r.id] === -1} onClick={() => valorarReceta(r.id, gustosCocina.value.valoraciones[r.id] === -1 ? 0 : -1)}>
              ✕ No nos gusta
            </button>
          </div>
        </div>
        {gustosCocina.value.valoraciones[r.id] === -1 && donde.length > 0 && (
          <p class="pie">Para quitarlo del menú, en Hoy o en Semana pulsa ⟳ en el plato y activa «Para siempre».</p>
        )}

        <div class="columnas">
          <div>
            {aj.raciones.activo ? (
              <Cantidades r={r} momento={momento} cambiarMomento={setMomento} />
            ) : (
              <>
                <div class="tit-lista">Ingredientes · ración de referencia (≈ {Math.round(nutrientesReceta(r).kcal)} kcal)</div>
                <div class="lista bloque-texto">
                  {CATEGORIAS.map(([c, nombre]) => {
                    const xs = r.ingredientes.filter((x) => x.c === c);
                    return xs.length ? (
                      <p class="ing-grupo">
                        <span>{nombre}</span>
                        {xs.map((x) => (x.g ? `${x.n}: ${textoCantidad(x.n, x.g)}` : `${x.n}: al gusto`)).join(' · ')}
                      </p>
                    ) : null;
                  })}
                  <p class="ayuda">
                    Gramos en crudo para una ración de adulto. Para calcularlos según las kcal de cada uno,{' '}
                    <a class="enlace" href="#/cocina/ajustes">
                      actívalo en los ajustes de cocina
                    </a>
                    . Sal, al final y solo en la parte de los adultos.
                  </p>
                </div>
              </>
            )}
          </div>
          <div>
            <div class="tit-lista">Pasos</div>
            <ol class="lista bloque-texto pasos-cocina">
              {r.pasos.map((p) => (
                <li>{p}</li>
              ))}
            </ol>

            <div class="tit-lista">Para el niño (1 año)</div>
            <div class="lista bloque-texto nino-receta">
              <p>
                <b>Textura:</b> {r.nino.adaptacion}
              </p>
              <p>
                <b>Ración:</b> {r.nino.racion}
              </p>
              <p class="ayuda">Siempre sin sal: separa su parte antes de salar. Si tiene poco apetito un día, no pasa nada: ofrece sin forzar.</p>
            </div>

            {donde.length > 0 && (
              <>
                <div class="tit-lista">En el menú</div>
                <div class="lista bloque-texto">
                  {donde.map((d) => (
                    <p>{d}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
