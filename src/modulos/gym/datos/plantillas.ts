// Rutinas de ejemplo para empezar (se pueden usar tal cual o duplicar y adaptar). Pautas generales
// para principiantes: 2-4 series por ejercicio, rangos de 6-15 repeticiones y dejando 1-3 en reserva.
import type { EjercicioRutina } from '../tipos';

export interface Plantilla {
  id: string;
  nombre: string;
  descripcion: string;
  ejercicios: EjercicioRutina[];
}

const e = (ejercicioId: string, series: number, reps: string): EjercicioRutina => ({ ejercicioId, series, reps });

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'pl-full-a',
    nombre: 'Cuerpo completo A',
    descripcion: 'Para empezar: 2-3 días por semana alternando A y B.',
    ejercicios: [e('sentadilla-goblet', 3, '8-12'), e('press-mancuernas', 3, '8-12'), e('jalon-pecho', 3, '10-12'), e('peso-muerto-rumano-mancuernas', 3, '10-12'), e('elevaciones-laterales', 2, '12-15'), e('plancha', 3, '30 s')],
  },
  {
    id: 'pl-full-b',
    nombre: 'Cuerpo completo B',
    descripcion: 'La otra mitad del cuerpo completo, con máquinas y polea.',
    ejercicios: [e('prensa', 3, '10-12'), e('remo-polea-baja', 3, '10-12'), e('press-hombro-mancuernas', 3, '8-12'), e('hip-thrust', 3, '8-12'), e('curl-mancuernas', 2, '10-15'), e('extension-cuerda', 2, '10-15'), e('dead-bug', 2, '10')],
  },
  {
    id: 'pl-torso',
    nombre: 'Torso',
    descripcion: 'Torso / pierna, 4 días por semana.',
    ejercicios: [e('press-banca', 4, '6-8'), e('remo-barra', 4, '8-10'), e('press-inclinado-mancuernas', 3, '8-12'), e('jalon-pecho', 3, '10-12'), e('elevaciones-laterales', 3, '12-15'), e('curl-ez', 2, '10-12'), e('extension-cuerda', 2, '10-12')],
  },
  {
    id: 'pl-pierna',
    nombre: 'Pierna',
    descripcion: 'Torso / pierna, 4 días por semana.',
    ejercicios: [e('sentadilla', 4, '6-8'), e('peso-muerto-rumano', 3, '8-10'), e('prensa', 3, '10-12'), e('curl-femoral-sentado', 3, '10-12'), e('gemelo-pie', 3, '12-15'), e('plancha-lateral', 3, '30 s')],
  },
  {
    id: 'pl-empuje',
    nombre: 'Empuje',
    descripcion: 'Empuje / tirón / pierna: pecho, hombro y tríceps.',
    ejercicios: [e('press-banca', 4, '6-10'), e('press-hombro-mancuernas', 3, '8-12'), e('press-inclinado-mancuernas', 3, '8-12'), e('elevaciones-laterales', 3, '12-15'), e('extension-cuerda', 3, '10-12'), e('fondos-triceps', 2, 'al fallo')],
  },
  {
    id: 'pl-tiron',
    nombre: 'Tirón',
    descripcion: 'Empuje / tirón / pierna: espalda y bíceps.',
    ejercicios: [e('dominadas', 3, 'al fallo'), e('remo-barra', 4, '6-10'), e('jalon-neutro', 3, '10-12'), e('face-pull', 3, '12-15'), e('curl-barra', 3, '8-12'), e('curl-martillo', 2, '10-12')],
  },
  {
    id: 'pl-corredor',
    nombre: 'Fuerza para correr',
    descripcion: 'Pierna a una pierna, tendón de Aquiles y core: complementa el plan de running.',
    ejercicios: [e('sentadilla-bulgara', 3, '8-10'), e('peso-muerto-unilateral', 3, '8-10'), e('gemelo-excentrico', 3, '15'), e('puente-una-pierna', 3, '10-12'), e('step-up', 2, '10'), e('plancha-lateral', 3, '30 s'), e('copenhagen', 2, '20 s')],
  },
  {
    id: 'pl-casa',
    nombre: 'En casa sin material',
    descripcion: 'Para los días que no da tiempo a ir al gimnasio.',
    ejercicios: [e('sentadilla-corporal', 3, '15-20'), e('flexiones', 3, 'al fallo'), e('zancadas-corporal', 3, '10-12'), e('remo-invertido', 3, '8-12'), e('puente-gluteo', 3, '15'), e('plancha', 3, '40 s'), e('burpees', 2, '10')],
  },
];
