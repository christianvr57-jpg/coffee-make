// Respaldos de CSS para Safari 12 (iPad mini 2, iOS 12), que se generan al compilar:
//  - color-mix() (Safari 16.2): un bloque @supports not (…) con el rgba() equivalente, usando
//    variables --x-rgb que se generan junto a cada variable de color (--x: #hex → --x-rgb: r, g, b);
//  - inset (Safari 14.1) → top/right/bottom/left;
//  - dvh (Safari 15.4) → vh, también en un bloque @supports not (…);
//  - position: sticky → también -webkit-sticky (Safari < 13);
//  - gap en flexbox (Safari 14.1): reglas `.sin-gap …` con márgenes (las activa src/core/compat.ts).
// Los navegadores modernos no entran en los bloques @supports not y usan la declaración moderna.
import type { Plugin } from 'vite';

const hexARgb = (hex: string): string | null => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
};

/** "r, g, b" (o var(--x-rgb)) de un color; null si no se sabe. */
function canales(color: string): string | null {
  const c = color.trim();
  const v = c.match(/^var\((--[\w-]+)\)$/);
  if (v) return `var(${v[1]}-rgb)`;
  if (c.startsWith('#')) return hexARgb(c);
  const rgb = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return `${rgb[1]}, ${rgb[2]}, ${rgb[3]}`;
  if (c === 'white' || c === '#fff') return '255, 255, 255';
  if (c === 'black') return '0, 0, 0';
  return null;
}

/** Parte un texto por comas de primer nivel (fuera de paréntesis). */
function partir(texto: string): string[] {
  const res: string[] = [];
  let nivel = 0;
  let actual = '';
  for (const ch of texto) {
    if (ch === '(') nivel++;
    if (ch === ')') nivel--;
    if (ch === ',' && nivel === 0) {
      res.push(actual);
      actual = '';
    } else actual += ch;
  }
  res.push(actual);
  return res.map((x) => x.trim());
}

/** Sustituye cada color-mix(in srgb, A p%, B) por un rgba() aproximado. null si no se puede. */
export function sinColorMix(valor: string): string | null {
  let salida = '';
  let i = 0;
  while (i < valor.length) {
    const k = valor.indexOf('color-mix(', i);
    if (k < 0) {
      salida += valor.slice(i);
      break;
    }
    salida += valor.slice(i, k);
    let nivel = 0;
    let j = k + 'color-mix'.length;
    for (; j < valor.length; j++) {
      if (valor[j] === '(') nivel++;
      else if (valor[j] === ')' && --nivel === 0) break;
    }
    const partes = partir(valor.slice(k + 'color-mix('.length, j));
    if (partes.length !== 3) return null;
    const [, a, b] = partes;
    const m = a.match(/^(.*?)\s+([\d.]+)%$/);
    const colorA = m ? m[1] : a.replace(/\s+calc\(.*\)$/, '');
    const pct = m ? Number(m[2]) / 100 : 0.5;
    const rgbA = canales(colorA);
    if (!rgbA) return null;
    const transparente = b === 'transparent';
    salida += !transparente && pct >= 0.5 ? (colorA.startsWith('var(') ? colorA : `rgb(${rgbA})`) : `rgba(${rgbA}, ${Math.round(pct * 100) / 100})`;
    i = j + 1;
  }
  return salida;
}

const DECL = /([{;]\s*)([-\w]+)\s*:\s*([^;{}]+?)(\s*)(?=[;}])/g;

/** Declaraciones en línea: variables -rgb (nombres nuevos, no se pisan), inset y sticky. */
function enLinea(css: string): string {
  return css.replace(DECL, (todo, antes: string, prop: string, valor: string, esp: string) => {
    const extra: string[] = [];
    const despues: string[] = [];
    if (prop.startsWith('--') && !prop.endsWith('-rgb')) {
      let c: string | null = null;
      if (!valor.includes('color-mix(')) c = canales(valor);
      else {
        const f = sinColorMix(valor);
        const m = f && f.match(/^rgba?\(([^()]*)\)$/);
        if (m) c = m[1].split(',').slice(0, 3).join(',');
      }
      if (c) despues.push(`${prop}-rgb: ${c}`);
    }
    if (prop === 'inset') {
      const v = partir(valor.trim().replace(/\s+/g, ',')).filter(Boolean);
      const [t, r = t, b = t, l = r] = v;
      extra.push(`top: ${t}`, `right: ${r}`, `bottom: ${b}`, `left: ${l}`);
    }
    if (prop === 'position' && valor.trim() === 'sticky') extra.push('position: -webkit-sticky');
    if (!extra.length && !despues.length) return todo;
    return `${antes}${extra.map((x) => `${x}; `).join('')}${prop}: ${valor}${despues.map((x) => `; ${x}`).join('')}${esp}`;
  });
}

