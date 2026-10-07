// CAFÉ · Temporizador guiado por fases (pantalla completa).
import { useEffect, useRef, useState } from 'preact/hooks';
import { segundosATexto } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { mantenerPantalla, pitido, prepararAudio } from '../../../core/dispositivo';
import { confirmar } from '../../../ui/capas';
import { fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { borrador } from '../borrador';
import { metodo, esEspresso } from '../datos/metodos';
import { ajustesCafe } from '../repositorio';
import { avanzar, iniciar, marcar, nuevoTemporizador, pausar, reanudar, terminar, tic, vistaFase, type EstadoTemporizador } from '../temporizador';
import { planDePreparacion, vertidoEnFase } from '../recetas';

const guardarEstado = (e: EstadoTemporizador) => {
  if (borrador.value) borrador.value = { ...borrador.value, temporizador: e };
};

export function Temporizador() {
  const b = borrador.value;
  const [ahora, setAhora] = useState(Date.now());
  const ultimoAviso = useRef<number | null>(null);

  // Crea el temporizador con las fases del método la primera vez.
  useEffect(() => {
    if (!borrador.value) {
      ir('/cafe/preparar', true);
      return;
    }
    const bb = borrador.value;
    // Sin empezar se rehace siempre, por si cambiaste cantidades o receta en Preparar.
    if (!bb.temporizador || bb.temporizador.terminado || bb.temporizador.inicio === null) {
      guardarEstado(nuevoTemporizador(planDePreparacion(bb.prep, bb.receta)));
    } else if (bb.temporizador.inicio !== null && bb.temporizador.pausadoEn === null && ajustesCafe.value.pantallaEncendida) {
      mantenerPantalla(true);
    }
    return () => {
      mantenerPantalla(false);
    };
  }, []);

  // Reloj: refresca la pantalla, avanza fases cumplidas y hace sonar los avisos.
  useEffect(() => {
    const id = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      const e = borrador.value?.temporizador;
      if (!e || e.inicio === null || e.pausadoEn !== null || e.terminado) return;
      const { estado, cambio } = tic(e, n);
      if (cambio) {
        guardarEstado(estado);
        if (ajustesCafe.value.sonido) pitido(true);
        ultimoAviso.current = null;
        return;
      }
      const v = vistaFase(estado, n);
      if (v.restante !== null && !v.ultima && v.restante > 0 && v.restante <= 3) {
        const s = Math.ceil(v.restante);
        if (ultimoAviso.current !== s) {
          ultimoAviso.current = s;
          if (ajustesCafe.value.sonido) pitido(false);
        }
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  if (!b || !b.temporizador) return null;
  const e = b.temporizador;
  const p = b.prep;
  const met = metodo(p.metodo);
  const esp = esEspresso(p.metodo);
  const v = vistaFase(e, ahora);
  const enMarcha = e.inicio !== null && e.pausadoEn === null;
  const empezado = e.inicio !== null;

  const empezar = () => {
    prepararAudio();
    if (ajustesCafe.value.pantallaEncendida) mantenerPantalla(true);
    guardarEstado(iniciar(e, Date.now()));
  };
  const alternarPausa = () => guardarEstado(enMarcha ? pausar(e, Date.now()) : reanudar(e, Date.now()));
  const siguiente = () => {
    guardarEstado(avanzar(e, Date.now()));
    if (ajustesCafe.value.sonido) pitido(true);
  };
  const acabar = () => {
    const fin = terminar(e, Date.now());
    const primera = fin.marcas.find((m) => m.nombre === 'Primera gota');
    mantenerPantalla(false);
    borrador.value = {
      ...b,
      temporizador: fin,
      prep: { ...p, tiempoTotal: Math.round(fin.total || 0), fases: fin.reales, primeraGota: primera ? Math.round(primera.t) : p.primeraGota },
    };
    ir('/cafe/preparar/resultado', true);
  };
  const salir = async () => {
    if (empezado && !(await confirmar({ titulo: '¿Salir del temporizador?', texto: 'Se perderá el tiempo de esta preparación.', ok: 'Salir', peligro: true }))) return;
    mantenerPantalla(false);
    if (borrador.value) borrador.value = { ...borrador.value, temporizador: undefined };
    ir('/cafe/preparar', true);
  };

  // Inicio previsto de cada fase para la lista.
  let acumulado = 0;
  const plan = e.fases.map((f, i) => {
    const inicio = i < e.reales.length ? e.reales[i].inicio : i === e.faseIdx ? e.inicioFase : acumulado;
    acumulado = inicio + (f.duracion || 0);
    return { ...f, inicio, estado: i < e.faseIdx ? 'hecha' : i === e.faseIdx ? 'actual' : 'siguiente' };
  });
  const primeraGota = e.marcas.find((m) => m.nombre === 'Primera gota');
  const vertido = vertidoEnFase(e.fases, e.faseIdx);
  const antes = `Antes de empezar: ${fmt(p.dosis)} g de café molido${p.temperatura ? `, agua a ${p.temperatura} °C` : ''}${
    met.familia === 'percolacion' || met.familia === 'hibrido' ? ', filtro enjuagado' : ''
  } y báscula a cero.`;

  return (
    <div class="temporizador">
      <header class="temp-cab">
        <button type="button" class="btn-icono" aria-label="Salir" onClick={salir}>
          <Icono n="cerrar" t={20} />
        </button>
        <div class="temp-titulo">
          <b>{b.receta ? b.receta.nombre : met.nombre}</b>
          <span>
            {b.receta ? `${met.nombre} · ` : ''}
            {p.cafeNombre || 'Café sin registrar'}
          </span>
        </div>
        <span class="temp-receta">
          {fmt(p.dosis)} g · {esp ? `${fmt(p.rendimiento)} g` : `${fmt(p.agua)} g`}
        </span>
      </header>

      <div class={`temp-reloj${enMarcha ? ' en-marcha' : ''}`}>{segundosATexto(v.t)}</div>

      {esp ? (
        <section class="temp-fase">
          <div class="temp-objetivo">
            <span>Objetivo</span>
            <b>
              {fmt(p.dosis)} g → {fmt(p.rendimiento)} g
            </b>
            <small>
              {b.receta?.tiempoObjetivo
                ? `Tiempo de la receta: ${b.receta.tiempoObjetivo[0]}-${b.receta.tiempoObjetivo[1]} s desde que pulsas`
                : 'Tiempo orientativo para un normale: 25-32 s desde que pulsas'}
            </small>
          </div>
          {primeraGota && <p class="temp-marca">Primera gota a los {fmt(primeraGota.t, 0)} s</p>}
        </section>
      ) : (
        v.fase && (
          <section class="temp-fase">
            <div class="temp-fase-nombre">
              Fase {e.faseIdx + 1} de {e.fases.length} · {v.fase.nombre}
            </div>
            {v.fase.aguaHasta !== undefined && (
              <div class="temp-agua">
                <span>Vierte hasta</span>
                <b>{v.fase.aguaHasta} g</b>
                {vertido !== undefined && vertido !== v.fase.aguaHasta && <small>+{vertido} g</small>}
              </div>
            )}
            <p class="temp-instruccion">{v.fase.instruccion}</p>
            {!empezado && e.faseIdx === 0 && <p class="temp-antes">{antes}</p>}
            {v.progreso !== null && (
              <div class="temp-barra">
                <div style={{ width: `${(v.progreso || 0) * 100}%` }} />
              </div>
            )}
            {empezado && v.restante !== null && (
              <div class={`temp-restante${v.restante < 0 ? ' pasado' : ''}`}>
                {v.restante >= 0
                  ? `${v.ultima ? 'Previsto: termina en' : v.siguiente ? `${v.siguiente.nombre}${v.siguiente.aguaHasta !== undefined ? ` (hasta ${v.siguiente.aguaHasta} g)` : ''} en` : 'Quedan'} ${segundosATexto(v.restante)}`
                  : `+${segundosATexto(-v.restante)} sobre lo previsto`}
              </div>
            )}
          </section>
        )
      )}

      {!esp && (
        <ol class="temp-fases">
          {plan.map((f) => (
            <li class={f.estado}>
              <span class="tf-marca">{f.estado === 'hecha' ? <Icono n="check" t={16} /> : null}</span>
              <span class="tf-nombre">{f.nombre}</span>
              <span class="tf-agua">{f.aguaHasta !== undefined ? `${f.aguaHasta} g` : ''}</span>
              <span class="tf-tiempo">{segundosATexto(f.inicio)}</span>
            </li>
          ))}
        </ol>
      )}

      <div class="temp-acciones">
        {!empezado ? (
          <button type="button" class="boton-principal grande" onClick={empezar}>
            <Icono n="play" t={24} /> Empezar
          </button>
        ) : esp ? (
          <>
            <button type="button" class="boton-secundario grande" disabled={!!primeraGota || !enMarcha} onClick={() => guardarEstado(marcar(e, 'Primera gota', Date.now()))}>
              <Icono n="gota" t={22} /> Primera gota
            </button>
            <button type="button" class="boton-principal grande peligro" onClick={acabar}>
              <Icono n="stop" t={22} /> Parar
            </button>
          </>
        ) : (
          <>
            <button type="button" class="boton-secundario" onClick={alternarPausa}>
              <Icono n={enMarcha ? 'pausa' : 'play'} t={20} /> {enMarcha ? 'Pausa' : 'Seguir'}
            </button>
            {!v.ultima && (
              <button type="button" class="boton-secundario" onClick={siguiente} disabled={!enMarcha}>
                <Icono n="chevron" t={20} /> Siguiente
              </button>
            )}
            <button type="button" class="boton-principal" onClick={acabar}>
              <Icono n="stop" t={20} /> Terminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
