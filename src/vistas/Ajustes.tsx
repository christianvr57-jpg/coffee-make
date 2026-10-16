// AJUSTES: ajustes de cada módulo, copia de seguridad y restablecer.
import { useRef } from 'preact/hooks';
import { entregarArchivo } from '../core/archivos';
import { borrarTodo, exportarTodo, importarTodo } from '../core/copia';
import { hoyISO } from '../core/fechas';
import { escritorio } from '../core/pantalla';
import { MAX_FIJADOS, MODULOS, cambiarFijados, fijados } from '../core/registro';
import { BarraDetalle } from '../ui/Cabecera';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../ui/capas';
import { FilaBoton, Lista, Texto } from '../ui/form';
import { Icono } from '../ui/Icono';
import { useState } from 'preact/hooks';

export async function aplicarImportacion(texto: string) {
  if (!(await confirmar({ titulo: '¿Importar esta copia?', texto: 'Las copias de Coffee Make sustituyen todos los datos actuales. Las de la app antigua «Rutina del hogar» solo añaden tu progreso del hogar y tus datos de running.', ok: 'Importar', peligro: true }))) return;
  try {
    const r = await importarTodo(texto);
    await avisar('Copia importada', r.tipo === 'hogar-antigua' ? `Se han traído ${r.registros} registros de la app antigua (hogar y running).` : `Se han restaurado ${r.registros} registros.`);
    location.reload();
  } catch (e) {
    await avisar('No se pudo importar', (e as Error).message);
  }
}

function PegarCopia({ cerrar }: { cerrar: () => void }) {
  const [texto, setTexto] = useState('');
  return (
    <Hoja
      titulo="Importar copia"
      cerrar={cerrar}
      guardar="Importar"
      onGuardar={() => {
        if (!texto.trim()) return false;
        setTimeout(() => aplicarImportacion(texto.trim()), 320);
      }}
    >
      <Lista titulo="Pega aquí el contenido de la copia">
        <div class="campo col">
          <Texto multilinea filas={10} valor={texto} cambiar={setTexto} marcador='{ "app": … }' />
        </div>
      </Lista>
    </Hoja>
  );
}

export function Ajustes() {
  const archivo = useRef<HTMLInputElement>(null);

  const exportar = async () => {
    const r = await entregarArchivo(`coffee-make-${hoyISO()}.json`, await exportarTodo(), 'application/json');
    if (r !== 'cancelado') mostrarToast('Copia exportada');
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(await exportarTodo());
      mostrarToast('Copia en el portapapeles');
    } catch {
      avisar('No se pudo copiar', 'Prueba con «Exportar copia».');
    }
  };
  const pegar = async () => {
    let t = '';
    try {
      t = await navigator.clipboard.readText();
    } catch {
      /* sin permiso */
    }
    if (t.includes('"app"')) aplicarImportacion(t);
    else abrirHoja((cerrar) => <PegarCopia cerrar={cerrar} />);
  };
  const csv = async () => {
    for (const m of MODULOS) {
      if (!m.exportarCsv) continue;
      for (const f of await m.exportarCsv()) await entregarArchivo(f.nombre, f.contenido, 'text/csv');
    }
  };
  const borrar = async () => {
    if (!(await confirmar({ titulo: '¿Borrar todos los datos?', texto: 'Progreso del hogar, menú y compra, cafés, running y ajustes. No se puede deshacer: haz antes una copia.', ok: 'Borrar todo', peligro: true }))) return;
    await borrarTodo();
    location.reload();
  };

  return (
    <>
      <BarraDetalle padre="/mas" textoAtras="Más" titulo="Ajustes" />
      <div class="pagina">
        {!escritorio.value && (
          <Lista titulo="Barra de pestañas" pie={`Elige hasta ${MAX_FIJADOS} módulos para la barra de abajo. Los demás se abren desde «Más» y desde su tarjeta en Inicio.`}>
            <div class="campo col">
              <div class="chips">
                {MODULOS.map((m) => {
                  const activo = fijados.value.includes(m.id);
                  return (
                    <button
                      type="button"
                      class="chip"
                      aria-pressed={activo}
                      onClick={() => {
                        if (activo) cambiarFijados(fijados.value.filter((x) => x !== m.id));
                        else if (fijados.value.length >= MAX_FIJADOS) mostrarToast(`Caben ${MAX_FIJADOS}: quita uno antes`);
                        else cambiarFijados([...fijados.value, m.id]);
                      }}
                    >
                      {m.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          </Lista>
        )}

        {escritorio.value && (
          <div class="aviso-instalar">
            <Icono n="info" t={22} />
            <div>
              <b>Tus datos del iPhone en el ordenador.</b> Cada dispositivo guarda lo suyo. Para ver aquí lo que apuntas en el móvil: en el iPhone, Ajustes → «Exportar copia» y guárdala (iCloud Drive, correo…); aquí, arrastra ese archivo a la ventana o pulsa «Importar copia». Sustituye lo que haya en este navegador.
            </div>
          </div>
        )}

        {MODULOS.filter((m) => m.ajustes).map((m) => {
          const A = m.ajustes!;
          return <A key={m.id} />;
        })}

        <Lista titulo="Copia de seguridad" pie={escritorio.value ? 'Todo vive solo en este navegador. Exporta una copia si apuntas cosas aquí que no quieras perder.' : 'Todo vive solo en este iPhone. Guarda una copia de vez en cuando (por ejemplo en Archivos o iCloud Drive), sobre todo antes de cambiar de móvil.'}>
          <FilaBoton icono="subir" texto="Exportar copia (JSON)" onClick={exportar} />
          <FilaBoton icono="descargar" texto="Importar copia…" onClick={() => archivo.current?.click()} />
          <FilaBoton icono="copiar" texto="Copiar copia al portapapeles" onClick={copiar} />
          <FilaBoton icono="descargar" texto="Importar desde el portapapeles" onClick={pegar} />
          <FilaBoton icono="grafico" texto="Exportar tablas para Excel (CSV)" onClick={csv} />
        </Lista>
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            (e.target as HTMLInputElement).value = '';
            if (f) aplicarImportacion(await f.text());
          }}
        />

        <Lista titulo="Restablecer">
          <FilaBoton icono="papelera" texto="Borrar todos los datos" peligro onClick={borrar} />
        </Lista>
      </div>
    </>
  );
}
