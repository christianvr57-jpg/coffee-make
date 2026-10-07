// Carcasa de la app: pantalla según la ruta + barra de pestañas.
import { useEffect } from 'preact/hooks';
import { coincide, ir, ruta } from './core/router';
import { FIJADOS, MODULOS } from './core/registro';
import { BarraSecciones } from './ui/Cabecera';
import { Capas, ocultarToast } from './ui/capas';
import { Icono } from './ui/Icono';
import { Inicio } from './vistas/Inicio';
import { Mas } from './vistas/Mas';
import { Ajustes } from './vistas/Ajustes';
import { Buscar } from './vistas/Buscar';

function resolver(path: string) {
  if (path === '/' || path === '') return { vista: <Inicio />, pestana: 'inicio', tema: '', completa: false };
  if (path === '/mas') return { vista: <Mas />, pestana: 'mas', tema: '', completa: false };
  if (path === '/ajustes') return { vista: <Ajustes />, pestana: 'mas', tema: '', completa: false };
  if (path === '/buscar') return { vista: <Buscar />, pestana: 'inicio', tema: '', completa: false };
  for (const m of MODULOS) {
    for (const r of m.rutas) {
      const params = coincide(r.patron, path);
      if (!params) continue;
      const seccion = m.secciones.find((s) => s.ruta === path);
      const V = r.vista;
      return {
        vista: (
          <>
            {seccion && <BarraSecciones secciones={m.secciones} activa={seccion.ruta} />}
            <V params={params} />
          </>
        ),
        pestana: FIJADOS.includes(m.id) ? m.id : 'mas',
        tema: m.tema,
        completa: !!r.pantallaCompleta,
      };
    }
  }
  return { vista: <Inicio />, pestana: 'inicio', tema: '', completa: false };
}

export function App() {
  const path = ruta.value.split('?')[0];
  const { vista, pestana, tema, completa } = resolver(path);

  useEffect(() => {
    window.scrollTo(0, 0);
    ocultarToast();
  }, [path]);

  const pestanas = [
    { id: 'inicio', nombre: 'Inicio', icono: 'inicio', ruta: '/' },
    ...MODULOS.filter((m) => FIJADOS.includes(m.id)).map((m) => ({ id: m.id, nombre: m.nombre, icono: m.icono, ruta: m.rutaInicio })),
    { id: 'mas', nombre: 'Más', icono: 'mas', ruta: '/mas' },
  ];

  return (
    <div class={tema}>
      <div class="barra-estado" />
      <main class={`vista${completa ? ' completa' : ''}`} key={path}>
        {vista}
      </main>
      {!completa && (
        <nav class="tabbar" aria-label="Secciones">
          {pestanas.map((t) => (
            <button
              type="button"
              class="tab"
              aria-current={pestana === t.id ? 'page' : undefined}
              onClick={() => (pestana === t.id && path === t.ruta ? window.scrollTo({ top: 0, behavior: 'smooth' }) : ir(t.ruta))}
            >
              <Icono n={t.icono} t={26} />
              <span>{t.nombre}</span>
            </button>
          ))}
        </nav>
      )}
      <Capas />
    </div>
  );
}
