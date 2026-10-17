// RUNNING · Semáforo de hoy: antes de entrenar, cómo estás (molestia, si te levantas peor y señales
// de alarma) y qué hacer según el semáforo de la guía. Se guarda por día para ver la tendencia.
import { useState } from 'preact/hooks';
import { parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { Interruptor } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { SEMAFORO } from '../datos/guia';
import { datos, guardarChequeo } from '../estado';
import { diasSeguidosAjustando, nivelChequeo, type Chequeo } from '../seguimiento';

const CONSEJO: Record<string, string> = {
  verde: 'Haz la sesión tal y como está en el plan.',
  ambar: 'Hoy, versión suave: quita cuestas, saltos y series, acorta o cámbiala por bici o natación suave.',
  rojo: 'Hoy no corras. Si el dolor sigue o va a más, consulta a un profesional.',
};

export function SemaforoHoy() {
  const hoy = diaActual.value;
  const guardado = datos.value.chequeos?.[hoy];
  const [editando, setEditando] = useState(false);
  const [c, setC] = useState<Chequeo>(guardado || { molestia: 0, peor: false, alarma: false });

  if (guardado && !editando) {
    const nivel = nivelChequeo(guardado);
    const s = SEMAFORO.find((x) => x.nivel === nivel)!;
    const seguidos = diasSeguidosAjustando(datos.value.chequeos, parse(hoy));
    return (
      <div class={`run-semaforo-hoy ${nivel}`}>
        <div class="rsh-cab">
          <span class={`rsh-luz ${nivel}`} />
          <div>
            <span class="run-sobre">Semáforo de hoy · molestia {guardado.molestia}/10</span>
            <b>{s.titulo}</b>
          </div>
          <button type="button" class="enlace-boton" onClick={() => setEditando(true)}>
            Cambiar
          </button>
        </div>
        <p>{CONSEJO[nivel]}</p>
        {seguidos >= 3 && (
          <p class="rsh-alerta">
            <Icono n="aviso" t={16} /> Llevas {seguidos} días seguidos ajustando: toca revisar el plan con el entrenador.
          </p>
        )}
      </div>
    );
  }

  const guardar = async () => {
    await guardarChequeo(hoy, c);
    setEditando(false);
  };
  return (
    <div class="run-semaforo-hoy form">
      <span class="run-sobre">Antes de entrenar · ¿cómo estás hoy?</span>
      <div class="rsh-pregunta">
        <span>Molestia máxima ahora (gemelo/Aquiles, rodilla, cuello)</span>
        <div class="rsh-escala" role="radiogroup" aria-label="Molestia de 0 a 10">
          {Array.from({ length: 11 }, (_, n) => (
            <button type="button" role="radio" aria-checked={c.molestia === n} class={n > 5 ? 'rojo' : n >= 3 ? 'ambar' : 'verde'} onClick={() => setC({ ...c, molestia: n })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div class="rsh-si-no">
        <span>Me he levantado con más rigidez o dolor que ayer</span>
        <Interruptor valor={c.peor} cambiar={(v) => setC({ ...c, peor: v })} etiqueta="Peor al levantarme" />
      </div>
      <div class="rsh-si-no">
        <span>
          Alguna señal de alarma <small>dolor en un hueso, en reposo o de noche, chasquido, rodilla hinchada o cojera</small>
        </span>
        <Interruptor valor={c.alarma} cambiar={(v) => setC({ ...c, alarma: v })} etiqueta="Señal de alarma" />
      </div>
      <div class="acciones-fila">
        <button type="button" class="boton-principal" onClick={guardar}>
          Ver qué hago hoy
        </button>
        {guardado && (
          <button type="button" class="boton-secundario" onClick={() => setEditando(false)}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
