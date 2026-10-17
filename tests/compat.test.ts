// Respaldos de CSS para Safari 12 (iPad mini 2): color-mix, variables -rgb, inset, dvh y gap en flex.
import { describe, expect, it } from 'vitest';
import { compatCss, sinColorMix } from '../tools/compat-css';

describe('respaldos de CSS para Safari 12', () => {
  it('traduce color-mix a rgba con las variables -rgb', () => {
    expect(sinColorMix('color-mix(in srgb, var(--accent) 13%, transparent)')).toBe('rgba(var(--accent-rgb), 0.13)');
    expect(sinColorMix('color-mix(in srgb, #ff9f0a 16%, var(--card))')).toBe('rgba(255, 159, 10, 0.16)');
    expect(sinColorMix('color-mix(in srgb, var(--ok) 80%, var(--label))')).toBe('var(--ok)');
    expect(sinColorMix('0 0 0 2px color-mix(in srgb, var(--accent) 55%, transparent)')).toBe('0 0 0 2px rgba(var(--accent-rgb), 0.55)');
    expect(sinColorMix('color-mix(in srgb, currentColor 20%, transparent)')).toBeNull();
  });

  it('crea --x-rgb junto a cada variable de color', () => {
    const css = compatCss(':root { --accent: #0a74e6; --label-2: rgba(60, 60, 67, 0.66); } .chip { --c: var(--accent); }');
    expect(css).toContain('--accent-rgb: 10, 116, 230');
    expect(css).toContain('--label-2-rgb: 60, 60, 67');
    expect(css).toContain('--c-rgb: var(--accent-rgb)');
  });

  it('pone el respaldo de color-mix y dvh en bloques @supports not, después de la regla', () => {
    const css = compatCss('.a { background: color-mix(in srgb, var(--accent) 10%, var(--card)); min-height: 100dvh; }');
    expect(css).toContain('@supports not (color: color-mix(in srgb, red 50%, red)) { .a { background: rgba(var(--accent-rgb), 0.1) } }');
    expect(css).toContain('@supports not (height: 1dvh) { .a { min-height: 100vh } }');
    expect(css.indexOf('@supports')).toBeGreaterThan(css.indexOf('min-height: 100dvh'));
  });

  it('desglosa inset y añade -webkit-sticky', () => {
    const css = compatCss('.f { position: fixed; inset: 0 0 auto 0; } .s { position: sticky; top: 0; }');
    expect(css).toContain('top: 0; right: 0; bottom: auto; left: 0; inset: 0 0 auto 0');
    expect(css).toContain('position: -webkit-sticky; position: sticky');
  });

  it('genera márgenes .sin-gap para flex con gap (fila, columna y con salto)', () => {
    const css = compatCss('.fila { display: flex; gap: 10px; } .col { display: flex; flex-direction: column; gap: 4px; } .chips { display: flex; flex-wrap: wrap; gap: 8px 6px; } .rejilla { display: grid; gap: 4px; }');
    expect(css).toContain('.sin-gap .fila > * + * { margin-left: 10px; }');
    expect(css).toContain('.sin-gap .fila > .ico:only-child { margin-right: 10px; }');
    expect(css).toContain('.sin-gap .col > * + * { margin-top: 4px; }');
    expect(css).toContain('.sin-gap .chips > * { margin-right: 6px; margin-bottom: 8px; }');
    expect(css).not.toContain('.sin-gap .rejilla');
  });

  it('no toca los fotogramas de las animaciones', () => {
    const css = compatCss('@keyframes x { from { background: color-mix(in srgb, var(--c) 16%, transparent); } to { background: transparent; } }');
    expect(css).not.toContain('@supports');
  });
});
