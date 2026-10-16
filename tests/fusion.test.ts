// Sincronización: fusión registro a registro entre este dispositivo y la nube.
import { describe, expect, it } from 'vitest';
import { fusionar } from '../src/core/fusion';
import { aBase64, deBase64 } from '../src/core/github';

const r = (id: string, actualizado: number, extra: Record<string, unknown> = {}) => ({ id, actualizado, ...extra });

describe('fusionar', () => {
  it('une lo que solo está en un lado y sabe qué hay que subir y qué traer', () => {
    const f = fusionar({ t: [r('a', 1)] }, { t: [r('b', 1)] });
    expect(f.resultado.t.map((x) => x.id).sort()).toEqual(['a', 'b']);
    expect(f.paraLocal.t.map((x) => x.id)).toEqual(['b']);
    expect(f.subir).toBe(true);
  });

  it('gana la versión más reciente de cada registro', () => {
    const f = fusionar({ t: [r('a', 5, { v: 'aquí' }), r('b', 1, { v: 'aquí' })] }, { t: [r('a', 3, { v: 'nube' }), r('b', 9, { v: 'nube' })] });
    const por = Object.fromEntries(f.resultado.t.map((x) => [x.id, x.v]));
    expect(por).toEqual({ a: 'aquí', b: 'nube' });
    expect(f.paraLocal.t.map((x) => x.id)).toEqual(['b']);
    expect(f.subir).toBe(true);
  });

  it('los borrados viajan como marcas y ganan si son posteriores', () => {
    const f = fusionar({ t: [r('a', 2, { v: 1 })] }, { t: [r('a', 7, { v: 1, borrado: 7 })] });
    expect(f.resultado.t[0].borrado).toBe(7);
    expect(f.paraLocal.t[0].borrado).toBe(7);
    expect(f.subir).toBe(false);
  });

  it('si todo coincide no hay nada que subir ni traer', () => {
    const datos = { t: [r('a', 4, { v: 1 })], ajustes: [{ clave: 'cocina', valor: { ciclo: 8 }, actualizado: 3 }] };
    const f = fusionar(datos, JSON.parse(JSON.stringify(datos)));
    expect(f.subir).toBe(false);
    expect(f.paraLocal).toEqual({});
  });

  it('los ajustes se identifican por clave', () => {
    const f = fusionar({ ajustes: [{ clave: 'cocina', valor: 'aquí', actualizado: 1 }] }, { ajustes: [{ clave: 'cocina', valor: 'nube', actualizado: 2 }] });
    expect(f.resultado.ajustes).toHaveLength(1);
    expect(f.resultado.ajustes[0].valor).toBe('nube');
  });

  it('los valores por defecto (fecha antigua) de un dispositivo nuevo nunca pisan los reales', () => {
    const f = fusionar({ ajustes: [{ clave: 'cocina', valor: 'por defecto', actualizado: 1 }] }, { ajustes: [{ clave: 'cocina', valor: 'del iPhone', actualizado: 1_700_000_000_000 }] });
    expect(f.resultado.ajustes[0].valor).toBe('del iPhone');
  });

  it('en la primera sincronización puede mandar la nube aunque lo local sea más reciente', () => {
    const local = { t: [r('a', 9, { v: 'aquí' }), r('solo-aqui', 9)] };
    const nube = { t: [r('a', 2, { v: 'nube' })] };
    const f = fusionar(local, nube, true);
    expect(f.resultado.t.find((x) => x.id === 'a')?.v).toBe('nube');
    expect(f.resultado.t.some((x) => x.id === 'solo-aqui')).toBe(true);
    expect(f.subir).toBe(true);
  });
});

describe('base64 con UTF-8', () => {
  it('conserva tildes, eñes y emojis', () => {
    const t = 'Café de Huila · año 2026 · ñandú ☕';
    expect(deBase64(aBase64(t))).toBe(t);
  });
});
