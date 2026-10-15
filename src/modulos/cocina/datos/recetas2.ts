// Recetas de las semanas 5 a 8 del ciclo (mismos criterios que las de recetas.ts).
import type { Receta } from '../tipos';
import { AOVE, LEGUMBRE_COCIDA, ing } from './ing';

export const RECETAS_2: Receta[] = [
  // ---------------- Semana 5 ----------------
  {
    id: 'curry-garbanzos', nombre: 'Curry suave de garbanzos y espinacas con arroz', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Garbanzos 70, Arroz 50; v:Espinacas frescas 100, Cebolla 50, Ajo 5, Tomate 80; d:Leche de coco 40, Curry suave en polvo, Cúrcuma, ${AOVE} 8`),
    pasos: [
      'Pon el arroz a cocer.',
      'Pocha cebolla y ajo, añade el curry suave, la cúrcuma y el tomate en dados (5 min).',
      `Incorpora los garbanzos cocidos y la leche de coco con un poco de agua: 10 min. Al final, las espinacas. ${LEGUMBRE_COCIDA}`,
    ],
    nino: { adaptacion: 'Garbanzos chafados con la salsa y el arroz; espinaca picada fina. El curry suave no pica.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'merluza-salsa-verde', nombre: 'Merluza en salsa verde con patatas', proteina: 'pescado-blanco', minutos: 30,
    ingredientes: ing(`p:Merluza en lomos 170; v:Patata 200, Ajo 5, Perejil 8, Guisantes congelados 40; c:Harina de trigo 5; d:${AOVE} 12`),
    pasos: [
      'Cuece la patata en rodajas gruesas 12-15 min.',
      'En una cazuela, dora el ajo picado en el aceite, añade una cucharadita de harina y, poco a poco, un vaso de agua o caldo de pescado, removiendo.',
      'Añade la merluza, los guisantes y el perejil picado: 6-8 min moviendo la cazuela para que ligue la salsa.',
    ],
    nino: { adaptacion: 'Merluza desmigada sin espinas con su salsa; patata y guisantes chafados.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'pollo-ajillo-arroz', nombre: 'Pollo al ajillo con arroz y judías verdes', proteina: 'carne-blanca', minutos: 30,
    ingredientes: ing(`p:Contramuslo de pollo deshuesado 150; c:Arroz 70; v:Ajo 10, Perejil 3, Judías verdes 120, Limón 10; d:${AOVE} 12`),
    pasos: [
      'Cuece el arroz y las judías verdes troceadas.',
      'Dora el pollo en trozos a fuego medio; añade los ajos laminados y, cuando se doren, un chorrito de limón y medio vaso de agua.',
      'Reduce 8-10 min y termina con perejil.',
    ],
    nino: { adaptacion: 'Pollo desmigado con un poco de su jugo (sin trozos de ajo); judías muy cocidas en trocitos.', racion: '3 cucharadas de arroz, unas tiras de pollo y judías.' },
  },
  {
    id: 'tortilla-alcachofa', nombre: 'Tortilla de alcachofas con ensalada de tomate', proteina: 'huevo', minutos: 30, acompanamiento: 'Ensalada de tomate',
    ingredientes: ing(`p:Huevos 100; v:Alcachofas 150, Cebolla 40, Tomate 150, Limón 5; c:Pan integral 40; d:${AOVE} 12`),
    pasos: [
      'Limpia las alcachofas (o usa congeladas), córtalas finas y pócheles con la cebolla 12-15 min.',
      'Mézclalas con los huevos batidos y cuaja la tortilla por los dos lados.',
      'Acompaña con tomate aliñado.',
    ],
    nino: { adaptacion: 'Bien cuajada, en bastones; la alcachofa queda muy tierna.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'hamburguesas-lentejas', nombre: 'Hamburguesas de lentejas con ensalada y boniato', proteina: 'legumbre', minutos: 35, aparato: 'freidora',
    ingredientes: ing(`c:Lentejas pardinas 70, Copos de avena 15; v:Zanahoria 40, Cebolla 30, Ajo 3, Boniato 150, Lechuga 60, Tomate 80; d:Comino, ${AOVE} 10`),
    pasos: [
      `Tritura las lentejas cocidas y bien escurridas con zanahoria rallada, cebolla, ajo, comino y los copos de avena. ${LEGUMBRE_COCIDA}`,
      'Forma hamburguesas (si están blandas, 10 min en la nevera) y hazlas en la freidora de aire 12 min a 190 °C o a la plancha.',
      'Boniato en bastones en la freidora de aire: 15-18 min. Sirve con ensalada.',
    ],
    nino: { adaptacion: 'Hamburguesa en tiras (es blanda y fácil de masticar); boniato en bastones blandos.', racion: 'Media hamburguesa y 3-4 bastones.' },
  },
  {
    id: 'sardinas-plancha', nombre: 'Sardinas a la plancha con patata y ensalada', proteina: 'pescado-azul', minutos: 25,
    ingredientes: ing(`p:Sardinas limpias y abiertas 150; v:Patata 200, Tomate 100, Lechuga 60, Cebolla morada 20, Limón 10; d:${AOVE} 8`),
    pasos: [
      'Cuece la patata en trozos 15 min.',
      'Haz las sardinas abiertas a la plancha muy caliente 2 min por lado.',
      'Sirve con la patata y la ensalada aliñada.',
    ],
    nino: { adaptacion: 'Lomos sin espinas desmigados; patata chafada con un hilo de aceite.', racion: '2-3 sardinas desmigadas y 2 trozos de patata.' },
  },
  {
    id: 'salteado-pavo-brocoli', nombre: 'Salteado de pavo con brócoli, pimiento y arroz', proteina: 'carne-blanca', minutos: 25,
    ingredientes: ing(`p:Pechuga de pavo 140; c:Arroz integral 70; v:Brócoli 120, Pimiento rojo 60, Cebolla 40, Ajo 5; d:Pimentón dulce, ${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      'Saltea el pavo en tiras a fuego fuerte y retíralo.',
      'Saltea el brócoli en arbolitos pequeños, el pimiento y la cebolla (con un chorrito de agua para que se hagan); vuelve a poner el pavo y mezcla con el arroz.',
    ],
    nino: { adaptacion: 'Pavo en tiras muy finas; arbolitos de brócoli bien hechos para coger con la mano.', racion: '3-4 cucharadas de arroz con pavo y 2-3 arbolitos.' },
  },
  {
    id: 'berenjenas-rellenas', nombre: 'Berenjenas rellenas de verduras y queso', proteina: 'vegetal', minutos: 40, aparato: 'horno',
    ingredientes: ing(`v:Berenjena 250, Cebolla 50, Pimiento rojo 50, Tomate 80, Champiñones 60; l:Queso rallado 25, Queso fresco 50; c:Pan integral 40; d:${AOVE} 10`),
    pasos: [
      'Parte las berenjenas por la mitad, haz cortes en la pulpa y hornéalas 20 min a 200 °C (o 8 min en el microondas).',
      'Vacía la pulpa y saltéala con cebolla, pimiento, champiñón y tomate picados.',
      'Rellena, mezcla con el queso fresco, cubre con queso rallado y gratina 10 min.',
    ],
    nino: { adaptacion: 'Relleno chafado (sin la piel de la berenjena) con pan sin sal en tiras.', racion: 'Media berenjena pequeña de relleno y una tira de pan.' },
  },
  {
    id: 'alubias-almejas', nombre: 'Alubias blancas con almejas', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Alubias blancas 70, Pan integral 30; p:Almejas 60; v:Cebolla 50, Pimiento verde 40, Ajo 5, Perejil 5, Puerro 40; d:Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Deja las almejas en agua fría con sal 30 min para que suelten la arena.',
      `Sofríe cebolla, puerro, pimiento y ajo; añade el pimentón, las alubias cocidas, el laurel y agua: 15 min. ${LEGUMBRE_COCIDA}`,
      'Añade las almejas y el perejil y tapa hasta que se abran (3-4 min). Desecha las que no se abran.',
    ],
    nino: { adaptacion: 'Alubias chafadas con su caldo; la almeja, picada muy fina o sin ella (es gomosa).', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'salmon-costra-hierbas', nombre: 'Salmón al horno con costra de hierbas y quinoa', proteina: 'pescado-azul', minutos: 30, aparato: 'horno',
    ingredientes: ing(`p:Salmón en lomos 140; c:Quinoa 50, Pan integral 15; v:Perejil 5, Ajo 3, Limón 10, Calabacín 100, Pimiento rojo 60; d:Eneldo seco, ${AOVE} 8`),
    pasos: [
      'Lava la quinoa y cuécela 12-15 min en el doble de agua.',
      'Mezcla pan rallado, perejil, ajo y ralladura de limón; cubre el salmón y hornea 12 min a 200 °C con el calabacín y el pimiento en dados.',
      'Sirve sobre la quinoa.',
    ],
    nino: { adaptacion: 'Salmón desmigado sin piel ni espinas; quinoa y verduras blandas.', racion: 'Un trozo del tamaño de su palma y 3 cucharadas de quinoa.' },
  },
  {
    id: 'pollo-cazuela-verduras', nombre: 'Pollo en cazuela con verduras y patatas', proteina: 'carne-blanca', minutos: 50,
    ingredientes: ing(`p:Muslos de pollo 170; v:Patata 180, Zanahoria 80, Guisantes congelados 50, Cebolla 60, Pimiento rojo 50, Ajo 5; d:Tomate triturado 60, Laurel, Tomillo, ${AOVE} 12`),
    pasos: [
      'Dora el pollo en trozos en la cazuela y retíralo.',
      'Sofríe cebolla, pimiento y ajo, añade el tomate, el pollo, el laurel, el tomillo y agua: 25 min.',
      'Añade patata y zanahoria en trozos y los guisantes: 15-20 min más.',
    ],
    nino: { adaptacion: 'Pollo sin piel ni huesos, desmigado; verduras y patata chafadas en la salsa.', racion: '2-3 cucharadas de pollo y 3 de verdura.' },
  },
  {
    id: 'pisto-huevo', nombre: 'Pisto con huevo y pan', proteina: 'huevo', minutos: 35,
    ingredientes: ing(`p:Huevos 100; v:Calabacín 120, Berenjena 80, Pimiento rojo 60, Pimiento verde 50, Cebolla 60, Ajo 5; c:Pan integral 50; d:Tomate triturado 100, ${AOVE} 12`),
    pasos: [
      'Pocha cebolla, ajo y pimientos 10 min; añade berenjena y calabacín en dados 10 min y el tomate 10 min más.',
      'Haz unos huecos y casca los huevos; tapa hasta que cuajen.',
      'La ración del niño, con el huevo completamente cuajado.',
    ],
    nino: { adaptacion: 'Huevo bien cuajado troceado y mezclado con el pisto; pan en tiras.', racion: 'Un huevo con 3 cucharadas de pisto.' },
  },
  {
    id: 'mujaddara', nombre: 'Arroz con lentejas y cebolla dorada (mujaddara)', proteina: 'legumbre', minutos: 40, acompanamiento: 'Ensalada de pepino y yogur',
    ingredientes: ing(`c:Lentejas pardinas 60, Arroz 50; v:Cebolla 120, Pepino 80; l:Yogur natural 60; d:Comino, ${AOVE} 12`),
    pasos: [
      'Pocha mucha cebolla en tiras a fuego suave hasta que esté dorada y dulce (20 min); reserva la mitad.',
      'Añade comino, el arroz, las lentejas cocidas y el doble de agua que de arroz: 15-18 min.',
      'Sirve con la cebolla reservada por encima y una ensalada de pepino con yogur.',
    ],
    nino: { adaptacion: 'Arroz y lentejas chafados; pepino pelado en bastones finos con yogur.', racion: '4 cucharadas.' },
  },
  {
    id: 'bacalao-vizcaina', nombre: 'Bacalao a la vizcaína suave con arroz', proteina: 'pescado-blanco', minutos: 40,
    ingredientes: ing(`p:Bacalao fresco en lomos 170; c:Arroz 50; v:Pimiento rojo 120, Cebolla 80, Ajo 5; d:Tomate triturado 80, Pimentón dulce, ${AOVE} 12`),
    pasos: [
      'Salsa: pocha cebolla, ajo y pimiento rojo 15 min, añade pimentón y tomate y cuece 10 min; tritúrala.',
      'Pon los lomos de bacalao fresco en la salsa y cuece tapado 8 min.',
      'Sirve con arroz blanco.',
    ],
    nino: { adaptacion: 'Bacalao desmigado sin espinas con la salsa (no pica) y el arroz.', racion: '3-4 cucharadas de pescado con salsa y 3 de arroz.' },
  },

  // ---------------- Semana 6 ----------------
  {
    id: 'garbanzos-horno-boniato', nombre: 'Garbanzos al horno con boniato y espinacas', proteina: 'legumbre', minutos: 35, aparato: 'horno',
    ingredientes: ing(`c:Garbanzos 70, Pan integral 30; v:Boniato 150, Cebolla morada 40, Espinacas frescas 80, Limón 10; l:Yogur natural 50; d:Pimentón dulce, Comino, ${AOVE} 12`),
    pasos: [
      `Mezcla los garbanzos cocidos y bien secos con el boniato en dados, la cebolla, pimentón, comino y aceite. ${LEGUMBRE_COCIDA}`,
      'Hornea 25 min a 200 °C removiendo a mitad.',
      'Mezcla con las espinacas crudas (se ablandan con el calor) y sirve con salsa de yogur y limón.',
    ],
    nino: { adaptacion: 'Garbanzos chafados (al horno quedan más duros: aplástalos bien) y boniato blando; espinaca picada.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'pescadilla-pure', nombre: 'Pescadilla al horno con limón y puré de patata', proteina: 'pescado-blanco', minutos: 30, aparato: 'horno',
    ingredientes: ing(`p:Pescadilla limpia 180; v:Patata 220, Limón 10, Ajo 3, Perejil 3, Judías verdes 100; l:Leche entera 50; d:${AOVE} 10`),
    pasos: [
      'Puré: cuece la patata 20 min y cháfala con leche caliente y un hilo de aceite.',
      'Hornea la pescadilla abierta con ajo, perejil y limón 10-12 min a 200 °C.',
      'Cuece las judías verdes 8-10 min.',
    ],
    nino: { adaptacion: 'Pescadilla desmigada sin espinas con el puré.', racion: 'Un trozo del tamaño de su palma y 3 cucharadas de puré.' },
  },
  {
    id: 'pechugas-rellenas', nombre: 'Pechugas rellenas de espinacas y queso con patata asada', proteina: 'carne-blanca', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Pechuga de pollo 150; v:Espinacas frescas 80, Ajo 3, Patata 200, Tomate 80; l:Queso fresco 40; d:Orégano, ${AOVE} 12`),
    pasos: [
      'Patata en gajos con aceite al horno: 25 min a 200 °C.',
      'Abre las pechugas en libro, rellénalas con espinacas salteadas con ajo y queso fresco, y ciérralas con un palillo.',
      'Hornéalas 15-18 min junto a las patatas (sin palillo para el niño).',
    ],
    nino: { adaptacion: 'Pechuga en tiras finas con su relleno; patata blanda.', racion: 'Unas tiras de pollo y 3 gajos de patata.' },
  },
  {
    id: 'shakshuka', nombre: 'Huevos en salsa de tomate y pimiento (shakshuka)', proteina: 'huevo', minutos: 30, acompanamiento: 'Pan integral',
    ingredientes: ing(`p:Huevos 100; v:Pimiento rojo 100, Cebolla 60, Ajo 5, Perejil 3; c:Pan integral 60; d:Tomate triturado 150, Comino, Pimentón dulce, ${AOVE} 12`),
    pasos: [
      'Pocha cebolla, pimiento y ajo 10 min; añade comino, pimentón y el tomate y cuece 10 min.',
      'Haz huecos, casca los huevos y tapa hasta que cuajen (el del niño, del todo).',
      'Sirve con pan para mojar.',
    ],
    nino: { adaptacion: 'Huevo totalmente cuajado troceado en la salsa; pan sin sal en tiras.', racion: 'Un huevo con 2-3 cucharadas de salsa.' },
  },
  {
    id: 'ensalada-lentejas-aguacate', nombre: 'Ensalada de lentejas con aguacate, tomate y pimiento', proteina: 'legumbre', minutos: 15,
    ingredientes: ing(`c:Lentejas pardinas 70, Pan integral 30; v:Aguacate 50, Tomate 100, Pimiento rojo 60, Pepino 60, Cebolla morada 20, Perejil 3, Limón 10; d:${AOVE} 10`),
    pasos: [
      `Escurre las lentejas cocidas. ${LEGUMBRE_COCIDA}`,
      'Mézclalas con tomate, pimiento, pepino, cebolla morada y aguacate en dados.',
      'Aliña con aceite, limón y perejil.',
    ],
    nino: { adaptacion: 'Lentejas chafadas con aguacate y tomate pelado; sin cebolla cruda.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'caballa-pisto', nombre: 'Caballa a la plancha con pisto de calabacín', proteina: 'pescado-azul', minutos: 30,
    ingredientes: ing(`p:Caballa en lomos 130; v:Calabacín 150, Cebolla 50, Pimiento verde 50, Patata 150; d:Tomate triturado 80, ${AOVE} 8`),
    pasos: [
      'Pisto rápido: pocha cebolla y pimiento, añade calabacín y tomate (20 min).',
      'Cuece la patata en trozos.',
      'Haz los lomos de caballa a la plancha 2-3 min por lado.',
    ],
    nino: { adaptacion: 'Desmiga con mucho cuidado (espinas finas) y mezcla con el pisto.', racion: 'Medio lomo pequeño desmigado y 3 cucharadas de pisto.' },
  },
  {
    id: 'solomillo-cerdo-manzana', nombre: 'Solomillo de cerdo con manzana asada y puré de boniato', proteina: 'carne-roja', minutos: 40, aparato: 'horno',
    ingredientes: ing(`p:Solomillo de cerdo 150; v:Manzana 100, Boniato 200, Cebolla 40, Judías verdes 100; d:Romero, Canela, ${AOVE} 10`),
    pasos: [
      'Asa el boniato en trozos y la manzana en gajos con la cebolla 25 min a 200 °C.',
      'Dora el solomillo entero por todos los lados y termínalo en el horno 12-15 min; deja reposar 5 min y córtalo.',
      'Chafa el boniato con un hilo de aceite. Cuece las judías verdes.',
    ],
    nino: { adaptacion: 'Solomillo en tiras muy finas (o desmigado); puré de boniato y manzana asada chafada.', racion: '2-3 tiras finas de carne, 3 cucharadas de puré y un poco de manzana.' },
  },
  {
    id: 'risotto-setas', nombre: 'Risotto de setas y queso', proteina: 'vegetal', minutos: 35, acompanamiento: 'Ensalada verde',
    ingredientes: ing(`c:Arroz redondo 80; v:Setas variadas 150, Cebolla 50, Ajo 3, Lechuga 60; l:Queso rallado 25, Leche entera 30; d:${AOVE} 10`),
    pasos: [
      'Sofríe la cebolla y el ajo, añade las setas troceadas y saltea 5 min.',
      'Añade el arroz y ve incorporando caldo de verduras o agua caliente poco a poco, removiendo, 18 min.',
      'Fuera del fuego, añade el queso y un chorro de leche y remueve hasta que quede cremoso.',
    ],
    nino: { adaptacion: 'Arroz cremoso con las setas picadas muy finas.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'chili-sin-carne', nombre: 'Chili suave de alubias rojas con arroz', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Alubias rojas 70, Arroz 50; v:Pimiento rojo 60, Pimiento verde 40, Cebolla 50, Ajo 5, Zanahoria 40; l:Yogur natural 40; d:Tomate triturado 100, Comino, Pimentón dulce, ${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      `Sofríe cebolla, pimientos, zanahoria y ajo; añade comino, pimentón y el tomate; incorpora las alubias cocidas y cuece 15 min. ${LEGUMBRE_COCIDA}`,
      'Sirve con arroz y una cucharada de yogur.',
    ],
    nino: { adaptacion: 'Alubias chafadas con el arroz y un poco de yogur (no pica).', racion: '4 cucharadas.' },
  },
  {
    id: 'brochetas-salmon', nombre: 'Brochetas de salmón y verduras con cuscús', proteina: 'pescado-azul', minutos: 25, aparato: 'freidora',
    ingredientes: ing(`p:Salmón en lomos 140; c:Cuscús integral 60; v:Calabacín 80, Pimiento rojo 60, Cebolla 40, Limón 10; d:Eneldo seco, ${AOVE} 6`),
    pasos: [
      'Corta el salmón sin piel en dados y ensártalo con las verduras.',
      'Freidora de aire 10-12 min a 190 °C (o plancha).',
      'Hidrata el cuscús con el mismo volumen de agua hirviendo, 5 min tapado.',
    ],
    nino: { adaptacion: 'Fuera del palillo: salmón desmigado y verduras blandas con el cuscús.', racion: 'Un trozo del tamaño de su palma y 3 cucharadas de cuscús.' },
  },
  {
    id: 'pavo-asado-verduras', nombre: 'Pavo asado con verduras de temporada', proteina: 'carne-blanca', minutos: 60, aparato: 'horno',
    ingredientes: ing(`p:Pechuga de pavo 160; v:Patata 180, Calabaza 120, Cebolla 50, Pimiento rojo 60, Ajo 5; d:Romero, Tomillo, ${AOVE} 12`),
    pasos: [
      'Verduras en trozos grandes en la bandeja con aceite y hierbas.',
      'Pon el pavo entero encima (pechuga en una pieza) y hornea 45 min a 180 °C, regando con su jugo.',
      'Deja reposar 10 min antes de cortar en lonchas.',
    ],
    nino: { adaptacion: 'Pavo en tiras finas jugosas; calabaza y patata chafadas.', racion: 'Unas tiras de pavo y 3-4 trozos de verdura.' },
  },
  {
    id: 'tortilla-puerro-queso', nombre: 'Tortilla de puerro y queso con ensalada', proteina: 'huevo', minutos: 25, acompanamiento: 'Ensalada de lechuga y tomate',
    ingredientes: ing(`p:Huevos 100; v:Puerro 100, Lechuga 60, Tomate 100; l:Queso tierno 20; c:Pan integral 40; d:${AOVE} 12`),
    pasos: [
      'Pocha el puerro en rodajas finas a fuego suave 10 min.',
      'Mézclalo con los huevos batidos y el queso en dados; cuaja por los dos lados.',
      'Sirve con la ensalada.',
    ],
    nino: { adaptacion: 'Bien cuajada, en bastones.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'pasta-garbanzos', nombre: 'Pasta con garbanzos y tomate (pasta e ceci)', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Garbanzos 50, Pasta pequeña 50; v:Cebolla 40, Zanahoria 40, Apio 30, Ajo 5, Espinacas frescas 50; l:Queso rallado 10; d:Tomate triturado 80, Romero, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, zanahoria, apio y ajo picados con una rama de romero.',
      `Añade tomate, los garbanzos cocidos (aplasta la mitad para espesar) y agua; cuando hierva, la pasta pequeña: 10 min. ${LEGUMBRE_COCIDA}`,
      'Al final, espinacas y un poco de queso rallado.',
    ],
    nino: { adaptacion: 'Espeso, con los garbanzos chafados.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'lubina-plancha-salteado', nombre: 'Lubina a la plancha con salteado de verduras y arroz', proteina: 'pescado-blanco', minutos: 30,
    ingredientes: ing(`p:Lubina en lomos 170; c:Arroz 50; v:Calabacín 80, Zanahoria 60, Judías verdes 80, Ajo 5, Limón 10; d:${AOVE} 12`),
    pasos: [
      'Cuece el arroz.',
      'Saltea las verduras en bastones finos con ajo hasta que estén tiernas.',
      'Haz la lubina a la plancha por el lado de la piel 4 min y 1 min por el otro.',
    ],
    nino: { adaptacion: 'Lubina desmigada sin piel ni espinas; verduras en bastones blandos.', racion: 'Un trozo del tamaño de su palma y 3 cucharadas de arroz.' },
  },

  // ---------------- Semana 7 ----------------
  {
    id: 'cuscus-garbanzos', nombre: 'Cuscús con garbanzos y verduras', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Garbanzos 60, Cuscús integral 50; v:Calabacín 80, Zanahoria 60, Calabaza 80, Cebolla 40, Ajo 3; d:Tomate triturado 60, Comino, Cúrcuma, Canela, ${AOVE} 10`),
    pasos: [
      'Rehoga cebolla y ajo con las especias; añade zanahoria, calabaza y calabacín en dados y el tomate.',
      `Cubre con agua y cuece 15 min; añade los garbanzos cocidos 5 min más. ${LEGUMBRE_COCIDA}`,
      'Hidrata el cuscús con parte del caldo caliente, tapado 5 min, y sirve con el guiso.',
    ],
    nino: { adaptacion: 'Cuscús con verduras y garbanzos chafados.', racion: '4 cucharadas.' },
  },
  {
    id: 'abadejo-tomate-arroz', nombre: 'Abadejo en salsa de tomate con arroz', proteina: 'pescado-blanco', minutos: 30,
    ingredientes: ing(`p:Abadejo en lomos 170; c:Arroz 60; v:Cebolla 50, Ajo 5, Pimiento verde 40, Perejil 3; d:Tomate triturado 120, Laurel, ${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      'Sofríe cebolla, ajo y pimiento, añade el tomate y el laurel y cuece 12 min.',
      'Pon el abadejo en la salsa, tapa y cuece 8 min. Termina con perejil.',
    ],
    nino: { adaptacion: 'Pescado desmigado sin espinas en la salsa, con arroz.', racion: '3-4 cucharadas de pescado y 3 de arroz.' },
  },
  {
    id: 'pollo-yogur-curcuma', nombre: 'Pollo al yogur y cúrcuma con arroz y zanahoria', proteina: 'carne-blanca', minutos: 30,
    ingredientes: ing(`p:Pechuga de pollo 150; c:Arroz 70; v:Zanahoria 100, Cebolla 50, Ajo 3, Limón 10; l:Yogur natural 60; d:Cúrcuma, Comino, ${AOVE} 10`),
    pasos: [
      'Marina el pollo en dados con yogur, cúrcuma, comino y limón (10 min o desde la noche anterior).',
      'Pocha la cebolla, añade el pollo con la marinada y cuece 12-15 min a fuego medio.',
      'Sirve con arroz y zanahoria cocida o asada.',
    ],
    nino: { adaptacion: 'Pollo desmigado con la salsa de yogur; zanahoria cocida en bastones.', racion: '3 cucharadas de arroz, unas tiras de pollo y 3 bastones.' },
  },
  {
    id: 'tortilla-champinones-esparragos', nombre: 'Tortilla de champiñones y espárragos', proteina: 'huevo', minutos: 25, acompanamiento: 'Tomate aliñado',
    ingredientes: ing(`p:Huevos 100; v:Champiñones 100, Espárragos trigueros 80, Ajo 3, Tomate 120; c:Pan integral 40; d:${AOVE} 12`),
    pasos: [
      'Saltea los champiñones laminados y los trigueros en trozos con ajo.',
      'Mézclalos con los huevos batidos y cuaja la tortilla por los dos lados.',
      'Acompaña con tomate aliñado.',
    ],
    nino: { adaptacion: 'Bien cuajada, en bastones; solo las puntas tiernas del espárrago.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'lentejas-calabaza-curcuma', nombre: 'Lentejas guisadas con calabaza y cúrcuma', proteina: 'legumbre', minutos: 35, aparato: 'olla-rapida',
    ingredientes: ing(`c:Lentejas pardinas 75, Pan integral 30; v:Calabaza 150, Cebolla 50, Ajo 5, Pimiento rojo 40; d:Tomate triturado 50, Cúrcuma, Comino, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, ajo y pimiento con la cúrcuma y el comino; añade el tomate.',
      'Añade las lentejas, la calabaza en dados, el laurel y agua: olla rápida 10 min (cazuela, 35 min).',
      'La calabaza se deshace y espesa el caldo.',
    ],
    nino: { adaptacion: 'Chafado con tenedor.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'jurel-horno-patatas', nombre: 'Jurel al horno con patatas y pimientos', proteina: 'pescado-azul', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Jurel limpio 150; v:Patata 200, Pimiento verde 60, Cebolla 50, Ajo 5, Limón 10; d:${AOVE} 8`),
    pasos: [
      'Patata, cebolla y pimiento en láminas con aceite: 20 min a 200 °C.',
      'Pon el jurel limpio (abierto o en lomos) encima con ajo y limón: 10-12 min.',
    ],
    nino: { adaptacion: 'Desmiga con cuidado revisando las espinas; patata chafada.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'albondigas-pollo-pure', nombre: 'Albóndigas de pollo en salsa de verduras con puré', proteina: 'carne-blanca', minutos: 40, aparato: 'freidora',
    ingredientes: ing(`p:Carne picada de pollo 130; c:Copos de avena 10; v:Ajo 3, Perejil 3, Cebolla 50, Zanahoria 60, Calabacín 80, Patata 180; l:Leche entera 50; d:Tomate triturado 60, ${AOVE} 10`),
    pasos: [
      'Mezcla la carne con ajo, perejil y avena; forma albóndigas pequeñas y dóralas en la freidora de aire 8 min a 190 °C.',
      'Salsa: pocha cebolla, zanahoria y calabacín con el tomate 15 min y tritura. Cuece las albóndigas en ella 10 min.',
      'Puré: patata cocida chafada con leche.',
    ],
    nino: { adaptacion: 'Albóndigas partidas en trocitos (nunca enteras) con la salsa y el puré.', racion: '2 albóndigas pequeñas en trocitos y 3 cucharadas de puré.' },
  },
  {
    id: 'tostas-crema-calabacin', nombre: 'Crema de calabacín con tostas de aguacate, tomate y queso fresco', proteina: 'vegetal', minutos: 25,
    ingredientes: ing(`v:Calabacín 250, Puerro 50, Patata 80, Aguacate 50, Tomate 60; l:Queso fresco 60; c:Pan integral 60; d:${AOVE} 10`),
    pasos: [
      'Crema: rehoga puerro, añade calabacín y patata, cubre de agua y cuece 15 min; tritura.',
      'Tuesta el pan y cúbrelo con aguacate chafado, tomate y queso fresco.',
    ],
    nino: { adaptacion: 'Crema con queso fresco desmenuzado; tostada sin sal en tiras con aguacate.', racion: 'Un cuenco pequeño de crema y una tira de tostada.' },
  },
  {
    id: 'crema-alubias-puerro', nombre: 'Crema de alubias blancas y puerro con picatostes', proteina: 'legumbre', minutos: 25,
    ingredientes: ing(`c:Alubias blancas 70, Pan integral 40; v:Puerro 100, Patata 60, Ajo 3, Espinacas frescas 50; d:${AOVE} 12`),
    pasos: [
      'Rehoga el puerro y el ajo, añade la patata en dados y agua: 15 min.',
      `Añade las alubias cocidas y las espinacas y tritura. ${LEGUMBRE_COCIDA}`,
      'Picatostes: dados de pan tostados en el horno o la freidora con un hilo de aceite (nada de freír).',
    ],
    nino: { adaptacion: 'Crema algo espesa; pan sin sal en tiras en vez de picatostes.', racion: 'Un cuenco pequeño (5-6 cucharadas).' },
  },
  {
    id: 'trucha-plancha-esparragos', nombre: 'Trucha a la plancha con arroz y trigueros', proteina: 'pescado-azul', minutos: 25,
    ingredientes: ing(`p:Trucha en filetes 160; c:Arroz 60; v:Espárragos trigueros 120, Limón 10, Ajo 3; d:${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      'Haz los trigueros a la plancha con un poco de aceite.',
      'Haz la trucha a la plancha 2-3 min por lado y termina con limón.',
    ],
    nino: { adaptacion: 'Trucha desmigada sin piel revisando espinas; puntas tiernas del espárrago picadas.', racion: 'Medio filete desmigado y 3 cucharadas de arroz.' },
  },
  {
    id: 'pollo-pepitoria', nombre: 'Pollo en pepitoria ligera con arroz', proteina: 'carne-blanca', minutos: 50,
    ingredientes: ing(`p:Contramuslo de pollo deshuesado 150; c:Arroz 60; v:Cebolla 60, Ajo 5, Perejil 3, Judías verdes 80; d:Almendra molida 10, Azafrán o cúrcuma, Laurel, ${AOVE} 12`),
    pasos: [
      'Dora el pollo en trozos y retíralo. Pocha la cebolla y el ajo.',
      'Vuelve a poner el pollo con el laurel, el azafrán y agua: 25 min.',
      'Espesa la salsa con la almendra molida (molida es segura para el niño) y el perejil; 5 min más. Sirve con arroz y judías.',
    ],
    nino: { adaptacion: 'Pollo desmigado con la salsa; la almendra va molida, nunca en trozos.', racion: '3 cucharadas de arroz y unas tiras de pollo con salsa.' },
  },
  {
    id: 'huevos-horno-espinacas', nombre: 'Huevos al horno sobre espinacas cremosas', proteina: 'huevo', minutos: 25, aparato: 'horno', acompanamiento: 'Pan integral',
    ingredientes: ing(`p:Huevos 100; v:Espinacas frescas 200, Ajo 3, Cebolla 40; l:Leche entera 60, Queso rallado 15; c:Harina de trigo 5, Pan integral 50; d:${AOVE} 10`),
    pasos: [
      'Saltea ajo, cebolla y espinacas; añade una cucharadita de harina y la leche y cuece 3 min hasta que espese.',
      'Reparte en cazuelitas, casca un huevo encima, espolvorea queso y hornea a 200 °C hasta que cuaje (el del niño, del todo).',
    ],
    nino: { adaptacion: 'Huevo bien cuajado troceado con las espinacas cremosas; pan en tiras.', racion: 'Un huevo con 2-3 cucharadas de espinacas.' },
  },
  {
    id: 'falafel-horno', nombre: 'Falafel al horno con salsa de yogur y ensalada', proteina: 'legumbre', minutos: 40, aparato: 'horno', acompanamiento: 'Pan de pita integral y ensalada',
    ingredientes: ing(`c:Garbanzos 70, Pan integral 50; v:Cebolla 30, Ajo 3, Perejil 10, Lechuga 60, Tomate 100, Pepino 60, Limón 10; l:Yogur natural 60; d:Comino, ${AOVE} 12`),
    pasos: [
      'Tritura garbanzos remojados la víspera (crudos, sin cocer) con cebolla, ajo, perejil y comino hasta una pasta granulosa.',
      'Forma bolitas aplanadas, úntalas de aceite y hornea 20-25 min a 200 °C dándoles la vuelta (o freidora de aire 15 min).',
      'Sirve con salsa de yogur y limón, ensalada y pan.',
    ],
    nino: { adaptacion: 'Falafel aplastado o en trocitos con yogur (redondo y seco, mejor no entero).', racion: '2 falafel en trocitos con yogur.' },
  },
  {
    id: 'arroz-calamares-gambas', nombre: 'Arroz con calamares, gambas y verduras', proteina: 'pescado-blanco', minutos: 40,
    ingredientes: ing(`c:Arroz redondo 75; p:Calamares limpios 80, Gambas peladas 60; v:Pimiento rojo 60, Pimiento verde 40, Ajo 5, Tomate 80, Limón 10; d:Pimentón dulce, Azafrán o cúrcuma, ${AOVE} 12`),
    pasos: [
      'Saltea los calamares en anillas y retíralos. Sofríe pimientos y ajo, añade tomate rallado y pimentón.',
      'Añade el arroz, el azafrán y unas 3 veces su volumen de agua o caldo de pescado; cuece 16 min.',
      'A falta de 4 min, añade calamares y gambas. Reposa 5 min.',
    ],
    nino: { adaptacion: 'Arroz con la gamba picada fina; el calamar, picadísimo o fuera (es gomoso y cuesta masticarlo).', racion: '4-5 cucharadas.' },
  },

  // ---------------- Semana 8 ----------------
  {
    id: 'lentejas-riojana-ligera', nombre: 'Lentejas a la riojana ligeras, al pimentón', proteina: 'legumbre', minutos: 35, aparato: 'olla-rapida',
    ingredientes: ing(`c:Lentejas pardinas 75, Pan integral 30; v:Patata 80, Pimiento rojo 60, Cebolla 50, Zanahoria 50, Ajo 5; d:Pimentón dulce, Laurel, Tomate triturado 40, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, pimiento, zanahoria y ajo; añade pimentón (sin dejar que se queme) y el tomate.',
      'Añade lentejas, patata cascada, laurel y agua: olla rápida 10 min (cazuela, 35 min).',
      'El pimentón da todo el sabor del guiso: no necesita embutido.',
    ],
    nino: { adaptacion: 'Chafado con tenedor.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'merluza-gallega', nombre: 'Merluza a la gallega', proteina: 'pescado-blanco', minutos: 30,
    ingredientes: ing(`p:Merluza en lomos 170; v:Patata 220, Cebolla 40, Ajo 5, Judías verdes 80; d:Pimentón dulce, Laurel, ${AOVE} 12`),
    pasos: [
      'Cuece patata en rodajas gruesas, cebolla y laurel en agua 15 min; añade la merluza los últimos 5-6 min.',
      'Dora el ajo laminado en el aceite, aparta del fuego y añade el pimentón.',
      'Escurre y riega con la ajada. Acompaña con judías verdes.',
    ],
    nino: { adaptacion: 'Separa su ración antes de la ajada; merluza desmigada sin espinas y patata chafada con un hilo de aceite.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'escalopines-pavo', nombre: 'Escalopines de pavo al limón con patatas y ensalada', proteina: 'carne-blanca', minutos: 30, aparato: 'freidora',
    ingredientes: ing(`p:Pechuga de pavo 140; v:Limón 15, Ajo 3, Perejil 3, Patata 200, Lechuga 60, Tomate 80; c:Harina de trigo 5; d:${AOVE} 10`),
    pasos: [
      'Patatas en gajos en la freidora de aire: 18-20 min a 190 °C.',
      'Pasa los filetes finos de pavo por un poco de harina y dóralos en la sartén con poco aceite.',
      'Añade ajo, zumo de limón y un poco de agua; reduce 2 min y termina con perejil.',
    ],
    nino: { adaptacion: 'Pavo en tiras muy finas con su jugo; patata blanda; tomate pelado.', racion: 'Unas tiras de pavo y 3 gajos de patata.' },
  },
  {
    id: 'revuelto-setas-patata', nombre: 'Revuelto de setas y patata', proteina: 'huevo', minutos: 25,
    ingredientes: ing(`p:Huevos 100; v:Setas variadas 120, Patata 120, Ajo 3, Perejil 3, Lechuga 60, Tomate 80; d:${AOVE} 12`),
    pasos: [
      'Patata en dados pequeños: 6 min en el microondas o pochada a fuego suave.',
      'Saltea las setas con el ajo, añade la patata y los huevos batidos y remueve hasta que cuajen.',
      'Acompaña con ensalada.',
    ],
    nino: { adaptacion: 'Bien cuajado; setas picadas finas.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'ensalada-garbanzos-quinoa', nombre: 'Ensalada templada de garbanzos y quinoa', proteina: 'legumbre', minutos: 25,
    ingredientes: ing(`c:Garbanzos 50, Quinoa 40; v:Calabacín 80, Pimiento rojo 60, Tomate 80, Espinacas frescas 40, Limón 10, Perejil 3; l:Queso fresco 40; d:Comino, ${AOVE} 12`),
    pasos: [
      'Cuece la quinoa lavada 12-15 min.',
      `Saltea calabacín y pimiento en dados con comino; añade los garbanzos cocidos para templarlos. ${LEGUMBRE_COCIDA}`,
      'Mezcla con la quinoa, tomate, espinacas y queso fresco; aliña con limón y aceite.',
    ],
    nino: { adaptacion: 'Garbanzos chafados con la quinoa, la verdura salteada y el queso fresco.', racion: '4 cucharadas.' },
  },
  {
    id: 'pastel-salmon-patata', nombre: 'Pastel de salmón y patata al horno', proteina: 'pescado-azul', minutos: 40, aparato: 'horno', acompanamiento: 'Ensalada verde',
    ingredientes: ing(`p:Salmón en lomos 130; v:Patata 200, Puerro 50, Lechuga 60, Limón 5; l:Leche entera 50, Queso rallado 10; d:Eneldo seco, ${AOVE} 6`),
    pasos: [
      'Cuece la patata y cháfala con la leche.',
      'Desmiga el salmón en crudo sin piel ni espinas y mézclalo con el puerro pochado y eneldo.',
      'Capa de puré, salmón y otra capa de puré; queso por encima y horno 20 min a 200 °C.',
    ],
    nino: { adaptacion: 'Perfecto tal cual: blando y sin espinas (revísalo al desmigar).', racion: 'Una porción como la palma de su mano.' },
  },
  {
    id: 'ternera-salteada', nombre: 'Ternera salteada con verduras y arroz', proteina: 'carne-roja', minutos: 25,
    ingredientes: ing(`p:Filete de ternera 130; c:Arroz 70; v:Pimiento rojo 60, Pimiento verde 50, Cebolla 50, Brócoli 80, Ajo 3; d:Pimentón dulce, ${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      'Corta la ternera en tiras finas y saltéala a fuego muy fuerte 1-2 min; retírala.',
      'Saltea las verduras en tiras con un poco de agua hasta que estén tiernas; vuelve a poner la carne y mezcla.',
    ],
    nino: { adaptacion: 'Ternera en hilos muy finos (o picada), mezclada con el arroz y la verdura blanda.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'risotto-calabaza', nombre: 'Arroz cremoso de calabaza y queso', proteina: 'vegetal', minutos: 35, acompanamiento: 'Ensalada de tomate',
    ingredientes: ing(`c:Arroz redondo 80; v:Calabaza 200, Cebolla 50, Tomate 100; l:Queso rallado 25, Leche entera 30; d:Tomillo, ${AOVE} 10`),
    pasos: [
      'Sofríe la cebolla, añade la calabaza en dados pequeños y el arroz.',
      'Ve añadiendo caldo de verduras o agua caliente poco a poco, removiendo, 18 min: la calabaza se deshace y lo vuelve cremoso.',
      'Fuera del fuego, queso y un chorro de leche.',
    ],
    nino: { adaptacion: 'Tal cual, templado.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'potaje-vigilia', nombre: 'Potaje de garbanzos con espinacas y bacalao', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Garbanzos 70, Pan integral 20; p:Bacalao fresco en lomos 40; v:Espinacas frescas 120, Cebolla 50, Ajo 5, Patata 60; d:Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla y ajo con el pimentón; añade la patata, el laurel y agua: 10 min.',
      `Añade los garbanzos cocidos y las espinacas: 10 min. ${LEGUMBRE_COCIDA}`,
      'Incorpora el bacalao fresco en trozos los últimos 5 min (sin sal: bacalao fresco, no salado).',
    ],
    nino: { adaptacion: 'Garbanzos chafados con el bacalao desmigado sin espinas.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'boquerones-rebozados-horno', nombre: 'Boquerones empanados al horno con ensalada', proteina: 'pescado-azul', minutos: 25, aparato: 'horno',
    ingredientes: ing(`p:Boquerones limpios y abiertos 160; c:Pan integral 30, Harina de trigo 5; v:Lechuga 60, Tomate 100, Limón 10, Perejil 3, Patata 150; d:${AOVE} 10`),
    pasos: [
      'Pasa los boquerones abiertos y sin espina por pan rallado con perejil (la humedad del pescado basta para que se pegue).',
      'Hornea en bandeja con un hilo de aceite 10-12 min a 210 °C (o freidora de aire 8 min).',
      'Sirve con patata cocida y ensalada.',
    ],
    nino: { adaptacion: 'Desmigados revisando espinas; el empanado al horno queda crujiente pero blando por dentro.', racion: '3-4 boquerones desmigados.' },
  },
  {
    id: 'pollo-horno-calabaza', nombre: 'Pollo al horno con calabaza, boniato y cebolla', proteina: 'carne-blanca', minutos: 55, aparato: 'horno',
    ingredientes: ing(`p:Contramuslo de pollo deshuesado 160; v:Calabaza 150, Boniato 120, Cebolla 60, Ajo 5, Limón 10; d:Romero, Pimentón dulce, ${AOVE} 12`),
    pasos: [
      'Calabaza, boniato y cebolla en trozos en la bandeja con aceite, romero y pimentón.',
      'Pon el pollo encima con ajo y limón y hornea 40-45 min a 200 °C.',
    ],
    nino: { adaptacion: 'Pollo desmigado; calabaza y boniato muy blandos, chafados o en bastones.', racion: 'Unas tiras de pollo y 3-4 trozos de verdura.' },
  },
  {
    id: 'tortilla-patata-espinacas', nombre: 'Tortilla de patata y espinacas', proteina: 'huevo', minutos: 35, acompanamiento: 'Ensalada de tomate',
    ingredientes: ing(`p:Huevos 100; v:Patata 150, Espinacas frescas 80, Cebolla 40, Tomate 120; d:${AOVE} 15`),
    pasos: [
      'Patata y cebolla en láminas: pochadas a fuego suave (20 min) o 6-8 min en el microondas.',
      'Saltea las espinacas, escúrrelas y mézclalo todo con los huevos batidos.',
      'Cuaja la tortilla por los dos lados.',
    ],
    nino: { adaptacion: 'Bien cuajada, en bastones.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'moussaka-lentejas', nombre: 'Musaka de lentejas y berenjena', proteina: 'legumbre', minutos: 60, aparato: 'horno',
    ingredientes: ing(`c:Lentejas pardinas 50, Harina de trigo 8; v:Berenjena 200, Patata 100, Cebolla 50, Ajo 3; l:Leche entera 100, Queso rallado 20; d:Tomate triturado 100, Canela, Orégano, ${AOVE} 14`),
    pasos: [
      'Berenjena y patata en rodajas, asadas 20 min a 200 °C con un hilo de aceite.',
      'Relleno: cebolla y ajo pochados con tomate, las lentejas cocidas, orégano y una pizca de canela (15 min).',
      'Capas de patata, berenjena y relleno; cubre con bechamel ligera (aceite, harina y leche) y queso, y hornea 20 min.',
    ],
    nino: { adaptacion: 'Su porción troceada pequeña, sin la piel de la berenjena.', racion: 'Una porción como la palma de su mano.' },
  },
  {
    id: 'dorada-papillote', nombre: 'Dorada en papillote con limón y patata', proteina: 'pescado-blanco', minutos: 30, aparato: 'horno',
    ingredientes: ing(`p:Dorada en lomos 170; v:Patata 180, Calabacín 80, Cebolla 40, Limón 15, Tomate 60; d:Tomillo, ${AOVE} 8`),
    pasos: [
      'Patata en rodajas finas precocida 6 min en el microondas.',
      'Sobre papel de horno: patata, calabacín, cebolla y tomate en rodajas, la dorada encima, limón, tomillo y aceite.',
      'Cierra el paquete y hornea 15 min a 200 °C.',
    ],
    nino: { adaptacion: 'Desmigada sin piel ni espinas con la patata y la verdura.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
];
