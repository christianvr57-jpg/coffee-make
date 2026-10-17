// Calendario: rejilla del mes, patrones de turnos, recuento y próximos recordatorios.
import { describe, expect, it } from 'vitest';
import { iso } from '../src/core/fechas';
import { aplicarPatron, cuandoEs, leerPatron, moverMes, proximas, recuentoMes, rejillaMes } from '../src/modulos/calendario/logica';
import type { NotaDia } from '../src/modulos/calendario/tipos';

describe('rejilla del mes', () => {
  it('6 semanas de lunes a domingo que cubren todo el mes', () => {
    const r = rejillaMes(2026, 10); // octubre de 2026 empieza en jueves
    expect(r).toHaveLength(6);
    expect(r.every((s) => s.length === 7)).toBe(true);
    expect(iso(r[0][0])).toBe('2026-09-28');
    expect(r[0][0].getDay()).toBe(1);
    const dias = r.flat().map(iso);
    expect(dias).toContain('2026-10-01');
    expect(dias).toContain('2026-10-31');
  });
  it('cambia de mes y de año', () => {
    expect(moverMes(2026, 12, 1)).toEqual({ año: 2027, mes: 1 });
    expect(moverMes(2026, 1, -1)).toEqual({ año: 2025, mes: 12 });
    expect(moverMes(2026, 10, 14)).toEqual({ año: 2027, mes: 12 });
  });
});

describe('turnos', () => {
  it('lee patrones y rechaza letras que no son turnos', () => {
    expect(leerPatron('mmttnnll')).toEqual(['M', 'M', 'T', 'T', 'N', 'N', 'L', 'L']);
    expect(leerPatron('M M T, N-L')).toEqual(['M', 'M', 'T', 'N', 'L']);
    expect(leerPatron('MX')).toBeNull();
    expect(leerPatron('')).toBeNull();
  });
  it('repite el patrón día a día y cruza de mes', () => {
    const r = aplicarPatron('2026-10-30', ['M', 'T', 'L'], 5);
    expect(r.map((x) => `${x.fecha} ${x.turno}`)).toEqual(['2026-10-30 M', '2026-10-31 T', '2026-11-01 L', '2026-11-02 M', '2026-11-03 T']);
  });
  it('cuenta los turnos de un mes', () => {
    const t = new Map([
      ['2026-10-01', 'M'],
      ['2026-10-02', 'M'],
      ['2026-10-03', 'N'],
      ['2026-11-01', 'M'],
    ] as const);
    expect(recuentoMes(new Map(t), 2026, 10)).toEqual({ M: 2, T: 0, N: 1, L: 0 });
  });
});

describe('recordatorios', () => {
  const nota = (fecha: string, texto: string, extra: Partial<NotaDia> = {}): NotaDia => ({ id: texto, fecha, texto, tipo: 'recordar', creado: 1, actualizado: 1, ...extra });
  it('próximos días, en orden y sin borradas', () => {
    const ns = [nota('2026-10-20', 'b'), nota('2026-10-17', 'a'), nota('2026-10-16', 'ayer'), nota('2026-11-30', 'lejos'), nota('2026-10-18', 'borrada', { borrado: 5 })];
    expect(proximas(ns, '2026-10-17', 7).map((n) => n.texto)).toEqual(['a', 'b']);
  });
  it('dice cuándo es', () => {
    expect(cuandoEs('2026-10-17', '2026-10-17')).toBe('hoy');
    expect(cuandoEs('2026-10-18', '2026-10-17')).toBe('mañana');
    expect(cuandoEs('2026-10-20', '2026-10-17')).toBe('en 3 días');
    expect(cuandoEs('2026-10-15', '2026-10-17')).toBe('hace 2 días');
  });
});
