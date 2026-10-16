// Guía general de entrenamiento para 10K (no personal). Lo específico de cada corredor (perfil,
// diagnóstico, plan semanal) va en el plan del entrenador, que vive solo en el dispositivo.
// En las sesiones, {E}, {M}, {T}, {10K}, {I} y {R} se sustituyen por tus zonas de ritmo.
import type { SesionPlan } from '../tipos';

export const SEMAFORO: { nivel: 'verde' | 'ambar' | 'rojo'; titulo: string; puntos: string[] }[] = [
  {
    nivel: 'verde',
    titulo: 'Seguir con el plan',
    puntos: ['Molestia de 0 a 2 sobre 10 que desaparece al calentar.', 'Al día siguiente no estás peor por la mañana.', 'La zancada no cambia.'],
  },
  {
    nivel: 'ambar',
    titulo: 'Ajustar hoy',
    puntos: [
      'Dolor de 3 a 5 durante la sesión o más rigidez al levantarte al día siguiente.',
      'Quita cuestas, saltos y series; acorta o cambia la sesión por bici o natación suave.',
      'Si se repite 3 días seguidos o va a más, se revisa el plan.',
    ],
  },
  {
    nivel: 'rojo',
    titulo: 'Parar y consultar a un profesional',
    puntos: [
      'Dolor de más de 5 sobre 10, que aumenta mientras corres o te hace cojear.',
      'Dolor muy localizado en un hueso, o dolor en reposo o por la noche.',
      'Chasquido o sensación de golpe en el gemelo o el Aquiles.',
      'Rodilla hinchada, que se bloquea o que falla.',
      'Hormigueo o pérdida de fuerza en los brazos, o mareos con el dolor de cuello.',
    ],
  },
];

export const SEMAFORO_NOTA =
  'Se basa en el modelo de monitorización del dolor usado en la rehabilitación de tendinopatías (Silbernagel y colaboradores): se tolera algo de molestia si se calma en 24 horas. Es una guía, no un diagnóstico.';

export const GUIARSE: { sesion: string; como: string }[] = [
  { sesion: 'Rodajes y tiradas largas', como: 'FC como techo (Z2) y RPE 3-4. El ritmo es una consecuencia: si hace calor o viento, ve más lento.' },
  { sesion: 'Umbral y tempo', como: 'Por ritmo, con la FC de control: en repeticiones largas debería acabar en Z4 sin pasar a Z5. Si la FC sube más de lo normal a ese ritmo, puede ser fatiga, calor o deshidratación.' },
  { sesion: 'VO2max y ritmo 10K', como: 'Por ritmo y sensaciones. La FC tarda 1-2 minutos en subir y engaña en repeticiones cortas.' },
  { sesion: 'Cuestas, viento o terreno irregular', como: 'Por RPE. El ritmo deja de ser comparable.' },
  { sesion: 'Potencia del reloj', como: 'Es una estimación de muñeca: sirve para compararte contigo mismo en llano, no para fijar zonas absolutas.' },
];

