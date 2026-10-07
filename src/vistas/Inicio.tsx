// INICIO: el "hoy" de toda tu vida. Cada módulo aporta su tarjeta.
import { useVivo } from '../core/vivo';
import { diaActual } from '../core/hoy';
import { DIAS, MESES, isoWeekday, parse } from '../core/fechas';
import { diasDesdeUltimaCopia } from '../core/copia';
import { hayActualizacion, aplicarActualizacion } from '../core/pwa';
import { ir } from '../core/router';
import { MODULOS } from '../core/registro';
import { Icono } from '../ui/Icono';

function saludo(): string {
  const h = new Date().getHours();
  return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

export function Inicio() {
  const fecha = parse(diaActual.value);
  const diasCopia = useVivo(diasDesdeUltimaCopia, []);
  return (
    <>
      <header class="cabecera">
        <div>
          <div class="sobre">
            {DIAS[isoWeekday(fecha)]}, {fecha.getDate()} de {MESES[fecha.getMonth() + 1]}
          </div>
          <h1>{saludo()}</h1>
        </div>
        <button type="button" class="btn-icono" aria-label="Buscar" onClick={() => ir('/buscar')}>
          <Icono n="buscar" t={20} />
        </button>
      </header>

      {hayActualizacion.value && (
        <button type="button" class="aviso-suave accion" onClick={aplicarActualizacion}>
          <Icono n="reiniciar" t={18} />
          <span>
            Hay una versión nueva de la app. <b>Toca para actualizar.</b>
          </span>
        </button>
      )}

      <div class="widgets">
        {MODULOS.filter((m) => m.widgetInicio).map((m) => {
          const W = m.widgetInicio!;
          return <W key={m.id} />;
        })}
      </div>

      {diasCopia !== undefined && (diasCopia === null || diasCopia > 30) && (
        <button type="button" class="aviso-suave accion" onClick={() => ir('/ajustes')}>
          <Icono n="subir" t={18} />
          <span>
            {diasCopia === null ? 'Aún no has hecho ninguna copia de seguridad.' : `Tu última copia de seguridad es de hace ${diasCopia} días.`} <b>Hacer una ahora</b>
          </span>
        </button>
      )}
    </>
  );
}
