// Catálogo de ejercicios. Cada línea: id | nombre | grupo principal | equipo | tipo de registro | secundarios.
// Tipo: peso (kg × reps), reps (repeticiones, con lastre opcional), tiempo (segundos), cardio (min y km).
// Los consejos de técnica de los ejercicios principales van en CONSEJOS (pautas generales de ejecución).
import type { Ejercicio, Equipo, Grupo, TipoRegistro } from '../tipos';

const CATALOGO = `
press-banca|Press de banca con barra|pecho|barra|peso|triceps,hombro
press-banca-inclinado|Press inclinado con barra|pecho|barra|peso|hombro,triceps
press-banca-declinado|Press declinado con barra|pecho|barra|peso|triceps
press-mancuernas|Press de banca con mancuernas|pecho|mancuernas|peso|triceps,hombro
press-inclinado-mancuernas|Press inclinado con mancuernas|pecho|mancuernas|peso|hombro,triceps
press-declinado-mancuernas|Press declinado con mancuernas|pecho|mancuernas|peso|triceps
press-suelo|Press en el suelo con mancuernas|pecho|mancuernas|peso|triceps
aperturas-mancuernas|Aperturas con mancuernas|pecho|mancuernas|peso|hombro
aperturas-inclinadas|Aperturas inclinadas con mancuernas|pecho|mancuernas|peso|hombro
press-smith|Press de banca en multipower|pecho|smith|peso|triceps
press-inclinado-smith|Press inclinado en multipower|pecho|smith|peso|hombro
press-pecho-maquina|Press de pecho en máquina|pecho|maquina|peso|triceps
press-inclinado-maquina|Press inclinado en máquina|pecho|maquina|peso|hombro
pec-deck|Contractor de pecho (pec deck)|pecho|maquina|peso|
cruce-poleas|Cruce de poleas|pecho|polea|peso|hombro
cruce-poleas-bajo|Cruce de poleas de abajo arriba|pecho|polea|peso|hombro
press-polea|Press de pecho en polea|pecho|polea|peso|triceps
pullover|Pullover con mancuerna|pecho|mancuernas|peso|espalda
flexiones|Flexiones|pecho|corporal|reps|triceps,hombro,core
flexiones-inclinadas|Flexiones inclinadas (manos elevadas)|pecho|corporal|reps|triceps
flexiones-declinadas|Flexiones declinadas (pies elevados)|pecho|corporal|reps|hombro,triceps
flexiones-rodillas|Flexiones con rodillas apoyadas|pecho|corporal|reps|triceps
flexiones-abiertas|Flexiones abiertas|pecho|corporal|reps|hombro
flexiones-trx|Flexiones en TRX|pecho|trx|reps|core
fondos-pecho|Fondos en paralelas (pecho)|pecho|corporal|reps|triceps,hombro
press-banda|Press de pecho con banda|pecho|banda|reps|triceps
dominadas|Dominadas|espalda|corporal|reps|biceps,antebrazo
dominadas-supinas|Dominadas supinas (chin-up)|espalda|corporal|reps|biceps
dominadas-neutras|Dominadas con agarre neutro|espalda|corporal|reps|biceps
dominadas-asistidas|Dominadas asistidas en máquina|espalda|maquina|peso|biceps
dominadas-banda|Dominadas asistidas con banda|espalda|banda|reps|biceps
dominadas-negativas|Dominadas negativas (solo bajada)|espalda|corporal|reps|biceps
jalon-pecho|Jalón al pecho|espalda|polea|peso|biceps
jalon-supino|Jalón al pecho supino|espalda|polea|peso|biceps
jalon-neutro|Jalón con agarre estrecho neutro|espalda|polea|peso|biceps
jalon-un-brazo|Jalón a una mano|espalda|polea|peso|biceps
jalon-maquina|Jalón en máquina|espalda|maquina|peso|biceps
pullover-polea|Pullover en polea alta (brazos rectos)|espalda|polea|peso|
remo-barra|Remo con barra|espalda|barra|peso|biceps,isquios
remo-pendlay|Remo Pendlay|espalda|barra|peso|biceps
remo-sello|Remo con pecho apoyado (seal row)|espalda|barra|peso|biceps
remo-mancuerna|Remo con mancuerna a una mano|espalda|mancuernas|peso|biceps
remo-mancuernas-inclinado|Remo con mancuernas en banco inclinado|espalda|mancuernas|peso|hombro
remo-polea-baja|Remo en polea baja|espalda|polea|peso|biceps
remo-maquina|Remo en máquina|espalda|maquina|peso|biceps
remo-t|Remo en T|espalda|barra|peso|biceps
remo-smith|Remo en multipower|espalda|smith|peso|biceps
remo-kettlebell|Remo con kettlebell|espalda|kettlebell|peso|biceps
remo-invertido|Remo invertido (australiano)|espalda|corporal|reps|biceps,core
remo-trx|Remo en TRX|espalda|trx|reps|biceps
remo-banda|Remo con banda|espalda|banda|reps|biceps
peso-muerto|Peso muerto|espalda|barra|peso|isquios,gluteo,antebrazo
rack-pull|Peso muerto parcial (rack pull)|espalda|barra|peso|gluteo,antebrazo
hiperextensiones|Hiperextensiones lumbares|espalda|maquina|reps|gluteo,isquios
superman|Superman|espalda|corporal|reps|gluteo
encogimientos-barra|Encogimientos con barra (trapecio)|espalda|barra|peso|antebrazo
encogimientos-mancuernas|Encogimientos con mancuernas (trapecio)|espalda|mancuernas|peso|antebrazo
press-militar|Press militar con barra|hombro|barra|peso|triceps,core
press-militar-sentado|Press militar sentado con barra|hombro|barra|peso|triceps
press-hombro-mancuernas|Press de hombros con mancuernas|hombro|mancuernas|peso|triceps
press-arnold|Press Arnold|hombro|mancuernas|peso|triceps
press-hombro-maquina|Press de hombros en máquina|hombro|maquina|peso|triceps
press-hombro-smith|Press de hombros en multipower|hombro|smith|peso|triceps
press-landmine|Press landmine|hombro|barra|peso|pecho,triceps
elevaciones-laterales|Elevaciones laterales con mancuernas|hombro|mancuernas|peso|
elevaciones-laterales-polea|Elevaciones laterales en polea|hombro|polea|peso|
elevaciones-laterales-maquina|Elevaciones laterales en máquina|hombro|maquina|peso|
elevaciones-frontales|Elevaciones frontales con mancuernas|hombro|mancuernas|peso|pecho
elevaciones-frontales-disco|Elevaciones frontales con disco|hombro|discos|peso|
pajaros|Pájaros (elevaciones posteriores)|hombro|mancuernas|peso|espalda
reverse-pec-deck|Pec deck invertido (deltoides posterior)|hombro|maquina|peso|espalda
cruce-posterior-polea|Cruce posterior en polea|hombro|polea|peso|espalda
face-pull|Face pull en polea|hombro|polea|peso|espalda
remo-al-menton|Remo al mentón|hombro|barra|peso|espalda
elevaciones-y|Elevaciones en Y|hombro|mancuernas|peso|espalda
rotacion-externa|Rotación externa en polea o banda|hombro|polea|peso|
pike-pushup|Flexiones en pica|hombro|corporal|reps|triceps
pino-pared|Flexiones en pino contra la pared|hombro|corporal|reps|triceps
curl-barra|Curl con barra|biceps|barra|peso|antebrazo
curl-ez|Curl con barra Z|biceps|ez|peso|antebrazo
curl-mancuernas|Curl con mancuernas|biceps|mancuernas|peso|antebrazo
curl-martillo|Curl martillo|biceps|mancuernas|peso|antebrazo
curl-inclinado|Curl inclinado con mancuernas|biceps|mancuernas|peso|
curl-concentrado|Curl concentrado|biceps|mancuernas|peso|
curl-arana|Curl araña|biceps|mancuernas|peso|
curl-zottman|Curl Zottman|biceps|mancuernas|peso|antebrazo
curl-predicador|Curl en banco Scott|biceps|ez|peso|
curl-predicador-maquina|Curl en máquina Scott|biceps|maquina|peso|
curl-polea|Curl en polea baja|biceps|polea|peso|
curl-polea-alta|Curl en polea alta|biceps|polea|peso|
curl-cuerda|Curl martillo con cuerda en polea|biceps|polea|peso|antebrazo
curl-banda|Curl con banda|biceps|banda|reps|
press-frances|Press francés con barra Z|triceps|ez|peso|
press-frances-mancuernas|Press francés con mancuernas|triceps|mancuernas|peso|
extension-polea|Extensión de tríceps en polea con barra|triceps|polea|peso|
extension-cuerda|Extensión de tríceps con cuerda|triceps|polea|peso|
extension-un-brazo-polea|Extensión de tríceps a una mano en polea|triceps|polea|peso|
extension-sobre-cabeza|Extensión por encima de la cabeza con mancuerna|triceps|mancuernas|peso|
extension-cuerda-cabeza|Extensión por encima de la cabeza en polea|triceps|polea|peso|
patada-triceps|Patada de tríceps|triceps|mancuernas|peso|
press-cerrado|Press de banca con agarre cerrado|triceps|barra|peso|pecho
fondos-triceps|Fondos en paralelas (tríceps)|triceps|corporal|reps|pecho,hombro
fondos-banco|Fondos en banco|triceps|corporal|reps|hombro
fondos-maquina|Fondos en máquina|triceps|maquina|peso|pecho
flexiones-diamante|Flexiones diamante|triceps|corporal|reps|pecho
extension-banda|Extensión de tríceps con banda|triceps|banda|reps|
curl-muneca|Curl de muñeca|antebrazo|barra|peso|
curl-muneca-inverso|Curl de muñeca inverso|antebrazo|mancuernas|peso|
curl-inverso|Curl inverso con barra Z|antebrazo|ez|peso|biceps
paseo-granjero|Paseo del granjero|antebrazo|mancuernas|tiempo|core,espalda
colgarse|Colgarse de la barra (dead hang)|antebrazo|corporal|tiempo|espalda
pinza-discos|Pinza de discos|antebrazo|discos|tiempo|
sentadilla|Sentadilla con barra|cuadriceps|barra|peso|gluteo,core
sentadilla-frontal|Sentadilla frontal|cuadriceps|barra|peso|core,gluteo
sentadilla-goblet|Sentadilla goblet|cuadriceps|mancuernas|peso|gluteo,core
sentadilla-kettlebell|Sentadilla con kettlebell|cuadriceps|kettlebell|peso|gluteo
sentadilla-smith|Sentadilla en multipower|cuadriceps|smith|peso|gluteo
sentadilla-hack|Sentadilla hack|cuadriceps|maquina|peso|gluteo
sentadilla-pendulo|Sentadilla péndulo|cuadriceps|maquina|peso|gluteo
sentadilla-corporal|Sentadilla sin peso|cuadriceps|corporal|reps|gluteo
sentadilla-bulgara|Sentadilla búlgara|cuadriceps|mancuernas|peso|gluteo
sentadilla-pistol|Sentadilla a una pierna (pistol)|cuadriceps|corporal|reps|gluteo
sentadilla-salto|Sentadilla con salto|cuadriceps|corporal|reps|gluteo,gemelo
sentadilla-sissy|Sentadilla sissy|cuadriceps|corporal|reps|
sentadilla-pared|Sentadilla isométrica en pared|cuadriceps|corporal|tiempo|gluteo
peso-muerto-hexagonal|Peso muerto con barra hexagonal|cuadriceps|barra|peso|gluteo,espalda
prensa|Prensa de piernas|cuadriceps|maquina|peso|gluteo
prensa-unilateral|Prensa a una pierna|cuadriceps|maquina|peso|gluteo
extension-cuadriceps|Extensión de cuádriceps|cuadriceps|maquina|peso|
zancadas|Zancadas con mancuernas|cuadriceps|mancuernas|peso|gluteo
zancadas-atras|Zancadas hacia atrás|cuadriceps|mancuernas|peso|gluteo
zancadas-caminando|Zancadas caminando|cuadriceps|mancuernas|peso|gluteo
zancadas-barra|Zancadas con barra|cuadriceps|barra|peso|gluteo
zancadas-corporal|Zancadas sin peso|cuadriceps|corporal|reps|gluteo
zancadas-laterales|Zancadas laterales|cuadriceps|mancuernas|peso|aductores,gluteo
step-up|Subidas al cajón (step-up)|cuadriceps|mancuernas|peso|gluteo
salto-cajon|Salto al cajón|cuadriceps|corporal|reps|gluteo,gemelo
peso-muerto-rumano|Peso muerto rumano|isquios|barra|peso|gluteo,espalda
peso-muerto-rumano-mancuernas|Peso muerto rumano con mancuernas|isquios|mancuernas|peso|gluteo
peso-muerto-rigido|Peso muerto con piernas rígidas|isquios|barra|peso|espalda
peso-muerto-unilateral|Peso muerto a una pierna|isquios|mancuernas|peso|gluteo,core
buenos-dias|Buenos días con barra|isquios|barra|peso|espalda,gluteo
curl-femoral-tumbado|Curl femoral tumbado|isquios|maquina|peso|gemelo
curl-femoral-sentado|Curl femoral sentado|isquios|maquina|peso|
curl-femoral-pie|Curl femoral de pie|isquios|maquina|peso|
curl-nordico|Curl nórdico|isquios|corporal|reps|
curl-femoral-fitball|Curl femoral con fitball|isquios|otro|reps|gluteo,core
hip-thrust|Hip thrust con barra|gluteo|barra|peso|isquios
hip-thrust-maquina|Hip thrust en máquina|gluteo|maquina|peso|isquios
hip-thrust-smith|Hip thrust en multipower|gluteo|smith|peso|isquios
puente-gluteo|Puente de glúteo|gluteo|corporal|reps|isquios
puente-una-pierna|Puente de glúteo a una pierna|gluteo|corporal|reps|isquios,core
patada-gluteo-polea|Patada de glúteo en polea|gluteo|polea|peso|
patada-gluteo-maquina|Patada de glúteo en máquina|gluteo|maquina|peso|
patada-cuadrupedia|Patada de glúteo en cuadrupedia|gluteo|corporal|reps|
abduccion-maquina|Abducción de cadera en máquina|gluteo|maquina|peso|
abduccion-banda|Paseo lateral con banda (monster walk)|gluteo|banda|reps|
abduccion-tumbado|Abducción de cadera tumbado de lado|gluteo|corporal|reps|
pull-through|Pull-through en polea|gluteo|polea|peso|isquios
swing-kettlebell|Swing con kettlebell|gluteo|kettlebell|peso|isquios,core
sentadilla-sumo|Sentadilla sumo con mancuerna|gluteo|mancuernas|peso|aductores,cuadriceps
peso-muerto-sumo|Peso muerto sumo|gluteo|barra|peso|aductores,espalda
aduccion-maquina|Aducción de cadera en máquina|aductores|maquina|peso|
aduccion-polea|Aducción en polea|aductores|polea|peso|
copenhagen|Plancha Copenhague|aductores|corporal|tiempo|core
gemelo-pie|Elevación de talones de pie|gemelo|maquina|peso|
gemelo-sentado|Elevación de talones sentado (sóleo)|gemelo|maquina|peso|
gemelo-prensa|Gemelo en prensa|gemelo|maquina|peso|
gemelo-smith|Gemelo en multipower|gemelo|smith|peso|
gemelo-unilateral|Elevación de talones a una pierna|gemelo|mancuernas|peso|
gemelo-corporal|Elevación de talones sin peso|gemelo|corporal|reps|
gemelo-excentrico|Elevación de talones excéntrica (Aquiles)|gemelo|corporal|reps|
tibial|Elevación de puntas (tibial anterior)|gemelo|corporal|reps|
plancha|Plancha|core|corporal|tiempo|hombro
plancha-lateral|Plancha lateral|core|corporal|tiempo|gluteo
plancha-toques|Plancha con toques de hombro|core|corporal|reps|hombro
hollow|Hollow hold|core|corporal|tiempo|
crunch|Crunch abdominal|core|corporal|reps|
crunch-inverso|Crunch inverso|core|corporal|reps|
crunch-bicicleta|Crunch bicicleta|core|corporal|reps|
sit-up|Abdominales completos (sit-up)|core|corporal|reps|
v-ups|V-ups|core|corporal|reps|
crunch-polea|Crunch en polea con cuerda|core|polea|peso|
crunch-maquina|Crunch en máquina|core|maquina|peso|
elevacion-piernas-colgado|Elevación de piernas colgado|core|corporal|reps|antebrazo
elevacion-rodillas-colgado|Elevación de rodillas colgado|core|corporal|reps|
elevacion-rodillas-paralelas|Elevación de rodillas en paralelas|core|corporal|reps|
elevacion-piernas-suelo|Elevación de piernas tumbado|core|corporal|reps|
pies-barra|Pies a la barra (toes to bar)|core|corporal|reps|antebrazo
rueda-abdominal|Rueda abdominal|core|otro|reps|hombro
dead-bug|Dead bug|core|corporal|reps|
bird-dog|Bird dog|core|corporal|reps|espalda,gluteo
pallof|Press Pallof|core|polea|peso|
lenador|Leñador en polea|core|polea|peso|hombro
giros-rusos|Giros rusos|core|discos|reps|
escaladores|Escaladores (mountain climbers)|core|corporal|tiempo|cardio
paseo-maleta|Paseo de maleta a una mano|core|kettlebell|tiempo|antebrazo
burpees|Burpees|cuerpo|corporal|reps|pecho,cuadriceps
thruster|Thruster|cuerpo|barra|peso|cuadriceps,hombro
cargada|Cargada de potencia (power clean)|cuerpo|barra|peso|espalda,gluteo
cargada-press|Cargada y press|cuerpo|barra|peso|hombro
arrancada-mancuerna|Arrancada con mancuerna|cuerpo|mancuernas|peso|hombro,gluteo
cargada-kettlebell|Cargada con kettlebell|cuerpo|kettlebell|peso|hombro
levantamiento-turco|Levantamiento turco|cuerpo|kettlebell|peso|core,hombro
wall-ball|Wall ball|cuerpo|otro|reps|cuadriceps,hombro
cuerdas-batalla|Cuerdas de batalla|cuerpo|otro|tiempo|hombro
trineo|Empuje de trineo|cuerpo|otro|peso|cuadriceps,gluteo
comba|Comba|cardio|otro|tiempo|gemelo
cinta|Cinta de correr|cardio|cardio|cardio|
caminata-inclinada|Caminata en cinta inclinada|cardio|cardio|cardio|gluteo,gemelo
bici-estatica|Bicicleta estática|cardio|cardio|cardio|cuadriceps
spinning|Spinning|cardio|cardio|cardio|cuadriceps
eliptica|Elíptica|cardio|cardio|cardio|
remo-ergometro|Remo (ergómetro)|cardio|cardio|cardio|espalda
escaladora|Escaladora (stairmaster)|cardio|cardio|cardio|gluteo
bici-aire|Bici de aire (assault bike)|cardio|cardio|cardio|
ski-erg|SkiErg|cardio|cardio|cardio|espalda
`;

