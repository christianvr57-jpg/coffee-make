// Controles de formulario con aspecto iOS. Todos tienen zonas táctiles de 44 pt como mínimo.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Icono } from './Icono';

export function Lista({ children, titulo, pie, clase = '' }: { children: ComponentChildren; titulo?: string; pie?: ComponentChildren; clase?: string }) {
  return (
    <>
      {titulo && <div class="tit-lista">{titulo}</div>}
      <div class={`lista ${clase}`}>{children}</div>
      {pie && <p class="pie">{pie}</p>}
    </>
  );
}

/** Fila con etiqueta a la izquierda y control a la derecha. */
export function Campo({ et, sub, children, col = false, clase = '' }: { et?: ComponentChildren; sub?: string; children?: ComponentChildren; col?: boolean; clase?: string }) {
  return (
    <div class={`campo${col ? ' col' : ''} ${clase}`}>
      {et !== undefined && (
        <div class="et">
          {et}
          {sub && <small>{sub}</small>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Texto(props: { valor: string; cambiar: (v: string) => void; marcador?: string; multilinea?: boolean; filas?: number }) {
  if (props.multilinea) {
    return <textarea rows={props.filas || 3} value={props.valor} placeholder={props.marcador} onInput={(e) => props.cambiar((e.target as HTMLTextAreaElement).value)} />;
  }
  return <input type="text" value={props.valor} placeholder={props.marcador} autocomplete="off" onInput={(e) => props.cambiar((e.target as HTMLInputElement).value)} />;
}

const aNumero = (s: string): number | undefined => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};
export const fmt = (n: number | undefined, dec = 1): string =>
  n === undefined || n === null || !Number.isFinite(n) ? '' : String(Math.round(n * 10 ** dec) / 10 ** dec).replace('.', ',');

/** Número con teclado decimal; admite coma. */
export function Numero(props: { valor?: number; cambiar: (v: number | undefined) => void; unidad?: string; marcador?: string; dec?: number; ancho?: number }) {
  const [txt, setTxt] = useState(fmt(props.valor, props.dec ?? 2));
  useEffect(() => {
    if (aNumero(txt) !== props.valor) setTxt(fmt(props.valor, props.dec ?? 2));
  }, [props.valor]);
  return (
    <span class="numero">
      <input
        type="text"
        inputMode="decimal"
        value={txt}
        placeholder={props.marcador || '—'}
        style={props.ancho ? { width: `${props.ancho}px` } : undefined}
        onInput={(e) => {
          const v = (e.target as HTMLInputElement).value;
          setTxt(v);
          props.cambiar(aNumero(v));
        }}
        onFocus={(e) => (e.target as HTMLInputElement).select()}
      />
      {props.unidad && <span class="unidad">{props.unidad}</span>}
    </span>
  );
}

/** Botones − valor + para ajustes finos (molienda, temperatura, minutos). */
export function Paso(props: { valor: number; cambiar: (v: number) => void; paso?: number; min?: number; max?: number; formato?: (v: number) => string; etiqueta?: string }) {
  const paso = props.paso ?? 1;
  const ajustar = (dir: number) => {
    let v = Math.round((props.valor + dir * paso) * 1000) / 1000;
    if (props.min !== undefined) v = Math.max(props.min, v);
    if (props.max !== undefined) v = Math.min(props.max, v);
    props.cambiar(v);
  };
  return (
    <div class="paso">
      <button type="button" aria-label={`Menos ${props.etiqueta || ''}`} onClick={() => ajustar(-1)}>
        <Icono n="menos" t={20} />
      </button>
      <output>{props.formato ? props.formato(props.valor) : fmt(props.valor)}</output>
      <button type="button" aria-label={`Más ${props.etiqueta || ''}`} onClick={() => ajustar(1)}>
        <Icono n="anadir" t={20} />
      </button>
    </div>
  );
}

/** − [número editable] + : para valores que a veces se teclean y a veces se ajustan a toques. */
export function Ajuste(props: { valor?: number; cambiar: (v: number | undefined) => void; paso?: number; min?: number; max?: number; unidad?: string; dec?: number; etiqueta?: string }) {
  const paso = props.paso ?? 1;
  const ajustar = (dir: number) => {
    const base = props.valor ?? props.min ?? 0;
    let v = Math.round((base + dir * paso) * 1000) / 1000;
    if (props.min !== undefined) v = Math.max(props.min, v);
    if (props.max !== undefined) v = Math.min(props.max, v);
    props.cambiar(v);
  };
  return (
    <div class="paso ajuste">
      <button type="button" aria-label={`Menos ${props.etiqueta || ''}`} onClick={() => ajustar(-1)}>
        <Icono n="menos" t={20} />
      </button>
      <Numero valor={props.valor} cambiar={props.cambiar} unidad={props.unidad} dec={props.dec ?? 1} />
      <button type="button" aria-label={`Más ${props.etiqueta || ''}`} onClick={() => ajustar(1)}>
        <Icono n="anadir" t={20} />
      </button>
    </div>
  );
}

export function Segmentado<T extends string | number>(props: { opciones: [T, string][]; valor: T; cambiar: (v: T) => void }) {
  return (
    <div class="segmentado">
      {props.opciones.map(([v, n]) => (
        <button type="button" aria-pressed={props.valor === v} onClick={() => props.cambiar(v)}>
          {n}
        </button>
      ))}
    </div>
  );
}

export function Interruptor({ valor, cambiar, etiqueta }: { valor: boolean; cambiar: (v: boolean) => void; etiqueta?: string }) {
  return (
    <label class="interruptor">
      <input type="checkbox" checked={valor} aria-label={etiqueta} onChange={(e) => cambiar((e.target as HTMLInputElement).checked)} />
      <span />
    </label>
  );
}

export function Selector<T extends string | number>(props: { opciones: [T, string][]; valor: T; cambiar: (v: T) => void; id?: string }) {
  return (
    <select
      id={props.id}
      value={String(props.valor)}
      onChange={(e) => {
        const raw = (e.target as HTMLSelectElement).value;
        const op = props.opciones.find(([v]) => String(v) === raw);
        if (op) props.cambiar(op[0]);
      }}
    >
      {props.opciones.map(([v, n]) => (
        <option value={String(v)}>{n}</option>
      ))}
    </select>
  );
}

/** Fila-botón de lista (navegación o acción). */
export function FilaBoton(props: { icono?: string; texto: ComponentChildren; detalle?: ComponentChildren; onClick: () => void; peligro?: boolean; chevron?: boolean }) {
  return (
    <button type="button" class={`boton-fila${props.peligro ? ' peligro' : ''}`} onClick={props.onClick}>
      {props.icono && <Icono n={props.icono} t={22} />}
      <span class="bf-texto">{props.texto}</span>
      {props.detalle !== undefined && <span class="bf-detalle">{props.detalle}</span>}
      {props.chevron && <Icono n="chevron" t={16} clase="chev" />}
    </button>
  );
}
