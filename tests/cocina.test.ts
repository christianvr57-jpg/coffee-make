// Módulo Cocina: coherencia del menú de 4 semanas con los criterios nutricionales y las reglas del niño.
import { describe, expect, it } from 'vitest';
import { addDays, parse } from '../src/core/fechas';
import { RECETAS, receta } from '../src/modulos/cocina/datos/recetas';
import { DESAYUNOS, MERIENDAS, SEMANAS } from '../src/modulos/cocina/datos/menu';
import { PESCADOS_EXCLUIDOS, RIESGO_ATRAGANTAMIENTO } from '../src/modulos/cocina/datos/guia';
import { alternativas, claveCambio, contarProteinas, equilibrio, inicioParaSemana, listaCompra, planDia, planSemana, semanaDelCiclo } from '../src/modulos/cocina/plan';
import { NUTRICION } from '../src/modulos/cocina/datos/nutricion';
import { factorPara, kcalComida, nutrientesReceta, redondear, tablaCantidades, textoCantidad, type AjustesRaciones } from '../src/modulos/cocina/raciones';

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
    // Los frutos secos molidos sí están permitidos (AEP); enteros o en trozos, no.
    for (const r of RECETAS) for (const p of RIESGO_ATRAGANTAMIENTO) expect(r.ingredientes.filter((x) => !/molid/i.test(x.n)).map((x) => x.n.toLowerCase()).join(' '), `${r.id}: ${p}`).not.toContain(p);
  });
});

