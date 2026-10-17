// Running (semáforo de hoy, plan frente a lo hecho, evolución) y progreso del Hogar.
import { describe, expect, it } from 'vitest';
import { addDays, iso, lunesDe, parse } from '../src/core/fechas';
import { PLAN_APP } from '../src/modulos/running/validar';
import { cumplimiento, diasSeguidosAjustando, evolucion, nivelChequeo } from '../src/modulos/running/seguimiento';
import { cumplido, pendientesSemana, progreso, progresoDia } from '../src/modulos/hogar/progreso';
import rutinaJson from '../src/modulos/hogar/rutina.json';
import type { AjustesHogar, Rutina } from '../src/modulos/hogar/tipos';

describe('running · semáforo de hoy', () => {
  it('sigue la guía: 0-2 seguir, 3-5 o peor al levantarse ajustar, >5 o alarma parar', () => {
    expect(nivelChequeo({ molestia: 2, peor: false, alarma: false })).toBe('verde');
    expect(nivelChequeo({ molestia: 3, peor: false, alarma: false })).toBe('ambar');
    expect(nivelChequeo({ molestia: 1, peor: true, alarma: false })).toBe('ambar');
    expect(nivelChequeo({ molestia: 6, peor: false, alarma: false })).toBe('rojo');
    expect(nivelChequeo({ molestia: 0, peor: false, alarma: true })).toBe('rojo');
  });
  it('cuenta los días seguidos ajustando hasta hoy', () => {
    const a = { molestia: 4, peor: false, alarma: false };
    const v = { molestia: 0, peor: false, alarma: false };
    const ch = { '2026-10-20': v, '2026-10-21': a, '2026-10-22': a, '2026-10-23': a };
    expect(diasSeguidosAjustando(ch, parse('2026-10-23'))).toBe(3);
    expect(diasSeguidosAjustando(ch, parse('2026-10-20'))).toBe(0);
    expect(diasSeguidosAjustando(ch, parse('2026-10-24'))).toBe(0);
  });
});

describe('running · seguimiento', () => {
  it('plan frente a lo hecho: solo semanas empezadas y sin contar descansos', () => {
    const semanas = PLAN_APP.plan!.semanas;
    const primera = semanas[0];
    const ses = primera.dias.flatMap((d) => d.sesiones).filter((s) => s.tipo !== 'descanso');
    const hechas = { [ses[0].id]: true };
    const regs = [{ fecha: primera.lunes, minutos: 30, km: 5 }];
    const c = cumplimiento(semanas, regs, hechas, addDays(parse(primera.lunes), 3));
    expect(c).toHaveLength(1);
    expect(c[0].planificadas).toBe(ses.length);
    expect(c[0].hechas).toBe(1);
    expect(c[0].minHechos).toBe(30);
    expect(c[0].kmHechos).toBe(5);
    expect(cumplimiento(semanas, regs, hechas, addDays(parse(primera.lunes), -1))).toHaveLength(0);
  });
  it('evolución: molestia máxima (registros y semáforos) y sueño medio por semana', () => {
    const hoy = parse('2026-10-31');
    const regs = [
      { id: 'a', creado: 0, actualizado: 0, fecha: '2026-10-30', tipo: 'rodaje' as const, aquiles: 2, sueno: 7 },
      { id: 'b', creado: 0, actualizado: 0, fecha: '2026-10-29', tipo: 'rodaje' as const, rodilla: 1, sueno: 6 },
    ];
    const ev = evolucion(regs, { '2026-10-31': { molestia: 4, peor: false, alarma: false } }, hoy, 2);
    expect(ev).toHaveLength(2);
    expect(ev[1]).toMatchObject({ molestia: 4, sueno: 6.5 });
    expect(ev[0]).toMatchObject({ molestia: null, sueno: null });
  });
});

describe('hogar · progreso', () => {
  const rutina = rutinaJson as unknown as Rutina;
  const modelo = { tareas: rutina.tareas, coladas: rutina.coladas };
  const aj: AjustesHogar = { camaBaja: false, semanaAuto: true, semanaAncla: { lunes: '2026-09-28', tipo: 'A' }, inicio: '2026-10-05' };
  const hoy = parse('2026-10-16'); // viernes
  const hacer = (m: Map<string, string>, d: Date) => {
    for (const i of progresoDia(modelo, aj, m, d).items) m.set(i.clave, iso(d));
  };

  it('racha de días cumplidos: hoy solo suma cuando ya está cumplido', () => {
    const m = new Map<string, string>();
    for (let i = 1; i <= 4; i++) hacer(m, addDays(hoy, -i));
    const p = progreso(modelo, aj, m, hoy, 2);
    expect(p.racha).toBe(4);
    expect(p.mejorRacha).toBe(4);
    hacer(m, hoy);
    expect(progreso(modelo, aj, m, hoy, 2).racha).toBe(5);
    // Antes de empezar a usar la app no cuenta.
    expect(progreso(modelo, aj, m, hoy, 3).dias.slice(0, 7).every((d) => d === null)).toBe(true);
  });

  it('lo que más se escapa y el umbral del día cumplido (80 %)', () => {
    const p = progreso(modelo, aj, new Map(), hoy, 2);
    expect(p.racha).toBe(0);
    expect(p.escapan.length).toBeGreaterThan(0);
    expect(p.escapan.every((t) => t.fallos === t.veces)).toBe(true);
    expect(cumplido({ total: 10, hechas: 8 })).toBe(true);
    expect(cumplido({ total: 10, hechas: 7 })).toBe(false);
  });

  it('pendientes de la semana: coladas y tareas de días anteriores, nunca las diarias', () => {
    const m = new Map<string, string>();
    const pend = pendientesSemana(modelo, aj, m, hoy);
    expect(pend.length).toBeGreaterThan(0);
    expect(pend.every((x) => x.fecha < iso(hoy) && x.fecha >= iso(lunesDe(hoy)))).toBe(true);
    expect(pend.every((x) => x.item.tipo === 'colada' || (x.item.t as { frecuencia: string }).frecuencia !== 'diaria')).toBe(true);
    for (const x of pend) m.set(x.item.clave, iso(hoy));
    expect(pendientesSemana(modelo, aj, m, hoy)).toHaveLength(0);
    expect(pendientesSemana(modelo, aj, new Map(), lunesDe(hoy))).toHaveLength(0);
  });
});
