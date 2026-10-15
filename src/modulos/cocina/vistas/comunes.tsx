// Piezas compartidas por las vistas de Cocina.
import { DIAS, MESES, parse } from '../../../core/fechas';
import { useVivo } from '../../../core/vivo';
import { ajustesCocina, cambiarPlato, leerCambios } from '../estado';
import { Hoja, abrirHoja, mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { alternativas, planDia, type PlanDia } from '../plan';
import { nombrePersona, racionesReceta } from '../raciones';
import { APARATOS, PROTEINAS, type Momento, type Receta } from '../tipos';

export const fechaLarga = (f: string) => {
  const d = parse(f);
  return `${DIAS[d.getDay() || 7]} ${d.getDate()} de ${MESES[d.getMonth() + 1]}`;
};

/** Cambios de plato en vivo (se repinta al cambiar uno). */
export const useCambios = () => useVivo(leerCambios, []);

/** Plan del día con los cambios ya aplicados. */
export function usePlanDia(fecha: string): PlanDia | undefined {
  const cambios = useCambios();
  if (!cambios) return undefined;
  return planDia(parse(fecha), ajustesCocina.value.inicio, cambios, ajustesCocina.value.ciclo);
}

export function Etiquetas({ r }: { r: Receta }) {
  return (
    <span class="etiquetas-receta">
      <span class={`chip-proteina p-${r.proteina}`}>{PROTEINAS[r.proteina]}</span>
      <span>
        <Icono n="reloj" t={13} /> {r.minutos} min
      </span>
      {r.aparato && <span>{APARATOS[r.aparato]}</span>}
    </span>
  );
}

/** Tarjeta de un plato de adultos con enlace a la receta y botón para cambiarlo. */
export function TarjetaPlato({ momento, r, cambiada, fecha, finde }: { momento: Momento; r: Receta; cambiada: boolean; fecha: string; finde: boolean }) {
  const raciones = ajustesCocina.value.raciones;
  return (
    <div class="tarjeta-plato">
      <a class="tp-cuerpo" href={`#/cocina/recetas/${r.id}?m=${momento}`}>
        <span class="tp-momento">
          {momento === 'comida' ? 'Comida' : 'Cena'}
          {cambiada && <em> · cambiado</em>}
        </span>
        <b>{r.nombre}</b>
        {r.acompanamiento && <span class="tp-acomp">Con: {r.acompanamiento.toLowerCase()}</span>}
        <Etiquetas r={r} />
        {raciones.activo && (
          <span class="tp-kcal">
            {racionesReceta(r, momento, raciones)
              .map((x, i) => `${nombrePersona(x.persona, i)} ${Math.round(x.kcal)} kcal`)
              .join(' · ')}
          </span>
        )}
      </a>
      <button type="button" class="tp-cambiar" aria-label={`Cambiar ${momento}`} onClick={() => elegirCambio(fecha, momento, r, finde, cambiada)}>
        <Icono n="repetir" t={18} />
      </button>
    </div>
  );
}

/** Lo que come el niño ese día en casa. */
export function ComidasNino({ p }: { p: PlanDia }) {
  const filas: { t: string; nombre: string; detalle: string; href?: string }[] = [];
  if (p.desayuno) filas.push({ t: 'Desayuno', nombre: p.desayuno.texto, detalle: p.desayuno.racion });
  if (p.finde) filas.push({ t: 'Comida', nombre: p.comida.nombre, detalle: `${p.comida.nino.adaptacion} ${p.comida.nino.racion}`, href: `#/cocina/recetas/${p.comida.id}?m=comida` });
  filas.push({ t: 'Merienda', nombre: p.merienda.texto, detalle: p.merienda.racion });
  filas.push({ t: 'Cena', nombre: p.cena.nombre, detalle: `${p.cena.nino.adaptacion} ${p.cena.nino.racion}`, href: `#/cocina/recetas/${p.cena.id}?m=cena` });
  return (
    <div class="lista nino-dia">
      {filas.map((f) =>
        f.href ? (
          <a class="nd-fila" href={f.href}>
            <span class="nd-t">{f.t}</span>
            <div>
              <b>{f.nombre}</b>
              <p>{f.detalle}</p>
            </div>
          </a>
        ) : (
          <div class="nd-fila">
            <span class="nd-t">{f.t}</span>
            <div>
              <b>{f.nombre}</b>
              <p>{f.detalle}</p>
            </div>
          </div>
        ),
      )}
      {!p.finde && <p class="nd-pie">La comida la hace en el colegio. Sin sal: separa su ración antes de salar.</p>}
      {p.finde && <p class="nd-pie">Sin sal: separa su ración antes de salar.</p>}
    </div>
  );
}

function ElegirCambio({ cerrar, fecha, momento, actual, finde, cambiada }: { cerrar: () => void; fecha: string; momento: Momento; actual: Receta; finde: boolean; cambiada: boolean }) {
  const { misma, otras } = alternativas(actual, finde);
  const elegir = async (id: string | null) => {
    await cambiarPlato(fecha, momento, id);
    mostrarToast(id ? 'Plato cambiado para ese día' : 'Vuelve el plato del menú');
    cerrar();
  };
  const Fila = ({ r }: { r: Receta }) => (
    <button type="button" class="item" onClick={() => elegir(r.id)}>
      <div class="item-txt">
        <div class="item-tit">{r.nombre}</div>
        <Etiquetas r={r} />
      </div>
    </button>
  );
  return (
    <Hoja titulo={`Cambiar la ${momento} del ${fechaLarga(fecha).toLowerCase()}`} cerrar={cerrar}>
      {cambiada && (
        <div class="lista">
          <button type="button" class="boton-fila" onClick={() => elegir(null)}>
            <Icono n="reiniciar" t={22} /> Volver al plato del menú
          </button>
        </div>
      )}
      <div class="tit-lista">{PROTEINAS[actual.proteina]}: mantiene el equilibrio de la semana</div>
      <div class="lista">
        {misma.map((r) => (
          <Fila r={r} />
        ))}
      </div>
      <div class="tit-lista">Otras recetas</div>
      <div class="lista">
        {otras.map((r) => (
          <Fila r={r} />
        ))}
      </div>
      <p class="pie">{finde ? 'El cambio solo afecta a este día y se refleja en la lista de la compra.' : 'Entre semana solo se ofrecen recetas de 40 minutos o menos. El cambio solo afecta a este día y se refleja en la lista de la compra.'}</p>
    </Hoja>
  );
}

export const elegirCambio = (fecha: string, momento: Momento, actual: Receta, finde: boolean, cambiada: boolean) =>
  abrirHoja((cerrar) => <ElegirCambio cerrar={cerrar} fecha={fecha} momento={momento} actual={actual} finde={finde} cambiada={cambiada} />);
