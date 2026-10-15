// Menú de 4 semanas en rotación. Cada semana cumple los criterios de la guía (ver tests/cocina.test.ts):
// 4 legumbres, 4 pescados (2 azules), 3 carnes como máximo (roja solo semanas 2 y 4), 2 platos de huevo
// y 1 plato de verdura con lácteo, sin repetir plato en la semana.
// Entre semana el niño come en el colegio: en casa, merienda y cena (la misma cena adaptada).
import type { Ingrediente, SemanaPlan, Toma } from '../tipos';

const AOVE = 'Aceite de oliva virgen extra';
const i = (lista: [string, Ingrediente['c']][]): Ingrediente[] => lista.map(([n, c]) => ({ n, c }));

export const MERIENDAS: Toma[] = [
  { id: 'platano-yogur', texto: 'Plátano en trozos y yogur natural', racion: 'Medio plátano y un yogur natural sin azúcar.', ingredientes: i([['Plátano', 'fruta-verdura'], ['Yogur natural', 'lacteo']]) },
  { id: 'pera-queso', texto: 'Pera madura en gajos finos y queso tierno', racion: 'Media pera y 2-3 bastones de queso tierno.', ingredientes: i([['Pera', 'fruta-verdura'], ['Queso tierno', 'lacteo']]) },
  { id: 'pan-tomate-leche', texto: 'Pan integral sin sal con aceite y tomate rallado, y leche entera', racion: 'Media rebanada en tiras y un vaso pequeño de leche.', ingredientes: i([['Pan integral sin sal', 'cereal-legumbre'], ['Tomate', 'fruta-verdura'], ['Leche entera', 'lacteo'], [AOVE, 'despensa']]) },
  { id: 'mandarina-yogur', texto: 'Mandarina en gajos y yogur natural', racion: 'Una mandarina (gajos partidos por la mitad y sin pepitas) y un yogur natural.', ingredientes: i([['Mandarina', 'fruta-verdura'], ['Yogur natural', 'lacteo']]) },
  { id: 'manzana-asada-leche', texto: 'Manzana asada con canela y leche entera', racion: 'Media manzana asada (cruda es demasiado dura a su edad) y un vaso pequeño de leche.', ingredientes: i([['Manzana', 'fruta-verdura'], ['Leche entera', 'lacteo'], ['Canela', 'despensa']]) },
  { id: 'tortita-aguacate-kiwi', texto: 'Tortita de maíz sin sal con aguacate y kiwi', racion: 'Una tortita con aguacate chafado y medio kiwi en trocitos.', ingredientes: i([['Tortitas de maíz sin sal', 'cereal-legumbre'], ['Aguacate', 'fruta-verdura'], ['Kiwi', 'fruta-verdura']]) },
  { id: 'pan-queso-fruta', texto: 'Pan sin sal con queso fresco y fruta blanda de temporada', racion: 'Media rebanada con queso fresco y unos trocitos de fruta.', ingredientes: i([['Pan integral sin sal', 'cereal-legumbre'], ['Queso fresco', 'lacteo'], ['Fruta de temporada', 'fruta-verdura']]) },
  { id: 'yogur-pera-rallada', texto: 'Yogur natural con pera rallada', racion: 'Un yogur natural y media pera rallada.', ingredientes: i([['Yogur natural', 'lacteo'], ['Pera', 'fruta-verdura']]) },
];

export const DESAYUNOS: Toma[] = [
  { id: 'gachas-avena', texto: 'Gachas de avena con leche entera y plátano chafado', racion: 'Un cuenco pequeño: 2 cucharadas de copos finos de avena cocidos en un vaso de leche, con medio plátano.', ingredientes: i([['Copos de avena', 'cereal-legumbre'], ['Leche entera', 'lacteo'], ['Plátano', 'fruta-verdura']]) },
  { id: 'tostada-aguacate', texto: 'Tostada sin sal con aguacate y leche entera', racion: 'Media rebanada con aguacate chafado, en tiras, y un vaso pequeño de leche.', ingredientes: i([['Pan integral sin sal', 'cereal-legumbre'], ['Aguacate', 'fruta-verdura'], ['Leche entera', 'lacteo']]) },
  { id: 'tostada-tomate-queso', texto: 'Tostada sin sal con tomate rallado y queso fresco, y fruta', racion: 'Media rebanada en tiras y unos trocitos de fruta blanda.', ingredientes: i([['Pan integral sin sal', 'cereal-legumbre'], ['Tomate', 'fruta-verdura'], ['Queso fresco', 'lacteo'], ['Fruta de temporada', 'fruta-verdura']]) },
  { id: 'cereales-leche', texto: 'Leche entera con cereales integrales sin azúcar y fruta', racion: 'Un cuenco pequeño de leche con 2-3 cucharadas de cereales y trocitos de fruta.', ingredientes: i([['Cereales integrales sin azúcar', 'cereal-legumbre'], ['Leche entera', 'lacteo'], ['Fruta de temporada', 'fruta-verdura']]) },
];

const d = (comida: string, cena: string, merienda: string, desayuno?: string) => ({ comida, cena, merienda, desayuno });

