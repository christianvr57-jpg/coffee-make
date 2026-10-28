// Gym: catálogo, plantillas, 1RM, volumen, lo anterior, sugerencia de progresión, récords y series por grupo.
import { describe, expect, it } from 'vitest';
import { anterior, e1rm, historialEjercicio, porSemana, recordsDeSesion, repsMax, seriesPorGrupo, sugerencia, textoSerie, volumen } from '../src/modulos/gym/calculos';
import { EJERCICIOS } from '../src/modulos/gym/datos/ejercicios';
import { PLANTILLAS } from '../src/modulos/gym/datos/plantillas';
import { parse } from '../src/core/fechas';
import { EQUIPOS, GRUPOS, type SesionGym } from '../src/modulos/gym/tipos';

const buscar = (id: string) => EJERCICIOS.find((e) => e.id === id);
const sesion = (id: string, fecha: string, inicio: number, ejercicios: SesionGym['ejercicios']): SesionGym => ({ id, fecha, nombre: id, inicio, fin: inicio + 3600e3, ejercicios, creado: inicio, actualizado: inicio });

describe('catálogo', () => {
  it('es amplio, sin ids repetidos y con grupos, material y tipo válidos', () => {
    expect(EJERCICIOS.length).toBeGreaterThanOrEqual(200);
    expect(new Set(EJERCICIOS.map((e) => e.id)).size).toBe(EJERCICIOS.length);
    const grupos = new Set(GRUPOS.map(([g]) => g));
    const equipos = new Set(EQUIPOS.map(([e]) => e));
    for (const e of EJERCICIOS) {
      expect(grupos.has(e.grupo), e.id).toBe(true);
      expect(equipos.has(e.equipo), e.id).toBe(true);
      expect(['peso', 'reps', 'tiempo', 'cardio']).toContain(e.tipo);
      for (const s of e.secundarios) expect(grupos.has(s), `${e.id}: ${s}`).toBe(true);
    }
    // Hay de sobra con y sin peso.
    expect(EJERCICIOS.filter((e) => e.tipo === 'peso').length).toBeGreaterThan(100);
    expect(EJERCICIOS.filter((e) => e.equipo === 'corporal').length).toBeGreaterThan(40);
  });
  it('las plantillas solo usan ejercicios del catálogo', () => {
    for (const p of PLANTILLAS) for (const e of p.ejercicios) expect(buscar(e.ejercicioId), `${p.id}: ${e.ejercicioId}`).toBeDefined();
  });
});

describe('cálculos', () => {
  it('1RM estimado (Epley) y volumen sin calentamientos', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 10)).toBeCloseTo(133.33, 1);
    expect(e1rm(0, 10)).toBe(0);
    expect(volumen([{ peso: 50, reps: 10, hecha: true }, { peso: 20, reps: 10, hecha: true, tipo: 'calentamiento' }, { peso: 50, reps: 10, hecha: false }])).toBe(500);
  });
  it('rango de repeticiones', () => {
    expect(repsMax('8-12')).toBe(12);
    expect(repsMax('10')).toBe(10);
    expect(repsMax('al fallo')).toBeNull();
  });
  it('lo de la última vez y la doble progresión', () => {
    const s1 = sesion('a', '2026-10-20', 1000, [{ uid: '1', ejercicioId: 'press-banca', series: [{ peso: 60, reps: 12, hecha: true }, { peso: 60, reps: 12, hecha: true }] }]);
    const prev = anterior([s1], 'press-banca', 2000);
    expect(prev).toHaveLength(2);
    expect(anterior([s1], 'press-banca', 500)).toHaveLength(0);
    expect(sugerencia(prev, '8-12', buscar('press-banca')!)).toMatch(/62,5 kg/);
    expect(sugerencia([{ peso: 60, reps: 10, hecha: true }], '8-12', buscar('press-banca')!)).toMatch(/sumar/);
    expect(sugerencia(prev, '8-12', buscar('flexiones')!)).toBeNull();
  });
  it('récords frente a todo lo anterior (no en la primera vez)', () => {
    const s1 = sesion('a', '2026-10-20', 1000, [{ uid: '1', ejercicioId: 'sentadilla', series: [{ peso: 80, reps: 5, hecha: true }] }]);
    const s2 = sesion('b', '2026-10-27', 2000, [{ uid: '2', ejercicioId: 'sentadilla', series: [{ peso: 85, reps: 5, hecha: true }] }]);
    expect(recordsDeSesion(s1, [s1, s2], buscar)).toHaveLength(0);
    const r = recordsDeSesion(s2, [s1, s2], buscar);
    expect(r).toHaveLength(1);
    expect(textoSerie('peso', r[0].serie)).toBe('85 kg × 5');
    expect(historialEjercicio([s2, s1], buscar('sentadilla')!).map((h) => h.fecha)).toEqual(['2026-10-20', '2026-10-27']);
  });
  it('series por grupo (secundarios a la mitad) y por semana', () => {
    const s = sesion('a', '2026-10-27', 1000, [{ uid: '1', ejercicioId: 'press-banca', series: [{ peso: 60, reps: 8, hecha: true }, { peso: 60, reps: 8, hecha: true }, { peso: 40, reps: 8, hecha: true, tipo: 'calentamiento' }] }]);
    const g = seriesPorGrupo([s], '2026-10-21', '2026-10-28', buscar);
    expect(g.get('pecho')).toBe(2);
    expect(g.get('triceps')).toBe(1);
    const ps = porSemana([s], parse('2026-10-28'), 2);
    expect(ps[1]).toMatchObject({ sesiones: 1, series: 2, volumen: 960 });
    expect(ps[0].sesiones).toBe(0);
  });
});
