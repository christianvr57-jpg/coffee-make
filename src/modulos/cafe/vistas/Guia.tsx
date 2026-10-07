// CAFÉ · Guía: ajustar la extracción, agua, variedades y procesos (con fuentes).
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Lista, Texto, fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import {
  AGUA_SCA, FUENTES_AGUA, FUENTES_EXTRACCION, PROCESOS_GUIA, VARIEDADES_GUIA, clasificacionEtiqueta, estadoAgua, type Fuente,
} from '../datos/guia';
import type { Cafe } from '../modelo';
import { listarAguas, listarCafes, listarPreparaciones } from '../repositorio';
import { Nota } from './comunes';

function Fuentes({ fuentes }: { fuentes: Fuente[] }) {
  return (
    <>
      <div class="tit-lista">{fuentes.length > 1 ? 'Fuentes' : 'Fuente'}</div>
      <div class="lista">
        {fuentes.map((f) => (
          <a class="item" href={f.url} target="_blank" rel="noopener noreferrer">
            <span class="insignia insignia-cafe" style={{ '--tam': '32px' }}>
              <Icono n="libro" t={18} />
            </span>
            <div class="item-txt">
              <div class="item-tit fuente-tit">{f.titulo}</div>
              <div class="item-meta">{new URL(f.url).hostname.replace(/^www\./, '')}</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        ))}
      </div>
    </>
  );
}

function Tema({ icono, titulo, sub, ruta }: { icono: string; titulo: string; sub: string; ruta: string }) {
  return (
    <a class="item" href={`#${ruta}`}>
      <span class="insignia insignia-cafe" style={{ '--tam': '40px' }}>
        <Icono n={icono} t={22} />
      </span>
      <div class="item-txt">
        <div class="item-tit">{titulo}</div>
        <div class="item-meta">{sub}</div>
      </div>
      <Icono n="chevron" t={16} clase="chev" />
    </a>
  );
}

export function Guia() {
  return (
    <>
      <Lista titulo="Preparar mejor">
        <Tema icono="equipo" titulo="Ajustar la extracción" sub="Qué cambiar si sale agrio, amargo, aguado o fuerte" ruta="/cafe/guia/extraccion" />
        <Tema icono="gota" titulo="El agua" sub="Qué mirar en la etiqueta y cómo están tus aguas" ruta="/cafe/guia/agua" />
      </Lista>
      <Lista titulo="Conocer el café" pie="Fichas resumidas de fuentes de referencia, con el enlace en cada una.">
        <Tema icono="grano" titulo="Variedades" sub={`${VARIEDADES_GUIA.length} fichas del catálogo de World Coffee Research y otras fuentes`} ruta="/cafe/guia/variedades" />
        <Tema icono="libro" titulo="Procesos" sub={`${PROCESOS_GUIA.length} fichas: lavado, natural, honey, anaeróbico…`} ruta="/cafe/guia/procesos" />
      </Lista>
      <Lista titulo="Tu equipo">
        <Tema icono="molino" titulo="Equipo y aguas" sub="Molinos, cafetera, básculas y tipos de agua" ruta="/cafe/equipo" />
      </Lista>
    </>
  );
}

function Pagina({ titulo, children }: { titulo: string; children: ComponentChildren }) {
  return (
    <>
      <BarraDetalle padre="/cafe/guia" textoAtras="Guía" />
      <div class="pagina">
        <h1 class="titulo-guia">{titulo}</h1>
        {children}
      </div>
    </>
  );
}

