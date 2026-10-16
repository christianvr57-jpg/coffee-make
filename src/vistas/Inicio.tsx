// INICIO: el "hoy" de toda tu vida. Cada módulo aporta su tarjeta y, en el ordenador, su fila en la
// agenda de la semana.
import { signal } from '@preact/signals';
import { useVivo } from '../core/vivo';
import { diaActual } from '../core/hoy';
import { DIAS, DIAS_CORTOS, MESES, addDays, fechaCorta, iso, isoWeekday, lunesDe, parse } from '../core/fechas';
import { diasDesdeUltimaCopia } from '../core/copia';
import { escritorio } from '../core/pantalla';
import { hayActualizacion, aplicarActualizacion } from '../core/pwa';
import { estadoNube } from '../core/nube';
import { ir } from '../core/router';
import { MODULOS } from '../core/registro';
import { Icono } from '../ui/Icono';
import { useFlechas } from '../ui/teclado';

function saludo(): string {
  const h = new Date().getHours();
  return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

const desfaseAgenda = signal(0);

/** Ordenador: la semana de todos los módulos en una rejilla (un módulo por fila, un día por columna). */
function AgendaSemana() {
  const hoy = diaActual.value;
  const lunes = addDays(lunesDe(parse(hoy)), 7 * desfaseAgenda.value);
  const dias = Array.from({ length: 7 }, (_, i) => iso(addDays(lunes, i)));
  const mods = MODULOS.filter((m) => m.agendaDia);
  useFlechas(() => desfaseAgenda.value--, () => desfaseAgenda.value++);
  const titulo = desfaseAgenda.value === 0 ? 'Tu semana' : desfaseAgenda.value === 1 ? 'La semana que viene' : desfaseAgenda.value === -1 ? 'La semana pasada' : `Semana del ${fechaCorta(lunes)}`;
  return (
    <section class="agenda">
      <div class="ag-cab">
        <h2>{titulo}</h2>
        <span>
          {fechaCorta(lunes)} – {fechaCorta(addDays(lunes, 6))}
        </span>
        {desfaseAgenda.value !== 0 && (
          <button type="button" class="btn-texto" onClick={() => (desfaseAgenda.value = 0)}>
            Hoy
          </button>
        )}
        <button type="button" class="btn-icono" aria-label="Semana anterior" title="Semana anterior (←)" onClick={() => desfaseAgenda.value--}>
          <Icono n="chevronIzq" t={18} />
        </button>
        <button type="button" class="btn-icono" aria-label="Semana siguiente" title="Semana siguiente (→)" onClick={() => desfaseAgenda.value++}>
          <Icono n="chevron" t={18} />
        </button>
      </div>
      <div class="ag-rejilla">
        <div class="ag-esquina" />
        {dias.map((f) => {
          const d = parse(f);
          return (
            <div class={`ag-dia${f === hoy ? ' hoy' : ''}`}>
              <b>{DIAS_CORTOS[isoWeekday(d)]}</b>
              <span>{d.getDate()}</span>
            </div>
          );
        })}
        {mods.map((m) => {
          const A = m.agendaDia!;
          return (
            <>
              <a class={`ag-modulo ${m.tema}`} href={`#${m.rutaInicio}`} title={m.nombre}>
                <Icono n={m.icono} t={17} />
                <span>{m.nombre}</span>
              </a>
              {dias.map((f) => (
                <div class={`ag-celda ${m.tema}${f === hoy ? ' hoy' : ''}`}>
                  <A fecha={f} />
                </div>
              ))}
            </>
          );
        })}
      </div>
    </section>
  );
}

export function Inicio() {
  const fecha = parse(diaActual.value);
  const diasCopia = useVivo(diasDesdeUltimaCopia, []);
  const esc = escritorio.value;
  return (
    <div class={esc ? 'inicio-escritorio' : ''}>
      <header class="cabecera">
        <div>
          <div class="sobre">
            {DIAS[isoWeekday(fecha)]}, {fecha.getDate()} de {MESES[fecha.getMonth() + 1]}
          </div>
          <h1>{saludo()}</h1>
        </div>
        {!esc && (
          <button type="button" class="btn-icono" aria-label="Buscar" onClick={() => ir('/buscar')}>
            <Icono n="buscar" t={20} />
          </button>
        )}
      </header>

      {hayActualizacion.value && (
        <button type="button" class="aviso-suave accion" onClick={aplicarActualizacion}>
          <Icono n="reiniciar" t={18} />
          <span>
            Hay una versión nueva de la app. <b>{esc ? 'Pulsa para actualizar.' : 'Toca para actualizar.'}</b>
          </span>
        </button>
      )}

      {estadoNube.value.activa && estadoNube.value.error && !estadoNube.value.sincronizando && (
        <button type="button" class="aviso-suave atencion accion" onClick={() => ir('/ajustes')}>
          <Icono n="nube" t={18} />
          <span>
            {estadoNube.value.error} <b>Ver</b>
          </span>
        </button>
      )}

      {esc && <AgendaSemana />}
      {esc && <div class="tit-lista">Hoy</div>}

      <div class="widgets">
        {MODULOS.filter((m) => m.widgetInicio).map((m) => {
          const W = m.widgetInicio!;
          return <W key={m.id} />;
        })}
      </div>

      {diasCopia !== undefined && (diasCopia === null || diasCopia > 30) && !esc && (
        <button type="button" class="aviso-suave accion" onClick={() => ir('/ajustes')}>
          <Icono n="subir" t={18} />
          <span>
            {diasCopia === null ? 'Aún no has hecho ninguna copia de seguridad.' : `Tu última copia de seguridad es de hace ${diasCopia} días.`} <b>Hacer una ahora</b>
          </span>
        </button>
      )}

      {esc && (
        <p class="pie inicio-pie">
          Lo que apuntas se guarda en este navegador. Para ver aquí lo del iPhone, exporta allí una copia (Ajustes → Exportar copia) y arrástrala a esta ventana. Atajos: <kbd>←</kbd> <kbd>→</kbd> cambian de semana, <kbd>/</kbd> busca y <kbd>Esc</kbd> cierra ventanas.
        </p>
      )}
    </div>
  );
}
