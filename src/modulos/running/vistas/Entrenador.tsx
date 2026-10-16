// RUNNING · Plan del entrenador: cargarlo (pegando o abriendo un JSON), exportarlo y borrarlo.
// El plan es personal y por eso vive solo en el dispositivo, nunca en el código publicado.
import { useRef, useState } from 'preact/hooks';
import { entregarArchivo } from '../../../core/archivos';
import { fechaCorta, hoyISO, parse } from '../../../core/fechas';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../../../ui/capas';
import { FilaBoton, Lista, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { borrarDatosRunning, borrarPlan, cargarPlan, plan } from '../estado';

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
            Tu entrenador (Claude, en el chat) te da el plan como un bloque de texto que empieza por <code>{'{'}</code>. Cópialo entero y pulsa «Pegar plan». Cada semana, cuando te pase el plan actualizado, repites el paso: tus registros y respuestas no se tocan.
          </p>
        </div>

        <Lista titulo="Plan actual">
          {p ? (
            <div class="campo col">
              <div class="et">
                <b>{semanas.length ? `${semanas.length} ${semanas.length === 1 ? 'semana' : 'semanas'}: ${fechaCorta(parse(semanas[0].lunes))} – ${fechaCorta(parse(semanas[semanas.length - 1].lunes))}` : 'Sin semanas todavía'}</b>
                <small>{p.actualizado ? `Actualizado el ${fechaCorta(parse(p.actualizado))}` : 'Cargado en este dispositivo'}</small>
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

        <Lista titulo="Cargar o actualizar" pie="El plan sustituye al anterior. Va también dentro de la copia de seguridad general de la app.">
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
          {p && (
            <FilaBoton
              icono="papelera"
              texto="Quitar el plan del dispositivo"
              peligro
              onClick={async () => {
                if (await confirmar({ titulo: '¿Quitar el plan?', texto: 'Tus registros, respuestas y zonas se conservan.', ok: 'Quitar', peligro: true })) {
                  await borrarPlan();
                  mostrarToast('Plan quitado');
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

        <p class="pie">
          <Icono n="info" t={14} /> Por qué no va dentro de la app: el plan incluye tu perfil, tus molestias y tus marcas, y la app se publica en un repositorio público. Así, tus datos de salud solo están en tu iPhone (y en tus copias).
        </p>
      </div>
    </>
  );
}
