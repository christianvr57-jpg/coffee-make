// Running: tiempos, VDOT, zonas, carga, validación del plan y biblioteca de sesiones.
import { describe, expect, it } from 'vitest';
import { addDays, iso, parse } from '../src/core/fechas';
import { formatoTiempo, indiceSemanaActual, leerTiempo, resumenCarga, tiempoEquivalente, vdot, zonasFC, zonasRitmo } from '../src/modulos/running/calculos';
import { BIBLIOTECA, NUTRICION } from '../src/modulos/running/datos/guia';
import { validarPlan } from '../src/modulos/running/validar';

describe('tiempos y VDOT', () => {
  it('lee y formatea tiempos', () => {
    expect(leerTiempo('41:00')).toBe(2460);
    expect(leerTiempo('1:02:30')).toBe(3750);
    expect(leerTiempo('abc')).toBeNull();
    expect(leerTiempo('')).toBeNull();
    expect(formatoTiempo(2460)).toBe('41:00');
    expect(formatoTiempo(3750)).toBe('1:02:30');
  });
  it('VDOT coincide con las tablas de Daniels (5K 19:57 y 10K 41:21 ≈ 50)', () => {
    expect(Math.abs(vdot(5000, leerTiempo('19:57')!) - 50)).toBeLessThan(0.3);
    expect(Math.abs(vdot(10000, leerTiempo('41:21')!) - 50)).toBeLessThan(0.3);
    const vd = vdot(10000, 2460);
    expect(Math.abs(tiempoEquivalente(vd, 10000) - 2460)).toBeLessThan(1);
  });
});

describe('zonas', () => {
  it('zonas de ritmo ordenadas de lento a rápido y coherentes con la marca', () => {
    const z = zonasRitmo(10000, 2460);
    const centro = (id: string) => {
      const x = z.zonas.find((y) => y.id === id)!;
      return (x.desde + x.hasta) / 2;
    };
    const orden = ['E', 'M', 'T', '10K', 'I', 'R'].map(centro);
    for (let i = 1; i < orden.length; i++) expect(orden[i]).toBeLessThan(orden[i - 1]);
    expect(Math.abs(centro('10K') - 246)).toBeLessThan(1);
    for (const x of z.zonas) expect(x.desde, x.id).toBeLessThanOrEqual(x.hasta);
  });
  it('zonas de FC contiguas, sin huecos (Friel)', () => {
    const fc = zonasFC(168, 188);
    for (let i = 1; i < fc.length; i++) expect(fc[i].min).toBe((fc[i - 1].max as number) + 1);
    expect(fc[4].min).toBe(168);
    expect(fc[4].max).toBe(188);
  });
});

describe('carga', () => {
  const hoy = parse('2026-10-16');
  it('4 semanas iguales → relación aguda:crónica ≈ 1', () => {
    const regs = [];
    for (let i = 1; i < 28; i += 2) regs.push({ fecha: iso(addDays(hoy, -i)), tipo: 'rodaje' as const, minutos: 40, km: 8, rpe: 4 });
    const r = resumenCarga(regs, hoy);
    expect(r.semanas).toHaveLength(4);
    expect(r.semanas.every((s) => s.sesiones >= 3)).toBe(true);
    expect(r.ratio!).toBeGreaterThan(0.8);
    expect(r.ratio!).toBeLessThan(1.25);
    expect(resumenCarga(regs.slice(0, 3), hoy).ratio).toBeNull();
  });
  it('el pádel suma carga pero no kilómetros', () => {
    const r = resumenCarga([{ fecha: '2026-10-16', tipo: 'padel', minutos: 90, rpe: 7, km: 0 }], hoy);
    expect(r.semanas[3].km).toBe(0);
    expect(r.aguda).toBe(630);
  });
});

describe('plan del entrenador', () => {
  const semana = (lunes: string) => ({ id: lunes, lunes, dias: [{ fecha: lunes, sesiones: [{ id: `${lunes}-a`, tipo: 'rodaje', titulo: 'Rodaje 30 min', duracion: 30 }] }] });
  it('acepta un plan con semanas y rechaza los mal formados', () => {
    expect(typeof validarPlan({ plan: { semanas: [semana('2026-10-19')] } })).toBe('object');
    expect(validarPlan('hola')).toMatch(/JSON/);
    expect(validarPlan({ plan: { semanas: [{ lunes: '19/10', dias: [] }] } })).toMatch(/lunes/);
    expect(validarPlan({ plan: { semanas: [{ lunes: '2026-10-19' }] } })).toMatch(/dias/);
    expect(validarPlan({})).toMatch(/no tiene/);
    expect(typeof validarPlan({ auditoria: [{ id: 'b1', titulo: 'Bloque 1', preguntas: [] }] })).toBe('object');
  });
  it('semana actual: la que contiene hoy, si no la siguiente, si no la última', () => {
    const ss = [semana('2026-10-19'), semana('2026-10-26')];
    expect(indiceSemanaActual(ss, parse('2026-10-28'))).toBe(1);
    expect(indiceSemanaActual(ss, parse('2026-10-16'))).toBe(0);
    expect(indiceSemanaActual(ss, parse('2026-12-01'))).toBe(1);
  });
});

describe('guía', () => {
  it('la biblioteca solo usa marcadores de zona conocidos', () => {
    for (const s of BIBLIOTECA) for (const m of Object.values(s).join(' ').matchAll(/\{([^}]+)\}/g)) expect(['E', 'M', 'T', '10K', 'I', 'R'], s.id).toContain(m[1]);
    expect(new Set(BIBLIOTECA.map((s) => s.id)).size).toBe(BIBLIOTECA.length);
  });
  it('la guía general no lleva datos personales (peso, altura, edad concretos)', () => {
    const texto = JSON.stringify([BIBLIOTECA, NUTRICION]).toLowerCase();
    for (const re of [/\d{2,3}\s?kg/, /\d{3}\s?cm/, /\d{2}\s?años/]) expect(texto, String(re)).not.toMatch(re);
  });
});
