// Recetas del menú familiar (semanas 1 a 4; las de 5 a 8 están en recetas2.ts). Cocina doméstica,
// ingredientes de supermercado y, entre semana, 40 minutos como máximo (contando con lo preparado
// en el batch cooking del domingo). Los gramos son de una ración de adulto de referencia: la app
// los escala a las kcal de cada persona si se activa en los ajustes. Para el niño, ración orientativa.
// Pescados: solo especies de contenido bajo en mercurio según la AESAN (ver datos/guia.ts).
import type { Receta } from '../tipos';
import { AOVE, LEGUMBRE_COCIDA, ing } from './ing';
import { RECETAS_2 } from './recetas2';

const RECETAS_1: Receta[] = [
  // ---------------- Semana 1 ----------------
  {
    id: 'lentejas-estofadas', nombre: 'Lentejas estofadas con verduras', proteina: 'legumbre', minutos: 35, aparato: 'olla-rapida', acompanamiento: 'Pan integral',
    ingredientes: ing(`c:Lentejas pardinas 75, Pan integral 30; v:Zanahoria 60, Patata 100, Cebolla 50, Pimiento verde 40, Ajo 5; d:Tomate triturado 50, Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, pimiento y ajo picados en aceite a fuego medio (8 min).',
      'Añade zanahoria y patata en dados, una cucharadita de pimentón (fuera del fuego para que no se queme) y el tomate.',
      'Incorpora las lentejas, el laurel y agua hasta cubrir. Olla rápida: 10 min desde que sube la válvula. Cazuela: 35-40 min.',
      'Separa la ración del niño y sala después la de los adultos.',
    ],
    nino: { adaptacion: 'Chafa lentejas y verduras con un tenedor, sin triturar del todo para que aprenda a masticar.', racion: '3-4 cucharadas soperas con verdura y un trocito de pan.' },
  },
  {
    id: 'merluza-patata-calabacin', nombre: 'Merluza al horno con patata y calabacín', proteina: 'pescado-blanco', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Merluza en lomos 170; v:Patata 200, Calabacín 120, Cebolla 50, Limón 15, Perejil 3, Ajo 5; d:${AOVE} 12`),
    pasos: [
      'Patata y cebolla en rodajas finas en una bandeja con un chorro de aceite y un poco de agua: 15 min a 200 °C.',
      'Añade el calabacín en medias lunas y los lomos de merluza encima con ajo y perejil picados.',
      'Hornea 10-12 min más y termina con limón.',
    ],
    nino: { adaptacion: 'Desmiga la merluza revisando bien que no queden espinas; patata y calabacín bien blandos, chafados o en trozos que pueda coger.', racion: 'Un trozo de pescado del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'pollo-curry', nombre: 'Pollo al curry suave con arroz y brócoli', proteina: 'carne-blanca', minutos: 30,
    ingredientes: ing(`p:Pechuga de pollo 150; c:Arroz integral 70; v:Cebolla 60, Brócoli 120, Ajo 5; l:Yogur natural 60; d:Curry suave en polvo, ${AOVE} 10`),
    pasos: [
      'Pon a cocer el arroz (el integral tarda unos 30 min; el blanco, 15).',
      'Dora el pollo en dados con poco aceite y retíralo. Pocha la cebolla y el ajo, añade una cucharadita de curry suave y un vaso de agua.',
      'Vuelve a poner el pollo 5 min y, fuera del fuego, añade el yogur para hacer la salsa.',
      'Cuece el brócoli al vapor 6-7 min y sírvelo con el arroz.',
    ],
    nino: { adaptacion: 'Pollo en tiras finas o desmigado con su salsa; arbolitos de brócoli muy cocidos para que los coja con la mano.', racion: '3-4 cucharadas de arroz con pollo y 2-3 arbolitos de brócoli.' },
  },
  {
    id: 'tortilla-calabacin', nombre: 'Tortilla de calabacín y cebolla', proteina: 'huevo', minutos: 25, acompanamiento: 'Ensalada de tomate y pepino',
    ingredientes: ing(`p:Huevos 100; v:Calabacín 150, Cebolla 60, Tomate 120, Pepino 80; c:Pan integral 40; d:${AOVE} 12`),
    pasos: [
      'Pocha cebolla y calabacín en dados a fuego medio con poco aceite (12 min).',
      'Mézclalos con los huevos batidos y cuaja la tortilla por los dos lados.',
      'Acompaña con tomate y pepino aliñados.',
    ],
    nino: { adaptacion: 'Su trozo bien cuajado (sin huevo líquido), en bastones; tomate pelado en trocitos.', racion: 'Un bastón equivalente a medio huevo-1 huevo y unos trocitos de tomate.' },
  },
  {
    id: 'garbanzos-espinacas', nombre: 'Garbanzos con espinacas', proteina: 'legumbre', minutos: 25, acompanamiento: 'Fruta con vitamina C de postre',
    ingredientes: ing(`c:Garbanzos 75, Pan integral 20; v:Espinacas frescas 150, Ajo 5, Cebolla 40; d:Comino, Pimentón dulce, ${AOVE} 10`),
    pasos: [
      `Dora el ajo y la cebolla picados, añade las espinacas y deja que se reduzcan. ${LEGUMBRE_COCIDA}`,
      'Machaca en un mortero una rebanada de pan tostado con comino y pimentón y un poco de agua.',
      'Añade los garbanzos cocidos, el majado y un vaso de agua o caldo; cuece 10 min a fuego suave.',
    ],
    nino: { adaptacion: 'Chafa los garbanzos (puedes quitarles la piel) con las espinacas picadas finas.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'salmon-boniato', nombre: 'Salmón al horno con boniato y judías verdes', proteina: 'pescado-azul', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Salmón en lomos 140; v:Boniato 180, Judías verdes 120, Limón 10; d:Eneldo seco, ${AOVE} 8`),
    pasos: [
      'Boniato en bastones con un hilo de aceite: 20 min a 200 °C.',
      'Añade el salmón con eneldo y limón y hornea 10-12 min más.',
      'Cuece las judías verdes 8-10 min.',
    ],
    nino: { adaptacion: 'Salmón sin piel y desmigado revisando espinas; bastones de boniato blandos; judías muy cocidas en trocitos.', racion: 'Un trozo de salmón del tamaño de su palma y 3-4 bastones de boniato.' },
  },
  {
    id: 'pasta-bolonesa-pavo', nombre: 'Pasta integral con boloñesa de pavo y verduras', proteina: 'carne-blanca', minutos: 30,
    ingredientes: ing(`p:Carne picada de pavo 110; c:Pasta integral 80; v:Cebolla 40, Zanahoria 50, Calabacín 80, Ajo 5; d:Tomate triturado 100, Orégano, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, zanahoria y calabacín muy picados (si tienes el sofrito del domingo, úsalo).',
      'Añade la carne picada y dórala; incorpora el tomate y el orégano y cuece 15 min.',
      'Cuece la pasta y mézclala con la salsa.',
    ],
    nino: { adaptacion: 'Pasta corta (macarrones o tiburones) bien cocida, con la salsa y la carne.', racion: '4-5 cucharadas soperas.' },
  },
  {
    id: 'crema-calabaza-tostas', nombre: 'Crema de calabaza con tostas de queso fresco y tomate', proteina: 'vegetal', minutos: 30,
    ingredientes: ing(`v:Calabaza 250, Puerro 60, Patata 80, Tomate 60; l:Queso fresco 80; c:Pan integral 50; d:${AOVE} 10`),
    pasos: [
      'Rehoga el puerro, añade calabaza y patata en trozos y cubre de agua: 20 min (o 6 min en olla rápida).',
      'Tritura con un hilo de aceite.',
      'Tuesta el pan y ponle queso fresco y tomate en rodajas.',
    ],
    nino: { adaptacion: 'Crema templada con queso fresco desmenuzado dentro (aporta la proteína de la cena); pan sin sal en tiras.', racion: 'Un cuenco pequeño de crema y una tira de pan con queso.' },
  },
  {
    id: 'ensalada-alubias-asadas', nombre: 'Ensalada templada de alubias con verduras asadas', proteina: 'legumbre', minutos: 15,
    ingredientes: ing(`c:Alubias blancas 70, Pan integral 30; v:Pimiento rojo 100, Calabacín 100, Cebolla morada 30, Tomate 100, Perejil 3; d:Vinagre 5, ${AOVE} 12`),
    pasos: [
      `Usa la bandeja de verduras asadas del domingo (o ásalas 25 min a 200 °C). ${LEGUMBRE_COCIDA}`,
      'Templa las alubias y mézclalas con las verduras en tiras, tomate y perejil.',
      'Aliña con aceite y vinagre.',
    ],
    nino: { adaptacion: 'Alubias algo chafadas con las verduras asadas blandas en tiras; sin cebolla cruda.', racion: '3-4 cucharadas.' },
  },
  {
    id: 'boquerones-horno', nombre: 'Boquerones al horno con ajo y perejil y pimientos asados', proteina: 'pescado-azul', minutos: 25, aparato: 'horno', acompanamiento: 'Pimientos asados y pan integral',
    ingredientes: ing(`p:Boquerones limpios y abiertos 160; v:Ajo 5, Perejil 3, Limón 10, Pimiento rojo 150; c:Pan integral 50; d:${AOVE} 10`),
    pasos: [
      'Pide los boquerones limpios, abiertos y sin espina central.',
      'Colócalos en una bandeja con ajo y perejil picados y un hilo de aceite: 8-10 min a 200 °C.',
      'Sirve con pimientos asados (del lote del domingo o 25 min al horno) y limón.',
    ],
    nino: { adaptacion: 'Desmiga revisando que no quede ninguna espina; pimiento asado pelado en tiras blandas.', racion: '3-4 boquerones desmigados y unas tiras de pimiento.' },
  },
  {
    id: 'muslos-pollo-asados', nombre: 'Muslos de pollo asados con patatas y zanahoria', proteina: 'carne-blanca', minutos: 60, aparato: 'horno',
    ingredientes: ing(`p:Muslos de pollo 170; v:Patata 220, Zanahoria 100, Cebolla 60, Ajo 5, Limón 10; d:Romero, ${AOVE} 12`),
    pasos: [
      'Patata, zanahoria y cebolla en trozos en la bandeja con aceite, romero y unos dientes de ajo.',
      'Pon los muslos encima con limón y hornea 50 min a 200 °C, dándoles la vuelta a mitad.',
      'También en freidora de aire: 25 min a 190 °C.',
    ],
    nino: { adaptacion: 'Carne sin piel ni huesos, desmigada; zanahoria y patata blandas en bastones.', racion: 'Un muslo pequeño desmigado (o la mitad) y 3-4 bastones de verdura.' },
  },
  {
    id: 'revuelto-champinones', nombre: 'Revuelto de champiñones y calabacín con tostada', proteina: 'huevo', minutos: 20, acompanamiento: 'Ensalada de lechuga y tomate',
    ingredientes: ing(`p:Huevos 100; v:Champiñones 120, Calabacín 100, Ajo 5, Lechuga 60, Tomate 100; c:Pan integral 50; d:${AOVE} 10`),
    pasos: [
      'Saltea ajo, champiñones laminados y calabacín en dados hasta que pierdan el agua.',
      'Añade los huevos batidos y remueve a fuego suave hasta que cuajen.',
      'Sirve con pan tostado y ensalada.',
    ],
    nino: { adaptacion: 'Su parte bien cuajada (el huevo nunca líquido); champiñón y calabacín picados finos.', racion: '3-4 cucharadas de revuelto y una tira de pan.' },
  },
  {
    id: 'arroz-alubias-rojas', nombre: 'Arroz con alubias rojas y verduras', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Alubias rojas 50, Arroz 60; v:Pimiento rojo 60, Cebolla 50, Ajo 5, Calabaza 100; d:Tomate triturado 60, Comino, Pimentón dulce, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, ajo, pimiento y calabaza en dados (10 min).',
      'Añade comino, pimentón y tomate; después el arroz y el doble de agua.',
      `A los 10 min incorpora las alubias cocidas y termina 8 min más. ${LEGUMBRE_COCIDA}`,
    ],
    nino: { adaptacion: 'Chafa ligeramente las alubias con el arroz y la verdura.', racion: '4 cucharadas.' },
  },
  {
    id: 'dorada-horno', nombre: 'Dorada al horno con patata, cebolla y tomate', proteina: 'pescado-blanco', minutos: 40, aparato: 'horno',
    ingredientes: ing(`p:Dorada en lomos 170; v:Patata 200, Cebolla 50, Tomate 100, Limón 10, Ajo 5; d:${AOVE} 12`),
    pasos: [
      'Patata y cebolla en rodajas finas con aceite: 20 min a 200 °C.',
      'Añade tomate en rodajas y los lomos de dorada con ajo y limón.',
      'Hornea 12-15 min más.',
    ],
    nino: { adaptacion: 'Desmigada sin piel y sin espinas; patata y tomate blandos y chafados.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },

  // ---------------- Semana 2 ----------------
  {
    id: 'potaje-garbanzos-calabaza', nombre: 'Potaje de garbanzos con calabaza', proteina: 'legumbre', minutos: 35, aparato: 'olla-rapida',
    ingredientes: ing(`c:Garbanzos 75, Pan integral 30; v:Calabaza 150, Espinacas frescas 60, Cebolla 50, Ajo 5; d:Tomate triturado 50, Pimentón dulce, Comino, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla y ajo; añade pimentón, comino y tomate.',
      `Incorpora la calabaza en dados, los garbanzos cocidos, el laurel y agua hasta cubrir: 20 min. ${LEGUMBRE_COCIDA}`,
      'Al final, un puñado de espinacas 2 min.',
    ],
    nino: { adaptacion: 'Garbanzos chafados con la calabaza, que queda muy blanda.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'bacalao-pisto', nombre: 'Bacalao fresco con pisto', proteina: 'pescado-blanco', minutos: 35,
    ingredientes: ing(`p:Bacalao fresco en lomos 170; c:Pan integral 40; v:Calabacín 120, Pimiento rojo 60, Pimiento verde 50, Cebolla 60, Ajo 5; d:Tomate triturado 100, ${AOVE} 12`),
    pasos: [
      'Pisto: pocha cebolla, ajo y pimientos (10 min), añade calabacín en dados (8 min) y el tomate (10 min).',
      'Pon los lomos de bacalao fresco encima, tapa y cuece 6-8 min.',
      'Usa bacalao fresco o congelado, no salado.',
    ],
    nino: { adaptacion: 'Bacalao desmigado sin espinas mezclado con el pisto.', racion: '3-4 cucharadas de pescado con pisto.' },
  },
  {
    id: 'pollo-cuscus', nombre: 'Pollo a la plancha con cuscús y verduras salteadas', proteina: 'carne-blanca', minutos: 25,
    ingredientes: ing(`p:Pechuga de pollo 150; c:Cuscús integral 70; v:Calabacín 80, Zanahoria 60, Pimiento rojo 60, Cebolla 40, Limón 10; d:Comino, ${AOVE} 12`),
    pasos: [
      'Hidrata el cuscús con el mismo volumen de agua hirviendo, tapado 5 min, y suéltalo con un tenedor.',
      'Saltea las verduras en dados pequeños con comino.',
      'Haz el pollo a la plancha en filetes finos y termina con limón.',
    ],
    nino: { adaptacion: 'Pollo jugoso en tiras muy finas o desmigado; verduras bien hechas, blandas.', racion: '3-4 cucharadas de cuscús con verdura y unas tiras de pollo.' },
  },
  {
    id: 'huevos-plato', nombre: 'Huevos al plato con tomate y guisantes', proteina: 'huevo', minutos: 25, aparato: 'horno', acompanamiento: 'Pan integral',
    ingredientes: ing(`p:Huevos 100; v:Cebolla 50, Pimiento rojo 60, Guisantes congelados 70; c:Pan integral 50; d:Tomate triturado 120, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla y pimiento, añade el tomate y los guisantes y cuece 10 min.',
      'Pásalo a cazuelitas, casca un huevo en cada una y hornea a 200 °C hasta que cuajen.',
      'La del niño, hasta que la yema esté completamente hecha.',
    ],
    nino: { adaptacion: 'Huevo con la yema bien cuajada, troceado; guisantes chafados (enteros son pequeños y redondos).', racion: 'Un huevo con 2-3 cucharadas de tomate y guisantes.' },
  },
  {
    id: 'lentejas-arroz', nombre: 'Lentejas con arroz y verduras', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Lentejas pardinas 60, Arroz 30; v:Zanahoria 60, Cebolla 50, Pimiento verde 40, Ajo 5; d:Tomate triturado 50, Comino, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, pimiento, ajo y zanahoria picados.',
      'Añade el tomate, el comino, el laurel, las lentejas (cocidas del lote o de bote) y agua.',
      'Incorpora un puñado de arroz y cuece 18 min.',
    ],
    nino: { adaptacion: 'Chafado con tenedor, sin triturar del todo.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'caballa-horno', nombre: 'Caballa al horno con patata y tomate', proteina: 'pescado-azul', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Caballa en lomos 130; v:Patata 200, Tomate 100, Cebolla 50, Limón 10; d:Orégano, ${AOVE} 8`),
    pasos: [
      'Patata y cebolla en rodajas finas con aceite: 20 min a 200 °C.',
      'Añade tomate en rodajas y los lomos de caballa con orégano: 10 min más.',
      'Pide los lomos limpios: la caballa tiene espinas finas.',
    ],
    nino: { adaptacion: 'Desmiga con mucho cuidado: la caballa tiene espinas muy finas. Patata y tomate chafados.', racion: 'Medio lomo pequeño desmigado y 2-3 trozos de patata.' },
  },
  {
    id: 'albondigas-ternera', nombre: 'Albóndigas de ternera en salsa de tomate con arroz', proteina: 'carne-roja', minutos: 40, aparato: 'freidora',
    ingredientes: ing(`p:Carne picada de ternera 120, Huevos 15; c:Pan integral 15, Arroz 60; l:Leche entera 20; v:Ajo 3, Perejil 3, Cebolla 50, Zanahoria 50; d:Tomate triturado 100, ${AOVE} 8`),
    pasos: [
      'Mezcla la carne con un huevo, pan remojado en leche, ajo y perejil picados. Forma albóndigas pequeñas.',
      'Dóralas en la freidora de aire (8 min a 190 °C) o en sartén con muy poco aceite.',
      'Haz una salsa con cebolla, zanahoria y tomate (15 min), tritúrala y cuece las albóndigas en ella 10 min. Sirve con arroz.',
    ],
    nino: { adaptacion: 'Nunca la albóndiga entera (es redonda): parte en trocitos o chafa en la salsa.', racion: '2 albóndigas pequeñas en trocitos y 3 cucharadas de arroz.' },
  },
  {
    id: 'pasta-verduras-queso', nombre: 'Pasta integral con verduras asadas y queso', proteina: 'vegetal', minutos: 25,
    ingredientes: ing(`c:Pasta integral 85; v:Calabacín 100, Berenjena 100, Pimiento rojo 60, Tomate 80, Ajo 5; l:Queso tierno 40; d:Albahaca seca, ${AOVE} 12`),
    pasos: [
      'Saltea (o aprovecha asadas) las verduras en dados con ajo y albahaca.',
      'Cuece la pasta y mézclala con las verduras y el tomate en dados.',
      'Termina con el queso rallado o en dados.',
    ],
    nino: { adaptacion: 'Pasta corta bien cocida, verdura blanda y queso tierno en trocitos.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'alubias-estofadas', nombre: 'Alubias blancas estofadas con verduras', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Alubias blancas 75, Pan integral 30; v:Puerro 50, Zanahoria 60, Patata 80, Pimiento verde 40, Ajo 5; d:Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe puerro, pimiento y ajo; añade zanahoria y patata en dados y el pimentón.',
      `Cubre de agua con el laurel y cuece 15 min; añade las alubias cocidas y 10 min más. ${LEGUMBRE_COCIDA}`,
      'Chafa unas pocas alubias para espesar el caldo.',
    ],
    nino: { adaptacion: 'Chafa alubias y verdura con un tenedor.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'salmon-papillote', nombre: 'Salmón en papillote con verduras', proteina: 'pescado-azul', minutos: 25, aparato: 'horno', acompanamiento: 'Patata cocida o arroz',
    ingredientes: ing(`p:Salmón en lomos 140; v:Calabacín 100, Zanahoria 60, Puerro 50, Limón 10, Patata 180; d:Eneldo seco, ${AOVE} 6`),
    pasos: [
      'Corta las verduras en tiras finas y ponlas sobre papel de horno con el salmón, eneldo, limón y un hilo de aceite.',
      'Cierra el paquete y hornea 15 min a 200 °C.',
      'Cuece la patata mientras tanto.',
    ],
    nino: { adaptacion: 'Salmón sin piel desmigado y sin espinas; verduras en tiras blandas.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'pavo-champinones-pure', nombre: 'Pavo guisado con champiñones y puré de patata', proteina: 'carne-blanca', minutos: 45,
    ingredientes: ing(`p:Pavo en dados 150; v:Champiñones 120, Cebolla 60, Ajo 5, Patata 220; l:Leche entera 50; d:Tomillo, ${AOVE} 12`),
    pasos: [
      'Dora el pavo y retíralo. Pocha cebolla y ajo, añade los champiñones y el tomillo.',
      'Vuelve a poner el pavo con un vaso de agua y cuece 20 min.',
      'Puré: patata cocida chafada con leche caliente y un hilo de aceite.',
    ],
    nino: { adaptacion: 'Pavo muy tierno, desmigado; puré de patata sin sal; champiñón picado fino.', racion: '3 cucharadas de puré y 2-3 cucharadas de pavo desmigado.' },
  },
  {
    id: 'tortilla-espinacas', nombre: 'Tortilla de espinacas con tomate aliñado', proteina: 'huevo', minutos: 20, acompanamiento: 'Tomate aliñado y pan',
    ingredientes: ing(`p:Huevos 100; v:Espinacas frescas 120, Ajo 5, Tomate 150; c:Pan integral 50; d:${AOVE} 12`),
    pasos: [
      'Saltea el ajo y las espinacas hasta que se reduzcan; escúrrelas bien.',
      'Mézclalas con los huevos batidos y cuaja la tortilla por los dos lados.',
      'Sirve con tomate aliñado.',
    ],
    nino: { adaptacion: 'Bien cuajada, en bastones; tomate pelado en trocitos.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'guiso-alubias-pintas', nombre: 'Guiso de alubias pintas con calabaza y patata', proteina: 'legumbre', minutos: 35, aparato: 'olla-rapida',
    ingredientes: ing(`c:Alubias pintas 70, Pan integral 30; v:Calabaza 120, Patata 80, Cebolla 50, Pimiento rojo 50, Ajo 5; d:Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, pimiento y ajo con el pimentón.',
      'Añade calabaza y patata en dados, las alubias cocidas, el laurel y agua.',
      `Cuece 20 min (o 5 min en olla rápida si las alubias ya están cocidas). ${LEGUMBRE_COCIDA}`,
    ],
    nino: { adaptacion: 'Chafado con tenedor.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'lubina-horno', nombre: 'Lubina al horno con patatas y pimiento verde', proteina: 'pescado-blanco', minutos: 40, aparato: 'horno',
    ingredientes: ing(`p:Lubina en lomos 170; v:Patata 200, Cebolla 50, Pimiento verde 60, Limón 10, Perejil 3, Ajo 5; d:${AOVE} 12`),
    pasos: [
      'Patata, cebolla y pimiento en láminas con aceite: 20 min a 200 °C.',
      'Añade los lomos de lubina con ajo, perejil y limón: 12 min más.',
    ],
    nino: { adaptacion: 'Desmigada sin piel y sin espinas; patata chafada.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },

  // ---------------- Semana 3 ----------------
  {
    id: 'crema-lentejas-rojas', nombre: 'Crema de lentejas rojas con calabaza y zanahoria', proteina: 'legumbre', minutos: 25, acompanamiento: 'Pan integral tostado',
    ingredientes: ing(`c:Lentejas rojas 70, Pan integral 40; v:Calabaza 150, Zanahoria 80, Cebolla 50, Ajo 5; d:Comino, ${AOVE} 10`),
    pasos: [
      'Rehoga cebolla y ajo, añade calabaza y zanahoria en trozos.',
      'Incorpora las lentejas rojas (no necesitan remojo), comino y agua: 18-20 min.',
      'Tritura y sirve con pan tostado.',
    ],
    nino: { adaptacion: 'Crema algo espesa; tiras de pan sin sal para mojar.', racion: 'Un cuenco pequeño (5-6 cucharadas) y una tira de pan.' },
  },
  {
    id: 'abadejo-costra', nombre: 'Abadejo al horno con costra de pan y perejil, con puré de calabacín', proteina: 'pescado-blanco', minutos: 30, aparato: 'horno',
    ingredientes: ing(`p:Abadejo en lomos 170; c:Pan integral 20; v:Ajo 5, Perejil 5, Limón 10, Calabacín 150, Patata 150; d:${AOVE} 12`),
    pasos: [
      'Mezcla pan rallado, ajo y perejil picados y un hilo de aceite; cubre con ello los lomos.',
      'Hornea 12-15 min a 200 °C.',
      'Puré: cuece patata y calabacín 15 min y chafa con aceite.',
    ],
    nino: { adaptacion: 'Pescado desmigado sin espinas con el puré.', racion: 'Un trozo del tamaño de su palma y 3 cucharadas de puré.' },
  },
  {
    id: 'pollo-limon-arroz', nombre: 'Pollo al limón con arroz y zanahoria salteada', proteina: 'carne-blanca', minutos: 30,
    ingredientes: ing(`p:Contramuslo de pollo deshuesado 150; c:Arroz 70; v:Limón 20, Ajo 5, Zanahoria 80, Judías verdes 80; d:Tomillo, ${AOVE} 10`),
    pasos: [
      'Cuece el arroz.',
      'Dora el pollo en trozos con ajo y tomillo; añade el zumo de un limón y medio vaso de agua y reduce 10 min.',
      'Saltea zanahoria en bastones y judías verdes troceadas hasta que estén tiernas.',
    ],
    nino: { adaptacion: 'Pollo desmigado con su jugo; zanahoria y judías bien hechas, en bastones blandos.', racion: '3 cucharadas de arroz, unas tiras de pollo y 3-4 bastones de verdura.' },
  },
  {
    id: 'pastel-verduras', nombre: 'Pastel de verduras al horno', proteina: 'huevo', minutos: 40, aparato: 'horno', acompanamiento: 'Ensalada verde',
    ingredientes: ing(`p:Huevos 100; c:Pan integral 40; v:Calabacín 120, Zanahoria 60, Cebolla 50, Lechuga 60; l:Leche entera 50, Queso rallado 15; d:${AOVE} 10`),
    pasos: [
      'Saltea cebolla, calabacín y zanahoria rallada hasta que estén tiernos.',
      'Bate huevos con un chorro de leche y el queso; mézclalo con las verduras.',
      'Hornea en un molde engrasado 25 min a 180 °C, hasta que al pinchar salga seco.',
    ],
    nino: { adaptacion: 'Totalmente cuajado, en bastones fáciles de coger.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'ensalada-garbanzos', nombre: 'Ensalada de garbanzos con pimiento, pepino y tomate', proteina: 'legumbre', minutos: 15,
    ingredientes: ing(`c:Garbanzos 75, Pan integral 30; v:Pimiento rojo 60, Pepino 80, Tomate 120, Zanahoria 40, Cebolla morada 20, Perejil 3, Limón 10; d:${AOVE} 12`),
    pasos: [
      `Escurre los garbanzos cocidos. ${LEGUMBRE_COCIDA}`,
      'Mézclalos con pimiento, pepino, tomate y cebolla en dados pequeños y zanahoria rallada.',
      'Aliña con aceite, limón y perejil.',
    ],
    nino: { adaptacion: 'Garbanzos chafados con tomate pelado; la zanahoria, cocida (cruda es dura para su edad).', racion: '3-4 cucharadas.' },
  },
  {
    id: 'trucha-horno', nombre: 'Trucha al horno con patatas y judías verdes', proteina: 'pescado-azul', minutos: 35, aparato: 'horno',
    ingredientes: ing(`p:Trucha en filetes 160; v:Patata 200, Judías verdes 120, Limón 10, Ajo 5; d:${AOVE} 10`),
    pasos: [
      'Patata en gajos con aceite: 20 min a 200 °C.',
      'Añade los filetes de trucha con ajo y limón: 10 min.',
      'Cuece las judías verdes 8-10 min.',
    ],
    nino: { adaptacion: 'Desmigada sin piel revisando espinas; patata y judías blandas.', racion: 'Medio filete desmigado y 2-3 trozos de patata.' },
  },
  {
    id: 'espaguetis-bolonesa-lentejas', nombre: 'Espaguetis integrales con boloñesa de lentejas', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Lentejas pardinas 40, Pasta integral 75; v:Cebolla 40, Zanahoria 50, Apio 30, Ajo 5; d:Tomate triturado 120, Orégano, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla, zanahoria, apio y ajo muy picados.',
      'Añade el tomate, el orégano y las lentejas cocidas; cuece 15 min y chafa un poco.',
      'Cuece la pasta y mézclala con la salsa.',
    ],
    nino: { adaptacion: 'Su pasta, corta o los espaguetis partidos en trozos pequeños, bien cocida.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'pizza-casera-verduras', nombre: 'Pizza casera integral de verduras y mozzarella', proteina: 'vegetal', minutos: 40, aparato: 'horno',
    ingredientes: ing(`c:Harina integral 90, Levadura de panadería seca; v:Calabacín 60, Pimiento rojo 40, Champiñones 50, Cebolla 30; l:Mozzarella fresca 60; d:Tomate triturado 60, Orégano, ${AOVE} 10`),
    pasos: [
      'Masa: 250 g de harina, un sobre de levadura seca, 150 ml de agua templada y un chorro de aceite. Amasa 5 min y deja reposar 20 min.',
      'Estírala fina, cubre con tomate, verduras en láminas finas y mozzarella.',
      'Hornea 12-15 min a 220 °C.',
      'Si quieres sal en la masa, deja una parte sin sal para el niño.',
    ],
    nino: { adaptacion: 'Masa sin sal, en tiras; verduras bien hechas.', racion: 'Una porción pequeña en tiras.' },
  },
  {
    id: 'minestrone-alubias', nombre: 'Minestrone de alubias con pasta', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Alubias blancas 50, Pasta pequeña 40; v:Calabacín 80, Zanahoria 50, Apio 30, Puerro 40, Ajo 5; d:Tomate triturado 80, Orégano, ${AOVE} 10`),
    pasos: [
      'Rehoga puerro, apio, zanahoria y ajo; añade calabacín en dados y el tomate.',
      'Cubre con agua y cuece 15 min; añade la pasta pequeña y las alubias cocidas, 10 min más.',
      LEGUMBRE_COCIDA,
    ],
    nino: { adaptacion: 'Con poco caldo y las alubias chafadas.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'hamburguesas-salmon', nombre: 'Hamburguesas caseras de salmón con boniato', proteina: 'pescado-azul', minutos: 30, aparato: 'freidora', acompanamiento: 'Bastones de boniato y ensalada',
    ingredientes: ing(`p:Salmón en lomos 140; c:Copos de avena 15; v:Cebolleta 20, Perejil 3, Limón 5, Boniato 180, Lechuga 60; d:${AOVE} 8`),
    pasos: [
      'Pica el salmón sin piel a cuchillo y mézclalo con cebolleta y perejil picados, ralladura de limón y 2 cucharadas de copos de avena.',
      'Forma hamburguesas y hazlas en la plancha 3 min por lado.',
      'Boniato en bastones en la freidora de aire: 15-18 min a 190 °C.',
    ],
    nino: { adaptacion: 'Hamburguesa en tiras; boniato en bastones blandos.', racion: 'Media hamburguesa pequeña y 3-4 bastones.' },
  },
  {
    id: 'conejo-horno', nombre: 'Conejo al horno con patatas y romero', proteina: 'carne-blanca', minutos: 60, aparato: 'horno', acompanamiento: 'Ensalada de tomate',
    ingredientes: ing(`p:Conejo troceado 170; v:Patata 220, Cebolla 50, Ajo 5, Tomate 100; d:Romero, Tomillo, ${AOVE} 12`),
    pasos: [
      'Patata y cebolla en trozos con aceite en la bandeja.',
      'Pon el conejo encima con ajo, romero y tomillo y un vaso de agua.',
      'Hornea 45-50 min a 190 °C, girando a mitad.',
    ],
    nino: { adaptacion: 'Carne desmigada revisando muy bien que no queden huesecillos.', racion: '2-3 cucharadas de carne desmigada y 3 trozos de patata.' },
  },
  {
    id: 'revuelto-trigueros-gambas', nombre: 'Revuelto de trigueros y gambas con tostada', proteina: 'huevo', minutos: 20,
    ingredientes: ing(`p:Huevos 100, Gambas peladas 60; v:Espárragos trigueros 120, Ajo 5, Tomate 50; c:Pan integral 50; d:${AOVE} 10`),
    pasos: [
      'Saltea el ajo y los trigueros en trozos; añade las gambas 1 min.',
      'Incorpora los huevos batidos y remueve a fuego suave hasta que cuajen.',
      'Sirve con pan tostado con tomate.',
    ],
    nino: { adaptacion: 'Huevo bien cuajado, gamba picada fina y solo las puntas tiernas del espárrago.', racion: '3-4 cucharadas de revuelto y una tira de pan.' },
  },
  {
    id: 'fideua-pescado', nombre: 'Fideuá de merluza y gambas', proteina: 'pescado-blanco', minutos: 40,
    ingredientes: ing(`c:Fideos 80; p:Merluza en lomos 100, Gambas peladas 50; v:Pimiento rojo 50, Ajo 5, Limón 10; d:Tomate triturado 60, Pimentón dulce, ${AOVE} 12`),
    pasos: [
      'Sofríe ajo y pimiento, añade el pimentón y el tomate.',
      'Tuesta un poco los fideos en el sofrito y añade el doble de agua (o caldo de pescado casero).',
      'A los 6 min incorpora la merluza y las gambas; termina 4-5 min y deja reposar.',
    ],
    nino: { adaptacion: 'Fideos blandos con la merluza desmigada; gamba picada fina.', racion: '4-5 cucharadas.' },
  },
  {
    id: 'brochetas-pavo', nombre: 'Brochetas de pavo con verduras y cuscús', proteina: 'carne-blanca', minutos: 30, aparato: 'freidora',
    ingredientes: ing(`p:Pechuga de pavo 140; c:Cuscús integral 60; v:Pimiento rojo 60, Calabacín 80, Cebolla 40, Champiñones 60, Limón 10; d:Pimentón dulce, ${AOVE} 10`),
    pasos: [
      'Marina el pavo en dados con limón, pimentón y aceite 10 min.',
      'Ensarta pavo y verduras en brochetas: freidora de aire 12-14 min a 190 °C (o plancha).',
      'Hidrata el cuscús con el mismo volumen de agua hirviendo, 5 min tapado.',
    ],
    nino: { adaptacion: 'Fuera del palillo: pavo en tiras finas y verduras blandas.', racion: '3 cucharadas de cuscús y unas tiras de pavo.' },
  },

  // ---------------- Semana 4 ----------------
  {
    id: 'cocido-ligero', nombre: 'Cocido ligero de garbanzos y verduras', proteina: 'legumbre', minutos: 40, aparato: 'olla-rapida',
    ingredientes: ing(`c:Garbanzos 75, Fideos 20; v:Repollo 100, Zanahoria 60, Patata 80, Puerro 40, Apio 30; d:Laurel, ${AOVE} 8`),
    pasos: [
      'Pon en la olla garbanzos (remojados la noche anterior), zanahoria, puerro, apio y laurel con agua.',
      'Olla rápida 20 min (o usa garbanzos cocidos y cuece las verduras 25 min en cazuela).',
      'Añade patata y repollo 10 min más. Con parte del caldo, haz una sopa de fideos.',
    ],
    nino: { adaptacion: 'Garbanzos y verduras chafados; sopa de fideos templada.', racion: '3-4 cucharadas de garbanzos con verdura y unas cucharadas de sopa.' },
  },
  {
    id: 'merluza-papillote', nombre: 'Merluza en papillote con verduras', proteina: 'pescado-blanco', minutos: 25, aparato: 'horno', acompanamiento: 'Patata cocida',
    ingredientes: ing(`p:Merluza en lomos 170; v:Puerro 50, Zanahoria 60, Calabacín 80, Tomate 60, Limón 10, Patata 180; d:${AOVE} 8`),
    pasos: [
      'Verduras en tiras finas sobre papel de horno con la merluza, limón y un hilo de aceite.',
      'Cierra el paquete y hornea 15 min a 200 °C.',
      'Cuece la patata mientras tanto.',
    ],
    nino: { adaptacion: 'Desmigada sin espinas, con las verduras blandas.', racion: 'Un trozo del tamaño de su palma y 2-3 trozos de patata.' },
  },
  {
    id: 'fajitas-pollo', nombre: 'Fajitas caseras de pollo y pimientos', proteina: 'carne-blanca', minutos: 25,
    ingredientes: ing(`p:Pechuga de pollo 140; c:Tortillas de trigo integral 60; v:Pimiento rojo 60, Pimiento verde 50, Cebolla 50, Aguacate 50, Tomate 60, Limón 10; l:Yogur natural 40; d:Comino, Pimentón dulce, ${AOVE} 8`),
    pasos: [
      'Saltea el pollo en tiras con comino y pimentón; añade pimientos y cebolla en tiras hasta que estén tiernos.',
      'Prepara guacamole sencillo (aguacate, tomate y limón) y una salsa de yogur.',
      'Calienta las tortillas y rellénalas. Elige tortillas con pocos ingredientes.',
    ],
    nino: { adaptacion: 'Pollo y pimiento blando en tiras; aguacate en bastones; un trozo de tortilla sin relleno para que lo coja.', racion: 'Unas tiras de pollo, 3-4 tiras de pimiento y aguacate.' },
  },
  {
    id: 'frittata-brocoli', nombre: 'Frittata de brócoli y queso', proteina: 'huevo', minutos: 25, aparato: 'horno', acompanamiento: 'Ensalada de tomate',
    ingredientes: ing(`p:Huevos 100; c:Pan integral 40; v:Brócoli 130, Cebolla 40, Tomate 120; l:Queso tierno 20, Leche entera 30; d:${AOVE} 8`),
    pasos: [
      'Cuece el brócoli en arbolitos pequeños 5 min y pocha la cebolla.',
      'Bate huevos con un chorro de leche y el queso; mézclalo todo en una sartén apta para horno.',
      'Cuaja 3 min al fuego y termina 10-12 min en el horno a 190 °C.',
    ],
    nino: { adaptacion: 'Totalmente cuajada, en bastones.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'lentejas-curry-arroz', nombre: 'Lentejas con espinacas al curry suave y arroz', proteina: 'legumbre', minutos: 30,
    ingredientes: ing(`c:Lentejas pardinas 60, Arroz 40; v:Espinacas frescas 80, Cebolla 50, Ajo 5, Tomate 80; l:Yogur natural 40; d:Curry suave en polvo, ${AOVE} 10`),
    pasos: [
      'Pocha cebolla y ajo, añade el curry suave y el tomate en dados (5 min).',
      `Incorpora las lentejas cocidas y un vaso de agua: 10 min. Al final, las espinacas. ${LEGUMBRE_COCIDA}`,
      'Sirve con arroz y una cucharada de yogur.',
    ],
    nino: { adaptacion: 'Lentejas chafadas con el arroz; espinaca picada fina.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'sardinas-horno', nombre: 'Sardinas al horno con tomate', proteina: 'pescado-azul', minutos: 25, aparato: 'horno', acompanamiento: 'Ensalada y pan integral',
    ingredientes: ing(`p:Sardinas limpias y abiertas 150; v:Tomate 150, Ajo 5, Perejil 3, Limón 10, Lechuga 60; c:Pan integral 50; d:${AOVE} 8`),
    pasos: [
      'Pide las sardinas limpias, abiertas y sin espina.',
      'Ponlas sobre rodajas de tomate con ajo, perejil y pan rallado por encima.',
      'Hornea 10 min a 200 °C.',
    ],
    nino: { adaptacion: 'Lomos sin espinas, desmigados con el tomate asado.', racion: '2-3 sardinas desmigadas.' },
  },
  {
    id: 'ternera-guisada', nombre: 'Ternera guisada con patatas y zanahoria', proteina: 'carne-roja', minutos: 50, aparato: 'olla-rapida',
    ingredientes: ing(`p:Ternera para guisar 150; v:Patata 180, Zanahoria 80, Cebolla 50, Ajo 5, Guisantes congelados 50; d:Tomate triturado 60, Laurel, ${AOVE} 10`),
    pasos: [
      'Dora la carne en dados y retírala. Sofríe cebolla y ajo, añade el tomate.',
      'Vuelve a poner la carne con laurel y agua: olla rápida 25 min (cazuela, 1 h 15 min).',
      'Abre, añade patata, zanahoria y guisantes y cuece 15 min más.',
    ],
    nino: { adaptacion: 'Carne muy tierna, deshebrada en hilos; patata y zanahoria chafadas; guisantes chafados.', racion: '2-3 cucharadas de carne deshebrada y 3 de verdura.' },
  },
  {
    id: 'patatas-rellenas', nombre: 'Patatas rellenas de verduras y queso', proteina: 'vegetal', minutos: 35, aparato: 'horno', acompanamiento: 'Ensalada verde',
    ingredientes: ing(`v:Patata 250, Brócoli 100, Champiñones 80, Cebolla 40, Lechuga 60; l:Queso rallado 30, Yogur natural 60; d:${AOVE} 8`),
    pasos: [
      'Cuece las patatas enteras (microondas 8-10 min o 25 min hervidas) y vacíalas un poco.',
      'Mezcla la pulpa con brócoli picado, champiñones y cebolla salteados, yogur y queso.',
      'Rellena, cubre con queso y gratina 10 min a 200 °C.',
    ],
    nino: { adaptacion: 'Relleno chafado con la pulpa, sin la piel.', racion: 'Media patata con su relleno.' },
  },
  {
    id: 'potaje-alubias-acelgas', nombre: 'Potaje de alubias con acelgas', proteina: 'legumbre', minutos: 35,
    ingredientes: ing(`c:Alubias blancas 75, Pan integral 30; v:Acelgas 150, Patata 80, Cebolla 50, Ajo 5; d:Pimentón dulce, Laurel, ${AOVE} 10`),
    pasos: [
      'Sofríe cebolla y ajo con el pimentón.',
      `Añade la patata en trozos, las acelgas picadas, el laurel y agua: 15 min. Incorpora las alubias cocidas y 10 min más. ${LEGUMBRE_COCIDA}`,
    ],
    nino: { adaptacion: 'Chafado con la acelga picada fina.', racion: '3-4 cucharadas soperas.' },
  },
  {
    id: 'salmon-yogur', nombre: 'Salmón con salsa de yogur y eneldo, patata y brócoli', proteina: 'pescado-azul', minutos: 25,
    ingredientes: ing(`p:Salmón en lomos 140; v:Patata 180, Brócoli 120, Limón 10; l:Yogur natural 60; d:Eneldo seco, ${AOVE} 5`),
    pasos: [
      'Cuece la patata en trozos 15 min y el brócoli al vapor 6-7 min.',
      'Haz el salmón a la plancha 3-4 min por lado.',
      'Salsa: yogur natural con eneldo y unas gotas de limón.',
    ],
    nino: { adaptacion: 'Salmón desmigado sin piel ni espinas con un poco de salsa de yogur; brócoli blando.', racion: 'Un trozo del tamaño de su palma, 2 trozos de patata y 2-3 arbolitos.' },
  },
  {
    id: 'hamburguesas-pollo', nombre: 'Hamburguesas caseras de pollo con patatas y ensalada', proteina: 'carne-blanca', minutos: 30, aparato: 'freidora', acompanamiento: 'Patatas en la freidora de aire y ensalada',
    ingredientes: ing(`p:Carne picada de pollo 140; c:Copos de avena 15; v:Cebolla 20, Perejil 3, Ajo 3, Patata 200, Lechuga 60, Tomate 80; d:${AOVE} 10`),
    pasos: [
      'Mezcla la carne con cebolla, ajo y perejil muy picados y 2 cucharadas de copos de avena. Forma hamburguesas.',
      'Patatas en gajos en la freidora de aire: 18-20 min a 190 °C, removiendo a mitad.',
      'Haz las hamburguesas a la plancha 4-5 min por lado (bien hechas por dentro).',
    ],
    nino: { adaptacion: 'Hamburguesa bien hecha por dentro, en tiras; patata blanda; tomate pelado en trocitos.', racion: 'Media hamburguesa pequeña y 3 gajos de patata.' },
  },
  {
    id: 'tortilla-patata', nombre: 'Tortilla de patata con pimientos asados', proteina: 'huevo', minutos: 35, acompanamiento: 'Pimientos asados',
    ingredientes: ing(`p:Huevos 100; v:Patata 180, Cebolla 50, Pimiento rojo 100; d:${AOVE} 15`),
    pasos: [
      'Patata y cebolla en láminas: pocha a fuego suave con poco aceite y tapa (20 min), o cuécelas 6-8 min en el microondas.',
      'Mezcla con los huevos batidos y cuaja por los dos lados.',
      'Acompaña con pimientos asados.',
    ],
    nino: { adaptacion: 'Su trozo bien cuajado, en bastones.', racion: 'Un bastón equivalente a medio huevo-1 huevo.' },
  },
  {
    id: 'lasana-lentejas', nombre: 'Lasaña de verduras y lentejas', proteina: 'legumbre', minutos: 60, aparato: 'horno',
    ingredientes: ing(`c:Lentejas pardinas 45, Placas de lasaña 50, Harina de trigo 8; v:Berenjena 80, Calabacín 80, Cebolla 40, Zanahoria 40; l:Leche entera 100, Queso rallado 20; d:Tomate triturado 80, ${AOVE} 12`),
    pasos: [
      'Relleno: sofríe cebolla, zanahoria, berenjena y calabacín en dados; añade tomate y las lentejas cocidas (15 min).',
      'Bechamel ligera: 2 cucharadas de aceite y 2 de harina, y medio litro de leche poco a poco sin dejar de remover.',
      'Alterna placas y relleno, cubre con bechamel y queso y hornea 25 min a 190 °C.',
    ],
    nino: { adaptacion: 'Su porción troceada pequeña, templada.', racion: 'Una porción pequeña (como la palma de su mano).' },
  },
  {
    id: 'lenguado-pure-calabaza', nombre: 'Lenguado a la plancha con puré de calabaza', proteina: 'pescado-blanco', minutos: 25,
    ingredientes: ing(`p:Lenguado en filetes 180; v:Calabaza 200, Patata 120, Limón 10, Perejil 3; l:Leche entera 40; d:${AOVE} 10`),
    pasos: [
      'Cuece calabaza y patata 15 min y chafa con un chorro de leche y aceite.',
      'Haz los filetes a la plancha 2 min por lado y termina con limón y perejil.',
    ],
    nino: { adaptacion: 'Lenguado desmigado (es muy fácil de masticar), revisando espinas; puré.', racion: 'Un filete pequeño desmigado y 3 cucharadas de puré.' },
  },
];

export const RECETAS: Receta[] = [...RECETAS_1, ...RECETAS_2];

export const receta = (id: string): Receta | undefined => RECETAS.find((r) => r.id === id);
