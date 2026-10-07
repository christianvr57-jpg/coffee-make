import type { ComponentChildren } from 'preact';
// Anillo de progreso. Se anima solo al cambiar la fracción (transición CSS).
export function Anillo({ fraccion, tam = 92, grosor = 10, children }: { fraccion: number; tam?: number; grosor?: number; children?: ComponentChildren }) {
  const c = tam / 2;
  const r = c - grosor / 2 - 1;
  const l = 2 * Math.PI * r;
  return (
    <div class="anillo-caja" style={{ width: `${tam}px`, height: `${tam}px` }}>
      <svg class="anillo" width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} aria-hidden="true">
        <circle class="anillo-pista" cx={c} cy={c} r={r} stroke-width={grosor} fill="none" />
        <circle
          class="anillo-valor"
          cx={c}
          cy={c}
          r={r}
          stroke-width={grosor}
          fill="none"
          stroke-linecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          stroke-dasharray={l}
          style={{ strokeDashoffset: l * (1 - Math.max(0, Math.min(1, fraccion))) }}
        />
      </svg>
      <div class="anillo-centro">
        <span>{children}</span>
      </div>
    </div>
  );
}
