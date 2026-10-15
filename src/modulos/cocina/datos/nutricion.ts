// Composición por 100 g de alimento crudo y limpio (parte comestible), de USDA FoodData Central,
// base SR Legacy (abril de 2018): https://fdc.nal.usda.gov/ — cada entrada lleva su fdc_id para
// poder comprobarla. Cuando la especie española no está en la base se usa la más parecida y se
// indica (p. ej. merluza → merlán; dorada → sargo/scup; sardina fresca → arenque, misma familia).
// Especias, hierbas secas y levadura no se cuentan (aportan muy poco en las cantidades de uso).

export interface Nutrientes {
  fdc: number;
  kcal: number;
  prot: number;
  grasa: number;
  hc: number;
  /** Alimento de USDA usado, cuando es una aproximación. */
  aprox?: string;
  /** Legumbres: kcal por 100 g ya cocida (para convertir peso seco ↔ cocido). */
  kcalCocida?: number;
}

const n = (fdc: number, kcal: number, prot: number, grasa: number, hc: number, extra: Partial<Nutrientes> = {}): Nutrientes => ({ fdc, kcal, prot, grasa, hc, ...extra });

export const NUTRICION: Record<string, Nutrientes> = {
  // Verduras, hortalizas y frutas
  Cebolla: n(170000, 40, 1.1, 0.1, 9.34),
  'Cebolla morada': n(170000, 40, 1.1, 0.1, 9.34),
  Cebolleta: n(170005, 32, 1.83, 0.19, 7.34),
  Ajo: n(169230, 149, 6.36, 0.5, 33.06),
  Zanahoria: n(170393, 41, 0.93, 0.24, 9.58),
  Patata: n(170026, 77, 2.05, 0.09, 17.49),
  'Pimiento verde': n(170427, 20, 0.86, 0.17, 4.64),
  'Pimiento rojo': n(170108, 26, 0.99, 0.3, 6.03),
  Calabacín: n(169291, 17, 1.21, 0.32, 3.11),
  Limón: n(167746, 29, 1.1, 0.3, 9.32),
  Perejil: n(170416, 36, 2.97, 0.79, 6.33),
  Brócoli: n(170379, 34, 2.82, 0.37, 6.64),
  Tomate: n(170457, 18, 0.88, 0.2, 3.89),
  Pepino: n(168409, 15, 0.65, 0.11, 3.63),
  'Espinacas frescas': n(168462, 23, 2.86, 0.39, 3.63),
  Boniato: n(168482, 86, 1.57, 0.05, 20.12),
  'Judías verdes': n(169961, 31, 1.83, 0.22, 6.97),
  Calabaza: n(169295, 45, 1, 0.1, 11.69),
  Puerro: n(169246, 61, 1.5, 0.3, 14.15),
  Lechuga: n(169249, 15, 1.36, 0.15, 2.87),
  Champiñones: n(169251, 22, 3.09, 0.34, 3.26),
  'Setas variadas': n(168580, 33, 3.31, 0.41, 6.09, { aprox: 'Mushrooms, oyster, raw' }),
  Berenjena: n(169228, 25, 0.98, 0.18, 5.88),
  'Guisantes congelados': n(170016, 77, 5.22, 0.4, 13.62),
  Apio: n(169988, 14, 0.69, 0.17, 2.97),
  Repollo: n(169975, 25, 1.28, 0.1, 5.8),
  Aguacate: n(171705, 160, 2, 14.66, 8.53),
  Acelgas: n(169991, 19, 1.8, 0.2, 3.74),
  'Espárragos trigueros': n(168389, 20, 2.2, 0.12, 3.88),
  Alcachofas: n(169205, 47, 3.27, 0.15, 10.51),
  Manzana: n(171688, 52, 0.26, 0.17, 13.81),

  // Pescado y marisco
  'Merluza en lomos': n(173713, 90, 18.31, 1.31, 0, { aprox: 'Fish, whiting, mixed species, raw (merlán)' }),
  'Pescadilla limpia': n(173713, 90, 18.31, 1.31, 0, { aprox: 'Fish, whiting, mixed species, raw (merlán)' }),
  'Bacalao fresco en lomos': n(171955, 82, 17.81, 0.67, 0),
  'Salmón en lomos': n(175167, 208, 20.42, 13.42, 0),
  'Boquerones limpios y abiertos': n(174182, 131, 20.35, 4.84, 0),
  'Lubina en lomos': n(175142, 97, 18.43, 2, 0),
  'Caballa en lomos': n(175119, 205, 18.6, 13.89, 0),
  'Abadejo en lomos': n(175129, 92, 19.44, 0.98, 0, { aprox: 'Fish, pollock, Atlantic, raw (carbonero)' }),
  'Trucha en filetes': n(173717, 141, 19.94, 6.18, 0),
  'Sardinas limpias y abiertas': n(175116, 158, 17.96, 9.04, 0, { aprox: 'Fish, herring, Atlantic, raw (arenque, misma familia)' }),
  'Lenguado en filetes': n(174196, 70, 12.41, 1.93, 0),
  'Dorada en lomos': n(175141, 105, 18.88, 2.73, 0, { aprox: 'Fish, scup, raw (espárido, misma familia)' }),
  'Jurel limpio': n(173672, 158, 20.07, 7.89, 0, { aprox: 'Fish, mackerel, Pacific and jack, raw (jurel del Pacífico)' }),
  'Gambas peladas': n(175179, 85, 20.1, 0.51, 0),
  Almejas: n(174214, 86, 14.67, 0.96, 3.57),
  'Calamares limpios': n(174223, 92, 15.58, 1.38, 3.08),

  // Carne y huevos
  'Pechuga de pollo': n(171077, 120, 22.5, 2.62, 0),
  'Contramuslo de pollo deshuesado': n(173627, 121, 19.66, 4.12, 0),
  'Muslos de pollo': n(173614, 116, 19.41, 3.71, 0),
  'Carne picada de pollo': n(171116, 143, 17.44, 8.1, 0.04),
  'Carne picada de pavo': n(171505, 148, 19.66, 7.66, 0),
  'Pechuga de pavo': n(174515, 114, 23.34, 2.33, 0),
  'Pavo en dados': n(174515, 114, 23.34, 2.33, 0),
  'Carne picada de ternera': n(174030, 176, 20, 10, 0),
  'Ternera para guisar': n(171206, 128, 21.75, 4.48, 0.16),
  'Filete de ternera': n(174055, 131, 22.09, 4.08, 0),
  'Conejo troceado': n(172521, 136, 20.05, 5.55, 0),
  'Solomillo de cerdo': n(168249, 109, 20.95, 2.17, 0),
  Huevos: n(171287, 143, 12.56, 9.51, 0.72),

  // Lácteos
  'Yogur natural': n(171284, 61, 3.47, 3.25, 4.66),
  'Leche entera': n(171265, 61, 3.15, 3.25, 4.8),
  'Queso fresco': n(170851, 150, 7.54, 10.18, 7.27, { aprox: 'Cheese, ricotta, whole milk (queso fresco tipo Burgos)' }),
  'Queso tierno': n(170844, 373, 24.48, 30.28, 0.68, { aprox: 'Cheese, monterey' }),
  'Queso rallado': n(171251, 393, 26.96, 30.99, 1.44, { aprox: 'Cheese, swiss (emmental)' }),
  'Mozzarella fresca': n(170845, 299, 22.17, 22.14, 2.4),

  // Cereales, pan y legumbres (en crudo / en seco)
  'Lentejas pardinas': n(172420, 352, 24.63, 1.06, 63.35, { kcalCocida: 116 }),
  'Lentejas rojas': n(174284, 358, 23.91, 2.17, 63.1, { kcalCocida: 116 }),
  Garbanzos: n(173756, 378, 20.47, 6.04, 62.95, { kcalCocida: 164 }),
  'Alubias blancas': n(175202, 333, 23.36, 0.85, 60.27, { kcalCocida: 139 }),
  'Alubias rojas': n(173744, 337, 22.53, 1.06, 61.29, { kcalCocida: 127 }),
  'Alubias pintas': n(175199, 347, 21.42, 1.23, 62.55, { kcalCocida: 143 }),
  'Arroz integral': n(169703, 367, 7.54, 3.2, 76.25),
  Arroz: n(169756, 365, 7.13, 0.66, 79.95),
  'Arroz redondo': n(169760, 360, 6.61, 0.58, 79.34),
  'Pasta integral': n(169738, 352, 13.87, 2.93, 73.37),
  'Pasta pequeña': n(168927, 371, 13.04, 1.51, 74.67),
  'Placas de lasaña': n(168927, 371, 13.04, 1.51, 74.67),
  Fideos: n(168927, 371, 13.04, 1.51, 74.67),
  'Pan integral': n(172688, 252, 12.45, 3.5, 42.71),
  'Cuscús integral': n(169699, 376, 12.76, 0.64, 77.43, { aprox: 'Couscous, dry' }),
  'Harina integral': n(168893, 340, 13.21, 2.5, 71.97),
  'Harina de trigo': n(169761, 364, 10.33, 0.98, 76.31),
  'Copos de avena': n(173904, 379, 13.15, 6.52, 67.7),
  'Tortillas de trigo integral': n(167535, 297, 8.01, 7.58, 49.27, { aprox: 'Tortillas, flour' }),
  Quinoa: n(168874, 368, 14.12, 6.07, 64.16),

  // Despensa
  'Aceite de oliva virgen extra': n(171413, 884, 0, 100, 0),
  'Tomate triturado': n(170501, 32, 1.64, 0.28, 7.29),
  'Leche de coco': n(170173, 197, 2.02, 21.33, 2.81),
  'Almendra molida': n(170567, 579, 21.15, 49.93, 21.55),
  Vinagre: n(172240, 19, 0.04, 0, 0.27),
};

/** Gramos de una cucharada sopera de aceite (USDA: 1 tbsp = 13,5 g). */
export const G_CUCHARADA_ACEITE = 13.5;
/** Parte comestible de un huevo mediano-grande (USDA: large egg = 50 g sin cáscara). */
export const G_HUEVO = 50;

export const FUENTE_NUTRICION = { titulo: 'USDA FoodData Central · SR Legacy (2018)', url: 'https://fdc.nal.usda.gov/' };
