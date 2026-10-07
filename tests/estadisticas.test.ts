// Estadísticas del diario y coherencia de la guía.
import { describe, expect, it } from 'vitest';
import { combosAjuste, costePrep, enPeriodo, evolucionNota, mejoresRecetas, porMetodo, porSemana, resumen } from '../src/modulos/cafe/estadisticas';
import { PROCESOS_GUIA, VARIEDADES_GUIA, clasificacionEtiqueta, estadoAgua, fichaProceso, fichaVariedad } from '../src/modulos/cafe/datos/guia';
import { PROCESOS, VARIEDADES } from '../src/modulos/cafe/datos/catalogos';
import type { Cafe, Preparacion } from '../src/modulos/cafe/modelo';

const DIA = 86400000;
const ahora = new Date(2026, 9, 8, 12).getTime(); // jueves 8 oct 2026
let n = 0;
const prep = (x: Partial<Preparacion>): Preparacion =>
  ({ id: `p${++n}`, fecha: ahora, metodo: 'v60', dosis: 15, agua: 250, sintomas: [], creado: 0, actualizado: 0, ...x }) as Preparacion;
const cafes = [{ id: 'a', nombre: 'A', precio: 15, pesoG: 250 }, { id: 'b', nombre: 'B', terminado: true }] as Cafe[];

describe('resumen y periodo', () => {
  const ps = [prep({ cafeId: 'a', puntuacion: 8 }), prep({ cafeId: 'a', puntuacion: 6, fecha: ahora - 40 * DIA }), prep({ cafeId: 'b', dosis: 18 })];
  it('filtra por días', () => {
    expect(enPeriodo(ps, 30, ahora)).toHaveLength(2);
    expect(enPeriodo(ps, null, ahora)).toHaveLength(3);
  });
  it('cuenta, media, gramos y coste solo con precio conocido', () => {
    const r = resumen(ps, cafes);
    expect(r).toMatchObject({ n: 3, cafes: 2, media: 7, gramos: 48, conCoste: 2 });
    expect(r.coste).toBeCloseTo(1.8);
    expect(r.costeTaza).toBeCloseTo(0.9);
    expect(costePrep(ps[2], cafes)).toBeUndefined();
  });
});

describe('series', () => {
  it('por semana: 12 semanas de lunes a domingo, la última la actual', () => {
    const s = porSemana([prep({}), prep({ fecha: ahora - 7 * DIA }), prep({ fecha: ahora - 100 * DIA })], 12, new Date(ahora));
    expect(s).toHaveLength(12);
    expect(s[11]).toMatchObject({ desde: '2026-10-05', n: 1 });
    expect(s[10].n).toBe(1);
    expect(s.reduce((a, b) => a + b.n, 0)).toBe(2);
  });
  it('evolución: orden cronológico y media móvil', () => {
    const e = evolucionNota([prep({ fecha: 3, puntuacion: 9 }), prep({ fecha: 1, puntuacion: 5 }), prep({ fecha: 2, puntuacion: 7 }), prep({ fecha: 4 })], 2);
    expect(e.map((x) => x.nota)).toEqual([5, 7, 9]);
    expect(e.map((x) => x.movil)).toEqual([5, 6, 8]);
  });
  it('por método y mejor receta por café y método', () => {
    const ps = [prep({ cafeId: 'a', puntuacion: 7 }), prep({ cafeId: 'a', puntuacion: 8.5 }), prep({ cafeId: 'b', metodo: 'espresso', puntuacion: 6 }), prep({ cafeId: 'a', metodo: 'aeropress' })];
    expect(porMetodo(ps)[0]).toMatchObject({ metodo: 'v60', n: 2, media: 7.75 });
    const m = mejoresRecetas(ps, cafes);
    expect(m.map((x) => [x.cafeNombre, x.metodo, x.mejor.puntuacion])).toEqual([['A', 'v60', 8.5], ['B', 'espresso', 6]]);
  });
  it('ajuste fino: solo combinaciones con 3 o más preparaciones con molienda y nota', () => {
    const ps = [1, 2, 3].map((i) => prep({ cafeId: 'a', molinoId: 'c40', molienda: 20 + i, puntuacion: 6 + i }));
    expect(combosAjuste([...ps, prep({ cafeId: 'b', molienda: 9, puntuacion: 7 })])).toEqual([{ cafeId: 'a', cafeNombre: '', metodo: 'v60', molinoId: 'c40', n: 3 }]);
  });
});

describe('guía', () => {
  it('ids únicos y fuentes https', () => {
    for (const lista of [VARIEDADES_GUIA, PROCESOS_GUIA]) {
      const ids = lista.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const x of lista) expect(x.fuente.url).toMatch(/^https:\/\//);
    }
  });
  it('los alias existen en los catálogos de la app y no se repiten', () => {
    const av = VARIEDADES_GUIA.flatMap((v) => v.alias);
    const ap = PROCESOS_GUIA.flatMap((p) => p.alias);
    for (const a of av) expect(VARIEDADES, a).toContain(a);
    for (const a of ap) expect(PROCESOS, a).toContain(a);
    expect(new Set(av).size).toBe(av.length);
    expect(new Set(ap).size).toBe(ap.length);
    expect(fichaVariedad('74110')?.id).toBe('landrace-etiope');
    expect(fichaProceso('Honey rojo')?.id).toBe('honey');
  });
  it('agua: clasificación de etiqueta (UE) y rango SCA', () => {
    expect(clasificacionEtiqueta(40)).toBe('Mineralización muy débil');
    expect(clasificacionEtiqueta(300)).toBe('Mineralización débil');
    expect(clasificacionEtiqueta(2000)).toBe('Mineralización fuerte');
    expect(estadoAgua(40).estado).toBe('bajo');
    expect(estadoAgua(150).estado).toBe('ideal');
    expect(estadoAgua(300).estado).toBe('alto');
  });
});
