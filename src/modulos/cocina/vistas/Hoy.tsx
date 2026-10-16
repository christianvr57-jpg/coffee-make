// COCINA · Hoy: qué se come hoy (adultos y niño), postre, batch cooking los domingos y mañana.
import { addDays, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { Icono } from '../../../ui/Icono';
import { ir } from '../../../core/router';
import { SEMANAS } from '../datos/menu';
import { ajustesCocina } from '../estado';
import { planDia } from '../plan';
import { ComidasNino, TarjetaPlato, fechaLarga, useCambios } from './comunes';

export function Lote({ semana, titulo }: { semana: number; titulo: string }) {
  return (
    <>
      <div class="tit-lista">{titulo}</div>
      <ol class="lista bloque-texto lote">
        {SEMANAS[semana].lote.map((x) => (
          <li>{x}</li>
        ))}
      </ol>
    </>
  );
}

export function HoyCocina() {
  const cambios = useCambios();
  if (!cambios) return null;
  const hoy = parse(diaActual.value);
  const inicio = ajustesCocina.value.inicio;
  const p = planDia(hoy, inicio, cambios, ajustesCocina.value.ciclo);
  const m = planDia(addDays(hoy, 1), inicio, cambios, ajustesCocina.value.ciclo);
  return (
    <>
      <div class="sub-cabecera">
        <div>
          <div class="sobre">Semana {p.semana + 1} de {ajustesCocina.value.ciclo} del menú</div>
          <div class="sub">{fechaLarga(p.fecha)}</div>
        </div>
        <button type="button" class="btn-mas" aria-label="Ajustes de cocina" onClick={() => ir('/cocina/ajustes')}>
          <Icono n="ajustes" t={22} />
        </button>
      </div>

      {p.dia === 7 && <Lote semana={m.semana} titulo="Hoy toca preparar la semana (batch cooking)" />}

      <div class="columnas">
        <div>
          <div class="tit-lista">Adultos</div>
          <TarjetaPlato momento="comida" r={p.comida} cambiada={p.comidaCambiada} fecha={p.fecha} finde={p.finde} />
          <TarjetaPlato momento="cena" r={p.cena} cambiada={p.cenaCambiada} fecha={p.fecha} finde={p.finde} />
          <div class="lista bloque-texto consejo-dia">
            <p>
              <Icono n="check" t={16} />
              <span>
                <b>Postre:</b> {p.postre}
              </span>
            </p>
            <p>
              <Icono n="check" t={16} />
              <span>Adultos: un puñado de frutos secos naturales sin sal entre horas.</span>
            </p>
          </div>
        </div>
        <div>
          <div class="tit-lista">El niño</div>
          <ComidasNino p={p} />

          <div class="tit-lista">Mañana · {fechaLarga(m.fecha).split(' ')[0].toLowerCase()}</div>
          <div class="lista">
            {[m.comida, m.cena].map((r, i) => (
              <a class="item" href={`#/cocina/recetas/${r.id}`}>
                <div class="item-txt">
                  <div class="item-meta">{i === 0 ? 'Comida' : 'Cena'}</div>
                  <div class="item-tit">{r.nombre}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </a>
            ))}
          </div>
          {m.comida.ingredientes.some((x) => /garbanzos|alubias/i.test(x.n)) && (
            <p class="pie">Si mañana usas legumbre seca (garbanzos o alubias) y no la tienes cocida, déjala hoy en remojo.</p>
          )}
          <p class="pie">
            <a class="enlace" href="#/cocina/semana">
              Ver la semana completa
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
