// CALENDARIO · Notas: todo lo apuntado de hoy en adelante, agrupado por día con el turno, y lo de
// los últimos 30 días plegado.
import { addDays, iso, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { useVivo } from '../../../core/vivo';
import { Icono } from '../../../ui/Icono';
import { leerNotas, leerTurnos } from '../estado';
import { cuandoEs } from '../logica';
import { tipoNota, type NotaDia } from '../tipos';
import { ChipTurno, IconoNota, abrirDia, fechaLarga } from './comunes';

function Grupos({ notas, turnos, hoy }: { notas: NotaDia[]; turnos: Map<string, string>; hoy: string }) {
  const dias: { fecha: string; notas: NotaDia[] }[] = [];
  for (const n of notas) {
    const g = dias[dias.length - 1];
    if (g && g.fecha === n.fecha) g.notas.push(n);
    else dias.push({ fecha: n.fecha, notas: [n] });
  }
  return (
    <>
      {dias.map((g) => (
        <section class="notas-grupo">
          <button type="button" class="tit-lista ng-cab" onClick={() => abrirDia(g.fecha)}>
            <span>
              {fechaLarga(g.fecha)} · {cuandoEs(g.fecha, hoy)}
            </span>
            {turnos.get(g.fecha) && <ChipTurno t={turnos.get(g.fecha) as never} />}
          </button>
          <div class="lista">
            {g.notas.map((n) => (
              <button type="button" class={`item nota-prox${n.hecha ? ' hecha' : ''}`} onClick={() => abrirDia(n.fecha)}>
                <IconoNota tipo={n.tipo} t={18} />
                <div class="item-txt">
                  <div class="item-tit">{n.texto}</div>
                  <div class="item-meta">{tipoNota(n.tipo).nombre}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function ListaCalendario() {
  const hoy = diaActual.value;
  const hace30 = iso(addDays(parse(hoy), -30));
  const notas = useVivo(() => leerNotas(hace30, '9999-12-31'), [hoy]);
  const turnos = useVivo(() => leerTurnos(hace30, '9999-12-31'), [hoy]);
  if (!notas || !turnos) return null;
  const orden = (a: NotaDia, b: NotaDia) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.creado - b.creado);
  const futuras = notas.filter((n) => n.fecha >= hoy).sort(orden);
  const pasadas = notas.filter((n) => n.fecha < hoy).sort((a, b) => -orden(a, b));
  return (
    <>
      <div class="sub-cabecera">
        <div class="sub">Citas, cosas que recordar y planes. Toca un día para añadir o cambiar.</div>
        <button type="button" class="btn-mas" aria-label="Añadir nota para hoy" onClick={() => abrirDia(hoy)}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      {futuras.length ? (
        <Grupos notas={futuras} turnos={turnos} hoy={hoy} />
      ) : (
        <div class="vacio">
          <Icono n="semana" t={40} />
          <p>No hay nada apuntado de hoy en adelante.</p>
        </div>
      )}
      {pasadas.length > 0 && (
        <details class="notas-pasadas">
          <summary>Últimos 30 días ({pasadas.length})</summary>
          <Grupos notas={pasadas} turnos={turnos} hoy={hoy} />
        </details>
      )}
    </>
  );
}
