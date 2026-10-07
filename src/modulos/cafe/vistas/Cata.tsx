// CAFÉ · Cata completa de una preparación (inspirada en el CVA de la SCA, adaptada a casa).
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { db, guardar } from '../../../core/db';
import { ir } from '../../../core/router';
import { BarraDetalle } from '../../../ui/Cabecera';
import { mostrarToast } from '../../../ui/capas';
import { Campo, Lista, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { AGRADO, ATRIBUTOS, DEFECTOS, INTENSIDAD, TEXTURAS, TIPOS_ACIDEZ, type AtributoId, type DefAtributo } from '../datos/cata';
import { metodo } from '../datos/metodos';
import type { Cata, Preparacion, ValorAtributo } from '../modelo';
import { Puntuacion, Sintomas } from './Resultado';
import { Rueda } from './Rueda';

function Atributo({ def, valor, cambiar, children }: { def: DefAtributo; valor: ValorAtributo; cambiar: (v: ValorAtributo) => void; children?: ComponentChildren }) {
  const [ayuda, setAyuda] = useState(false);
  return (
    <div class="atributo">
      <div class="at-cab">
        <b>{def.nombre}</b>
        <button type="button" class="at-info" aria-label={`Qué es ${def.nombre}`} aria-expanded={ayuda} onClick={() => setAyuda(!ayuda)}>
          <Icono n="info" t={18} />
        </button>
        <span class="at-valor">{valor.agrado ? AGRADO[valor.agrado] : ''}</span>
      </div>
      {ayuda && (
        <p class="ayuda">
          {def.que} <b>Cómo:</b> {def.como}
        </p>
      )}
      {def.intensidad && (
        <div class="at-fila">
          <span>Intensidad</span>
          <div class="segmentado mini">
            {[1, 2, 3].map((n) => (
              <button type="button" aria-pressed={valor.intensidad === n} onClick={() => cambiar({ ...valor, intensidad: valor.intensidad === n ? undefined : n })}>
                {INTENSIDAD[n]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div class="at-fila">
        <span>¿Te gusta?</span>
        <div class="agrado" role="radiogroup" aria-label={`Agrado de ${def.nombre}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" role="radio" aria-checked={valor.agrado === n} aria-label={AGRADO[n]} class={`ag-${n}`} onClick={() => cambiar({ ...valor, agrado: valor.agrado === n ? undefined : n })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

const cataVacia = (): Cata => ({ fecha: Date.now(), atributos: {}, acidezTipos: [], sabores: [], defectos: [] });

export function CataVista({ params }: { params: Record<string, string> }) {
  const [p, setP] = useState<Preparacion | null>(null);
  const [c, setC] = useState<Cata>(cataVacia());
  const [puntuacion, setPuntuacion] = useState<number | undefined>();
  const [sintomas, setSintomas] = useState<Preparacion['sintomas']>([]);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    db.cafe_preparaciones.get(params.id).then((x) => {
      if (!x) return;
      setP(x);
      setC(x.cata || cataVacia());
      setPuntuacion(x.puntuacion);
      setSintomas(x.sintomas || []);
      setNotas(x.notas || '');
    });
  }, [params.id]);
  if (!p) return <BarraDetalle padre={`/cafe/p/${params.id}`} textoAtras="Volver" titulo="Cata" />;

  const setAtr = (id: AtributoId, v: ValorAtributo) => setC((x) => ({ ...x, atributos: { ...x.atributos, [id]: v } }));
  const alternarLista = (k: 'acidezTipos' | 'defectos', id: string) =>
    setC((x) => ({ ...x, [k]: x[k].includes(id) ? x[k].filter((y) => y !== id) : [...x[k], id] }));

  const guardarCata = async () => {
    await guardar<Preparacion>('cafe_preparaciones', { ...p, cata: { ...c, fecha: c.fecha || Date.now() }, puntuacion, sintomas, notas: notas.trim() || undefined });
    mostrarToast('Cata guardada');
    ir(`/cafe/p/${p.id}`, true);
  };

  return (
    <>
      <BarraDetalle padre={`/cafe/p/${p.id}`} textoAtras="Cancelar" titulo="Cata" derecha={<button type="button" class="bd-accion" onClick={guardarCata}>Guardar</button>} />
      <div class="pagina">
        <p class="pie" style={{ margin: '0 4px 4px' }}>
          {metodo(p.metodo).nombre} · {p.cafeNombre || 'Café sin registrar'}. Cata con calma: deja que se temple y vuelve a probar al enfriarse. Todo es opcional.
        </p>

        <div class="tit-lista">Sabores y aromas</div>
        <div class="lista bloque-texto">
          <Rueda seleccion={c.sabores} cambiar={(v) => setC((x) => ({ ...x, sabores: v }))} />
        </div>
        <p class="pie">Empieza por lo general (¿frutal?, ¿chocolate?) y baja al detalle solo si lo reconoces. Rueda propia inspirada en el léxico de World Coffee Research y la rueda SCA/WCR.</p>

        <div class="tit-lista">Atributos</div>
        <div class="lista atributos">
          {ATRIBUTOS.map((def) => (
            <Atributo def={def} valor={c.atributos[def.id] || {}} cambiar={(v) => setAtr(def.id, v)}>
              {def.id === 'acidez' && (
                <div class="chips compactos">
                  {TIPOS_ACIDEZ.map((t) => (
                    <button type="button" class="chip" aria-pressed={c.acidezTipos.includes(t.id)} title={t.ejemplo} onClick={() => alternarLista('acidezTipos', t.id)}>
                      {t.nombre}
                    </button>
                  ))}
                </div>
              )}
              {def.id === 'acidez' && c.acidezTipos.length > 0 && (
                <p class="ayuda">{c.acidezTipos.map((id) => TIPOS_ACIDEZ.find((t) => t.id === id)!).map((t) => `${t.nombre}: ${t.ejemplo}`).join(' · ')}</p>
              )}
              {def.id === 'cuerpo' && (
                <div class="chips compactos">
                  {TEXTURAS.map((t) => (
                    <button type="button" class="chip" aria-pressed={c.textura === t} onClick={() => setC((x) => ({ ...x, textura: x.textura === t ? undefined : t }))}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </Atributo>
          ))}
        </div>

        <Lista titulo="Defectos" pie="Solo si notas algo raro. La pista te dice de dónde suele venir.">
          <Campo col>
            <div class="chips">
              {DEFECTOS.map((d) => (
                <button type="button" class="chip sintoma defecto" aria-pressed={c.defectos.includes(d.id)} onClick={() => alternarLista('defectos', d.id)}>
                  {d.nombre}
                </button>
              ))}
            </div>
            {c.defectos.map((id) => {
              const d = DEFECTOS.find((x) => x.id === id)!;
              return (
                <p class="ayuda">
                  <b>{d.nombre}:</b> {d.pista}
                </p>
              );
            })}
          </Campo>
        </Lista>

        <Lista titulo="Extracción y valoración">
          <Campo et="¿Cómo lo notas?" col>
            <Sintomas valor={sintomas} cambiar={setSintomas} />
          </Campo>
          <Campo col>
            <Puntuacion valor={puntuacion} cambiar={setPuntuacion} />
          </Campo>
          <Campo et="Notas" col>
            <Texto multilinea valor={notas} cambiar={setNotas} marcador="Lo que quieras recordar" />
          </Campo>
        </Lista>

        <div class="acciones-fijas">
          <button type="button" class="boton-principal" onClick={guardarCata}>
            <Icono n="check" t={22} /> Guardar cata
          </button>
        </div>
      </div>
    </>
  );
}
