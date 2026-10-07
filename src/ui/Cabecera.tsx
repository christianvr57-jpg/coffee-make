// Cabeceras: barra de secciones de un módulo y barra de navegación de las pantallas de detalle.
import type { ComponentChildren } from 'preact';
import { atras, ir } from '../core/router';
import type { Seccion } from '../core/modulos';
import { Icono } from './Icono';

export function BarraSecciones({ secciones, activa }: { secciones: Seccion[]; activa: string }) {
  return (
    <nav class="barra-secciones" aria-label="Secciones">
      <div class="segmentado">
        {secciones.map((s) => (
          <button type="button" aria-pressed={s.ruta === activa} onClick={() => ir(s.ruta, true)}>
            {s.nombre}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Barra fija con "‹ Atrás", título centrado y acción opcional a la derecha. */
export function BarraDetalle({ titulo, padre, textoAtras = 'Atrás', derecha }: { titulo?: string; padre: string; textoAtras?: string; derecha?: ComponentChildren }) {
  return (
    <header class="barra-detalle">
      <button type="button" class="bd-atras" onClick={() => atras(padre)}>
        <Icono n="chevronIzq" t={22} />
        <span>{textoAtras}</span>
      </button>
      <h2>{titulo}</h2>
      <div class="bd-derecha">{derecha}</div>
    </header>
  );
}

export function TituloGrande({ sobre, titulo, sub, derecha }: { sobre?: string; titulo: string; sub?: ComponentChildren; derecha?: ComponentChildren }) {
  return (
    <header class="cabecera">
      <div>
        {sobre && <div class="sobre">{sobre}</div>}
        <h1>{titulo}</h1>
        {sub && <div class="sub">{sub}</div>}
      </div>
      {derecha}
    </header>
  );
}
