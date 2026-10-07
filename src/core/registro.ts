// Módulos instalados en la app. Para añadir un proyecto nuevo: impórtalo y añádelo aquí.
import type { ModuloApp } from './modulos';
import { moduloHogar } from '../modulos/hogar';
import { moduloCafe } from '../modulos/cafe';

export const MODULOS: ModuloApp[] = [moduloHogar, moduloCafe];

/** Módulos fijados en la barra inferior (máximo 3); el resto se abre desde «Más». */
export const FIJADOS = ['hogar', 'cafe'];
