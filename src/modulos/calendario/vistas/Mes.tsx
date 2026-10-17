// CALENDARIO · Mes: cada día con el turno en una esquina y sus notas. Con «Turnos rápidos» se elige
// un turno y se van tocando días para ponerlo (para pasar el cuadrante del mes de una vez).
import { signal } from '@preact/signals';
import { DIAS_INICIAL, MESES, iso, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { escritorio } from '../../../core/pantalla';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { Icono } from '../../../ui/Icono';
import { useFlechas } from '../../../ui/teclado';
import { leerNotas, leerTurnos, nombreTurnos, ponerTurno } from '../estado';
import { cuandoEs, moverMes, proximas, recuentoMes, rejillaMes } from '../logica';
import { TURNOS, type Turno } from '../tipos';
import { ChipTurno, IconoNota, abrirDia, fechaLarga } from './comunes';

const vista = signal<{ año: number; mes: number } | null>(null);
/** Turno con el que se «pinta» al tocar un día (modo turnos rápidos). */
const pincel = signal<Turno | 'quitar' | null>(null);

export function MesCalendario() {
  const hoy = diaActual.value;
  const h = parse(hoy);
  const { año, mes } = vista.value || { año: h.getFullYear(), mes: h.getMonth() + 1 };
  const semanas = rejillaMes(año, mes);
  const desde = iso(semanas[0][0]);
  const hasta = iso(semanas[5][6]);
  const turnos = useVivo(() => leerTurnos(desde, hasta), [desde]);
  const notas = useVivo(() => leerNotas(desde, hasta), [desde]);
  const futuras = useVivo(() => leerNotas(hoy, '9999-12-31'), [hoy]);
  const mover = (n: number) => (vista.value = moverMes(año, mes, n));
  useFlechas(() => mover(-1), () => mover(1));
  if (!turnos || !notas) return null;

  const porDia = new Map<string, typeof notas>();
  for (const n of notas) porDia.set(n.fecha, [...(porDia.get(n.fecha) || []), n]);
  const recuento = recuentoMes(turnos, año, mes);
  const esEsteMes = año === h.getFullYear() && mes === h.getMonth() + 1;
  const prox = proximas(futuras || [], hoy, 21);
  const maxNotas = escritorio.value ? 3 : 2;

  const tocar = (fecha: string) => {
    if (pincel.value) ponerTurno(fecha, pincel.value === 'quitar' ? null : pincel.value);
    else abrirDia(fecha);
  };

  return (
    <>
      <div class="cal-cab">
        <button type="button" class="btn-icono" aria-label="Mes anterior" onClick={() => mover(-1)}>
          <Icono n="chevronIzq" t={20} />
        </button>
        <h2>
          {MESES[mes][0].toUpperCase() + MESES[mes].slice(1)} <span>{año}</span>
        </h2>
        <button type="button" class="btn-icono" aria-label="Mes siguiente" onClick={() => mover(1)}>
          <Icono n="chevron" t={20} />
        </button>
        {!esEsteMes && (
          <button type="button" class="btn-texto" onClick={() => (vista.value = null)}>
            Hoy
          </button>
        )}
        <button type="button" class={`boton-secundario auto cal-pintar${pincel.value ? ' activo' : ''}`} onClick={() => (pincel.value = pincel.value ? null : 'M')}>
          <Icono n={pincel.value ? 'check' : 'editar'} t={18} /> {pincel.value ? 'Listo' : 'Turnos rápidos'}
        </button>
      </div>

      {pincel.value && (
        <div class="cal-pincel">
          <span>Elige un turno y toca los días:</span>
          <div class="turnos-sel compacto">
            {TURNOS.map((x) => (
              <button type="button" class={`t-${x.id}`} aria-pressed={pincel.value === x.id} onClick={() => (pincel.value = x.id)}>
                <b>{x.id}</b>
                <span>{x.nombre}</span>
              </button>
            ))}
            <button type="button" class="sin" aria-pressed={pincel.value === 'quitar'} onClick={() => (pincel.value = 'quitar')}>
              <b>—</b>
              <span>Quitar</span>
            </button>
          </div>
        </div>
      )}

      <div class={`cal-mes${pincel.value ? ' pintando' : ''}`}>
        {DIAS_INICIAL.slice(1).map((d) => (
          <div class="cal-sem">{d}</div>
        ))}
        {semanas.flat().map((d) => {
          const f = iso(d);
          const t = turnos.get(f);
          const ns = porDia.get(f) || [];
          const fuera = d.getMonth() + 1 !== mes;
          return (
            <button type="button" class={`cal-dia${fuera ? ' fuera' : ''}${f === hoy ? ' hoy' : ''}${f < hoy ? ' pasado' : ''}`} onClick={() => tocar(f)} aria-label={`${fechaLarga(f)}${t ? `, turno ${t}` : ''}${ns.length ? `, ${ns.length} notas` : ''}`}>
              <span class="cd-num">{d.getDate()}</span>
              {t && <ChipTurno t={t} />}
              <span class="cd-notas">
                {ns.slice(0, maxNotas).map((n) => (
                  <span class={`cd-nota n-${n.tipo}${n.hecha ? ' hecha' : ''}`}>{n.texto}</span>
                ))}
                {ns.length > maxNotas && <span class="cd-mas">+{ns.length - maxNotas} más</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p class="pie">
        {pincel.value ? 'Toca «Listo» cuando acabes.' : 'Toca un día para poner el turno o añadir una nota.'} Turnos de {nombreTurnos()} este mes: {TURNOS.map((x) => `${x.id} ${recuento[x.id]}`).join(' · ')}.
      </p>

      <div class="columnas">
        <div>
          <div class="tit-lista">Próximas 3 semanas</div>
          {prox.length ? (
            <div class="lista">
              {prox.map((n) => (
                <button type="button" class={`item nota-prox${n.hecha ? ' hecha' : ''}`} onClick={() => abrirDia(n.fecha)}>
                  <IconoNota tipo={n.tipo} t={18} />
                  <div class="item-txt">
                    <div class="item-tit">{n.texto}</div>
                    <div class="item-meta">
                      {fechaLarga(n.fecha)} · {cuandoEs(n.fecha, hoy)}
                    </div>
                  </div>
                  {turnos.get(n.fecha) && <ChipTurno t={turnos.get(n.fecha)!} />}
                </button>
              ))}
            </div>
          ) : (
            <div class="lista bloque-texto">
              <p class="ayuda">Nada apuntado en las próximas tres semanas.</p>
            </div>
          )}
        </div>
        <div>
          <div class="tit-lista">Turnos</div>
          <div class="lista bloque-texto leyenda-turnos">
            {TURNOS.map((x) => (
              <p>
                <ChipTurno t={x.id} /> {x.nombre}
              </p>
            ))}
            <button type="button" class="enlace-boton" onClick={() => ir('/calendario/ajustes')}>
              Rellenar con un patrón rotativo y cambiar el nombre →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
