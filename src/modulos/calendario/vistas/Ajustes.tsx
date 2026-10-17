// CALENDARIO · Ajustes: nombre de quien tiene los turnos y relleno con un patrón rotativo
// (p. ej. MMTTNNLL desde un día durante varias semanas).
import { useState } from 'preact/hooks';
import { diaActual } from '../../../core/hoy';
import { BarraDetalle } from '../../../ui/Cabecera';
import { avisar, confirmar } from '../../../ui/capas';
import { Campo, Lista, Selector, Texto } from '../../../ui/form';
import { ajustesCalendario, cambiarAjustesCalendario, rellenarPatron } from '../estado';
import { aplicarPatron, leerPatron } from '../logica';
import { ChipTurno, fechaLarga } from './comunes';

export function AjustesCalendarioPantalla() {
  const [nombre, setNombre] = useState(ajustesCalendario.value.nombre);
  const [desde, setDesde] = useState(diaActual.value);
  const [patron, setPatron] = useState('');
  const [semanas, setSemanas] = useState(4);
  const p = leerPatron(patron);
  const muestra = p ? aplicarPatron(desde, p, Math.min(14, semanas * 7)) : [];

  const rellenar = async () => {
    if (!p) return;
    const dias = semanas * 7;
    if (!(await confirmar({ titulo: '¿Rellenar los turnos?', texto: `${dias} días desde el ${fechaLarga(desde).toLowerCase()} con el patrón ${p.join('')}. Los turnos que ya hubiera en esos días se sustituyen; las notas no se tocan.`, ok: 'Rellenar' }))) return;
    const n = await rellenarPatron(desde, p, dias);
    await avisar('Turnos puestos', `${n} días rellenados.`);
  };

  return (
    <>
      <BarraDetalle padre="/calendario" textoAtras="Calendario" titulo="Ajustes del calendario" />
      <div class="pagina">
        <Lista titulo="Turnos de" pie="Aparece en la leyenda, en la ficha de cada día y en Inicio.">
          <Campo et="Nombre" col>
            <Texto
              valor={nombre}
              cambiar={(v) => {
                setNombre(v);
                cambiarAjustesCalendario({ nombre: v });
              }}
              marcador="Pareja"
            />
          </Campo>
        </Lista>

        <Lista
          titulo="Rellenar con un patrón"
          pie="Para turnos rotativos: escribe la secuencia de días con M (mañana), T (tarde), N (noche) y L (libre), por ejemplo MMTTNNLL, y desde qué día empieza. Luego puedes corregir días sueltos tocándolos en el mes."
        >
          <Campo et="Desde">
            <input type="date" class="fecha" value={desde} onInput={(e) => setDesde((e.target as HTMLInputElement).value)} />
          </Campo>
          <Campo et="Patrón" col clase={patron && !p ? 'error' : ''}>
            <Texto valor={patron} cambiar={setPatron} marcador="MMTTNNLL" />
          </Campo>
          <Campo et="Durante">
            <Selector<number> opciones={[1, 2, 4, 8, 12, 26, 52].map((n) => [n, `${n} ${n === 1 ? 'semana' : 'semanas'}`] as [number, string])} valor={semanas} cambiar={setSemanas} />
          </Campo>
          {muestra.length > 0 && (
            <div class="campo col">
              <div class="et">Así quedan los primeros días</div>
              <div class="patron-muestra">
                {muestra.map((x) => (
                  <span>
                    <small>{Number(x.fecha.slice(8))}</small>
                    <ChipTurno t={x.turno} />
                  </span>
                ))}
              </div>
            </div>
          )}
          <div class="campo">
            <button type="button" class="boton-principal" disabled={!p} onClick={rellenar}>
              Rellenar {semanas * 7} días
            </button>
          </div>
        </Lista>
      </div>
    </>
  );
}
