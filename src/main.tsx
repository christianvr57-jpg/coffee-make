// Punto de entrada: abre la base de datos, inicia cada módulo y pinta la app.
import { render } from 'preact';
import { App } from './app';
import { pedirPersistencia } from './core/db';
import { registrarPwa } from './core/pwa';
import { MODULOS } from './core/registro';
import './styles/base.css';
import './styles/nucleo.css';
import './styles/cafe.css';

async function arrancar() {
  const raiz = document.getElementById('raiz')!;
  try {
    for (const m of MODULOS) await m.iniciar?.();
    pedirPersistencia();
    render(<App />, raiz);
    registrarPwa();
  } catch (e) {
    console.error(e);
    raiz.innerHTML = `<main class="vista"><div class="vacio"><p>No se pudo abrir la app.</p><p class="pie">${String((e as Error)?.message || e)}</p></div></main>`;
  }
}

arrancar();
