// Guía: fichas de variedades, procesos y agua. Todo contrastado el 8 de octubre de 2026 con la
// fuente indicada en cada ficha. Las descripciones son resúmenes propios en castellano; no se
// añaden notas de sabor por variedad porque las fuentes de referencia no las dan (el sabor
// depende sobre todo del origen, el proceso y el tueste).

export interface Fuente {
  titulo: string;
  url: string;
}

export interface FichaVariedad {
  id: string;
  nombre: string;
  /** Nombres del catálogo de la app (campo Variedades de un café) que remiten a esta ficha. */
  alias: string[];
  grupo: string;
  resumen: string;
  porte?: string;
  rendimiento?: string;
  calidad?: string;
  altitud?: string;
  roya?: string;
  antracnosis?: string;
  nematodos?: string;
  grano?: string;
  origen: string;
  fuente: Fuente;
}

const wcr = (slug: string, nombre: string): Fuente => ({ titulo: `World Coffee Research · Catálogo de variedades · ${nombre}`, url: `https://varieties.worldcoffeeresearch.org/varieties/${slug}` });
const BT = 'Bourbon-Typica';
const CERCA = 'cerca del ecuador';

/** Las alturas de WCR dependen de la latitud; se da la referencia cerca del ecuador (5° N - 5° S). */
export const VARIEDADES_GUIA: FichaVariedad[] = [
  {
    id: 'typica', nombre: 'Typica', alias: ['Typica'], grupo: `${BT} (rama Typica)`,
    resumen: 'Una de las arábicas más importantes cultural y genéticamente, de gran calidad en Centroamérica. Produce muy poco y es sensible a las grandes enfermedades. También se conoce como Criollo, Arábigo o Blue Mountain, entre otros nombres.',
    porte: 'Alto', rendimiento: 'Bajo', calidad: 'Muy buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Etiopía → Yemen (siglos XV-XVI) → Java, Europa y América desde finales del siglo XVII.', fuente: wcr('typica', 'Typica'),
  },
  {
    id: 'bourbon', nombre: 'Bourbon', alias: ['Bourbon'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Una de las arábicas más importantes del mundo, conocida por su excelente calidad en taza.',
    porte: 'Alto', rendimiento: 'Medio', calidad: 'Muy buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'De Yemen a la isla de Bourbon (hoy La Reunión) a principios del siglo XVIII.', fuente: wcr('bourbon', 'Bourbon'),
  },
  {
    id: 'caturra', nombre: 'Caturra', alias: ['Caturra'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Mutación natural de Bourbon de porte compacto. Buen rendimiento y calidad estándar en Centroamérica.',
    porte: 'Enano o compacto', rendimiento: 'Medio', calidad: 'Buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'Descubierta en Brasil entre 1915 y 1918; seleccionada por el Instituto Agronômico (IAC).', fuente: wcr('caturra', 'Caturra'),
  },
  {
    id: 'catuai', nombre: 'Catuaí', alias: ['Catuaí'], grupo: `${BT} (ramas Typica y Bourbon)`,
    resumen: 'Planta compacta de rendimiento muy alto y calidad estándar en Centroamérica.',
    porte: 'Enano o compacto', rendimiento: 'Muy alto', calidad: 'Buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'Instituto Agronômico (IAC), Brasil, 1949.', fuente: wcr('catuai', 'Catuai'),
  },
  {
    id: 'mundo-novo', nombre: 'Mundo Novo', alias: ['Mundo Novo'], grupo: `${BT} (cruce natural Typica × Bourbon)`,
    resumen: 'Planta vigorosa y productiva, con buena calidad en taza pero sensible a las grandes enfermedades.',
    porte: 'Alto', rendimiento: 'Medio', calidad: 'Buena', altitud: 'Alta', roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'Cruce natural descubierto en Brasil (1943); seleccionado por el IAC entre 1943 y 1952.', fuente: wcr('mundo-novo', 'Mundo Novo'),
  },
  {
    id: 'pacas', nombre: 'Pacas', alias: ['Pacas'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Mutación natural de Bourbon de porte compacto. Calidad estándar en Centroamérica y muy sensible a la roya.',
    porte: 'Enano o compacto', rendimiento: 'Medio', calidad: 'Buena', altitud: 'Alta', roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'Descubierta en El Salvador en 1949 (ISIC).', fuente: wcr('pacas', 'Pacas'),
  },
  {
    id: 'villa-sarchi', nombre: 'Villa Sarchi', alias: ['Villa Sarchi'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Variedad compacta de la rama Bourbon, bien adaptada a las mayores altitudes y tolerante al viento fuerte.',
    porte: 'Enano o compacto', rendimiento: 'Medio', calidad: 'Buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Por debajo de la media',
    origen: 'Costa Rica, años 50-60 (ICAFE).', fuente: wcr('villa-sarchi', 'Villa Sarchi'),
  },
  {
    id: 'maragogipe', nombre: 'Maragogipe', alias: ['Maragogipe'], grupo: `${BT} (rama Typica)`,
    resumen: 'Mutación de Typica con granos enormes. Calidad de buena a muy buena en Centroamérica, pero muy sensible a la roya.',
    porte: 'Alto', rendimiento: 'Bajo', calidad: 'Muy buena', altitud: 'Alta', roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Muy grande',
    origen: 'Mutación natural descubierta en Brasil en 1870.', fuente: wcr('maragogipe', 'Maragogipe'),
  },
  {
    id: 'pacamara', nombre: 'Pacamara', alias: ['Pacamara'], grupo: `${BT} (Pacas × Maragogipe)`,
    resumen: 'Capaz de dar una calidad en taza excepcional. Grano muy grande y muy alta sensibilidad a la roya.',
    porte: 'Enano o compacto', rendimiento: 'Bajo', calidad: 'Excepcional', altitud: 'Alta', roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Muy grande',
    origen: 'Cruce de Pacas y Maragogipe del Instituto Salvadoreño de Investigaciones del Café (ISIC).', fuente: wcr('pacamara', 'Pacamara'),
  },
  {
    id: 'geisha', nombre: 'Gesha / Geisha', alias: ['Gesha / Geisha'], grupo: 'Variedad local etíope',
    resumen: 'Calidad excepcionalmente alta a gran altitud. La ficha de referencia es la de la Geisha de Panamá.',
    porte: 'Alto', rendimiento: 'Bajo', calidad: 'Excepcional', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Intermedia', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'Recolectada en bosques de Etiopía en los años 30; llegó a Panamá a través del CATIE en los 60.', fuente: wcr('geisha-panama', 'Geisha (Panama)'),
  },
  {
    id: 'java', nombre: 'Java', alias: ['Java'], grupo: 'Variedad local etíope',
    resumen: 'Alta calidad en Centroamérica, tolerante a la antracnosis del fruto y con pocas necesidades de abono.',
    porte: 'Alto', rendimiento: 'Medio', calidad: 'Muy buena', altitud: 'Alta', roya: 'Susceptible', antracnosis: 'Tolerante', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Etiopía → Java (holandeses, principios del XIX) → Camerún → Centroamérica (CIRAD, 1991).', fuente: wcr('java', 'Java'),
  },
  {
    id: 'sl28', nombre: 'SL28', alias: ['SL28'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Tolerante a la sequía y con potencial de calidad muy alto, pero sensible a las grandes enfermedades. Clásica de Kenia.',
    porte: 'Alto', rendimiento: 'Bajo', calidad: 'Excepcional', altitud: `Más de 1200 m ${CERCA}`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Scott Agricultural Laboratories, Kenia, 1935.', fuente: wcr('sl28', 'SL28'),
  },
  {
    id: 'sl34', nombre: 'SL34', alias: ['SL34'], grupo: `${BT} (rama Typica)`,
    resumen: 'Calidad en taza excepcional, pero muy sensible a la antracnosis del fruto. Clásica de Kenia.',
    porte: 'Alto', rendimiento: 'Medio', calidad: 'Excepcional', altitud: `Más de 1200 m ${CERCA}`, roya: 'Susceptible', antracnosis: 'Susceptible', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Scott Agricultural Laboratories, Kenia, finales de los años 30.', fuente: wcr('sl34', 'SL34'),
  },
  {
    id: 'k7', nombre: 'K7', alias: ['K7'], grupo: `${BT} (rama Bourbon)`,
    resumen: 'Tolerante a la antracnosis del fruto. Se encuentra sobre todo en Kenia y Tanzania.',
    porte: 'Alto', rendimiento: 'Medio', calidad: 'Buena', altitud: `1000-1600 m ${CERCA}`, roya: 'Susceptible', antracnosis: 'Tolerante', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'R. H. Walker, Kenia, 1936.', fuente: wcr('k7', 'K7'),
  },
  {
    id: 'ruiru-11', nombre: 'Ruiru 11', alias: ['Ruiru 11'], grupo: 'Híbrido F1 (introgresado)',
    resumen: 'Híbrido compacto de rendimiento muy alto, tolerante a la roya y resistente a la antracnosis del fruto.',
    porte: 'Enano o compacto', rendimiento: 'Muy alto', calidad: 'Buena', altitud: `Más de 1000 m ${CERCA}`, roya: 'Alta resistencia', antracnosis: 'Resistente', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Coffee Research Foundation, Kenia, 1985.', fuente: wcr('ruiru-11', 'Ruiru 11'),
  },
  {
    id: 'batian', nombre: 'Batian', alias: ['Batian'], grupo: 'Introgresado',
    resumen: 'Variedad alta que combina rendimiento alto, tolerancia a la roya, resistencia a la antracnosis del fruto y buena calidad en taza.',
    porte: 'Alto', rendimiento: 'Alto', calidad: 'Muy buena', altitud: `1000-1200 m ${CERCA}`, roya: 'Intermedia', antracnosis: 'Resistente', nematodos: 'Susceptible', grano: 'Muy grande',
    origen: 'Coffee Research Foundation, Kenia, 2010.', fuente: wcr('batian', 'Batian'),
  },
  {
    id: 'catimor-129', nombre: 'Catimor', alias: ['Catimor'], grupo: 'Introgresado (Caturra × Híbrido de Timor)',
    resumen: 'Familia de variedades compactas y productivas con resistencia a la roya heredada del Híbrido de Timor. Ficha de referencia: Catimor 129.',
    porte: 'Enano o compacto', rendimiento: 'Alto', calidad: 'Buena', altitud: `Alta (más de 1600 m ${CERCA})`, roya: 'Intermedia', antracnosis: 'Resistente', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Catimor 129: Caturra × Híbrido de Timor 1343; liberada en Malaui en 2006.', fuente: wcr('catimor-129', 'Catimor 129'),
  },
  {
    id: 'marsellesa', nombre: 'Marsellesa', alias: ['Marsellesa'], grupo: 'Introgresado (Sarchimor)',
    resumen: 'Productiva y adaptada a altitudes medias. Acidez notablemente alta en taza.',
    porte: 'Enano o compacto', rendimiento: 'Alto', calidad: 'Buena', altitud: `1000-1600 m ${CERCA}`, roya: 'Intermedia', antracnosis: 'Tolerante', nematodos: 'Susceptible', grano: 'Medio',
    origen: 'CIRAD y ECOM, Nicaragua, 2009.', fuente: wcr('marsellesa', 'Marsellesa'),
  },
  {
    id: 'parainema', nombre: 'Parainema', alias: ['Parainema'], grupo: 'Introgresado (Sarchimor)',
    resumen: 'Adaptada a altitudes medias, resistente a la roya y a algunos nematodos.',
    porte: 'Enano o compacto', rendimiento: 'Muy alto', calidad: 'Buena', altitud: `1000-1600 m ${CERCA}`, roya: 'Alta resistencia', antracnosis: 'Tolerante', nematodos: 'Resistente a algunos Meloidogyne', grano: 'Grande',
    origen: 'IHCAFE, Honduras, 2004.', fuente: wcr('parainema', 'Parainema'),
  },
  {
    id: 'centroamericano', nombre: 'Centroamericano (H1)', alias: ['Centroamericano (H1)'], grupo: 'Híbrido F1 (introgresado)',
    resumen: 'Rendimiento muy alto y muy buen potencial de calidad si se planta en suelo sano y por encima de 1300 m; resistente a la roya.',
    porte: 'Enano o compacto', rendimiento: 'Muy alto', calidad: 'Muy buena', altitud: `Más de 1000 m ${CERCA}`, roya: 'Alta resistencia', antracnosis: 'Tolerante', nematodos: 'Susceptible', grano: 'Grande',
    origen: 'Consorcio CIRAD, CATIE, ICAFE, IHCAFE, PROCAFE y ANACAFE; liberado en 2010.', fuente: wcr('centroamericano', 'Centroamericano'),
  },
  {
    id: 'castillo', nombre: 'Castillo', alias: ['Castillo'], grupo: 'Introgresado (Caturra × Híbrido de Timor)',
    resumen: 'Variedad compuesta (mezcla de líneas) de porte bajo, adaptada a la zona cafetera colombiana, con producción alta y resistencia a la roya. Es una de las más plantadas de Colombia.',
    porte: 'Bajo', rendimiento: 'Alto', roya: 'Resistente',
    origen: 'Cenicafé; liberada por la Federación Nacional de Cafeteros de Colombia en 2005.',
    fuente: { titulo: 'Cenicafé · Revista Cenicafé (artículo sobre la variedad Castillo)', url: 'https://www.cenicafe.org/es/publications/arc057%2802%29100-121.pdf' },
  },
  {
    id: 'landrace-etiope', nombre: 'Variedades locales etíopes («heirloom»)', alias: ['Landrace etíope (heirloom)', '74110', '74112', '74158', 'Kurume', 'Wolisho', 'Dega', 'Wush Wush'], grupo: 'Variedades locales etíopes',
    resumen: 'Etiopía es el origen del arábica y tiene una enorme diversidad. «Heirloom» agrupa poblaciones locales y selecciones del Jimma Agricultural Research Center (JARC), como 74110 y 74112, elegidas por su resistencia a enfermedades y su productividad. Por eso un café etíope rara vez indica una sola variedad.',
    origen: 'Etiopía; selecciones del Jimma Agricultural Research Center (JARC).',
    fuente: { titulo: 'Sucafina · Glosario de variedades', url: 'https://sucafina.com/na/About/glossary' },
  },
];

export interface FichaProceso {
  id: string;
  nombre: string;
  alias: string[];
  resumen: string;
  como: string;
  taza: string;
  variantes?: string[];
  fuente: Fuente;
}

const ACHILLES: Fuente = { titulo: 'Achilles Coffee Roasters · «Coffee Processing Methods Explained»', url: 'https://achillescoffeeroasters.com/blogs/specialty-coffee-blog/coffee-processing-methods-explained-washed-natural-honey-and-wet-hulled' };

export const PROCESOS_GUIA: FichaProceso[] = [
  {
    id: 'lavado', nombre: 'Lavado', alias: ['Lavado', 'Doble lavado (Kenia)'],
    resumen: 'Se quita toda la fruta antes de secar. Es el proceso que deja ver con más claridad el origen y la variedad.',
    como: 'Se retiran pronto la piel y la pulpa; el mucílago se elimina (normalmente fermentando y lavando) y el grano se seca dentro de su pergamino.',
    taza: 'Suele asociarse a sabores limpios y bien separados y a una acidez nítida: cítricos, florales, fruta de hueso o hierbas.',
    fuente: ACHILLES,
  },
  {
    id: 'natural', nombre: 'Natural', alias: ['Natural'],
    resumen: 'La cereza entera se seca con el grano dentro. Es el método más antiguo.',
    como: 'La cereza se seca intacta, normalmente al sol en camas elevadas, y después se retiran todas las capas secas de fruta.',
    taza: 'Suele dar aroma frutal intenso, mucho dulzor percibido y cuerpo redondo y almibarado: frutos rojos, fruta tropical, chocolate, frutos secos.',
    fuente: ACHILLES,
  },
  {
    id: 'honey', nombre: 'Honey', alias: ['Honey blanco', 'Honey amarillo', 'Honey rojo', 'Honey negro', 'Semilavado (pulped natural)'],
    resumen: 'Punto intermedio entre lavado y natural: se quita la piel y la pulpa, pero se seca con parte del mucílago pegado (la «miel»).',
    como: 'Tras despulpar, el grano se seca con parte del mucílago sobre el pergamino. El color indica cuánto mucílago queda y lo lento que se seca.',
    taza: 'Suele conservar la acidez del lavado y añadir dulzor, fruta y cuerpo; el resultado depende de cuánto mucílago se deja.',
    variantes: [
      'Blanco y amarillo: menos mucílago, más volteos y secado más rápido; perfil más limpio.',
      'Rojo: más mucílago o secado más lento; más fruta y dulzor.',
      'Negro: mucho mucílago y secado lento; el perfil más intenso.',
      '«Pulped natural» y «semilavado» se usan a menudo como sinónimos cercanos.',
    ],
    fuente: ACHILLES,
  },
  {
    id: 'wet-hulled', nombre: 'Wet-hulled (Giling Basah)', alias: ['Wet-hulled (Giling Basah)'],
    resumen: 'Proceso típico de Indonesia: el pergamino se quita cuando el grano aún está muy húmedo.',
    como: 'Se retira el pergamino con el grano todavía al 30-40 % de humedad y el grano verde ya expuesto termina de secarse.',
    taza: 'Suele asociarse a cuerpo lleno, acidez baja o moderada y notas terrosas, herbales, de tabaco, cedro, especias o chocolate negro.',
    fuente: ACHILLES,
  },
  {
    id: 'anaerobico', nombre: 'Fermentación anaeróbica', alias: ['Anaeróbico lavado', 'Anaeróbico natural'],
    resumen: 'Fermentación en tanques cerrados sin oxígeno, combinada después con un secado lavado, natural o honey.',
    como: 'Las cerezas (enteras o despulpadas) fermentan en recipientes sellados con válvula, desde unas 12 horas hasta más de una semana. Luego se secan como lavado, natural o honey.',
    taza: 'Suele dar fruta intensa (tropical, de hueso), un carácter vinoso, acidez más suave y redonda (a veces «a yogur»), cuerpo lleno y dulzor concentrado.',
    fuente: { titulo: 'Ozone Coffee · «Anaerobic Fermentation»', url: 'https://ozonecoffee.co.uk/blogs/coffee-processing-explained/anaerobic-fermentation-coffee' },
  },
  {
    id: 'maceracion-carbonica', nombre: 'Maceración carbónica', alias: ['Maceración carbónica'],
    resumen: 'Técnica tomada del vino: un tipo de fermentación anaeróbica con la cereza entera en un tanque lleno de CO₂.',
    como: 'Las cerezas enteras e intactas fermentan en un tanque sellado purgado con dióxido de carbono.',
    taza: 'Suele dar frutos rojos (cereza, frambuesa, ciruela) con notas tropicales, textura sedosa y acidez brillante; aromático más que «fermentado».',
    variantes: ['Se popularizó en 2015, cuando Saša Šestić ganó el Campeonato Mundial de Baristas con un café procesado así.'],
    fuente: { titulo: 'Ozone Coffee · «What Is Carbonic Maceration Coffee?»', url: 'https://ozonecoffee.co.uk/blogs/coffee-processing-explained/what-is-carbonic-maceration' },
  },
];

// ---------- Agua ----------

/** Rango de sólidos disueltos recomendado por la SCA para preparar café (mg/L). */
export const AGUA_SCA = { tdsObjetivo: 150, tdsMin: 75, tdsMax: 250, phObjetivo: 7, phMin: 6.5, phMax: 7.5 };

export const FUENTES_AGUA: Fuente[] = [
  { titulo: 'Archers Coffee · «Thinking About Water for Coffee» (valores del estándar SCA)', url: 'https://archerscoffee.com/blogs/brew-guides/water-for-coffee' },
  { titulo: 'Third Wave Water · «Water TDS and why it matters» (TDS SCA)', url: 'https://thirdwavewater.com/blogs/news/water-tds-and-why-it-matters-when-brewing-coffee' },
  { titulo: 'Directiva 2009/54/CE de aguas minerales naturales, anexo III (BOE/DOUE)', url: 'https://boe.es/doue/2009/164/L00045-00058.pdf' },
];

/** Clasificación de la etiqueta según el residuo seco (Directiva 2009/54/CE, anexo III). */
export function clasificacionEtiqueta(residuo: number): string {
  if (residuo <= 50) return 'Mineralización muy débil';
  if (residuo <= 500) return 'Mineralización débil';
  if (residuo > 1500) return 'Mineralización fuerte';
  return 'Mineralización media';
}

export type EstadoAgua = 'bajo' | 'ideal' | 'alto';
export function estadoAgua(residuo: number): { estado: EstadoAgua; texto: string } {
  if (residuo < AGUA_SCA.tdsMin) return { estado: 'bajo', texto: `Por debajo del rango SCA (${AGUA_SCA.tdsMin}-${AGUA_SCA.tdsMax} mg/L)` };
  if (residuo > AGUA_SCA.tdsMax) return { estado: 'alto', texto: `Por encima del rango SCA (${AGUA_SCA.tdsMin}-${AGUA_SCA.tdsMax} mg/L)` };
  return { estado: 'ideal', texto: `Dentro del rango SCA (${AGUA_SCA.tdsMin}-${AGUA_SCA.tdsMax} mg/L; ideal ${AGUA_SCA.tdsObjetivo})` };
}

export const FUENTES_EXTRACCION: Fuente[] = [
  { titulo: 'Barista Hustle · «The Coffee Compass»', url: 'https://www.baristahustle.com/?p=2185' },
  { titulo: 'SCA · Brewing Control Chart (zona ideal: 18-22 % de extracción, 1,15-1,35 % de TDS)', url: 'https://sca.coffee/research/coffee-standards' },
];

/** Busca la ficha de una variedad o proceso por el nombre usado en un café. */
export const fichaVariedad = (nombre: string) => VARIEDADES_GUIA.find((v) => v.alias.includes(nombre));
export const fichaProceso = (nombre: string) => PROCESOS_GUIA.find((p) => p.alias.includes(nombre));