/** Pautas de técnica de los ejercicios más habituales. */
export const CONSEJOS: Record<string, string> = {
  'press-banca': 'Escápulas juntas y hacia abajo, pies firmes. Baja la barra controlada a la parte baja del pecho y empuja sin rebotar.',
  'press-inclinado-mancuernas': 'Banco a 30-45°. Codos algo por debajo de los hombros, baja hasta notar estiramiento en el pecho.',
  'press-mancuernas': 'Escápulas atrás. Baja las mancuernas a los lados del pecho con los codos a unos 45° del cuerpo.',
  'aperturas-mancuernas': 'Codos ligeramente flexionados y fijos; el movimiento es un abrazo, no un press.',
  'cruce-poleas': 'Un paso al frente, pecho alto. Junta las manos delante con los codos suaves y vuelve despacio.',
  flexiones: 'Cuerpo en bloque, del talón a la cabeza. Codos a unos 45°, pecho casi al suelo.',
  'fondos-pecho': 'Inclina el tronco hacia delante y baja hasta que el hombro quede a la altura del codo, sin forzar.',
  dominadas: 'Desde brazos estirados, lleva el pecho hacia la barra tirando de los codos hacia abajo. Sin balanceo.',
  'jalon-pecho': 'Pecho alto y ligera inclinación atrás. Tira de los codos hacia los costados hasta la parte alta del pecho.',
  'remo-barra': 'Cadera atrás, espalda neutra a unos 45°. Lleva la barra al ombligo juntando las escápulas.',
  'remo-mancuerna': 'Apoyo firme en el banco y espalda plana. Lleva el codo hacia la cadera, no hacia arriba.',
  'remo-polea-baja': 'Espalda recta, sin balancearte. Tira hacia el abdomen y deja que las escápulas se estiren al volver.',
  'peso-muerto': 'Barra pegada a las piernas, espalda neutra y abdomen apretado. Empuja el suelo con las piernas y extiende la cadera arriba.',
  'press-militar': 'Glúteos y abdomen apretados, sin arquear la zona lumbar. La barra sube en línea recta pasando cerca de la cara.',
  'press-hombro-mancuernas': 'Sentado con respaldo. Baja hasta que las mancuernas queden a la altura de las orejas.',
  'elevaciones-laterales': 'Codos ligeramente flexionados, sube hasta la altura de los hombros llevando los codos, sin impulso.',
  'face-pull': 'Polea a la altura de la cara, tira de la cuerda separando las manos hacia las orejas. Ideal para la postura.',
  pajaros: 'Tronco inclinado y espalda plana. Abre los brazos hacia los lados con los codos suaves.',
  'curl-barra': 'Codos pegados al cuerpo y quietos. Sube sin balancear el tronco y baja controlando.',
  'curl-mancuernas': 'Gira la palma hacia arriba al subir. Baja del todo para recorrer todo el rango.',
  'curl-martillo': 'Palmas enfrentadas durante todo el recorrido; trabaja también el braquial y el antebrazo.',
  'press-frances': 'Codos apuntando al techo y quietos; baja la barra hacia la frente o detrás de la cabeza.',
  'extension-cuerda': 'Codos pegados a los costados. Extiende del todo y separa las puntas de la cuerda abajo.',
  'fondos-triceps': 'Tronco vertical. Baja hasta 90° de codo y extiende sin bloquear de golpe.',
  sentadilla: 'Pies a la anchura de los hombros, rodillas siguiendo la dirección de los pies. Baja con el pecho alto hasta donde mantengas la espalda neutra.',
  'sentadilla-goblet': 'La mancuerna pegada al pecho ayuda a mantener el tronco erguido. Buena para aprender a sentarse.',
  'sentadilla-bulgara': 'Pie de atrás apoyado en el banco. La rodilla de delante va hacia la punta; tronco algo inclinado para más glúteo.',
  prensa: 'Zona lumbar siempre apoyada. Baja hasta donde la pelvis no se despegue y no bloquees las rodillas arriba.',
  'extension-cuadriceps': 'Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina. Sube y baja controlado.',
  zancadas: 'Paso largo y estable. Baja la rodilla de atrás casi al suelo con el tronco erguido.',
  'peso-muerto-rumano': 'Rodillas ligeramente flexionadas y fijas. Lleva la cadera atrás deslizando la barra por los muslos hasta notar el estiramiento.',
  'curl-femoral-tumbado': 'Cadera pegada al banco. Sube los talones hacia el glúteo y baja despacio.',
  'curl-nordico': 'Rodillas fijas y cuerpo recto: déjate caer frenando todo lo posible. Muy eficaz para prevenir lesiones de isquios.',
  'hip-thrust': 'Escápulas en el banco y barbilla recogida. Sube hasta alinear tronco y muslos y aprieta el glúteo arriba.',
  'puente-gluteo': 'Talones cerca del glúteo. Empuja con los talones y sube la cadera sin arquear la zona lumbar.',
  'swing-kettlebell': 'El movimiento sale de la cadera (como un salto), no de los brazos. La kettlebell sube hasta la altura del pecho.',
  'gemelo-pie': 'Recorrido completo: baja el talón por debajo del escalón y sube hasta la punta. Pausa arriba.',
  'gemelo-excentrico': 'Sube con las dos piernas y baja despacio (3-4 s) con una sola. Clásico para tendón de Aquiles (protocolo de Alfredson).',
  plancha: 'Codos bajo los hombros, glúteos y abdomen apretados, cuerpo en línea. Mejor varias series cortas bien hechas.',
  'plancha-lateral': 'Codo bajo el hombro y cadera alta. Cuerpo en línea recta de la cabeza a los pies.',
  'dead-bug': 'Zona lumbar pegada al suelo todo el tiempo. Estira brazo y pierna contrarios despacio.',
  pallof: 'De lado a la polea, brazos al frente: resiste el giro. Trabaja la estabilidad del tronco.',
  'rueda-abdominal': 'Empieza de rodillas y con poco recorrido. Abdomen apretado para que la zona lumbar no se hunda.',
  'press-cerrado': 'Manos a la anchura de los hombros, codos cerca del cuerpo. Gran ejercicio de fuerza de tríceps.',
  'remo-invertido': 'Cuerpo en bloque; cuanto más horizontal, más difícil. Lleva el pecho a la barra.',
  burpees: 'Flexión, salto con pies a las manos y salto vertical. Mantén un ritmo que puedas sostener.',
};

export const EJERCICIOS: Ejercicio[] = CATALOGO.trim()
  .split('\n')
  .map((l) => {
    const [id, nombre, grupo, equipo, tipo, sec = ''] = l.split('|');
    return {
      id,
      nombre,
      grupo: grupo as Grupo,
      equipo: equipo as Equipo,
      tipo: tipo as TipoRegistro,
      secundarios: sec ? (sec.split(',') as Grupo[]) : [],
      consejo: CONSEJOS[id],
    };
  });

/** Los ejercicios creados por el usuario llevan este prefijo en el id. */
export const esPropio = (id: string) => id.startsWith('propio-');
