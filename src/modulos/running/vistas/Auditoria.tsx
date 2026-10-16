// RUNNING · Auditoría: las preguntas del entrenador por bloques, tus respuestas (guardadas en el
// dispositivo) y un botón para copiarlas al chat.
import { useEffect, useRef, useState } from 'preact/hooks';
import { avisar, mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { datos, plan, responder } from '../estado';
import type { BloqueAuditoria } from '../tipos';
import { copiarTexto } from './comunes';

function textoAuditoria(bloques: BloqueAuditoria[], resp: Record<string, string>): string {
  const lineas = ['AUDITORÍA INICIAL · RESPUESTAS', ''];
  for (const b of bloques) {
    const r = b.preguntas.filter((p) => resp[p.id]?.trim());
    if (!r.length) continue;
    lineas.push(b.titulo.toUpperCase());
    for (const p of r) lineas.push(`- ${p.texto}`, `  ${resp[p.id].trim().replace(/\n/g, '\n  ')}`);
    lineas.push('');
  }
  return lineas.join('\n').trim();
}

function Respuesta({ id }: { id: string }) {
  const [txt, setTxt] = useState(datos.value.respuestas[id] || '');
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <textarea
      rows={3}
      value={txt}
      placeholder="Tu respuesta…"
      onInput={(e) => {
        const v = (e.target as HTMLTextAreaElement).value;
        setTxt(v);
        clearTimeout(t.current);
        t.current = window.setTimeout(() => responder(id, v), 400);
      }}
      onBlur={() => {
        clearTimeout(t.current);
        responder(id, txt);
      }}
    />
  );
}

export function AuditoriaRunning() {
  const bloques = plan.value?.auditoria || [];
  const resp = datos.value.respuestas;
  if (!bloques.length) {
    return (
      <div class="vacio">
        <Icono n="tareas" t={40} />
        <p>{plan.value ? 'Este plan no tiene preguntas de auditoría pendientes.' : 'Las preguntas de la auditoría llegan con el plan del entrenador.'}</p>
        {!plan.value && (
          <a class="enlace" href="#/running/entrenador">
            Cargar el plan
          </a>
        )}
      </div>
    );
  }
  const ids = bloques.flatMap((b) => b.preguntas.map((p) => p.id));
  const hechas = ids.filter((id) => resp[id]?.trim()).length;
  const copiar = async () => {
    const t = textoAuditoria(bloques, datos.value.respuestas);
    if (!t.includes('\n- ')) return avisar('Aún no hay respuestas', 'Escribe al menos una respuesta.');
    if (await copiarTexto(t)) mostrarToast('Respuestas copiadas: pégalas en el chat');
    else await avisar('No se pudo copiar', t);
  };
  return (
    <>
      <div class="run-tarjeta">
        <p>Responde por bloques y en orden: el primero es el que condiciona el plan. Vale con notas cortas. Las respuestas se guardan en este dispositivo; cuando termines un bloque, cópialas y pégalas en el chat.</p>
        <div class="barra-stock">
          <div style={{ width: `${ids.length ? (hechas / ids.length) * 100 : 0}%` }} />
        </div>
        <small>
          {hechas} de {ids.length} respondidas
        </small>
      </div>
      <div class="paneles">
        {bloques.map((b) => (
          <section>
            <div class="tit-lista">{b.titulo}</div>
            {b.porque && <p class="pie primero">{b.porque}</p>}
            <div class="lista">
              {b.preguntas.map((p) => (
                <div class={`campo col run-pregunta${resp[p.id]?.trim() ? ' respondida' : ''}`}>
                  <div class="et">
                    <b>{p.texto}</b>
                    {p.ayuda && <small>{p.ayuda}</small>}
                  </div>
                  <Respuesta id={p.id} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div class="lista separada">
        <button type="button" class="boton-fila" onClick={copiar}>
          <Icono n="subir" t={22} /> Copiar respuestas para el entrenador
        </button>
      </div>
    </>
  );
}
