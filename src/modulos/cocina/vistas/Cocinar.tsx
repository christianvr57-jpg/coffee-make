// COCINA · Modo cocinar: la receta paso a paso en grande, con la pantalla encendida, la lista de
// ingredientes para ir marcando y temporizadores para los tiempos que aparecen en cada paso.
import { useEffect, useState } from 'preact/hooks';
import { mantenerPantalla, pitido, prepararAudio } from '../../../core/dispositivo';
import { atras, consulta } from '../../../core/router';
import { mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { useFlechas } from '../../../ui/teclado';
import { ingredientesParaCocinar, relojTexto, tiemposDePaso } from '../cocinar';
import { receta } from '../datos/recetas';
import { ajustesCocina } from '../estado';
import { nombrePersona } from '../raciones';
import type { Momento } from '../tipos';

interface Temporizador {
  id: number;
  nombre: string;
  fin: number;
  avisado: boolean;
}

function avisar(t: Temporizador) {
  prepararAudio();
  [0, 450, 900, 1350].forEach((ms) => setTimeout(() => pitido(true), ms));
  try {
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  } catch {
    /* sin vibración */
  }
  mostrarToast(`¡Tiempo! ${t.nombre}`);
}

export function CocinarCocina({ params }: { params: Record<string, string> }) {
  const r = receta(params.id);
  const momento = (consulta().get('m') as Momento) || 'comida';
  const [paso, setPaso] = useState(0);
  const [tengo, setTengo] = useState<Set<string>>(new Set());
  const [timers, setTimers] = useState<Temporizador[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    mantenerPantalla(true);
    return () => {
      mantenerPantalla(false);
    };
  }, []);

  // Reloj de los temporizadores (con la hora de fin: no se desajustan si la app pasa a segundo plano).
  useEffect(() => {
    if (!timers.length) return;
    const t = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      setTimers((xs) => {
        let cambio = false;
        const ys = xs.map((x) => {
          if (!x.avisado && x.fin <= n) {
            avisar(x);
            cambio = true;
            return { ...x, avisado: true };
          }
          return x;
        });
        return cambio ? ys : xs;
      });
    }, 500);
    return () => clearInterval(t);
  }, [timers.length]);

  const total = (r?.pasos.length || 0) + 1;
  useFlechas(
    () => setPaso((p) => Math.max(0, p - 1)),
    () => setPaso((p) => Math.min(total - 1, p + 1)),
  );

  if (!r) return <div class="vacio">Esta receta no existe.</div>;
  const aj = ajustesCocina.value.raciones;
  const ingredientes = ingredientesParaCocinar(r, momento, aj);
  const para = aj.activo
    ? `${aj.personas.map((p, i) => nombrePersona(p, i)).join(' y ')}${aj.ninoEnCompra ? ' y el niño' : ''}`
    : 'dos adultos y el niño (raciones de referencia)';
  const texto = paso > 0 ? r.pasos[paso - 1] : '';
  const tiempos = paso > 0 ? tiemposDePaso(texto) : [];
  const ultimo = paso === total - 1;

  const iniciar = (etiqueta: string, segundos: number) => {
    prepararAudio();
    const nombre = `Paso ${paso} · ${etiqueta}`;
    setTimers((xs) => [...xs, { id: Date.now(), nombre, fin: Date.now() + segundos * 1000, avisado: false }]);
    setAhora(Date.now());
  };
  const quitar = (id: number) => setTimers((xs) => xs.filter((x) => x.id !== id));
  const alternar = (n: string) =>
    setTengo((s) => {
      const t = new Set(s);
      if (t.has(n)) t.delete(n);
      else t.add(n);
      return t;
    });

  return (
    <div class="cocinar">
      <header class="cocinar-cab">
        <button type="button" class="bd-atras" onClick={() => atras(`/cocina/recetas/${r.id}`)}>
          <Icono n="cerrar" t={20} />
          <span>Salir</span>
        </button>
        <div>
          <small>{paso === 0 ? 'Antes de empezar' : `Paso ${paso} de ${total - 1}`}</small>
          <b>{r.nombre}</b>
        </div>
      </header>

      <div class="cocinar-progreso" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <button type="button" class={i === paso ? 'actual' : i < paso ? 'hecho' : ''} onClick={() => setPaso(i)} tabIndex={-1} />
        ))}
      </div>

      {timers.length > 0 && (
        <div class="cocinar-timers">
          {timers.map((t) => {
            const resta = Math.ceil((t.fin - ahora) / 1000);
            return (
              <button type="button" class={`cocinar-timer${t.avisado ? ' listo' : ''}`} onClick={() => quitar(t.id)} title="Quitar temporizador">
                <Icono n="crono" t={16} />
                <span>{t.avisado ? '¡Listo!' : relojTexto(resta)}</span>
                <small>{t.nombre}</small>
                <Icono n="cerrar" t={14} />
              </button>
            );
          })}
        </div>
      )}

      <main class="cocinar-cuerpo">
        {paso === 0 ? (
          <>
            <h2 class="cocinar-tit">Saca los ingredientes</h2>
            <p class="ayuda">Para {para}. Toca cada uno cuando lo tengas a mano.</p>
            <ul class="cocinar-ingredientes">
              {ingredientes.map((i) => (
                <li>
                  <button type="button" class={tengo.has(i.nombre) ? 'hecho' : ''} onClick={() => alternar(i.nombre)}>
                    <span class={`casilla${tengo.has(i.nombre) ? ' marcada' : ''}`}>{tengo.has(i.nombre) && <Icono n="check" t={16} />}</span>
                    <span class="ci-nombre">{i.nombre}</span>
                    <span class="ci-cantidad">{i.cantidad}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p class="ayuda">La pantalla se queda encendida mientras cocinas. Sal solo en la parte de los adultos, al final.</p>
          </>
        ) : (
          <>
            <p class="cocinar-paso">{texto}</p>
            {tiempos.length > 0 && (
              <div class="cocinar-tiempos">
                {tiempos.map((t) => (
                  <button type="button" class="boton-secundario auto" onClick={() => iniciar(t.etiqueta, t.segundos)}>
                    <Icono n="crono" t={18} /> Temporizador {t.etiqueta}
                  </button>
                ))}
              </div>
            )}
            {ultimo && (
              <div class="lista bloque-texto nino-receta cocinar-nino">
                <p>
                  <b>Para el niño:</b> {r.nino.adaptacion}
                </p>
                <p>
                  <b>Ración:</b> {r.nino.racion}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer class="cocinar-pie">
        <button type="button" class="boton-secundario grande" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
          <Icono n="chevronIzq" t={22} /> Anterior
        </button>
        {ultimo ? (
          <button type="button" class="boton-principal grande" onClick={() => atras(`/cocina/recetas/${r.id}`)}>
            <Icono n="check" t={22} /> Terminado
          </button>
        ) : (
          <button type="button" class="boton-principal grande" onClick={() => setPaso(paso + 1)}>
            {paso === 0 ? 'Empezar' : 'Siguiente'} <Icono n="chevron" t={22} />
          </button>
        )}
      </footer>
    </div>
  );
}
