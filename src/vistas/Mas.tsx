// MÁS: todos los módulos, buscador, ajustes y copia de seguridad.
import { ir } from '../core/router';
import { visibles } from '../core/registro';
import { escritorio } from '../core/pantalla';
import { esAppInstalada } from '../core/pwa';
import { TituloGrande } from '../ui/Cabecera';
import { FilaBoton, Lista } from '../ui/form';
import { Icono } from '../ui/Icono';

export function Mas() {
  return (
    <>
      <TituloGrande titulo="Más" />
      {!esAppInstalada() && (
        <div class="aviso-instalar">
          <Icono n="info" t={22} />
          {escritorio.value ? (
            <div>
              <b>Instálala en el ordenador.</b> En Chrome o Edge, pulsa el icono de instalar que aparece a la derecha de la barra de direcciones. Se abrirá en su propia ventana y funcionará sin conexión.
            </div>
          ) : (
            <div>
              <b>Instálala en el iPhone.</b> En Safari pulsa Compartir y luego «Añadir a pantalla de inicio». Así se abre a pantalla completa y sin conexión.
            </div>
          )}
        </div>
      )}
      <Lista titulo="Módulos">
        {visibles.value.map((m) => (
          <FilaBoton icono={m.icono} texto={m.nombre} chevron onClick={() => ir(m.rutaInicio)} />
        ))}
      </Lista>
      <Lista titulo="App">
        <FilaBoton icono="buscar" texto="Buscar" chevron onClick={() => ir('/buscar')} />
        <FilaBoton icono="ajustes" texto="Ajustes y copia de seguridad" chevron onClick={() => ir('/ajustes')} />
      </Lista>
      <div class="version">
        Coffee Make · versión {__VERSION__}
        <br />
        Tus datos se guardan solo en este dispositivo. Sin cuentas ni servidor.
      </div>
    </>
  );
}