export const BIBLIOTECA: SesionPlan[] = [
  {
    id: 'rodaje', titulo: 'Rodaje fácil', tipo: 'rodaje',
    calentamiento: 'Empieza más lento de lo que te pide el cuerpo los primeros 10 minutos.',
    principal: '30-60 minutos a {E}.', vuelta: 'Termina andando 2-3 minutos.',
    intensidad: 'Z1-Z2 · RPE 3-4 · puedes hablar en frases completas',
    objetivo: 'Más mitocondrias y capilares y un corazón más eficiente con poco coste de recuperación. Es la base de todo lo demás.',
    nota: 'Si vuelves de un parón, esta será casi la única sesión de las primeras semanas.',
  },
  {
    id: 'rectas', titulo: 'Rectas (strides)', tipo: 'rodaje',
    calentamiento: 'Al final de un rodaje fácil.', principal: '6-8 × 20 segundos acelerando hasta {R}, relajado y sin esprintar.',
    recuperaciones: '60-90 segundos andando o trotando.', vuelta: '5 minutos de trote.',
    intensidad: 'Rápido pero suelto · RPE 7 en cada recta, pero no cansan',
    objetivo: 'Economía de carrera y coordinación neuromuscular sin carga metabólica relevante.',
    nota: 'En llano o con una ligera subida. Evítalas si el Aquiles está en ámbar.',
  },
  {
    id: 'tirada', titulo: 'Tirada larga', tipo: 'tirada',
    calentamiento: 'Los primeros 15 minutos, en la parte lenta de {E}.',
    principal: '60-90 minutos a {E}. Más adelante, los últimos 10-15 minutos a {M}.', vuelta: 'Termina andando.',
    intensidad: 'Z2 · RPE 4 (5 en el tramo final)',
    objetivo: 'Resistencia aeróbica y resistencia muscular y tendinosa. En el 10K, la tirada sirve de soporte; no es la sesión principal.',
    nota: 'La duración crece poco a poco y no debería superar el 25-30 % del volumen semanal.',
  },
  {
    id: 'umbral', titulo: 'Umbral: intervalos largos', tipo: 'calidad',
    calentamiento: '15 minutos a {E} con 3-4 rectas.', principal: '4-5 × 6 minutos (o 3 × 2 km) a {T}.',
    recuperaciones: '60-90 segundos trotando.', vuelta: '10 minutos a {E}.',
    intensidad: 'Z4 al final de cada repetición · RPE 6-7, «cómodamente duro» · acabas sintiendo que podrías hacer una más',
    objetivo: 'Subir la velocidad a la que se estabiliza el lactato. Es lo que más transfiere al 10K en las primeras fases.',
    nota: 'Si tienes que apretar para mantener el ritmo en la última, ibas demasiado rápido.',
  },
  {
    id: 'tempo', titulo: 'Tempo continuo', tipo: 'calidad',
    calentamiento: '15 minutos a {E} con 3-4 rectas.', principal: '20-25 minutos a {T}.', vuelta: '10 minutos a {E}.',
    intensidad: 'Z4 · RPE 7',
    objetivo: 'Umbral de lactato y tolerancia a mantener el ritmo, más exigente mentalmente que los intervalos.',
    nota: 'Se compara bien entre semanas en el mismo recorrido llano.',
  },
  {
    id: 'vo2', titulo: 'VO2max', tipo: 'calidad',
    calentamiento: '15-20 minutos a {E}, 4 rectas y 2-3 minutos de movilidad dinámica.',
    principal: '5-6 × 1000 m o 4-5 × 4 minutos a {I}. Entre 15 y 20 minutos en total a ese ritmo.',
    recuperaciones: '2-3 minutos trotando (entre la mitad y el total del tiempo de cada repetición).', vuelta: '10 minutos a {E}.',
    intensidad: 'Z5 en las últimas repeticiones · RPE 8 · duro pero controlado',
    objetivo: 'Subir el techo aeróbico (VO2max) y la velocidad a la que lo alcanzas.',
    nota: 'Solo una sesión de este tipo por semana y nunca el día después de otro esfuerzo intenso (un partido de pádel, por ejemplo). Mejor en pista o en llano.',
  },
  {
    id: 'especifico', titulo: 'Ritmo específico de 10K', tipo: 'calidad',
    calentamiento: '15-20 minutos a {E} y 4 rectas.', principal: '3 × 3 km o 5 × 2 km a {10K}.',
    recuperaciones: '2-3 minutos trotando.', vuelta: '10 minutos a {E}.',
    intensidad: 'Z4-Z5 · RPE 7-8',
    objetivo: 'Economía y confianza al ritmo de carrera y práctica del ritmo constante.',
    nota: 'Pertenece a las últimas 4-6 semanas antes de competir.',
  },
  {
    id: 'progresivo', titulo: 'Progresivo', tipo: 'rodaje',
    calentamiento: '10 minutos a {E}.', principal: '30-40 minutos bajando el ritmo cada 10 minutos, de {E} hasta {M} y los últimos 5 minutos a {T}.',
    vuelta: '5-10 minutos a {E}.', intensidad: 'De Z2 a Z4 · RPE de 4 a 7',
    objetivo: 'Estímulo moderado útil en semanas de transición, con poco coste muscular.',
    nota: 'No cuenta como rodaje fácil: es media sesión de calidad.',
  },
  {
    id: 'cuestas', titulo: 'Cuestas cortas', tipo: 'calidad',
    calentamiento: '15 minutos a {E}.', principal: '8-10 × 10-12 segundos en una cuesta empinada, fuerte y con buena técnica.',
    recuperaciones: 'Completa: 1,5-2 minutos bajando andando.', vuelta: '10 minutos a {E}.',
    intensidad: 'Máxima pero corta: no hay fatiga metabólica',
    objetivo: 'Potencia y reclutamiento muscular, que son la base de la economía de carrera.',
    nota: 'Solo con el Aquiles y el gemelo en verde durante al menos 2 semanas: cargan mucho el tendón.',
  },
];

