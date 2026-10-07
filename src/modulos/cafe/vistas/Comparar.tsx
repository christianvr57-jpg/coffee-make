// CAFÉ · Comparador de 2-3 preparaciones lado a lado. Resalta lo que cambia respecto a la primera.
import { db } from '../../../core/db';
import { fechaRelativa, segundosATexto } from '../../../core/fechas';
import { consulta } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { ratio, textoRatio } from '../calculos';
import { ATRIBUTOS } from '../datos/cata';
import { SINTOMAS } from '../datos/catalogos';
import { metodo } from '../datos/metodos';
import { nombreSabor } from '../datos/rueda';
import type { Preparacion } from '../modelo';
import { listarAguas, listarEquipo, listarRecetas } from '../repositorio';
import { textoMolienda } from './comunes';
import { elegirParaComparar } from './Analisis';

export function Comparar() {
  const ids = (consulta().get('ids') || '').split(',').filter(Boolean).slice(0, 3);
  const preps = useVivo(async () => (await db.cafe_preparaciones.bulkGet(ids)).filter((p): p is Preparacion => !!p && !p.borrado), [ids.join(',')]);
  const equipo = useVivo(listarEquipo, []) || [];
  const aguas = useVivo(listarAguas, []) || [];
  const recetas = useVivo(listarRecetas, []) || [];
  if (!preps) return <BarraDetalle padre="/cafe/analisis" textoAtras="Análisis" />;
  if (preps.length < 2) {
    return (
      <>
        <BarraDetalle padre="/cafe/analisis" textoAtras="Análisis" />
        <div class="vacio">
          <p>Elige al menos dos preparaciones para compararlas.</p>
          <button type="button" class="boton-principal" onClick={() => elegirParaComparar()}>
            Elegir
          </button>
        </div>
      </>
    );
  }
  const esp = preps.some((p) => p.metodo === 'espresso');
  const filas: [string, (p: Preparacion) => string][] = [
    ['Fecha', (p) => fechaRelativa(p.fecha)],
    ['Café', (p) => p.cafeNombre || 'Sin registrar'],
    ['Método', (p) => metodo(p.metodo).nombre],
    ['Receta', (p) => recetas.find((r) => r.id === p.recetaId)?.nombre || '—'],
    ['Dosis', (p) => `${fmt(p.dosis)} g`],
    [esp ? 'Agua / salida' : 'Agua', (p) => (p.metodo === 'espresso' ? (p.rendimiento ? `${fmt(p.rendimiento)} g` : '—') : p.agua ? `${fmt(p.agua)} g` : '—')],
    ['Ratio', (p) => textoRatio(ratio(p))],
    ['Molienda', (p) => textoMolienda(p, equipo) || '—'],
    ['Temperatura', (p) => (p.temperatura ? `${p.temperatura} °C` : '—')],
    ['Tiempo', (p) => (p.tiempoTotal ? segundosATexto(p.tiempoTotal) : '—')],
    ['Reposo', (p) => (p.diasReposo !== undefined ? `${p.diasReposo} días` : '—')],
    ['Agua usada', (p) => aguas.find((a) => a.id === p.aguaId)?.nombre || '—'],
    ['Filtro', (p) => p.filtro || '—'],
    ['Sensaciones', (p) => (p.sintomas || []).map((s) => SINTOMAS.find((x) => x.id === s)?.nombre).join(', ') || '—'],
    ['Sabores', (p) => (p.cata?.sabores || []).map(nombreSabor).join(', ') || '—'],
  ];
  const conCata = preps.some((p) => p.cata);
  if (conCata) {
    for (const a of ATRIBUTOS) {
      filas.push([a.nombre, (p) => (p.cata?.atributos[a.id]?.agrado ? `${p.cata.atributos[a.id]!.agrado}/5` : '—')]);
    }
  }
  const mejorNota = Math.max(...preps.map((p) => p.puntuacion ?? -1));

  return (
    <>
      <BarraDetalle
        padre="/cafe/analisis"
        textoAtras="Análisis"
        titulo="Comparar"
        derecha={
          <button type="button" class="bd-accion" onClick={() => elegirParaComparar(ids)}>
            Cambiar
          </button>
        }
      />
      <div class="pagina">
        <div class="comparador" style={{ '--cols': preps.length }}>
          <div class="cmp-fila cmp-cab">
            <span />
            {preps.map((p) => (
              <a href={`#/cafe/p/${p.id}`} class={`cmp-nota${p.puntuacion === mejorNota && mejorNota >= 0 ? ' mejor' : ''}`}>
                <b>{p.puntuacion !== undefined ? fmt(p.puntuacion) : '–'}</b>
                <small>{p.puntuacion === mejorNota && mejorNota >= 0 ? 'la mejor' : 'nota'}</small>
              </a>
            ))}
          </div>
          {filas.map(([nombre, valor]) => {
            const vals = preps.map(valor);
            if (vals.every((v) => v === '—')) return null;
            return (
              <div class="cmp-fila">
                <span class="cmp-et">{nombre}</span>
                {vals.map((v, i) => (
                  <span class={`cmp-val${i > 0 && nombre !== 'Fecha' && v !== vals[0] ? ' distinto' : ''}`}>{v}</span>
                ))}
              </div>
            );
          })}
        </div>
        <p class="pie">
          <Icono n="info" t={14} /> Resaltado: lo que cambia respecto a la primera columna. Toca la nota para abrir cada preparación.
        </p>
      </div>
    </>
  );
}