const SIN_COLOR_MIX = '@supports not (color: color-mix(in srgb, red 50%, red))';
const SIN_DVH = '@supports not (height: 1dvh)';

/**
 * color-mix y dvh: el respaldo va en un bloque @supports not (…) justo después de la regla, que solo
 * aplican los navegadores sin soporte. Así el minificador no lo funde con la declaración moderna.
 */
function bloquesSupports(css: string): string {
  return css.replace(/([^{}@;]+)\{([^{}]*)\}/g, (regla, selector: string, cuerpo: string) => {
    const sel = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!sel || /^(from|to|\d)/.test(sel)) return regla;
    const mix: string[] = [];
    const dvh: string[] = [];
    for (const d of cuerpo.split(';')) {
      const i = d.indexOf(':');
      if (i < 0) continue;
      const prop = d.slice(0, i).trim();
      const valor = d.slice(i + 1).trim();
      if (prop.startsWith('--')) continue;
      if (valor.includes('color-mix(')) {
        const f = sinColorMix(valor);
        if (f) mix.push(`${prop}: ${f.replace(/(\d)dvh/g, '$1vh')}`);
      } else if (/\ddvh/.test(valor)) dvh.push(`${prop}: ${valor.replace(/(\d)dvh/g, '$1vh')}`);
    }
    let extra = '';
    if (mix.length) extra += `\n${SIN_COLOR_MIX} { ${sel} { ${mix.join('; ')} } }`;
    if (dvh.length) extra += `\n${SIN_DVH} { ${sel} { ${dvh.join('; ')} } }`;
    return regla + extra;
  });
}

/** Reglas `.sin-gap` con márgenes para los contenedores flex que usan gap. */
function gapsFlex(css: string): string {
  return css.replace(/([^{}@;]+)\{([^{}]*)\}/g, (regla, selector: string, cuerpo: string) => {
    if (!/display\s*:\s*(inline-)?flex\b/.test(cuerpo)) return regla;
    const g = cuerpo.match(/(?:^|;)\s*gap\s*:\s*([^;]+)/);
    if (!g) return regla;
    const [fila, col = fila] = g[1].trim().split(/\s+/);
    const columna = /flex-direction\s*:\s*column/.test(cuerpo);
    const envuelve = /flex-wrap\s*:\s*wrap/.test(cuerpo);
    const sels = selector
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('from') && !/^\d/.test(s));
    if (!sels.length) return regla;
    const pref = (sufijo: string) => sels.map((s) => `.sin-gap ${s}${sufijo}`).join(', ');
    let extra: string;
    if (envuelve) extra = `${pref(' > *')} { margin-right: ${col}; margin-bottom: ${fila}; }`;
    else if (columna) extra = `${pref(' > * + *')} { margin-top: ${fila}; }`;
    // Fila: separación entre elementos y, si el único elemento es un icono junto a un texto suelto
    // («<Icono/> Guardar»), margen a su derecha (el texto no es un elemento y no lo pilla «* + *»).
    else extra = `${pref(' > * + *')} { margin-left: ${col}; }
${pref(' > .ico:only-child')} { margin-right: ${col}; }`;
    return `${regla}\n${extra}`;
  });
}

export function compatCss(css: string): string {
  return gapsFlex(bloquesSupports(enLinea(css)));
}

/** Plugin de Vite: aplica los respaldos a los .css del proyecto. */
export function compatSafari12(): Plugin {
  return {
    name: 'compat-safari12',
    enforce: 'pre',
    transform(codigo, id) {
      if (!/\/src\/styles\/[^/]+\.css$/.test(id.split('?')[0].replace(/\\/g, '/'))) return null;
      return { code: compatCss(codigo), map: null };
    },
  };
}
