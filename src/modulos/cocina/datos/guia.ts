// Guía del módulo Cocina: reglas del niño y criterios del menú, con sus fuentes
// (contrastadas el 15 de octubre de 2026). Ante cualquier duda concreta, manda el pediatra.

export interface Fuente {
  titulo: string;
  url: string;
}

export interface Apartado {
  titulo: string;
  puntos: string[];
}

export const GUIA_NINO: Apartado[] = [
  {
    titulo: 'Lácteos',
    puntos: [
      'Desde los 12 meses puede tomar leche de vaca entera, la misma que el resto de la familia. No hace falta leche «de crecimiento».',
      'En total, unos 500 ml de lácteos al día: vaso de leche, yogur natural sin azúcar y queso tierno o fresco.',
      'Más leche de la cuenta le quita apetito para otros alimentos. El agua es la bebida de las comidas.',
    ],
  },
  {
    titulo: 'Sal y azúcar',
    puntos: [
      'Sin sal añadida: separa su ración antes de salar la de los adultos.',
      'Sin azúcares añadidos antes de los 2 años: nada de galletas, zumos ni yogures azucarados. Este menú no usa miel.',
    ],
  },
  {
    titulo: 'Texturas y atragantamiento',
    puntos: [
      'Alimentos blandos, chafados con tenedor o en bastones que pueda coger. No triturar del todo: así aprende a masticar.',
      'Frutos secos nunca enteros ni a trozos antes de los 5-6 años; molidos o en crema fina, sí.',
      'Uvas, arándanos, cerezas, aceitunas o tomates cherry: sin hueso, pelados y en cuatro trozos a lo largo, nunca enteros ni en rodajas.',
      'Zanahoria y manzana crudas son demasiado duras: cocidas, asadas o ralladas fino.',
      'Siempre sentado, tranquilo y con un adulto delante.',
    ],
  },
  {
    titulo: 'Pescado y huevo',
    puntos: [
      'Hasta los 10 años, nada de pez espada o emperador, atún rojo, tiburón (cazón, marrajo, tintorera…) ni lucio, por el mercurio.',
      'Todo el pescado del menú es de bajo contenido en mercurio: merluza, bacalao, abadejo, dorada, lubina, lenguado, salmón, trucha, sardina, boquerón, caballa y gambas.',
      'Desmiga el pescado revisando las espinas con los dedos.',
      'El huevo, siempre bien cuajado: ni la yema ni la clara líquidas.',
    ],
  },
  {
    titulo: 'Hierro',
    puntos: [
      'Legumbres, carne, pescado y huevo aportan hierro. Acompáñalos de fruta o verdura con vitamina C (mandarina, naranja, kiwi, fresas, tomate o pimiento) para absorberlo mejor.',
    ],
  },
];

export const CRITERIOS_SEMANA: Apartado[] = [
  {
    titulo: 'Lo que cumple cada semana',
    puntos: [
      'Legumbres 4 veces (la AESAN recomienda al menos 4 raciones a la semana).',
      'Pescado 4 veces, 2 de ellas azul (la AESAN, 3 o más, priorizando el azul).',
      'Carne 3 veces como máximo, sobre todo pollo, pavo y conejo; ternera solo una vez cada dos semanas.',
      '2 cenas de huevo: en torno a 3-4 huevos por adulto a la semana (la AESAN, hasta 4).',
      'Verdura en la comida y en la cena todos los días, y fruta de postre.',
      'Aceite de oliva virgen extra como grasa; nada frito en abundancia, ni embutidos, ni bollería.',
    ],
  },
  {
    titulo: 'Para los adultos',
    puntos: [
      'Fruta: 2-3 piezas al día (de postre y entre horas). Verduras y hortalizas: al menos 3 raciones al día.',
      'Un puñado de frutos secos naturales sin sal la mayoría de los días (al menos 3 veces por semana).',
      'Las cantidades no vienen fijadas: ajústalas a vuestro apetito; si queréis más proteína, sube la ración del plato principal.',
    ],
  },
  {
    titulo: 'Conservación',
    puntos: [
      'Lo cocinado en el batch cooking del domingo, mejor consumirlo en 3-4 días; lo que vaya para el jueves en adelante, congélalo en raciones.',
      'Descongela en la nevera, no a temperatura ambiente.',
    ],
  },
];

export const FUENTES: Fuente[] = [
  { titulo: 'Asociación Española de Pediatría · Alimentación en el segundo año de vida', url: 'https://www.aeped.es/enfamilia/salud-en-familia/alimentacion-en-segundo-ano-vida' },
  { titulo: 'AEP · Nota sobre mercurio en el pescado (recomendaciones de la AESAN)', url: 'https://static.aeped.es/cailm_recomendacionesaecosan_mercurio_6d78a38eb8.pdf' },
  { titulo: 'AEP · Comité de Soporte Vital · Atragantamiento', url: 'https://static.aeped.es/atragantamiento_csvaep_final_6bd02592cf.pdf' },
  { titulo: 'AEP · Cómo cortar las uvas para prevenir atragantamientos', url: 'https://www.aeped.es/actualidad/atragantamientos-navidad' },
  { titulo: 'AESAN · Recomendaciones dietéticas saludables y sostenibles (2022)', url: 'https://aesan.gob.es/actualidad/actualidad-noticias/recomendaciones_dieteticas' },
];

/** Pescados de alto contenido en mercurio (AESAN): fuera del menú del niño hasta los 10 años. */
export const PESCADOS_EXCLUIDOS = ['pez espada', 'emperador', 'atún rojo', 'tiburón', 'cazón', 'marrajo', 'tintorera', 'pintarroja', 'mielga', 'lucio'];
/** Alimentos que nunca deben aparecer en lo que se le da al niño (enteros). */
export const RIESGO_ATRAGANTAMIENTO = ['frutos secos', 'cacahuete', 'almendra', 'nuez', 'uva', 'tomate cherry', 'palomitas', 'aceituna', 'caramelo'];
