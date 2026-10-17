// Seguimiento de Running (puro, con pruebas en tests/running.test.ts):
//  - semáforo de hoy: con la molestia de hoy, si te levantas peor y las señales de alarma, decide
//    seguir / ajustar / parar según el semáforo de la guía;
//  - cumplimiento del plan semana a semana (planificado frente a hecho y registrado);
//  - evolución semanal de molestias y sueño.
import { addDays, iso, parse } from '../../core/fechas';
import { MOLESTIAS, type RegistroRun, type SemanaPlan } from './tipos';

export type Nivel = 'verde' | 'ambar' | 'rojo';

/** Cómo estás hoy antes de entrenar. */
export interface Chequeo {
  /** Molestia máxima ahora mismo (0-10) en gemelo/Aquiles, rodilla o cuello. */
  molestia: number;
  /** Más rigidez o dolor al levantarte que ayer. */
  peor: boolean;
  /** Alguna señal de alarma: dolor en un hueso, en reposo o de noche, chasquido, rodilla hinchada o cojera. */
  alarma: boolean;
}

export function nivelChequeo(c: Chequeo): Nivel {
  if (c.alarma || c.molestia > 5) return 'rojo';
  if (c.molestia >= 3 || c.peor) return 'ambar';
  return 'verde';
}

/** Días seguidos en ámbar o rojo terminando en `hoy` (la guía pide revisar el plan a los 3). */
export function diasSeguidosAjustando(chequeos: Record<string, Chequeo>, hoy: Date): number {
  let n = 0;
  for (let d = hoy; ; d = addDays(d, -1)) {
    const c = chequeos[iso(d)];
    if (!c || nivelChequeo(c) === 'verde') return n;
    n++;
  }
}

export interface Cumplimiento {
  lunes: string;
  fase?: string;
  planificadas: number;
  hechas: number;
  minPlan: number;
  minHechos: number;
  kmPlan: number;
  kmHechos: number;
}

/** Planificado frente a hecho en cada semana del plan que ya ha empezado. */
export function cumplimiento(semanas: SemanaPlan[], registros: Pick<RegistroRun, 'fecha' | 'minutos' | 'km'>[], hechas: Record<string, unknown>, hoy: Date): Cumplimiento[] {
  const h = iso(hoy);
  return semanas
    .filter((s) => s.lunes <= h)
    .map((s) => {
      const fin = iso(addDays(parse(s.lunes), 6));
      const ses = s.dias.flatMap((d) => d.sesiones).filter((x) => x.tipo !== 'descanso');
      const regs = registros.filter((r) => r.fecha >= s.lunes && r.fecha <= fin);
      return {
        lunes: s.lunes,
        fase: s.fase,
        planificadas: ses.length,
        hechas: ses.filter((x) => hechas[x.id]).length,
        minPlan: ses.reduce((a, x) => a + (x.duracion || 0), 0),
        minHechos: regs.reduce((a, r) => a + (r.minutos || 0), 0),
        kmPlan: Math.round(ses.reduce((a, x) => a + (x.km || 0), 0) * 10) / 10,
        kmHechos: Math.round(regs.reduce((a, r) => a + (r.km || 0), 0) * 10) / 10,
      };
    });
}

export interface SemanaEvolucion {
  desde: string;
  /** Molestia máxima de la semana (registros y semáforos), o null sin datos. */
  molestia: number | null;
  /** Horas de sueño de media, o null sin datos. */
  sueno: number | null;
}

/** Últimas `n` semanas (de 7 días terminando en `hoy`) de molestia máxima y sueño medio. */
export function evolucion(registros: RegistroRun[], chequeos: Record<string, Chequeo>, hoy: Date, n = 8): SemanaEvolucion[] {
  return Array.from({ length: n }, (_, i) => {
    const desde = iso(addDays(hoy, -7 * (n - i) + 1));
    const hasta = iso(addDays(hoy, -7 * (n - i - 1)));
    const regs = registros.filter((r) => r.fecha >= desde && r.fecha <= hasta);
    const molestias = [
      ...regs.flatMap((r) => MOLESTIAS.map(([k]) => r[k]).filter((v): v is number => typeof v === 'number')),
      ...Object.entries(chequeos)
        .filter(([f]) => f >= desde && f <= hasta)
        .map(([, c]) => c.molestia),
    ];
    const suenos = regs.map((r) => r.sueno).filter((v): v is number => typeof v === 'number' && v > 0);
    return {
      desde,
      molestia: molestias.length ? Math.max(...molestias) : null,
      sueno: suenos.length ? Math.round((suenos.reduce((a, b) => a + b, 0) / suenos.length) * 10) / 10 : null,
    };
  });
}