export const FUERZA = {
  principios: [
    '2 sesiones por semana. Una de mantenimiento basta en las semanas de afinamiento.',
    'Días duros duros y días fáciles fáciles: la pierna pesada va el mismo día que la calidad (después) o junto a otro deporte intenso, nunca en las 24-48 horas previas a una sesión clave.',
    'Deja 2-3 repeticiones en reserva y no llegues al fallo. Ejecución lenta y controlada.',
    'Sube la carga cuando completes todas las series con buena técnica y sin aumento de molestias al día siguiente.',
  ],
  bloques: [
    {
      titulo: 'A · Pierna y tendón',
      ejercicios: [
        ['Elevación de talones de pie con carga (gemelo)', '3-4 × 8-12 · 3 s subir, 3 s bajar'],
        ['Elevación de talones sentado con carga (sóleo)', '3-4 × 10-15 · el sóleo soporta mucha carga al correr'],
        ['Sentadilla búlgara o split squat', '3 × 6-10 por pierna · en un rango sin dolor de rodilla'],
        ['Peso muerto rumano', '3 × 6-8'],
        ['Hip thrust', '3 × 8-10'],
        ['Elevación de punteras (tibial anterior)', '2 × 15-20'],
        ['Plancha Copenhague (aductores)', '2-3 × 20-30 s por lado'],
      ] as [string, string][],
    },
    {
      titulo: 'B · Estabilidad, pie y tren superior',
      ejercicios: [
        ['Step-up alto controlado', '3 × 8 por pierna'],
        ['Puente de isquios a una pierna', '3 × 8-10 por pierna'],
        ['Press Pallof', '3 × 10 por lado'],
        ['Dead bug', '3 × 8 por lado'],
        ['Remo con cable o mancuerna y face pull', '3 × 10-12 · descarga cervical y postura escapular'],
        ['Pie corto y toe yoga', '2 × 10 · musculatura intrínseca del pie'],
        ['Movilidad torácica y cervical suave', '5 minutos · sin forzar rangos dolorosos'],
      ] as [string, string][],
    },
  ],
  adaptaciones: [
    ['Aquiles o gemelo en ámbar', 'Cambia las elevaciones dinámicas por isometrías: 5 × 30-45 s a esfuerzo alto pero tolerable (≤3/10). Sin saltos ni cuestas. La evidencia del efecto analgésico de la isometría es mixta: si no te alivia, no insistas.'],
    ['Rodilla molesta', 'Cambia la búlgara por sentadilla española o wall sit isométrico (5 × 45 s), limitando el rango a lo que no duele. Evita bajadas largas en los rodajes.'],
    ['Cervical o trapecios cargados', 'Prioriza remo, face pull y movilidad. Revisa la tensión de hombros al correr: brazos relajados y manos sueltas.'],
    ['Pliometría (saltos)', 'Saltos cortos sobre los tobillos (pogo) o comba, 2-3 × 20 s, solo cuando el Aquiles lleve 2 semanas en verde. Introduce poco a poco.'],
  ] as [string, string][],
};

