// Recetas: coherencia de la biblioteca de referencia, escalado, plan del temporizador y editor.
import { describe, expect, it } from 'vitest';
import { RECETAS_REFERENCIA } from '../src/modulos/cafe/datos/recetas';
import { METODOS } from '../src/modulos/cafe/datos/metodos';
import {
  duplicarReceta, duracionPlan, fasesEscaladas, iniciosFases, objetivoDesdeFases, planDePreparacion,
  recetaDesdeMetodo, recetaDesdePreparacion, revisarReceta, vertidoEnFase,
} from '../src/modulos/cafe/recetas';
import { diagnosticar } from '../src/modulos/cafe/diagnostico';
import type { Preparacion } from '../src/modulos/cafe/modelo';

describe('recetas de referencia', () => {
  it('ids únicos, con fuente https y método conocido', () => {
    const ids = RECETAS_REFERENCIA.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of RECETAS_REFERENCIA) {
      expect(r.referencia).toBe(true);
      expect(r.fuente?.url).toMatch(/^https:\/\//);
      expect(METODOS.some((m) => m.id === r.metodo)).toBe(true);
    }
  });
  it('los pesos son acumulados, no bajan y terminan en el agua total', () => {
    for (const r of RECETAS_REFERENCIA) {
      const rev = revisarReceta(r);
      expect(rev.errores, r.id).toEqual([]);
      expect(rev.avisos.filter((a) => a.includes('llegan')), r.id).toEqual([]);
    }
  });
  it('el plan cuadra con el tiempo publicado por el autor', () => {
    const t = (id: string) => duracionPlan(RECETAS_REFERENCIA.find((r) => r.id === id)!.fases);
    expect(t('ref-hoffmann-v60')).toBe(210); // drenaje hacia 3:30
    expect(t('ref-hoffmann-v60-1taza')).toBe(180); // hacia 3:00
    expect(t('ref-kasuya-46')).toBe(210); // retirar a 3:30
  });
  it('4:6: vertidos de Kasuya (50, 70 y tres de 60) a 0:00, 0:45, 1:30, 2:10 y 2:40', () => {
    const r = RECETAS_REFERENCIA.find((x) => x.id === 'ref-kasuya-46')!;
    expect(r.fases.map((_, i) => vertidoEnFase(r.fases, i))).toEqual([50, 70, 60, 60, 60]);
    expect(iniciosFases(r.fases)).toEqual([0, 45, 90, 130, 160]);
  });
  it('las instrucciones no llevan gramos (los pone el temporizador ya escalados)', () => {
    for (const r of RECETAS_REFERENCIA) for (const f of r.fases) expect(f.instruccion, `${r.id}/${f.nombre}`).not.toMatch(/\d+\s?g\b/);
  });
});

describe('escalado y plan', () => {
  const v60 = RECETAS_REFERENCIA.find((r) => r.id === 'ref-hoffmann-v60')!;
  it('escala los pesos en proporción al agua', () => {
    const f = fasesEscaladas(v60, 250);
    expect(f.map((x) => x.aguaHasta)).toEqual([30, 150, 250, undefined, undefined]);
    expect(f.map((x) => x.duracion)).toEqual(v60.fases.map((x) => x.duracion));
  });
  it('no modifica la receta original', () => {
    fasesEscaladas(v60, 100);
    expect(v60.fases[0].aguaHasta).toBe(60);
  });
  it('plan: receta del mismo método, o plantilla del método si no', () => {
    expect(planDePreparacion({ metodo: 'v60', dosis: 15, agua: 250 }, v60)[2].aguaHasta).toBe(250);
    expect(planDePreparacion({ metodo: 'aeropress', dosis: 15, agua: 240 }, v60)[0].nombre).toBe('Verter');
  });
  it('vertido de cada paso, saltando pasos sin agua', () => {
    const f = [
      { nombre: 'a', duracion: 10, aguaHasta: 40, instruccion: '' },
      { nombre: 'b', duracion: 10, instruccion: '' },
      { nombre: 'c', duracion: 10, aguaHasta: 100, instruccion: '' },
    ];
    expect([0, 1, 2].map((i) => vertidoEnFase(f, i))).toEqual([40, undefined, 60]);
  });
});

describe('editor', () => {
  it('detecta pesos que bajan y falta de nombre', () => {
    const r = recetaDesdeMetodo('v60');
    r.fases![1] = { ...r.fases![1], aguaHasta: 10 };
    const rev = revisarReceta(r);
    expect(rev.errores.some((e) => e.includes('nombre'))).toBe(true);
    expect(rev.errores.some((e) => e.includes('peso baja'))).toBe(true);
  });
  it('avisa si los pasos no llegan al agua total', () => {
    const r = { ...recetaDesdeMetodo('v60'), nombre: 'x', agua: 300 };
    expect(revisarReceta(r).avisos[0]).toMatch(/llegan a 251 g pero el agua total es 300 g/);
  });
  it('tiempo objetivo desde los pasos', () => {
    expect(objetivoDesdeFases(RECETAS_REFERENCIA[0].fases)).toEqual([165, 195]);
    expect(objetivoDesdeFases(RECETAS_REFERENCIA.find((r) => r.metodo === 'moka')!.fases)).toBeUndefined();
  });
  it('duplicar: copia editable sin id ni marca de referencia', () => {
    const d = duplicarReceta(RECETAS_REFERENCIA[0]);
    expect(d.id).toBeUndefined();
    expect(d.referencia).toBeUndefined();
    expect(d.baseId).toBe(RECETAS_REFERENCIA[0].id);
    d.fases![0].aguaHasta = 1;
    expect(RECETAS_REFERENCIA[0].fases[0].aguaHasta).toBe(50);
  });
  it('desde una preparación: usa la duración real de cada paso salvo el último', () => {
    const plan = RECETAS_REFERENCIA[0].fases;
    const p = {
      id: 'p', metodo: 'v60', dosis: 15, agua: 250, molinoId: 'c40', molienda: 22, temperatura: 96, sintomas: [], fecha: 0, creado: 0, actualizado: 0, tiempoTotal: 190,
      fases: plan.map((f, i) => ({ nombre: f.nombre, inicio: i * 30, fin: i * 30 + 30 })),
    } as Preparacion;
    const r = recetaDesdePreparacion(p, plan, 'V60');
    expect(r.fases!.map((f) => f.duracion)).toEqual([30, 30, 30, 30, 30, 60]);
    expect(r.ajusteMolino).toBe(22);
    expect(r.tiempoObjetivo).toEqual([175, 205]);
    // Si terminaste antes de tiempo, se quedan los tiempos de la receta.
    const corta = recetaDesdePreparacion({ ...p, fases: p.fases!.slice(0, 2) }, plan, 'V60');
    expect(corta.fases!.map((f) => f.duracion)).toEqual(plan.map((f) => f.duracion));
  });
});

describe('diagnóstico con receta', () => {
  it('usa el tiempo de la receta: 3:35 es lento para la plantilla de V60 pero normal en la 4:6', () => {
    const p = { metodo: 'v60' as const, dosis: 20, agua: 300, molienda: 30, sintomas: ['agrio' as const], tiempoTotal: 215 };
    const k = RECETAS_REFERENCIA.find((r) => r.id === 'ref-kasuya-46')!;
    expect(diagnosticar(p).sugerencias[0].cambio).toHaveProperty('temperatura');
    expect(diagnosticar(p, { objetivo: k.tiempoObjetivo }).sugerencias[0].cambio).toHaveProperty('molienda');
  });
});
