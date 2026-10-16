// COCINA · Ajustes: raciones por kcal de cada adulto, reparto entre comida y cena, la parte del
// niño en la compra y la rotación del menú. Los nombres y las kcal solo se guardan en el móvil.
import { parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { BarraDetalle } from '../../../ui/Cabecera';
import { confirmar, mostrarToast } from '../../../ui/capas';
import { Ajuste, Campo, FilaBoton, Interruptor, Lista, Segmentado, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { FUENTE_NUTRICION } from '../datos/nutricion';
import { ajustesCocina, cambiarAjustesCocina, gustosCocina, marcarEnCasa, restablecerCambios, sustituirSiempre } from '../estado';
import { receta } from '../datos/recetas';
import { cambiaProteina, inicioParaSemana, semanaDelCiclo } from '../plan';
import type { AjustesRaciones, Persona } from '../raciones';

export function AjustesCocinaPantalla() {
  const aj = ajustesCocina.value;
  const r = aj.raciones;
  const hoy = parse(diaActual.value);
  const actual = semanaDelCiclo(hoy, aj.inicio, aj.ciclo);
  const setR = (p: Partial<AjustesRaciones>) => cambiarAjustesCocina({ raciones: { ...r, ...p } });
  const setPersona = (i: number, p: Partial<Persona>) => setR({ personas: r.personas.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const resto = 100 - r.pctComida - r.pctCena;
  const sust = gustosCocina.value.sustituciones;

  return (
    <>
      <BarraDetalle padre="/cocina" textoAtras="Cocina" titulo="Ajustes de cocina" />
      <div class="pagina">
        <Lista
          titulo="Raciones por persona"
          pie="Con esto activado, cada receta muestra los gramos de cada ingrediente para cada uno, y la lista de la compra suma las cantidades de la semana."
        >
          <Campo et="Calcular gramos según las kcal" sub="Escala cada receta a lo que quiere comer cada uno">
            <Interruptor valor={r.activo} cambiar={(v) => setR({ activo: v })} etiqueta="Calcular gramos según las kcal" />
          </Campo>
        </Lista>

        {r.personas.map((p, i) => (
          <Lista titulo={`Adulto ${i + 1}`}>
            <Campo et="Nombre" col>
              <Texto valor={p.nombre} cambiar={(v) => setPersona(i, { nombre: v })} marcador={`Adulto ${i + 1}`} />
            </Campo>
            <Campo et="Kcal al día" sub={`Comida ≈ ${Math.round((p.kcal * r.pctComida) / 100)} kcal · cena ≈ ${Math.round((p.kcal * r.pctCena) / 100)} kcal`}>
              <Ajuste valor={p.kcal} cambiar={(v) => v && v >= 800 && setPersona(i, { kcal: Math.round(v) })} paso={50} min={1000} max={5000} dec={0} etiqueta="kcal" />
            </Campo>
          </Lista>
        ))}

        <Lista titulo="Reparto del día" pie={`El ${resto} % restante queda para desayuno, media mañana, merienda, fruta y frutos secos. Es un reparto orientativo habitual: ajústalo a vuestros horarios.`}>
          <Campo et="Comida" sub="% de las kcal del día">
            <Ajuste valor={r.pctComida} cambiar={(v) => v && v >= 10 && setR({ pctComida: Math.min(60, v) })} paso={5} min={20} max={60} unidad="%" dec={0} etiqueta="comida" />
          </Campo>
          <Campo et="Cena" sub="% de las kcal del día">
            <Ajuste valor={r.pctCena} cambiar={(v) => v && v >= 10 && setR({ pctCena: Math.min(60, v) })} paso={5} min={15} max={60} unidad="%" dec={0} etiqueta="cena" />
          </Campo>
        </Lista>

        <Lista titulo="El niño" pie="Su ración no se calcula por kcal: en cada receta tienes la orientativa en cucharadas.">
          <Campo et="Sumar su parte en la compra" sub="Unos ¼ de ración de adulto cuando come en casa">
            <Interruptor valor={r.ninoEnCompra} cambiar={(v) => setR({ ninoEnCompra: v })} etiqueta="Sumar la parte del niño" />
          </Campo>
        </Lista>

        <Lista titulo="Menú" pie="Con 8 semanas hay el doble de recetas antes de que se repita nada. Si eliges 4, se usan solo las 4 primeras.">
          <Campo et="Rotación" col>
            <Segmentado<4 | 8>
              opciones={[[4, '4 semanas'], [8, '8 semanas']]}
              valor={aj.ciclo}
              cambiar={(c) => cambiarAjustesCocina({ ciclo: c, inicio: inicioParaSemana(hoy, Math.min(actual, c - 1)) })}
            />
          </Campo>
          <Campo et="Esta semana toca la del menú" col>
            <div class="chips compactos">
              {Array.from({ length: aj.ciclo }, (_, n) => (
                <button type="button" class="chip" aria-pressed={actual === n} onClick={() => cambiarAjustesCocina({ inicio: inicioParaSemana(hoy, n) })}>
                  {n + 1}
                </button>
              ))}
            </div>
          </Campo>
          <FilaBoton
            icono="reiniciar"
            texto="Deshacer todos los cambios de platos"
            onClick={async () => {
              if (await confirmar({ titulo: '¿Deshacer los cambios de platos?', texto: 'Todos los días vuelven a su plato del menú.', ok: 'Deshacer', peligro: true })) {
                await restablecerCambios();
                mostrarToast('Menú original restablecido');
              }
            }}
          />
        </Lista>

        <Lista
          titulo="Platos sustituidos para siempre"
          pie={
            Object.keys(sust).length
              ? 'Se aplican en todas las semanas del menú. Para sustituir otro, pulsa ⟳ en un plato y activa «Para siempre».'
              : 'Ninguno. Para quitar del menú un plato que no os gusta, pulsa ⟳ en él (en Hoy o en Semana) y activa «Para siempre».'
          }
        >
          {Object.entries(sust).map(([de, por]) => (
            <FilaBoton
              icono="reiniciar"
              texto={
                <>
                  {receta(de)?.nombre} → <b>{receta(por)?.nombre}</b>
                  {cambiaProteina(de, por) && <small class="aviso-proteina"> · cambia la proteína</small>}
                </>
              }
              onClick={async () => {
                await sustituirSiempre(de, null);
                mostrarToast(`Vuelve «${receta(de)?.nombre}» al menú`);
              }}
            />
          ))}
        </Lista>

        {gustosCocina.value.enCasa.length > 0 && (
          <Lista titulo="Siempre en casa" pie="No se cuentan ni se comparten en la lista de la compra. Toca uno para que vuelva a la lista.">
            {gustosCocina.value.enCasa.map((n) => (
              <FilaBoton icono="cerrar" texto={n} onClick={() => marcarEnCasa(n, false)} />
            ))}
          </Lista>
        )}

        <div class="aviso-suave">
          <Icono n="info" t={18} />
          <span>
            Las kcal se calculan con la tabla de composición de alimentos del USDA (
            <a class="enlace" href={FUENTE_NUTRICION.url} target="_blank" rel="noopener noreferrer">
              FoodData Central
            </a>
            ) sobre el peso en crudo y limpio. Son una estimación (±10-15 %), suficiente para cocinar cantidades coherentes. Si tenéis un objetivo de salud concreto, que lo marque un dietista-nutricionista.
          </span>
        </div>
      </div>
    </>
  );
}