/** Recomendaciones con su nivel de evidencia. `porKg` permite calcular la cantidad con tu peso. */
export const NUTRICION: { tema: string; texto: string; evidencia: string; porKg?: { min: number; max?: number; unidad: string; que: string } }[] = [
  { tema: 'Antes de una sesión exigente', texto: 'Entre 1 y 4 g de hidratos por kg de peso, 1-4 horas antes. Si comes más cerca, algo pequeño y fácil de digerir.', evidencia: 'Consenso (ACSM, 2016)', porKg: { min: 1, max: 4, unidad: 'g', que: 'de hidratos' } },
  { tema: 'Durante', texto: 'En sesiones de menos de 60-75 minutos no hace falta. En tiradas de más de 75-90 minutos, 30-60 g de hidratos por hora.', evidencia: 'Sólida' },
  { tema: 'Después', texto: 'Entre 25 y 35 g de proteína más hidratos. Si vuelves a entrenar en menos de 8 horas (doble sesión), 1-1,2 g de hidratos por kg y hora durante las primeras 4 horas.', evidencia: 'Sólida' },
  { tema: 'Proteína diaria', texto: 'Unos 1,6 g por kg al día en 4 tomas, una de ellas antes de dormir. Por encima de esa cifra, el beneficio adicional para la masa muscular es pequeño (metaanálisis de Morton, 2018).', evidencia: 'Sólida', porKg: { min: 1.6, unidad: 'g', que: 'de proteína al día' } },
  { tema: 'Peso y energía', texto: 'No hagas sesiones clave con un déficit calórico grande. Si quieres bajar peso, hazlo con un déficit moderado y fuera de las fases específicas. La baja disponibilidad energética perjudica el rendimiento, los huesos y los tendones.', evidencia: 'Consenso (RED-S, COI)' },
  { tema: 'Hidratación', texto: 'En sesiones cortas, bebe según la sed. Si hace calor, pésate antes y después: perder más del 2 % del peso empeora el rendimiento. Repón 1,25-1,5 L por kg perdido, con sodio si sudas mucho.', evidencia: 'Consenso' },
  { tema: 'Cafeína', texto: '3 mg por kg 30-60 minutos antes de la competición o de una sesión clave. Pruébala antes en un entreno y evítala por la tarde si te quita sueño.', evidencia: 'Sólida (ISSN, 2021)', porKg: { min: 3, unidad: 'mg', que: 'de cafeína' } },
  { tema: 'Creatina', texto: '3-5 g al día ayudan a ganar fuerza y masa muscular en el gimnasio. En el 10K su beneficio directo es poco probable y puede subir 1-2 kg de agua. Es opcional.', evidencia: 'Sólida para fuerza · hipótesis para 10K' },
  { tema: 'Hierro', texto: 'No lo suplementes sin analítica. Si notas fatiga sin explicación, pide que te midan la ferritina.', evidencia: 'Consenso' },
  { tema: 'Sueño', texto: 'Entre 7 y 9 horas. Si duermes mal varias noches seguidas, la sesión de calidad se mueve o se suaviza: no se pierde.', evidencia: 'Consenso' },
];

export const FASES_GENERICAS: { nombre: string; objetivo: string }[] = [
  { nombre: 'Base aeróbica', objetivo: 'Tolerar volumen con bajo coste: frecuencia de salidas, rodajes fáciles, rectas y fuerza.' },
  { nombre: 'Umbral de lactato', objetivo: 'Correr más rápido sin acumular lactato: tempos e intervalos largos a ritmo de umbral.' },
  { nombre: 'VO2max y velocidad aeróbica', objetivo: 'Subir el techo aeróbico con intervalos de 3-5 minutos.' },
  { nombre: 'Ritmo específico de 10K', objetivo: 'Acostumbrarse al ritmo objetivo con repeticiones de 1-3 km.' },
  { nombre: 'Afinamiento', objetivo: 'Bajar volumen manteniendo intensidad para llegar fresco a la carrera.' },
];