const BRUJULA: { sintoma: string; lectura: string; hacer: string }[] = [
  { sintoma: 'Agrio', lectura: 'Falta extracción', hacer: 'Muele más fino. Si ya tarda mucho, sube la temperatura o agita un poco más.' },
  { sintoma: 'Amargo o astringente', lectura: 'Sobra extracción', hacer: 'Muele más grueso. Si el tiempo está bien, baja la temperatura o agita menos.' },
  { sintoma: 'Agrio y amargo a la vez', lectura: 'Extracción desigual', hacer: 'Parte del café se extrae de más y parte de menos. Antes de tocar la molienda, busca uniformidad: reparte bien la cama, vierte con calma y evita canales.' },
  { sintoma: 'Aguado', lectura: 'Poca concentración', hacer: 'Menos agua por gramo de café (ratio más corto). En espresso, corta antes la salida.' },
  { sintoma: 'Demasiado fuerte', lectura: 'Mucha concentración', hacer: 'Más agua por gramo de café (ratio más largo). En espresso, alarga la salida.' },
];

export function GuiaExtraccion() {
  return (
    <Pagina titulo="Ajustar la extracción">
      <div class="lista bloque-texto">
        <p>
          Hay dos ideas distintas que se suelen mezclar. La <b>extracción</b> es cuánto del café molido se disuelve en el agua: poca da sabores agrios y punzantes; demasiada, amargor y sequedad. La{' '}
          <b>concentración</b> es cuánto café hay en la taza: depende sobre todo del ratio y se nota como aguado o como demasiado fuerte.
        </p>
        <p>
          La extracción se mueve con la <b>molienda</b> (la palanca principal), el <b>tiempo</b> de contacto, la <b>temperatura</b> y la <b>agitación</b>. La concentración, con la <b>cantidad de agua</b> por gramo de café.
        </p>
      </div>

      <div class="tit-lista">Qué hacer según lo que notas</div>
      <div class="lista brujula">
        {BRUJULA.map((b) => (
          <div class="brujula-fila">
            <b>{b.sintoma}</b>
            <span class="brujula-lectura">{b.lectura}</span>
            <p>{b.hacer}</p>
          </div>
        ))}
      </div>

      <div class="lista bloque-texto separada">
        <p>
          <b>Cambia una sola cosa cada vez.</b> Si mueves dos variables y mejora, no sabrás cuál fue. El botón «Repetir» de cada preparación parte de la anterior para eso, y el diagnóstico de la app aplica estas mismas reglas teniendo en cuenta el tiempo y la receta.
        </p>
        <p>
          Con refractómetro, la zona ideal del control chart de la SCA para filtro es un 18-22 % de extracción y un 1,15-1,35 % de sólidos disueltos en la taza.
        </p>
      </div>
      <Fuentes fuentes={FUENTES_EXTRACCION} />
    </Pagina>
  );
}

