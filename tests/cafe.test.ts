// Cálculos del café y motor del temporizador.
import { describe, expect, it } from 'vitest';
import { diasReposo, diferencias, estadoReposo, extraccion, ratio, stock, textoRatio, diagnosticoControl } from '../src/modulos/cafe/calculos';
import { METODOS, metodo } from '../src/modulos/cafe/datos/metodos';
import { avanzar, iniciar, marcar, nuevoTemporizador, pausar, reanudar, terminar, tic, transcurrido } from '../src/modulos/cafe/temporizador';

describe('ratio', () => {
  it('filtro: agua / dosis', () => {
    expect(ratio({ metodo: 'v60', dosis: 15, agua: 250 })).toBeCloseTo(16.667, 2);
    expect(textoRatio(250 / 15)).toBe('1:16,7');
  });
  it('espresso: salida / dosis', () => {
    expect(ratio({ metodo: 'espresso', dosis: 18, rendimiento: 36 })).toBe(2);
  });
});

describe('extracción (EY)', () => {
  it('espresso = TDS × salida / dosis', () => {
    expect(extraccion({ metodo: 'espresso', dosis: 18, rendimiento: 36, tds: 10 })).toBeCloseTo(20, 5);
  });
  it('percolación con bebida pesada', () => {
    expect(extraccion({ metodo: 'v60', dosis: 15, agua: 250, rendimiento: 213, tds: 1.34 })).toBeCloseTo(19.03, 1);
  });
  it('percolación sin pesar: estima la retención (2 g/g)', () => {
    expect(extraccion({ metodo: 'v60', dosis: 15, agua: 250, tds: 1.3 })).toBeCloseTo((1.3 * 220) / 15, 5);
  });
  it('inmersión: usa el agua total', () => {
    expect(extraccion({ metodo: 'prensa', dosis: 30, agua: 500, tds: 1.25 })).toBeCloseTo((1.25 * 500) / 30, 5);
  });
  it('sin TDS no hay extracción', () => {
    expect(extraccion({ metodo: 'v60', dosis: 15, agua: 250 })).toBeUndefined();
  });
  it('control chart clásico', () => {
    expect(diagnosticoControl(1.25, 20, 'filtro')).toEqual({ fuerza: 'ideal', ext: 'ideal' });
    expect(diagnosticoControl(1.0, 17, 'filtro')).toEqual({ fuerza: 'débil', ext: 'subextraído' });
    expect(diagnosticoControl(1.5, 23, 'filtro')).toEqual({ fuerza: 'fuerte', ext: 'sobreextraído' });
  });
});

describe('reposo', () => {
  const cafe = { fechaTueste: '2026-10-01', congelaciones: [] as { desde: string; hasta?: string }[], tueste: 'claro' as const };
  it('cuenta días desde el tueste', () => {
    expect(diasReposo(cafe, new Date(2026, 9, 11, 12))).toBe(10);
  });
  it('descuenta los días congelado', () => {
    const c = { ...cafe, congelaciones: [{ desde: '2026-10-03', hasta: '2026-10-08' }] };
    expect(diasReposo(c, new Date(2026, 9, 11, 12))).toBe(5);
    const sigue = { ...cafe, congelaciones: [{ desde: '2026-10-05' }] };
    expect(diasReposo(sigue, new Date(2026, 9, 20, 12))).toBe(4);
  });
  it('ventana según uso y tueste', () => {
    expect(estadoReposo(cafe, 'filtro', new Date(2026, 9, 4, 12)).estado).toBe('temprano');
    expect(estadoReposo(cafe, 'filtro', new Date(2026, 9, 12, 12)).estado).toBe('optimo');
    expect(estadoReposo(cafe, 'espresso', new Date(2026, 9, 12, 12)).estado).toBe('temprano');
  });
});

describe('stock y diferencias', () => {
  it('descuenta las dosis', () => {
    const preps = [{ cafeId: 'a', dosis: 15 }, { cafeId: 'a', dosis: 18 }, { cafeId: 'b', dosis: 20 }, { cafeId: 'a', dosis: 15, borrado: 1 }];
    expect(stock({ id: 'a', pesoG: 250 }, preps)).toEqual({ usado: 33, restante: 217 });
  });
  it('detecta qué variable ha cambiado', () => {
    const base = { metodo: 'v60' as const, cafeId: 'a', dosis: 15, agua: 250, molienda: 24, temperatura: 93 };
    expect(diferencias({ ...base, molienda: 22 }, base).map((d) => d.clave)).toEqual(['molienda']);
    expect(diferencias({ ...base, molienda: 22, temperatura: 95 }, base)).toHaveLength(2);
  });
});

describe('plantillas de métodos', () => {
  it('los vertidos acaban en el agua total y van en aumento', () => {
    for (const m of METODOS.filter((x) => x.temporizador)) {
      const agua = Math.round(m.dosis * m.ratio);
      const fases = m.fases(m.dosis, agua);
      const objetivos = fases.map((f) => f.aguaHasta).filter((x): x is number => x !== undefined);
      if (m.id !== 'espresso' && m.id !== 'moka') expect(objetivos[objetivos.length - 1]).toBe(agua);
      for (let i = 1; i < objetivos.length; i++) expect(objetivos[i]).toBeGreaterThan(objetivos[i - 1]);
    }
  });
});

describe('temporizador', () => {
  const fases = metodo('v60').fases(15, 250);
  it('avanza solo las fases cumplidas, aunque la app haya estado en segundo plano', () => {
    let e = iniciar(nuevoTemporizador(fases), 0);
    e = tic(e, 44_000).estado;
    expect(e.faseIdx).toBe(0);
    const r = tic(e, 100_000); // 100 s: bloom (45) + primer vertido (30) cumplidos
    expect(r.cambio).toBe(true);
    expect(r.estado.faseIdx).toBe(2);
    expect(r.estado.reales.map((f) => [f.inicio, f.fin])).toEqual([[0, 45], [45, 75]]);
  });
  it('la última fase no se cierra sola', () => {
    let e = iniciar(nuevoTemporizador(fases), 0);
    e = tic(e, 1_000_000).estado;
    expect(e.faseIdx).toBe(fases.length - 1);
    expect(e.terminado).toBe(false);
  });
  it('las pausas no cuentan', () => {
    let e = iniciar(nuevoTemporizador(fases), 0);
    e = pausar(e, 10_000);
    expect(transcurrido(e, 50_000)).toBe(10);
    e = reanudar(e, 50_000);
    expect(transcurrido(e, 55_000)).toBe(15);
  });
  it('siguiente fase manual, marcas y fin', () => {
    let e = iniciar(nuevoTemporizador(fases), 0);
    e = avanzar(e, 30_000);
    expect(e.faseIdx).toBe(1);
    e = marcar(e, 'Primera gota', 32_000);
    e = terminar(e, 200_000);
    expect(e.terminado).toBe(true);
    expect(e.total).toBe(200);
    expect(e.marcas[0]).toEqual({ nombre: 'Primera gota', t: 32 });
    expect(e.reales.at(-1)).toEqual({ nombre: 'Primer vertido', inicio: 30, fin: 200 });
  });
});
