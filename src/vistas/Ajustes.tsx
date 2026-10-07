// AJUSTES: ajustes de cada módulo, copia de seguridad y restablecer.
import { useRef } from 'preact/hooks';
import { entregarArchivo } from '../core/archivos';
import { borrarTodo, exportarTodo, importarTodo } from '../core/copia';
import { hoyISO } from '../core/fechas';
import { MODULOS } from '../core/registro';
import { BarraDetalle } from '../ui/Cabecera';
import { Hoja, abrirHoja, avisar, confirmar, mostrarToast } from '../ui/capas';
import { FilaBoton, Lista, Texto } from '../ui/form';
import { useState } from 'preact/hooks';

async function aplicarImportacion(texto: string) {
  if (!(await confirmar({ titulo: '¿Importar esta copia?', texto: 'Las copias de Coffee Make sustituyen todos los datos actuales. Las de la app antigua «Rutina del hogar» solo añaden tu progreso del hogar.', ok: 'Importar', peligro: true }))) return;
  try {
    const r = await importarTodo(texto);
    await avisar('Copia importada', r.tipo === 'hogar-antigua' ? `Se han traído ${r.registros} marcas del hogar de la app antigua.` : `Se han restaurado ${r.registros} registros.`);
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
    if (!(await confirmar({ titulo: '¿Borrar todos los datos?', texto: 'Progreso del hogar, cafés, preparaciones, equipo y ajustes. No se puede deshacer: haz antes una copia.', ok: 'Borrar todo', peligro: true }))) return;
    await borrarTodo();
    location.reload();
  };

  return (
    <>
      <BarraDetalle padre="/mas" textoAtras="Más" titulo="Ajustes" />
      <div class="pagina">
        {MODULOS.filter((m) => m.ajustes).map((m) => {
          const A = m.ajustes!;
          return <A key={m.id} />;
        })}

        <Lista titulo="Copia de seguridad" pie="Todo vive solo en este iPhone. Guarda una copia de vez en cuando (por ejemplo en Archivos o iCloud Drive), sobre todo antes de cambiar de móvil.">
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