export function GuiaAgua() {
  const aguas = useVivo(listarAguas, []) || [];
  return (
    <Pagina titulo="El agua">
      <div class="lista bloque-texto">
        <p>Casi todo lo que bebes en una taza es agua, y sus minerales influyen en cómo se extrae el café. Lo más fácil de controlar es cuántos sólidos lleva disueltos.</p>
      </div>

      <div class="tit-lista">Lo que recomienda la SCA</div>
      <dl class="rejilla-datos">
        <div>
          <dt>Sólidos disueltos</dt>
          <dd>
            {AGUA_SCA.tdsObjetivo} mg/L <small>({AGUA_SCA.tdsMin}-{AGUA_SCA.tdsMax})</small>
          </dd>
        </div>
        <div>
          <dt>pH</dt>
          <dd>
            {AGUA_SCA.phObjetivo} <small>({fmt(AGUA_SCA.phMin)}-{fmt(AGUA_SCA.phMax)})</small>
          </dd>
        </div>
        <div>
          <dt>Cloro</dt>
          <dd>Nada</dd>
        </div>
        <div>
          <dt>Olor y color</dt>
          <dd>Limpia y transparente</dd>
        </div>
      </dl>

      <div class="tit-lista">Cómo leer la etiqueta</div>
      <div class="lista bloque-texto">
        <p>
          El <b>residuo seco a 180 °C</b> de las botellas mide los sólidos disueltos, así que puedes compararlo con el rango de la SCA.
        </p>
        <p>La etiqueta clasifica el agua según ese residuo seco (normativa europea):</p>
        <ul class="lista-simple">
          <li>
            <b>Mineralización muy débil</b>: hasta 50 mg/L. Queda por debajo del rango recomendado.
          </li>
          <li>
            <b>Mineralización débil</b>: hasta 500 mg/L. Es una franja muy amplia: mira el número exacto, lo ideal está entre {AGUA_SCA.tdsMin} y {AGUA_SCA.tdsMax}.
          </li>
          <li>
            <b>Mineralización fuerte</b>: más de 1500 mg/L. Demasiada para café.
          </li>
        </ul>
      </div>

      <div class="tit-lista">Tus aguas</div>
      <div class="lista">
        {aguas.map((a) => {
          const e = a.residuoSeco ? estadoAgua(a.residuoSeco) : null;
          return (
            <button type="button" class="item" onClick={() => ir('/cafe/equipo')}>
              <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
                <Icono n="gota" t={20} />
              </span>
              <div class="item-txt">
                <div class="item-tit">{a.nombre}</div>
                {e && a.residuoSeco ? (
                  <>
                    <div class="item-meta">
                      {a.residuoSeco} mg/L · {clasificacionEtiqueta(a.residuoSeco).toLowerCase()}
                    </div>
                    <span class={`chip-estado ${e.estado === 'ideal' ? 'optimo' : 'temprano'}`}>{e.texto}</span>
                  </>
                ) : (
                  <div class="item-meta">{a.tipo === 'embotellada' ? 'Apunta el residuo seco de la etiqueta para valorarla' : 'Sin medir (para el agua del grifo o filtrada haría falta un medidor de TDS)'}</div>
                )}
              </div>
              <Icono n="chevron" t={16} clase="chev" />
            </button>
          );
        })}
      </div>
      <Fuentes fuentes={FUENTES_AGUA} />
    </Pagina>
  );
}

/** Cafés de tu biblioteca que tienen una variedad o proceso, con su nota media. */
function TusCafes({ coincide, titulo }: { coincide: (c: Cafe) => boolean; titulo: string }) {
  const cafes = (useVivo(listarCafes, []) || []).filter(coincide);
  const preps = useVivo(listarPreparaciones, []) || [];
  if (!cafes.length) return null;
  return (
    <Lista titulo={titulo}>
      {cafes.map((c) => {
        const notas = preps.filter((p) => p.cafeId === c.id && p.puntuacion !== undefined).map((p) => p.puntuacion!);
        return (
          <a class="item" href={`#/cafe/cafes/${c.id}`}>
            <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
              <Icono n="grano" t={20} />
            </span>
            <div class="item-txt">
              <div class="item-tit">{c.nombre}</div>
              <div class="item-meta">{[c.tostador, c.pais].filter(Boolean).join(' · ')}</div>
            </div>
            {notas.length ? <Nota p={notas.reduce((a, b) => a + b, 0) / notas.length} /> : <Icono n="chevron" t={16} clase="chev" />}
          </a>
        );
      })}
    </Lista>
  );
}

export function GuiaVariedades() {
  const [q, setQ] = useState('');
  const n = q.trim().toLowerCase();
  const lista = VARIEDADES_GUIA.filter((v) => !n || [v.nombre, v.grupo, ...v.alias].join(' ').toLowerCase().includes(n));
  return (
    <Pagina titulo="Variedades">
      <div class="buscador-guia">
        <Icono n="buscar" t={18} />
        <Texto valor={q} cambiar={setQ} marcador="Buscar variedad o grupo" />
      </div>
      <div class="lista">
        {lista.map((v) => (
          <a class="item" href={`#/cafe/guia/variedades/${v.id}`}>
            <div class="item-txt">
              <div class="item-tit">{v.nombre}</div>
              <div class="item-meta">{v.grupo}</div>
            </div>
            {v.calidad && <span class="chip-estado">{v.calidad}</span>}
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        ))}
      </div>
      <p class="pie">La «calidad» es el potencial en taza a gran altitud según World Coffee Research; el sabor final depende también del origen, el proceso y el tueste.</p>
    </Pagina>
  );
}

