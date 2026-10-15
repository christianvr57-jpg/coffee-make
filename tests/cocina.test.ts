// Módulo Cocina: coherencia del menú de 4 semanas con los criterios nutricionales y las reglas del niño.
import { describe, expect, it } from 'vitest';
import { addDays, parse } from '../src/core/fechas';
import { RECETAS, receta } from '../src/modulos/cocina/datos/recetas';
import { DESAYUNOS, MERIENDAS, SEMANAS } from '../src/modulos/cocina/datos/menu';
import { PESCADOS_EXCLUIDOS, RIESGO_ATRAGANTAMIENTO } from '../src/modulos/cocina/datos/guia';
import { alternativas, claveCambio, contarProteinas, equilibrio, inicioParaSemana, listaCompra, planDia, planSemana, semanaDelCiclo } from '../src/modulos/cocina/plan';

const INICIO = '2026-10-12'; // lunes = semana 1
const lunesSemana = (n: number) => addDays(parse(INICIO), 7 * n);

describe('recetas', () => {
  it('ids únicos y todas las del menú existen', () => {
    const ids = RECETAS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SEMANAS) for (const d of s.dias) for (const id of [d.comida, d.cena]) expect(receta(id), id).toBeDefined();
    for (const s of SEMANAS) for (const d of s.dias) expect(MERIENDAS.some((m) => m.id === d.merienda)).toBe(true);
  });
  it('todas las recetas se usan en el ciclo', () => {
    const usadas = new Set(SEMANAS.flatMap((s) => s.dias.flatMap((d) => [d.comida, d.cena])));
    expect(RECETAS.filter((r) => !usadas.has(r.id)).map((r) => r.id)).toEqual([]);
  });
  it('ingredientes con categoría, pasos y adaptación del niño', () => {
    for (const r of RECETAS) {
      expect(r.ingredientes.every((x) => !!x.c && !!x.n), r.id).toBe(true);
      expect(r.pasos.length, r.id).toBeGreaterThan(0);
      expect(r.nino.adaptacion && r.nino.racion, r.id).toBeTruthy();
    }
  });
  it('sin pescados de alto mercurio ni ultraprocesados típicos', () => {
    const texto = RECETAS.map((r) => `${r.nombre} ${r.ingredientes.map((x) => x.n).join(' ')}`).join(' ').toLowerCase();
    for (const p of PESCADOS_EXCLUIDOS) expect(texto, p).not.toContain(p);
    for (const p of ['chorizo', 'jamón', 'salchicha', 'bacon', 'beicon', 'nuggets', 'bollería', 'azúcar', 'miel']) expect(texto, p).not.toContain(p);
  });
  it('lo que come el niño no incluye alimentos de riesgo de atragantamiento', () => {
    const tomas = [...MERIENDAS, ...DESAYUNOS].map((t) => `${t.texto} ${t.ingredientes.map((x) => x.n).join(' ')}`).join(' ').toLowerCase();
    for (const p of RIESGO_ATRAGANTAMIENTO) expect(tomas, p).not.toContain(p);
    for (const r of RECETAS) for (const p of RIESGO_ATRAGANTAMIENTO) expect(r.ingredientes.map((x) => x.n.toLowerCase()).join(' '), `${r.id}: ${p}`).not.toContain(p);
  });
});

describe('las 4 semanas cumplen los criterios', () => {
  for (let n = 0; n < 4; n++) {
    it(`semana ${n + 1}`, () => {
      const dias = planSemana(lunesSemana(n), INICIO);
      const fallos = equilibrio(dias).filter((c) => !c.ok);
      expect(fallos).toEqual([]);
      const c = contarProteinas(dias);
      expect(c.legumbre).toBe(4);
      expect(c['pescado-blanco'] + c['pescado-azul']).toBe(4);
      expect(c['pescado-azul']).toBe(2);
      expect(c['carne-blanca'] + c['carne-roja']).toBeLessThanOrEqual(3);
      expect(c.huevo).toBe(2);
    });
  }
  it('entre semana nada pasa de 40 minutos', () => {
    for (const s of SEMANAS)
      for (const d of s.dias.slice(0, 5))
        for (const id of [d.comida, d.cena]) expect(receta(id)!.minutos, `semana ${s.numero}: ${id}`).toBeLessThanOrEqual(40);
  });
  it('desayuno solo en fin de semana', () => {
    for (const s of SEMANAS) s.dias.forEach((d, i) => expect(!!d.desayuno, `semana ${s.numero} día ${i + 1}`).toBe(i >= 5));
  });
});

describe('ciclo y cambios', () => {
  it('semana del ciclo y vuelta a empezar', () => {
    expect(semanaDelCiclo(parse('2026-10-15'), INICIO)).toBe(0);
    expect(semanaDelCiclo(parse('2026-10-19'), INICIO)).toBe(1);
    expect(semanaDelCiclo(parse('2026-11-09'), INICIO)).toBe(0);
    expect(semanaDelCiclo(parse('2026-10-05'), INICIO)).toBe(3);
    expect(semanaDelCiclo(parse('2026-10-15'), inicioParaSemana(parse('2026-10-15'), 2))).toBe(2);
  });
  it('un cambio de plato solo afecta a ese día y se nota en la compra', () => {
    const cambios = new Map([[claveCambio('2026-10-12', 'cena'), 'sardinas-horno']]);
    expect(planDia(parse('2026-10-12'), INICIO, cambios).cena.id).toBe('sardinas-horno');
    expect(planDia(parse('2026-10-12'), INICIO, cambios).cenaCambiada).toBe(true);
    expect(planDia(parse('2026-10-19'), INICIO, cambios).cena.id).not.toBe('sardinas-horno');
    const lista = listaCompra(planSemana(parse('2026-10-12'), INICIO, cambios));
    expect(lista.find((a) => a.nombre === 'Sardinas limpias y abiertas')?.usos).toEqual(['Lun cena']);
  });
  it('lista de la compra agrupada, sin duplicados y con los básicos', () => {
    const lista = listaCompra(planSemana(lunesSemana(0), INICIO));
    const nombres = lista.map((a) => a.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    expect(nombres).toContain('Leche entera (niño)');
    expect(lista.find((a) => a.nombre === 'Huevos')?.usos).toEqual(['Mar cena', 'Sáb cena']);
  });
  it('alternativas: misma proteína primero y, entre semana, solo recetas rápidas', () => {
    const a = alternativas(receta('merluza-patata-calabacin')!, false);
    expect(a.misma.every((r) => r.proteina === 'pescado-blanco' && r.minutos <= 40)).toBe(true);
    expect(a.otras.some((r) => r.id === 'muslos-pollo-asados')).toBe(false);
  });
});
