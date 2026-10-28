// Punto de entrada: abre la base de datos, inicia cada módulo y pinta la app.
import './core/compat';
import { render } from 'preact';
import { App } from './app';
import { pedirPersistencia } from './core/db';
import { alRecibirDatos, iniciarNube } from './core/nube';
import { registrarPwa } from './core/pwa';
import { MODULOS, cargarFijados } from './core/registro';
import './styles/base.css';
import './styles/nucleo.css';
import './styles/cafe.css';
import './styles/cocina.css';
import './styles/running.css';
import './styles/calendario.css';
import './styles/gym.css';
import './styles/escritorio.css';

async function arrancar() {
  const raiz = document.getElementById('raiz')!;
  try {
    // Los módulos son independientes: se preparan a la vez.
    await Promise.all([...MODULOS.map((m) => m.iniciar?.()), cargarFijados()]);
    pedirPersistencia();
    render(<App />, raiz);
    registrarPwa();
    // Cuando llegan datos de otro dispositivo, cada módulo vuelve a cargar su estado en memoria.
    alRecibirDatos(async () => {
      await Promise.all([...MODULOS.map((m) => m.iniciar?.()), cargarFijados()]);
    });
    iniciarNube();
  } catch (e) {
    console.error(e);
    raiz.innerHTML = `<main class="vista"><div class="vacio"><p>No se pudo abrir la app.</p><p class="pie">${String((e as Error)?.message || e)}</p></div></main>`;
  }
}

arrancar();
