// Contrato que cumple cada módulo del "segundo cerebro". Añadir un proyecto nuevo
// = crear su carpeta en src/modulos/ con un objeto ModuloApp y registrarlo en registro.ts.
import type { ComponentType } from 'preact';

export interface Seccion {
  id: string;
  nombre: string;
  ruta: string;
}

export interface RutaModulo {
  patron: string;
  vista: ComponentType<{ params: Record<string, string> }>;
  /** Oculta la barra de pestañas (p. ej. el temporizador). */
  pantallaCompleta?: boolean;
}

export interface AccionRapida {
  nombre: string;
  icono: string;
  ruta: string;
}

export interface ResultadoBusqueda {
  titulo: string;
  detalle?: string;
  ruta: string;
  icono?: string;
}

export interface ModuloApp {
  id: string;
  nombre: string;
  icono: string;
  /** Clase CSS que fija el color de acento del módulo (--acento). */
  tema: string;
  rutaInicio: string;
  /** Secciones de la barra superior del módulo. */
  secciones: Seccion[];
  rutas: RutaModulo[];
  /** Tarjeta para la pantalla de Inicio. */
  widgetInicio?: ComponentType;
  accionesRapidas?: AccionRapida[];
  buscar?: (q: string) => Promise<ResultadoBusqueda[]>;
  /** Bloque propio dentro de Ajustes. */
  ajustes?: ComponentType;
  /** Se ejecuta al arrancar: carga de datos en memoria, datos iniciales, etc. */
  iniciar?: () => Promise<void>;
  /** Exportaciones CSV propias del módulo (para abrir en Excel o Numbers). */
  exportarCsv?: () => Promise<{ nombre: string; contenido: string }[]>;
}
