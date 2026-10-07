// Iconos de trazo (24×24) al estilo de los símbolos de iOS.
const TRAZOS: Record<string, string> = {
  // Núcleo
  inicio: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  mas: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke-width="2.6"/>',
  buscar: '<circle cx="10.5" cy="10.5" r="6.2"/><path d="M15.2 15.2 20 20"/>',
  ajustes: '<path d="M3.5 7h9M17 7h3.5M3.5 17H8M12.5 17h8"/><circle cx="14.8" cy="7" r="2.3"/><circle cx="10.2" cy="17" r="2.3"/>',
  cafe: '<path d="M4 9.5h12v4.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10.8h1.4a2.6 2.6 0 0 1 0 5.2H16M7.5 3.5c0 1.3 1 1.3 1 2.6M11.5 3.5c0 1.3 1 1.3 1 2.6"/>',
  hogar: '<path d="M3.5 11.2 12 3.8l8.5 7.4M5.5 9.8v10.7h13V9.8M10 20.5v-5.8h4v5.8"/>',

  // Hogar
  hoy: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  semana: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01"/>',
  tareas: '<path d="M10 6.5h10.5M10 12h10.5M10 17.5h10.5M3.5 6.6l1.4 1.4 2.6-2.8M3.5 12.1l1.4 1.4 2.6-2.8M3.5 17.6l1.4 1.4 2.6-2.8"/>',
  ropa: '<path d="M8.2 3.5 3 6.3l1.9 4 2.6-1.1v11.3h9V9.2l2.6 1.1 1.9-4-5.2-2.8c-.5 1.6-1.9 2.5-3.8 2.5s-3.3-.9-3.8-2.5z"/>',
  cocina: '<path d="M4 11.5h16v5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5zM2.5 11.5h19M9 7.8c0-1.6 1.2-1.6 1.2-3.2M14 7.8c0-1.6 1.2-1.6 1.2-3.2"/>',
  bano: '<path d="M12 3.2s6 6.3 6 10.6a6 6 0 0 1-12 0c0-4.3 6-10.6 6-10.6z"/><path d="M9.3 14.3a2.8 2.8 0 0 0 2 2.4"/>',
  suelos: '<path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  bebe: '<circle cx="12" cy="12.5" r="8.5"/><path d="M9 11.4v.4M15 11.4v.4M8.8 15.2c.9 1.3 2 1.9 3.2 1.9s2.3-.6 3.2-1.9M12 4c-.2 1.5.8 2.3 2 2.2"/>',
  casa: '<path d="M3.5 11.2 12 3.8l8.5 7.4M5.5 9.8v10.7h13V9.8M10 20.5v-5.8h4v5.8"/>',
  lavadora: '<rect x="4.5" y="3" width="15" height="18" rx="3"/><path d="M4.5 7.7h15M8 5.3h.01M11 5.3h.01"/><circle cx="12" cy="14.2" r="4"/><path d="M9.8 14.6c1-.9 1.6.9 2.6 0s1-.9 1.8-.3"/>',
  manana: '<path d="M12 4v3M5.6 8.4l1.8 1.8M18.4 8.4l-1.8 1.8M2.8 16.5h18.4M7 16.5a5 5 0 0 1 10 0M8 20h8"/>',
  dia: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  fija: '<path d="M8.5 3.5h7l-1.2 6 3.2 3.2H6.5l3.2-3.2zM12 12.7v7.8"/>',
  noche: '<path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z"/>',
  periodicas: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15.2l2 2 4-4.2"/>',
  cama: '<path d="M3 18.5v-11M3 14h18v4.5M21 14v-2.7a2.3 2.3 0 0 0-2.3-2.3H11v5"/><circle cx="7" cy="11" r="1.7"/>',

  // Café
  grano: '<ellipse cx="12" cy="12" rx="6.2" ry="8.6" transform="rotate(32 12 12)"/><path d="M9 17.6c1.8-1.5 1.4-4 3-5.6s3.4-1.6 3.4-1.6"/>',
  diario: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  receta: '<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.5l-3-2-3 2-3-2-3 2V5A1.5 1.5 0 0 1 7 3.5zM9 8.5h6M9 12h6"/>',
  grafico: '<path d="M4 4v16h16M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
  libro: '<path d="M4 5.5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zM4 19.5a2 2 0 0 0 2 2h13v-4M8 7.5h7"/>',
  termometro: '<path d="M10 14.3V5a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0z"/><path d="M12 9.5v7"/>',
  bascula: '<path d="M4 19.5h16M6.2 19.5 8 9.5h8l1.8 10"/><circle cx="12" cy="14.3" r="2.2"/><path d="M12 14.3l1-1"/>',
  molino: '<path d="M7 9.5h10l-1.2 11H8.2zM9 9.5V6.8h6v2.7M12 6.8V3.5h5"/>',
  crono: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.8h4M18.4 6.6l1.3-1.3"/>',
  gota: '<path d="M12 3.2s6 6.3 6 10.6a6 6 0 0 1-12 0c0-4.3 6-10.6 6-10.6z"/>',
  equipo: '<path d="M14.6 4.4a4.2 4.2 0 0 0-5.2 5.2L4 15l5 5 5.4-5.4a4.2 4.2 0 0 0 5.2-5.2l-2.6 2.6-2.6-.6-.6-2.6z"/>',
  nieve: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.6 4.6 12 7l2.4-2.4M9.6 19.4 12 17l2.4 2.4"/>',
  camara: '<path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  estrella: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z"/>',
  play: '<path d="M8 5.2v13.6L18.8 12z" fill="currentColor"/>',
  pausa: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>',
  bandera: '<path d="M6 21V4M6 4.5h11.5l-2 4 2 4H6"/>',
  repetir: '<path d="M4.5 11a7.5 7.5 0 0 1 13-4.8L19.5 8.5M19.5 4v4.5H15M19.5 13a7.5 7.5 0 0 1-13 4.8L4.5 15.5M4.5 20v-4.5H9"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
  copiar: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  // Métodos
  v60: '<path d="M4.5 6h15l-5.6 9h-3.8zM9.5 15v2.5h5V15M6.5 20.5h11"/>',
  chemex: '<path d="M7 3.5h10l-4 8.5 4 8.5H7l4-8.5zM9.3 9h5.4"/>',
  aeropress: '<rect x="8" y="3.5" width="8" height="12.5" rx="1"/><path d="M6.5 16h11M9.5 19.5h5M8 7.5h8"/>',
  prensa: '<rect x="5.5" y="7" width="10" height="13.5" rx="1.5"/><path d="M10.5 3v9M7.5 3h6M15.5 9.5h2.2v7h-2.2M5.5 12h10"/>',
  moka: '<path d="M7 20.5h10l-1.5-7h-7zM8.5 13.5l1-4h5l1 4M9.5 9.5l.5-5h4l.5 5M15 6.2h2.5l-1 3"/>',
  frio: '<path d="M8 3.5h8M9 3.5V8L6.2 20.5h11.6L15 8V3.5M7.5 14h9"/>',
  espresso: '<path d="M5 10h11v3.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 13.5zM16 11.2h1.4a2 2 0 0 1 0 4H16M4 20.5h13"/>',

  // Genéricos
  check: '<path d="M5.5 12.6l4.2 4.2L18.5 7.6"/>',
  chevron: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  chevronIzq: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  chevronAbajo: '<path d="M5.5 9.5 12 16l6.5-6.5"/>',
  anadir: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  papelera: '<path d="M4 7h16M9.5 7V4.5h5V7M6.2 7l.9 13h9.8l.9-13M10 11v6M14 11v6"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.3V12l3 2"/>',
  descargar: '<path d="M12 3.5v11M7.5 10.3 12 14.8l4.5-4.5M5 20h14"/>',
  subir: '<path d="M12 14.8v-11M7.5 8 12 3.5 16.5 8M5 20h14"/>',
  reiniciar: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4.5v4.6h4.6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.9h.01"/>',
  aviso: '<path d="M12 4 21 19.5H3zM12 10v4.5M12 17.2h.01"/>',
};

export const existeIcono = (nombre: string) => nombre in TRAZOS;

export function Icono({ n, t = 22, clase = '' }: { n: string; t?: number; clase?: string }) {
  return (
    <svg
      class={`ico ${clase}`}
      width={t}
      height={t}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: TRAZOS[n] || '' }}
    />
  );
}
