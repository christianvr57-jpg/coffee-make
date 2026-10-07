// Recomendador, aprendizajes y preferencias.
import { describe, expect, it } from 'vitest';
import { aprendizajes, consejoCompra, parecido, preferencias, recomendarInicio } from '../src/modulos/cafe/aprendizaje';
import type { Cafe, Equipo, Preparacion } from '../src/modulos/cafe/modelo';

const cafe = (id: string, x: Partial<Cafe> = {}): Cafe =>
  ({ id, nombre: id, tostador: 't', variedades: [], procesos: [], congelaciones: [], notasTostador: [], creado: 0, actualizado: 0, ...x }) as Cafe;
let n = 0;
const prep = (x: Partial<Preparacion>): Preparacion =>
  ({ id: `p${++n}`, fecha: n * 1000, metodo: 'v60', dosis: 15, agua: 250, molinoId: 'c40', molienda: 22, temperatura: 94, sintomas: [], creado: 0, actualizado: 0, ...x }) as Preparacion;
const c40 = { id: 'c40', tipo: 'molino', molino: { escala: 'clics', min: 0, max: 45, paso: 1, manual: true } } as Equipo;

describe('parecido entre cafés', () => {
  it('suma tueste, proceso y origen', () => {
    const a = cafe('a', { tueste: 'claro', procesos: ['Natural'], pais: 'Etiopía' });
    expect(parecido(a, cafe('b', { tueste: 'claro', procesos: ['Natural'], pais: 'Etiopía' })).puntos).toBe(6);
    expect(parecido(a, cafe('c', { tueste: 'oscuro', procesos: ['Lavado'], pais: 'Brasil' })).puntos).toBe(0);
  });
});

describe('recomendarInicio', () => {
  const guji = cafe('guji', { tueste: 'claro', procesos: ['Natural'], pais: 'Etiopía' });
  const sidama = cafe('sidama', { tueste: 'claro', procesos: ['Natural'], pais: 'Etiopía', nombre: 'Sidama' });
  const brasil = cafe('brasil', { tueste: 'oscuro', procesos: ['Natural'], pais: 'Brasil' });
  const medio = cafe('medio', { tueste: 'medio', procesos: ['Natural'], pais: 'Etiopía' });

  it('usa tu mejor preparación con el café más parecido', () => {
    const preps = [prep({ cafeId: 'guji', molienda: 21, puntuacion: 8.5 }), prep({ cafeId: 'guji', molienda: 25, puntuacion: 6 }), prep({ cafeId: 'brasil', molienda: 30, puntuacion: 9 })];
    const r = recomendarInicio(sidama, 'v60', preps, [guji, sidama, brasil], [c40])!;
    expect(r.base.cafeId).toBe('guji');
    expect(r.prep.molienda).toBe(21);
    expect(r.texto).toMatch(/mismo tueste/);
  });
  it('corrige por tueste: más oscuro → más grueso y menos caliente', () => {
    const preps = [prep({ cafeId: 'guji', molienda: 21, temperatura: 96, puntuacion: 8 })];
    const r = recomendarInicio(medio, 'v60', preps, [guji, medio], [c40])!;
    expect(r.prep.molienda).toBe(23);
    expect(r.prep.temperatura).toBe(94);
    expect(r.texto).toMatch(/más oscuro/);
  });
  it('sin buenas notas (≥7), otro método o cafés distintos: nada', () => {
    expect(recomendarInicio(sidama, 'v60', [prep({ cafeId: 'guji', puntuacion: 6 })], [guji, sidama])).toBeNull();
    expect(recomendarInicio(sidama, 'aeropress', [prep({ cafeId: 'guji', puntuacion: 9 })], [guji, sidama])).toBeNull();
    const lavado = cafe('lav', { tueste: 'oscuro', procesos: ['Lavado'], pais: 'Kenia' });
    expect(recomendarInicio(lavado, 'v60', [prep({ cafeId: 'guji', puntuacion: 9 })], [guji, lavado])).toBeNull();
  });
});

describe('aprendizajes', () => {
  it('agrupa cambios de una sola variable y su efecto en la nota', () => {
    const a1 = prep({ puntuacion: 6, molienda: 24 });
    const a2 = prep({ puntuacion: 7.5, molienda: 22, padreId: a1.id });
    const b1 = prep({ puntuacion: 7, molienda: 23 });
    const b2 = prep({ puntuacion: 7.5, molienda: 21, padreId: b1.id });
    // Dos cambios a la vez: no cuenta.
    const c1 = prep({ puntuacion: 5, molienda: 25 });
    const c2 = prep({ puntuacion: 9, molienda: 20, temperatura: 96, padreId: c1.id });
    const r = aprendizajes([a1, a2, b1, b2, c1, c2]);
    expect(r).toHaveLength(1);
    expect(r[0].accion).toBe('moler más fino');
    expect(r[0].n).toBe(2);
    expect(r[0].media).toBe(1);
    expect(r[0].texto).toMatch(/En V60, moler más fino te ha subido la nota 1 puntos de media \(2 veces\)/);
  });
  it('necesita al menos dos casos', () => {
    const a1 = prep({ puntuacion: 6, temperatura: 92 });
    const a2 = prep({ puntuacion: 7, temperatura: 95, padreId: a1.id });
    expect(aprendizajes([a1, a2])).toEqual([]);
  });
});

describe('preferencias', () => {
  it('media por café y por proceso; consejo con datos suficientes', () => {
    const cafes = [
      cafe('e1', { procesos: ['Natural'], pais: 'Etiopía', tueste: 'claro' }),
      cafe('e2', { procesos: ['Natural'], pais: 'Etiopía', tueste: 'claro' }),
      cafe('b1', { procesos: ['Lavado'], pais: 'Brasil', tueste: 'medio' }),
    ];
    const preps = [
      prep({ cafeId: 'e1', puntuacion: 9 }), prep({ cafeId: 'e1', puntuacion: 8 }), prep({ cafeId: 'e2', puntuacion: 8.5 }),
      prep({ cafeId: 'b1', puntuacion: 6 }), prep({ cafeId: 'b1', puntuacion: 6 }), prep({ cafeId: 'b1', puntuacion: 6 }),
    ];
    const p = preferencias(preps, cafes);
    expect(p.procesos[0]).toEqual({ nombre: 'Natural', n: 2, media: 8.5 });
    expect(p.paises[0].nombre).toBe('Etiopía');
    expect(consejoCompra(p)).toMatch(/natural \(8,5 de media en 2 cafés\)/);
  });
});
