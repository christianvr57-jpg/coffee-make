// Calendario del hogar: reparto de periódicas, semanas A/B, cama baja y caducidad de lo no hecho.
import { describe, expect, it } from 'vitest';
import { addDays, iso, lunesDe, parse } from '../src/core/fechas';
import { elementosDelDia, fechaProgramada, periodoDe, planDelDia, tipoSemana } from '../src/modulos/hogar/calendario';
import rutinaJson from '../src/modulos/hogar/rutina.json';
import type { AjustesHogar, Rutina } from '../src/modulos/hogar/tipos';

const rutina = rutinaJson as unknown as Rutina;
const modelo = { tareas: rutina.tareas, coladas: rutina.coladas };
const ajustes: AjustesHogar = { camaBaja: false, semanaAuto: true, semanaAncla: { lunes: '2026-09-28', tipo: 'A' }, inicio: null };

describe('reparto de periódicas', () => {
  it('nunca salta más de un extra nuevo el mismo día (dos años)', () => {
    let max = 0;
    for (let i = 0; i < 730; i++) {
      const plan = planDelDia(modelo, ajustes, addDays(parse('2026-01-01'), i));
      max = Math.max(max, plan.periodicas.filter((p) => p.nueva).length);
    }
    expect(max).toBeLessThanOrEqual(2);
    expect(max).toBe(1);
  });

  it('una periódica se ve desde su día hasta fin de periodo y no antes de empezar a usar la app', () => {
    const t = modelo.tareas.find((x) => x.id === 'm-lavadora')!;
    const due = iso(fechaProgramada(t, periodoDe('mensual', parse('2026-10-15')))!);
    const ve = (d: string, aj = ajustes) => planDelDia(modelo, aj, parse(d)).periodicas.some((p) => p.t.id === t.id);
    expect(ve(iso(addDays(parse(due), -1)))).toBe(false);
    expect(ve(due)).toBe(true);
    expect(ve(iso(addDays(parse(due), 2)))).toBe(true);
    expect(ve('2026-11-01')).toBe(false);
    expect(planDelDia(modelo, { ...ajustes, inicio: '2026-10-30' }, parse('2026-10-31')).periodicas).toHaveLength(0);
  });
});

describe('semanas A/B y coladas', () => {
  it('alterna cada lunes', () => {
    expect(tipoSemana(parse('2026-09-30'), ajustes)).toBe('A');
    expect(tipoSemana(parse('2026-10-07'), ajustes)).toBe('B');
    expect(tipoSemana(parse('2026-10-11'), ajustes)).toBe('B');
    expect(tipoSemana(parse('2026-10-12'), ajustes)).toBe('A');
    expect(tipoSemana(parse('2026-09-23'), ajustes)).toBe('B');
  });
  it('el sábado lava sábanas en A y blancos en B', () => {
    expect(planDelDia(modelo, ajustes, parse('2026-10-03')).coladas.map((c) => c.t.id)).toEqual(['col-sab-a']);
    expect(planDelDia(modelo, ajustes, parse('2026-10-10')).coladas.map((c) => c.t.id)).toEqual(['col-sab-b']);
  });
  it('hay una colada cada día', () => {
    const lunes = lunesDe(parse('2026-10-05'));
    for (let i = 0; i < 7; i++) expect(planDelDia(modelo, ajustes, addDays(lunes, i)).coladas).toHaveLength(1);
  });
});

describe('cama baja', () => {
  it('activa el aspirado de la habitación cada dos días', () => {
    const tiene = (d: string, aj: AjustesHogar) => planDelDia(modelo, aj, parse(d)).grupos.dia.some((x) => x.t.id === 'd-suelo-cuarto');
    expect(tiene('2026-10-06', ajustes)).toBe(false);
    const con = { ...ajustes, camaBaja: true };
    expect(tiene('2026-10-06', con)).not.toBe(tiene('2026-10-07', con));
  });
});

describe('carga del día', () => {
  it('cuenta colada, rutina diaria y fijas', () => {
    const plan = planDelDia(modelo, ajustes, parse('2026-10-05'));
    const items = elementosDelDia(plan);
    expect(items.length).toBeGreaterThan(15);
    expect(items.reduce((s, i) => s + i.minutos, 0)).toBeGreaterThan(60);
  });
});
