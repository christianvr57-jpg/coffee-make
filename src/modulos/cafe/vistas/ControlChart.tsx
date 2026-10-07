// Control chart (TDS frente a % de extracción) con la zona ideal y tus preparaciones.
import { fmt } from '../../../ui/form';
import { ZONAS } from '../calculos';

export interface PuntoControl {
  tds: number;
  ey: number;
  actual?: boolean;
}

export function ControlChart({ puntos, tipo }: { puntos: PuntoControl[]; tipo: 'filtro' | 'espresso' }) {
  const z = ZONAS[tipo];
  const W = 340;
  const H = 240;
  const m = { izq: 44, der: 12, arr: 14, aba: 36 };
  const ey: [number, number] = [14, 26];
  const tds: [number, number] = tipo === 'filtro' ? [0.9, 1.7] : [6, 14];
  const x = (v: number) => m.izq + ((v - ey[0]) / (ey[1] - ey[0])) * (W - m.izq - m.der);
  const y = (v: number) => H - m.aba - ((v - tds[0]) / (tds[1] - tds[0])) * (H - m.arr - m.aba);
  const clampX = (v: number) => Math.max(ey[0], Math.min(ey[1], v));
  const clampY = (v: number) => Math.max(tds[0], Math.min(tds[1], v));
  const marcasX = [14, 16, 18, 20, 22, 24, 26];
  const marcasY = tipo === 'filtro' ? [0.9, 1.1, 1.3, 1.5, 1.7] : [6, 8, 10, 12, 14];
  return (
    <figure class="control-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Control chart: TDS frente a extracción">
        {marcasX.map((v) => (
          <g>
            <line class="cc-rejilla" x1={x(v)} x2={x(v)} y1={m.arr} y2={H - m.aba} />
            <text class="cc-eje" x={x(v)} y={H - m.aba + 16} text-anchor="middle">
              {v}
            </text>
          </g>
        ))}
        {marcasY.map((v) => (
          <g>
            <line class="cc-rejilla" x1={m.izq} x2={W - m.der} y1={y(v)} y2={y(v)} />
            <text class="cc-eje" x={m.izq - 6} y={y(v) + 4} text-anchor="end">
              {fmt(v, 2)}
            </text>
          </g>
        ))}
        <rect class="cc-zona" x={x(z.eyMin)} y={y(z.tdsMax)} width={x(z.eyMax) - x(z.eyMin)} height={y(z.tdsMin) - y(z.tdsMax)} rx="4" />
        <text class="cc-etq" x={m.izq + 6} y={m.arr + 12}>Fuerte</text>
        <text class="cc-etq" x={m.izq + 6} y={H - m.aba - 6}>Débil</text>
        <text class="cc-etq" x={W - m.der - 4} y={H - m.aba - 6} text-anchor="end">Sobreextraído →</text>
        <text class="cc-etq" x={x(z.eyMin) - 4} y={m.arr + 12} text-anchor="end">← Subextraído</text>
        {puntos.map((pt) => (
          <circle class={`cc-punto${pt.actual ? ' actual' : ''}`} cx={x(clampX(pt.ey))} cy={y(clampY(pt.tds))} r={pt.actual ? 6.5 : 4.5} />
        ))}
        <text class="cc-titulo-eje" x={(W + m.izq) / 2} y={H - 4} text-anchor="middle">
          Extracción (%)
        </text>
        <text class="cc-titulo-eje" x={12} y={(H - m.aba) / 2} text-anchor="middle" transform={`rotate(-90 12 ${(H - m.aba) / 2})`}>
          TDS (%)
        </text>
      </svg>
      <figcaption>
        {tipo === 'filtro'
          ? 'Zona ideal del control chart clásico de la SCA: 1,15-1,35 % TDS y 18-22 % de extracción.'
          : 'Referencia habitual para espresso: 8-12 % TDS y 18-22 % de extracción (no es un estándar oficial).'}
      </figcaption>
    </figure>
  );
}