export const SEMANAS: SemanaPlan[] = [
  {
    numero: 1,
    dias: [
      d('lentejas-estofadas', 'merluza-patata-calabacin', 'platano-yogur'),
      d('pollo-curry', 'tortilla-calabacin', 'pera-queso'),
      d('garbanzos-espinacas', 'salmon-boniato', 'pan-tomate-leche'),
      d('pasta-bolonesa-pavo', 'crema-calabaza-tostas', 'mandarina-yogur'),
      d('ensalada-alubias-asadas', 'boquerones-horno', 'manzana-asada-leche'),
      d('muslos-pollo-asados', 'revuelto-champinones', 'tortita-aguacate-kiwi', 'gachas-avena'),
      d('arroz-alubias-rojas', 'dorada-horno', 'pan-queso-fruta', 'tostada-aguacate'),
    ],
    lote: [
      'Cuece en la olla rápida lentejas pardinas y alubias blancas y rojas (las alubias, en remojo desde el sábado). Guarda en la nevera las del lunes y congela en raciones las del viernes y el domingo.',
      'Prepara un sofrito base de cebolla, pimiento, zanahoria y ajo para las lentejas del lunes y la boloñesa del jueves: un tarro en la nevera y el resto congelado en cubitos.',
      'Asa una bandeja de pimientos rojos, calabacín y cebolla. Congela la mitad para la ensalada de alubias y los boquerones del viernes.',
      'Haz la crema de calabaza y congélala en raciones: el jueves solo hay que calentarla.',
    ],
  },
  {
    numero: 2,
    dias: [
      d('potaje-garbanzos-calabaza', 'bacalao-pisto', 'mandarina-yogur'),
      d('pollo-cuscus', 'huevos-plato', 'pan-queso-fruta'),
      d('lentejas-arroz', 'caballa-horno', 'pera-queso'),
      d('albondigas-ternera', 'pasta-verduras-queso', 'platano-yogur'),
      d('alubias-estofadas', 'salmon-papillote', 'tortita-aguacate-kiwi'),
      d('pavo-champinones-pure', 'tortilla-espinacas', 'manzana-asada-leche', 'cereales-leche'),
      d('guiso-alubias-pintas', 'lubina-horno', 'yogur-pera-rallada', 'tostada-tomate-queso'),
    ],
    lote: [
      'Cuece garbanzos (lunes), lentejas (miércoles) y alubias blancas y pintas (viernes y domingo). Congela en raciones todo lo que se use a partir del jueves.',
      'Haz el pisto del lunes en doble cantidad y congela la mitad: te servirá de base otro día.',
      'Forma las albóndigas de ternera y congélalas crudas separadas con papel de horno; el jueves van directas a la salsa.',
      'Lava y corta las verduras del cuscús del martes y del papillote del viernes (estas, mejor el jueves).',
    ],
  },
  {
    numero: 3,
    dias: [
      d('crema-lentejas-rojas', 'abadejo-costra', 'pera-queso'),
      d('pollo-limon-arroz', 'pastel-verduras', 'platano-yogur'),
      d('ensalada-garbanzos', 'trucha-horno', 'mandarina-yogur'),
      d('espaguetis-bolonesa-lentejas', 'pizza-casera-verduras', 'pan-tomate-leche'),
      d('minestrone-alubias', 'hamburguesas-salmon', 'yogur-pera-rallada'),
      d('conejo-horno', 'revuelto-trigueros-gambas', 'pan-queso-fruta', 'tostada-aguacate'),
      d('fideua-pescado', 'brochetas-pavo', 'manzana-asada-leche', 'gachas-avena'),
    ],
    lote: [
      'Haz la crema de lentejas rojas del lunes: aguanta bien en la nevera hasta el miércoles.',
      'Cuece garbanzos (miércoles), lentejas pardinas (jueves) y alubias blancas (viernes); congela las del jueves y el viernes.',
      'Prepara la masa de pizza, divídela y congélala; descongélala el jueves por la mañana en la nevera.',
      'Ralla zanahoria y pica cebolla y calabacín para el pastel de verduras del martes.',
    ],
  },
  {
    numero: 4,
    dias: [
      d('cocido-ligero', 'merluza-papillote', 'manzana-asada-leche'),
      d('fajitas-pollo', 'frittata-brocoli', 'mandarina-yogur'),
      d('lentejas-curry-arroz', 'sardinas-horno', 'platano-yogur'),
      d('hamburguesas-pollo', 'patatas-rellenas', 'pera-queso'),
      d('potaje-alubias-acelgas', 'salmon-yogur', 'pan-tomate-leche'),
      d('ternera-guisada', 'tortilla-patata', 'yogur-pera-rallada', 'tostada-tomate-queso'),
      d('lasana-lentejas', 'lenguado-pure-calabaza', 'tortita-aguacate-kiwi', 'cereales-leche'),
    ],
    lote: [
      'Deja los garbanzos en remojo el domingo por la noche para el cocido del lunes.',
      'Cuece lentejas pardinas (miércoles y domingo) y alubias blancas (viernes); congela las que no vayas a usar antes del jueves.',
      'Forma las hamburguesas de pollo del jueves y congélalas separadas con papel de horno.',
      'Asa una bandeja de pimientos rojos y congélalos para la tortilla del sábado.',
    ],
  },
];

/** Lo que se compra igual todas las semanas además de lo que piden las recetas. */
export const BASICOS_SEMANA: Ingrediente[] = [
  { n: 'Fruta de temporada variada (postre diario)', c: 'fruta-verdura' },
  { n: 'Cítricos o kiwi (postre de los días de legumbre o carne)', c: 'fruta-verdura' },
  { n: 'Leche entera (niño)', c: 'lacteo' },
  { n: 'Frutos secos naturales sin sal (adultos)', c: 'despensa' },
  { n: AOVE, c: 'despensa' },
];
