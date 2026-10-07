// Diagnóstico de extracción y léxico de la rueda.
import { describe, expect, it } from 'vitest';
import { diagnosticar } from '../src/modulos/cafe/diagnostico';
import { INDICE_SABORES, RUEDA } from '../src/modulos/cafe/datos/rueda';
import type { Equipo, Preparacion } from '../src/modulos/cafe/modelo';

const c40 = { id: 'c40', molino: { escala: 'clics', min: 0, max: 45, paso: 1, manual: true } } as Equipo;
const g5 = { id: 'g5', molino: { escala: 'numero', min: 1, max: 36, paso: 1, manual: false } } as Equipo;
const v60 = (x: Partial<Preparacion>): Partial<Preparacion> & Pick<Preparacion, 'metodo'> => ({ metodo: 'v60', dosis: 15, agua: 250, molienda: 24, temperatura: 93, sintomas: [], ...x });
const esp = (x: Partial<Preparacion>): Partial<Preparacion> & Pick<Preparacion, 'metodo'> => ({ metodo: 'espresso', dosis: 18, rendimiento: 36, molienda: 10, temperatura: 93, sintomas: [], ...x });

describe('diagnóstico en filtro', () => {
  it('agrio y rápido → más fino, con el cambio concreto', () => {
    const d = diagnosticar(v60({ sintomas: ['agrio'], tiempoTotal: 130 }), { molino: c40 });
    expect(d.lectura).toMatch(/subextracción/);
    expect(d.sugerencias[0].cambio).toEqual({ molienda: 22 });
  });
  it('agrio pero ya lento → sube temperatura en vez de moler más fino', () => {
    const d = diagnosticar(v60({ sintomas: ['agrio'], tiempoTotal: 250 }), { molino: c40 });
    expect(d.sugerencias[0].cambio).toEqual({ temperatura: 95 });
  });
  it('amargo y lento → más grueso', () => {
    const d = diagnosticar(v60({ sintomas: ['amargo'], tiempoTotal: 260 }), { molino: c40 });
    expect(d.lectura).toMatch(/sobreextracción/);
    expect(d.sugerencias[0].cambio).toEqual({ molienda: 26 });
  });
  it('astringente en tiempo → menos agitación (técnica, sin cambio numérico)', () => {
    const d = diagnosticar(v60({ sintomas: ['astringente'], tiempoTotal: 190 }), { molino: c40 });
    expect(d.sugerencias[0].id).toBe('agitacion');
  });
  it('agrio y amargo a la vez → extracción desigual', () => {
    const d = diagnosticar(v60({ sintomas: ['agrio', 'amargo'] }));
    expect(d.lectura).toBe('Extracción desigual');
  });
  it('aguado → menos agua (concentración, no extracción)', () => {
    const d = diagnosticar(v60({ sintomas: ['aguado'] }));
    expect(d.lectura).toBe('Poca concentración');
    expect(d.sugerencias[0].cambio?.agua).toBeLessThan(250);
  });
  it('el TDS manda sobre la intuición', () => {
    const d = diagnosticar(v60({ tds: 1.05, rendimiento: 215, sintomas: [] }));
    expect(d.lectura).toMatch(/subextracción/);
  });
  it('dulce y equilibrado → vas bien', () => {
    const d = diagnosticar(v60({ sintomas: ['dulce', 'equilibrado'] }));
    expect(d.sugerencias.map((s) => s.id)).toEqual(['bien']);
  });
  it('tueste oscuro amargo → baja temperatura', () => {
    const d = diagnosticar(v60({ sintomas: ['amargo'] }), { cafe: { tueste: 'oscuro', congelaciones: [] } as never });
    expect(d.sugerencias[0].id).toBe('oscuro');
  });
  it('café demasiado fresco → aviso de reposo', () => {
    const hoy = new Date();
    const hace3 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 3, 12);
    const fecha = `${hace3.getFullYear()}-${String(hace3.getMonth() + 1).padStart(2, '0')}-${String(hace3.getDate()).padStart(2, '0')}`;
    const d = diagnosticar(v60({ sintomas: ['agrio'] }), { cafe: { tueste: 'claro', fechaTueste: fecha, congelaciones: [] } as never });
    expect(d.sugerencias[0].id).toBe('fresco');
  });
});

describe('diagnóstico en espresso', () => {
  it('agrio y rápido → más fino en el G5', () => {
    const d = diagnosticar(esp({ sintomas: ['agrio'], tiempoTotal: 19 }), { molino: g5 });
    expect(d.sugerencias[0].cambio).toEqual({ molienda: 9 });
  });
  it('agrio en tiempo → alargar la salida', () => {
    const d = diagnosticar(esp({ sintomas: ['agrio'], tiempoTotal: 28 }), { molino: g5 });
    expect(d.sugerencias[0].cambio?.rendimiento).toBeGreaterThan(36);
  });
  it('amargo y lento → más grueso', () => {
    const d = diagnosticar(esp({ sintomas: ['amargo'], tiempoTotal: 38 }), { molino: g5 });
    expect(d.sugerencias[0].cambio).toEqual({ molienda: 11 });
  });
  it('sin síntomas pide que marques algo', () => {
    expect(diagnosticar(esp({})).lectura).toMatch(/Marca/);
  });
});

describe('rueda de sabores', () => {
  it('ids únicos y jerárquicos', () => {
    const ids: string[] = [];
    for (const f of RUEDA) {
      ids.push(f.id);
      for (const g of f.hijos) {
        expect(g.id.startsWith(`${f.id}/`)).toBe(true);
        ids.push(g.id);
        for (const m of g.hijos || []) {
          expect(m.id.startsWith(`${g.id}/`)).toBe(true);
          ids.push(m.id);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(INDICE_SABORES.size).toBe(ids.length);
  });
  it('las etiquetas caben en la rueda', () => {
    for (const x of INDICE_SABORES.values()) expect((x.nodo.corto || x.nodo.nombre).length).toBeLessThanOrEqual(16);
  });
});
