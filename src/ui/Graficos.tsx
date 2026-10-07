// Gráficos SVG sencillos (sin librerías): barras, línea con puntos y dispersión.
// Usan los colores del tema mediante clases CSS (ver nucleo.css · Gráficos).

const ANCHO = 340;

/** Barras verticales con etiqueta cada `cadaEtiqueta`. */
export function Barras({ datos, alto = 140, cadaEtiqueta = 1, titulo }: { datos: { etiqueta: string; valor: number }[]; alto?: number; cadaEtiqueta?: number; titulo: string }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  const izq = 22;
  const abajo = 22;
  const w = (ANCHO - izq) / datos.length;
  const y = (v: number) => alto - abajo - (v / max) * (alto - abajo - 14);
  return (
    <svg class="grafico" viewBox={`0 0 ${ANCHO} ${alto}`} role="img" aria-label={titulo}>
      {[0, max].map((v) => (
        <>
          <line class="gr-rejilla" x1={izq} x2={ANCHO} y1={y(v)} y2={y(v)} />
          <text class="gr-eje" x={izq - 4} y={y(v) + 3.5} text-anchor="end">
            {v}
          </text>
        </>
      ))}
      {datos.map((d, i) => {
        const h = alto - abajo - y(d.valor);
        return (
          <>
            {d.valor > 0 && <rect class="gr-barra" x={izq + i * w + w * 0.18} y={y(d.valor)} width={w * 0.64} height={h} rx={3} />}
            {d.valor > 0 && (
              <text class="gr-valor" x={izq + i * w + w / 2} y={y(d.valor) - 3} text-anchor="middle">
                {d.valor}
              </text>
            )}
            {i % cadaEtiqueta === 0 && (
              <text class="gr-eje" x={izq + i * w + w / 2} y={alto - 6} text-anchor="middle">
                {d.etiqueta}
              </text>
            )}
          </>
        );
      })}
    </svg>
  );
}

/** Notas en el tiempo: puntos y la media móvil como línea. Eje Y fijo 1-10. */
export function LineaNotas({ puntos, alto = 160, titulo }: { puntos: { nota: number; movil: number }[]; alto?: number; titulo: string }) {
  const izq = 22;
  const abajo = 10;
  const n = puntos.length;
  const x = (i: number) => izq + 6 + (n <= 1 ? (ANCHO - izq - 12) / 2 : (i / (n - 1)) * (ANCHO - izq - 12));
  const y = (v: number) => alto - abajo - ((v - 1) / 9) * (alto - abajo - 10);
  const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.movil).toFixed(1)}`).join(' ');
  return (
    <svg class="grafico" viewBox={`0 0 ${ANCHO} ${alto}`} role="img" aria-label={titulo}>
      {[2, 4, 6, 8, 10].map((v) => (
        <>
          <line class="gr-rejilla" x1={izq} x2={ANCHO} y1={y(v)} y2={y(v)} />
          <text class="gr-eje" x={izq - 4} y={y(v) + 3.5} text-anchor="end">
            {v}
          </text>
        </>
      ))}
      {puntos.map((p, i) => (
        <circle class="gr-punto" cx={x(i)} cy={y(p.nota)} r={3.2} />
      ))}
      {n > 1 && <path class="gr-linea" d={linea} />}
    </svg>
  );
}

/** Dispersión x → nota (1-10), con el mejor punto resaltado. */
export function Dispersion({ puntos, alto = 170, titulo, etiquetaX, invertirX = false }: { puntos: { x: number; y: number; reciente?: boolean }[]; alto?: number; titulo: string; etiquetaX: string; invertirX?: boolean }) {
  const izq = 24;
  const abajo = 30;
  const xs = puntos.map((p) => p.x);
  let min = Math.min(...xs);
  let max = Math.max(...xs);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.1;
  min -= pad;
  max += pad;
  const fx = (v: number) => {
    const r = (v - min) / (max - min);
    return izq + 6 + (invertirX ? 1 - r : r) * (ANCHO - izq - 14);
  };
  const y = (v: number) => alto - abajo - ((v - 1) / 9) * (alto - abajo - 10);
  const mejor = puntos.reduce((b, p) => (p.y > b.y ? p : b), puntos[0]);
  const marcas = [...new Set(xs)].sort((a, b) => a - b);
  const paso = Math.ceil(marcas.length / 7);
  return (
    <svg class="grafico" viewBox={`0 0 ${ANCHO} ${alto}`} role="img" aria-label={titulo}>
      {[2, 4, 6, 8, 10].map((v) => (
        <>
          <line class="gr-rejilla" x1={izq} x2={ANCHO} y1={y(v)} y2={y(v)} />
          <text class="gr-eje" x={izq - 4} y={y(v) + 3.5} text-anchor="end">
            {v}
          </text>
        </>
      ))}
      {marcas.filter((_, i) => i % paso === 0).map((v) => (
        <text class="gr-eje" x={fx(v)} y={alto - abajo + 14} text-anchor="middle">
          {String(v).replace('.', ',')}
        </text>
      ))}
      <text class="gr-titulo-eje" x={(ANCHO + izq) / 2} y={alto - 2} text-anchor="middle">
        {etiquetaX}
      </text>
      {puntos.map((p) => (
        <circle class={`gr-punto${p === mejor ? ' mejor' : ''}${p.reciente ? ' reciente' : ''}`} cx={fx(p.x)} cy={y(p.y)} r={p === mejor ? 5.5 : 4} />
      ))}
    </svg>
  );
}