export function FichaVariedadVista({ params }: { params: Record<string, string> }) {
  const v = VARIEDADES_GUIA.find((x) => x.id === params.id);
  if (!v) {
    return (
      <Pagina titulo="Variedad">
        <div class="vacio">No existe esta ficha.</div>
      </Pagina>
    );
  }
  const datos: [string, string | undefined][] = [
    ['Grupo genético', v.grupo],
    ['Porte', v.porte],
    ['Potencial de calidad', v.calidad],
    ['Rendimiento', v.rendimiento],
    ['Altitud óptima', v.altitud],
    ['Tamaño de grano', v.grano],
    ['Roya', v.roya],
    ['Antracnosis del fruto', v.antracnosis],
    ['Nematodos', v.nematodos],
  ];
  return (
    <>
      <BarraDetalle padre="/cafe/guia/variedades" textoAtras="Variedades" />
      <div class="pagina">
        <h1 class="titulo-guia">{v.nombre}</h1>
        <p class="resumen-receta">{v.resumen}</p>
        <div class="tit-lista">Ficha</div>
        <dl class="rejilla-datos">
          {datos.filter(([, x]) => x).map(([k, x]) => (
            <div>
              <dt>{k}</dt>
              <dd>{x}</dd>
            </div>
          ))}
        </dl>
        <div class="tit-lista">Origen</div>
        <div class="lista bloque-texto">
          <p>{v.origen}</p>
        </div>
        <TusCafes titulo="Tus cafés de esta variedad" coincide={(c) => c.variedades.some((x) => v.alias.includes(x))} />
        <Fuentes fuentes={[v.fuente]} />
      </div>
    </>
  );
}

export function GuiaProcesos() {
  return (
    <Pagina titulo="Procesos">
      <div class="lista bloque-texto">
        <p>El proceso es lo que se hace con la cereza tras la cosecha para sacar el grano y secarlo. Cambia mucho el sabor: a veces más que el origen.</p>
      </div>
      <div class="lista separada">
        {PROCESOS_GUIA.map((p) => (
          <a class="item" href={`#/cafe/guia/procesos/${p.id}`}>
            <div class="item-txt">
              <div class="item-tit">{p.nombre}</div>
              <div class="item-meta">{p.resumen}</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        ))}
      </div>
    </Pagina>
  );
}

export function FichaProcesoVista({ params }: { params: Record<string, string> }) {
  const p = PROCESOS_GUIA.find((x) => x.id === params.id);
  if (!p) {
    return (
      <Pagina titulo="Proceso">
        <div class="vacio">No existe esta ficha.</div>
      </Pagina>
    );
  }
  return (
    <>
      <BarraDetalle padre="/cafe/guia/procesos" textoAtras="Procesos" />
      <div class="pagina">
        <h1 class="titulo-guia">{p.nombre}</h1>
        <p class="resumen-receta">{p.resumen}</p>
        <div class="tit-lista">Cómo se hace</div>
        <div class="lista bloque-texto">
          <p>{p.como}</p>
        </div>
        <div class="tit-lista">En la taza</div>
        <div class="lista bloque-texto">
          <p>{p.taza}</p>
          <p class="ayuda">Son tendencias generales: el origen, la variedad y el tueste también cuentan.</p>
        </div>
        {p.variantes && (
          <>
            <div class="tit-lista">Más detalles</div>
            <ul class="lista bloque-texto consejos">
              {p.variantes.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          </>
        )}
        <TusCafes titulo="Tus cafés con este proceso" coincide={(c) => c.procesos.some((x) => p.alias.includes(x))} />
        <Fuentes fuentes={[p.fuente]} />
      </div>
    </>
  );
}