describe('las 8 semanas cumplen los criterios', () => {
  for (let n = 0; n < 8; n++) {
    it(`semana ${n + 1}`, () => {
      const dias = planSemana(lunesSemana(n), INICIO, new Map(), 8);
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
    expect(semanaDelCiclo(parse('2026-11-09'), INICIO, 4)).toBe(0);
    expect(semanaDelCiclo(parse('2026-11-09'), INICIO, 8)).toBe(4);
    expect(semanaDelCiclo(parse('2026-12-07'), INICIO, 8)).toBe(0);
    expect(semanaDelCiclo(parse('2026-10-05'), INICIO, 4)).toBe(3);
    expect(semanaDelCiclo(parse('2026-10-05'), INICIO, 8)).toBe(7);
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
    expect(nombres).toContain('Leche entera');
    expect(nombres).toContain('Fruta de temporada');
    expect(lista.find((a) => a.nombre === 'Huevos')?.usos).toEqual(['Mar cena', 'Sáb cena']);
  });
  it('alternativas: misma proteína primero y, entre semana, solo recetas rápidas', () => {
    const a = alternativas(receta('merluza-patata-calabacin')!, false);
    expect(a.misma.every((r) => r.proteina === 'pescado-blanco' && r.minutos <= 40)).toBe(true);
    expect(a.otras.some((r) => r.id === 'muslos-pollo-asados')).toBe(false);
  });
});

describe('raciones por kcal', () => {
  const aj: AjustesRaciones = { activo: true, personas: [{ nombre: 'A', kcal: 2400 }, { nombre: 'B', kcal: 1800 }], pctComida: 35, pctCena: 30, ninoEnCompra: true };
  it('todos los ingredientes con gramos están en la tabla de composición', () => {
    const faltan = new Set<string>();
    for (const r of RECETAS) for (const i of r.ingredientes) if (i.g && !NUTRICION[i.n]) faltan.add(i.n);
    expect([...faltan]).toEqual([]);
  });
  it('cada ración de referencia es un plato completo razonable (350-900 kcal)', () => {
    for (const r of RECETAS) {
      const k = nutrientesReceta(r).kcal;
      expect(k, `${r.id}: ${Math.round(k)} kcal`).toBeGreaterThan(350);
      expect(k, `${r.id}: ${Math.round(k)} kcal`).toBeLessThan(900);
      expect(nutrientesReceta(r).prot, `${r.id}: proteína`).toBeGreaterThan(15);
    }
  });
  it('escala todos los ingredientes para llegar a las kcal de cada persona', () => {
    const r = receta('lentejas-estofadas')!;
    expect(kcalComida(aj.personas[0], 'comida', aj)).toBe(840);
    const f = factorPara(r, 840);
    expect(nutrientesReceta(r, f).kcal).toBeCloseTo(840, 0);
    const t = tablaCantidades(r, 'comida', aj, false);
    const lentejas = t.find((x) => x.ingrediente.n === 'Lentejas pardinas')!;
    expect(lentejas.porPersona[0]! / lentejas.porPersona[1]!).toBeCloseTo(2400 / 1800, 5);
    expect(lentejas.total).toBeCloseTo(lentejas.porPersona[0]! + lentejas.porPersona[1]!, 5);
    expect(t.find((x) => x.ingrediente.n === 'Laurel')!.total).toBeUndefined();
  });
  it('cantidades legibles', () => {
    expect(redondear(7.4)).toBe(7);
    expect(redondear(63)).toBe(65);
    expect(redondear(187)).toBe(190);
    expect(textoCantidad('Huevos', 100)).toBe('2 huevos');
    expect(textoCantidad('Huevos', 130)).toBe('2,5 huevos');
    expect(textoCantidad('Aceite de oliva virgen extra', 13.5)).toBe('14 g (1 cda)');
    expect(textoCantidad('Lentejas pardinas', 75)).toBe('75 g en seco (≈ 230 g cocidas)');
    expect(textoCantidad('Patata', 187)).toBe('190 g');
  });
  it('la compra suma gramos de la semana (con la parte del niño)', () => {
    const dias = planSemana(lunesSemana(0), INICIO, new Map(), 8);
    const sin = listaCompra(dias);
    const con = listaCompra(dias, aj);
    expect(sin.find((a) => a.nombre === 'Merluza en lomos')?.g).toBeUndefined();
    const merluza = con.find((a) => a.nombre === 'Merluza en lomos')!.g!;
    const lunesCena = receta('merluza-patata-calabacin')!;
    const factores = aj.personas.reduce((s, p) => s + factorPara(lunesCena, kcalComida(p, 'cena', aj)), 0) + 0.25;
    expect(merluza).toBeCloseTo(170 * factores, 5);
    const sinNino = listaCompra(dias, { ...aj, ninoEnCompra: false }).find((a) => a.nombre === 'Merluza en lomos')!.g!;
    expect(merluza - sinNino).toBeCloseTo(170 * 0.25, 5);
  });
});

describe('gustos: sustituir un plato para siempre', () => {
  it('se aplica en todas las semanas, marca el hueco y los cambios de un día mandan', async () => {
    const { fijarSustituciones, efectiva } = await import('../src/modulos/cocina/plan');
    const base = SEMANAS[0].dias[0].comida;
    const otra = RECETAS.find((r) => r.id !== base && r.proteina === receta(base)!.proteina)!.id;
    fijarSustituciones({ [base]: otra });
    try {
      const p = planDia(lunesSemana(0), INICIO);
      expect(p.comida.id).toBe(otra);
      expect(p.comidaSustituida).toBe(true);
      expect(p.comidaCambiada).toBe(false);
      expect(p.base.comida).toBe(base);
      expect(efectiva(base)).toBe(otra);
      // En la siguiente vuelta del ciclo, también.
      expect(planDia(lunesSemana(8), INICIO).comida.id).toBe(otra);
      // Un cambio de ese día concreto gana a la sustitución.
      const tercera = RECETAS.find((r) => r.id !== base && r.id !== otra)!.id;
      const q = planDia(lunesSemana(0), INICIO, new Map([[claveCambio(INICIO, 'comida'), tercera]]));
      expect(q.comida.id).toBe(tercera);
      expect(q.comidaCambiada).toBe(true);
      expect(q.comidaSustituida).toBe(false);
    } finally {
      fijarSustituciones({});
    }
    expect(planDia(lunesSemana(0), INICIO).comida.id).toBe(base);
  });

  it('las alternativas ponen primero las que os gustan y al final las que no', () => {
    const actual = receta(SEMANAS[0].dias[5].comida)!;
    const { misma } = alternativas(actual, true);
    const fav = misma[misma.length - 1].id;
    const odio = misma[0].id;
    const ordenadas = alternativas(actual, true, { [fav]: 1, [odio]: -1 }).misma;
    expect(ordenadas[0].id).toBe(fav);
    expect(ordenadas[ordenadas.length - 1].id).toBe(odio);
  });
});

describe('modo cocinar', () => {
  it('encuentra los tiempos de cada paso para el temporizador', async () => {
    const { tiemposDePaso } = await import('../src/modulos/cocina/cocinar');
    expect(tiemposDePaso('Sofríe a fuego medio (8 min).')).toEqual([{ etiqueta: '8 min', segundos: 480 }]);
    expect(tiemposDePaso('Hornea 12-15 min a 200 °C')).toEqual([{ etiqueta: '12-15 min', segundos: 720 }]);
    expect(tiemposDePaso('Olla rápida 1 h y luego 10 minutos de reposo').map((t) => t.segundos)).toEqual([3600, 600]);
    expect(tiemposDePaso('Sirve con perejil.')).toEqual([]);
    // Todas las recetas: ningún tiempo absurdo.
    for (const r of RECETAS) for (const p of r.pasos) for (const t of tiemposDePaso(p)) expect(t.segundos, `${r.id}: ${p}`).toBeLessThanOrEqual(2 * 3600);
  });
  it('cantidades para sacar: dos raciones de referencia y la del niño, o las calculadas por kcal', async () => {
    const { ingredientesParaCocinar } = await import('../src/modulos/cocina/cocinar');
    const r = receta('lentejas-estofadas')!;
    const ref = ingredientesParaCocinar(r, 'comida', { activo: false, personas: [], pctComida: 35, pctCena: 30, ninoEnCompra: true });
    expect(ref).toHaveLength(r.ingredientes.length);
    expect(ref.find((i) => i.nombre === 'Laurel')?.cantidad).toBe('al gusto');
    const aj: AjustesRaciones = { activo: true, personas: [{ nombre: 'A', kcal: 2500 }, { nombre: 'B', kcal: 1800 }], pctComida: 35, pctCena: 30, ninoEnCompra: false };
    const kc = ingredientesParaCocinar(r, 'comida', aj);
    const total = tablaCantidades(r, 'comida', aj, false).find((t) => t.ingrediente.n === 'Zanahoria')!.total!;
    expect(kc.find((i) => i.nombre === 'Zanahoria')?.cantidad).toBe(textoCantidad('Zanahoria', total));
  });
});
