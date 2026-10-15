// COCINA · Recetas: biblioteca con buscador y filtro por proteína, y ficha de cada receta.
import { signal } from '@preact/signals';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { RECETAS, receta } from '../datos/recetas';
import { apariciones } from '../plan';
import { CATEGORIAS, PROTEINAS, type Proteina } from '../tipos';
import { Etiquetas } from './comunes';

const busqueda = signal('');
const filtro = signal<Proteina | 'todas'>('todas');

export function RecetasCocina() {
  const q = busqueda.value.trim().toLowerCase();
  const lista = RECETAS.filter((r) => (filtro.value === 'todas' || r.proteina === filtro.value) && (!q || `${r.nombre} ${r.ingredientes.map((x) => x.n).join(' ')}`.toLowerCase().includes(q))).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );
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
        {(Object.keys(PROTEINAS) as Proteina[]).map((p) => (
          <button type="button" class="chip" aria-pressed={filtro.value === p} onClick={() => (filtro.value = p)}>
            {PROTEINAS[p]}
          </button>
        ))}
      </div>
      <div class="lista">
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
      {lista.length === 0 && <div class="vacio">No hay recetas con esa búsqueda.</div>}
      <p class="pie">{RECETAS.length} recetas: todas forman parte del menú de 4 semanas.</p>
    </>
  );
}

export function FichaRecetaCocina({ params }: { params: Record<string, string> }) {
  const r = receta(params.id);
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
      <div class="pagina">
        <h1 class="titulo-guia">{r.nombre}</h1>
        <div class="ficha-etiquetas">
          <Etiquetas r={r} />
        </div>
        {r.acompanamiento && <p class="resumen-receta">Acompañamiento: {r.acompanamiento.toLowerCase()}.</p>}

        <div class="tit-lista">Ingredientes</div>
        <div class="lista bloque-texto">
          {CATEGORIAS.map(([c, nombre]) => {
            const xs = r.ingredientes.filter((x) => x.c === c);
            return xs.length ? (
              <p class="ing-grupo">
                <span>{nombre}</span>
                {xs.map((x) => x.n).join(', ')}
              </p>
            ) : null;
          })}
          <p class="ayuda">Sin cantidades: ajústalas a vuestro apetito. Sal, al final y solo en la parte de los adultos.</p>
        </div>

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
    </>
  );
}
