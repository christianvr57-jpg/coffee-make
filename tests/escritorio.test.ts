// Ordenador: a qué sección de la barra lateral pertenece cada ruta.
import { describe, expect, it } from 'vitest';
import { seccionDe } from '../src/core/modulos';

const cocina = {
  secciones: [
    { id: 'hoy', nombre: 'Hoy', ruta: '/cocina' },
    { id: 'semana', nombre: 'Semana', ruta: '/cocina/semana' },
    { id: 'recetas', nombre: 'Recetas', ruta: '/cocina/recetas' },
  ],
};

describe('sección activa en la barra lateral', () => {
  it('la ruta exacta marca su sección', () => {
    expect(seccionDe(cocina, '/cocina')?.id).toBe('hoy');
    expect(seccionDe(cocina, '/cocina/semana')?.id).toBe('semana');
  });
  it('una ficha marca la sección de la que cuelga (prefijo más largo)', () => {
    expect(seccionDe(cocina, '/cocina/recetas/lentejas')?.id).toBe('recetas');
    expect(seccionDe(cocina, '/cocina/ajustes')?.id).toBe('hoy');
  });
  it('no confunde rutas que solo empiezan igual', () => {
    expect(seccionDe(cocina, '/cocinero')).toBeUndefined();
    expect(seccionDe(cocina, '/cocina/semanario')?.id).toBe('hoy');
  });
});
