// RUNNING · Plan del entrenador: el que trae la app y, si hace falta, uno pegado a mano más reciente.
import { useRef, useState } from 'preact/hooks';
import { entregarArchivo } from '../../../core/archivos';
import { fechaCorta, hoyISO, parse } from '../../../core/fechas';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../../../ui/capas';
import { FilaBoton, Lista, Texto } from '../../../ui/form';
import { borrarDatosRunning, borrarPlan, cargarPlan, plan, planPropio } from '../estado';

async function aplicar(texto: string) {
  try {
    const p = await cargarPlan(texto);
    const n = p.plan?.semanas?.length || 0;
    await avisar('Plan cargado', n ? `${n} ${n === 1 ? 'semana' : 'semanas'} de entrenamiento${p.actualizado ? `, actualizado el ${fechaCorta(parse(p.actualizado))}` : ''}.` : 'Diagnóstico y auditoría cargados.');
  } catch (e) {
    await avisar('No se pudo cargar', (e as Error).message);
  }
}

function PegarPlan({ cerrar }: { cerrar: () => void }) {
  const [t, setT] = useState('');
  return (
    <Hoja
      titulo="Pegar plan"
      cerrar={cerrar}
      guardar="Cargar"
      onGuardar={() => {
        if (!t.trim()) return false;
        setTimeout(() => aplicar(t.trim()), 320);
      }}
    >
      <Lista titulo="Pega aquí el plan que te ha dado el entrenador">
        <div class="campo col">
          <Texto multilinea filas={12} valor={t} cambiar={setT} marcador='{ "plan": { "semanas": [ … ] } }' />
        </div>
      </Lista>
    </Hoja>
  );
}

export function EntrenadorRunning() {
  const archivo = useRef<HTMLInputElement>(null);
  const p = plan.value;
  const semanas = p?.plan?.semanas || [];

  const pegar = async () => {
    let t = '';
    try {
      t = await navigator.clipboard.readText();
    } catch {
      /* sin permiso: se pega a mano */
    }
    if (t.trim().startsWith('{')) aplicar(t.trim());
    else abrirHoja((cerrar) => <PegarPlan cerrar={cerrar} />);
  };
  const exportar = async () => {
    if (!p) return;
    const r = await entregarArchivo(`plan-running-${hoyISO()}.json`, JSON.stringify(p, null, 2), 'application/json');
    if (r !== 'cancelado') mostrarToast('Plan exportado');
  };

  return (
    <>
      <BarraDetalle padre="/running" textoAtras="Running" titulo="Plan del entrenador" />
      <div class="pagina">
        <div class="run-tarjeta acento">
          <span class="run-sobre">Cómo funciona</span>
          <p>
            El plan viene dentro de la app y se actualiza solo cuando el entrenador publica la semana nueva: no tienes que hacer nada. Si alguna vez te pasa el plan como texto (empieza por <code>{'{'}</code>), puedes pegarlo aquí. Tus registros y respuestas nunca se tocan.
          </p>
        </div>

        <Lista titulo="Plan actual">
          {p ? (
            <div class="campo col">
              <div class="et">
                <b>{semanas.length ? `${semanas.length} ${semanas.length === 1 ? 'semana' : 'semanas'}: ${fechaCorta(parse(semanas[0].lunes))} – ${fechaCorta(parse(semanas[semanas.length - 1].lunes))}` : 'Sin semanas todavía'}</b>
                <small>
                  {p.actualizado ? `Actualizado el ${fechaCorta(parse(p.actualizado))}` : 'Sin fecha'} · {planPropio.value ? 'pegado en este dispositivo' : 'el de la app'}
                </small>
              </div>
            </div>
          ) : (
            <div class="campo col">
              <div class="et">
                <b>Ningún plan cargado</b>
                <small>Hasta que lo cargues, Registro, Zonas y Guía funcionan igualmente.</small>
              </div>
            </div>
          )}
        </Lista>

        <Lista titulo="Cargar a mano (opcional)" pie="Un plan pegado se usa mientras sea igual o más reciente que el de la app. Va también dentro de la copia de seguridad.">
          <FilaBoton icono="descargar" texto="Pegar plan desde el portapapeles" onClick={pegar} />
          <FilaBoton icono="libro" texto="Abrir archivo del plan…" onClick={() => archivo.current?.click()} />
          {p && <FilaBoton icono="subir" texto="Exportar plan (para guardarlo)" onClick={exportar} />}
        </Lista>
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json,text/plain"
          hidden
          onChange={async (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            (e.target as HTMLInputElement).value = '';
            if (f) aplicar(await f.text());
          }}
        />

        <Lista titulo="Borrar">
          {planPropio.value && (
            <FilaBoton
              icono="reiniciar"
              texto="Volver al plan de la app"
              onClick={async () => {
                if (await confirmar({ titulo: '¿Volver al plan de la app?', texto: 'Se quita el plan pegado a mano. Tus registros, respuestas y zonas se conservan.', ok: 'Volver' })) {
                  await borrarPlan();
                  mostrarToast('Usando el plan de la app');
                }
              }}
            />
          )}
          <FilaBoton
            icono="papelera"
            texto="Borrar mis datos de running"
            peligro
            onClick={async () => {
              if (await confirmar({ titulo: '¿Borrar tus datos de running?', texto: 'Se borran las respuestas de la auditoría, tus zonas y el registro de sesiones. El plan del entrenador se mantiene.', ok: 'Borrar', peligro: true })) {
                await borrarDatosRunning();
                mostrarToast('Datos de running borrados');
              }
            }}
          />
        </Lista>

      </div>
    </>
  );
}
