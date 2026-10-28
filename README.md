# Coffee Make

Segundo cerebro personal en forma de app web instalable (PWA): un núcleo común y **módulos** para cada ámbito. Funciona sin conexión, sin cuentas y sin servidor; los datos viven en el propio dispositivo (IndexedDB).

Módulos actuales:

- **Hogar**: rutina de la casa (coladas, tareas diarias, semanales y periódicas repartidas por el mes), lo que se quedó pendiente de días anteriores y progreso (racha, mapa de 12 semanas, categorías y lo que más se escapa).
- **Cocina**: menú familiar (2 adultos y un niño de 1 año) en 8 semanas de rotación con dieta mediterránea, 112 recetas con adaptación para el niño, gramos por persona según las kcal diarias de cada adulto (composición de alimentos de USDA FoodData Central, `datos/nutricion.ts`), lista de la compra con cantidades, batch cooking del domingo y equilibrio semanal comprobado (AESAN y AEP, con fuentes en `src/modulos/cocina/datos/guia.ts`).
- **Running**: entrenador de 10K. Plan semanal del entrenador, registro de sesiones (esfuerzo, sueño, molestias, carga de 4 semanas), zonas de ritmo (VDOT de Daniels) y de FC (Friel), auditoría inicial y guía (semáforo de molestias, sesiones clave, fuerza y nutrición). El plan del entrenador está en `src/modulos/running/datos/plan.json` (forma `PlanEntrenador`, en `src/modulos/running/tipos.ts`) y llega al móvil con cada versión; también se puede pegar a mano un plan más reciente.
- **Gym**: entrenos con kg y repeticiones (también peso corporal con lastre, isométricos por tiempo y cardio), catálogo de más de 200 ejercicios con y sin peso (`datos/ejercicios.ts`) y ejercicios propios, rutinas propias y plantillas, lo que hiciste la última vez en cada serie, sugerencia de doble progresión, descanso automático al marcar una serie, récords (1RM estimado de Epley), historial y progreso (series por músculo, volumen por semana).
- **Calendario**: turnos de la pareja (M mañana, T tarde, N noche, L libre) en una esquina de cada día, con «turnos rápidos» para pintar el mes y relleno con un patrón rotativo (`MMTTNNLL`), y notas por día sin horarios (citas, cosas que recordar, planes). Va el primero en la agenda semanal de Inicio.
- **Café** (oculto de serie, se activa en Ajustes → Módulos): biblioteca de cafés con reposo y existencias, registro de preparaciones con temporizador guiado por fases, equipo y aguas, TDS/extracción con control chart, "repetir cambiando una variable", cata con rueda de sabores y diagnóstico de extracción, recetas (de referencia con su fuente y propias) que guían el temporizador paso a paso, un recomendador que aprende de tus registros, una guía (extracción, agua, variedades y procesos) y análisis con gráficos, mejores recetas por café y comparador.

Las recetas de referencia (`src/modulos/cafe/datos/recetas.ts`) y las fichas de la guía (`datos/guia.ts`) llevan cada una el enlace a su fuente. Las cantidades, tiempos y temperaturas son los del autor; los clics del Comandante C40 son una estimación de la app y se muestran como tal.

## Estructura

```
src/
  core/          base de datos (Dexie), enrutado, contrato de módulos, copias, PWA, tamaño de pantalla
  ui/            componentes compartidos (formularios, hojas, diálogos, iconos, gráficos SVG, barra lateral)
  vistas/        Inicio, Más, Buscar, Ajustes
  modulos/
    hogar/       calendario.ts (lógica), reparto.ts, rutina.json (datos), vistas/
    cocina/      plan.ts (ciclo, compra, equilibrio), raciones.ts (gramos por kcal),
                 datos/ (recetas, menú, nutrición, guía), vistas/
    running/     calculos.ts (VDOT, zonas, carga), validar.ts, datos/guia.ts, vistas/
    cafe/        modelo.ts, calculos.ts, diagnostico.ts, recetas.ts, aprendizaje.ts (recomendador),
                 estadisticas.ts, temporizador.ts,
                 datos/ (métodos, catálogos, rueda de sabores, recetas, guía), vistas/
tests/           pruebas de la lógica (Vitest)
tools/           reparto de tareas periódicas e iconos
```

### Añadir un módulo nuevo

1. Crea `src/modulos/<nombre>/index.tsx` exportando un objeto `ModuloApp` (ver `src/core/modulos.ts`): rutas, secciones, tarjeta de Inicio, fila de la agenda semanal (ordenador), búsqueda, ajustes y exportación CSV.
2. Si necesita tablas, añádelas en `src/core/db.ts` con una nueva `version()` de Dexie (las migraciones son automáticas).
3. Regístralo en `src/core/registro.ts`.

### Sincronización en la nube

Cada registro tiene identificador ULID (se genera sin servidor), `creado`, `actualizado` y borrado lógico (`borrado`), y cada escritura deja constancia en la tabla `cambios`. Con eso, la app sincroniza todos los dispositivos a través de un archivo JSON (`coffee-make.json`) en un **repositorio privado de GitHub** (`christianvr57-jpg/coffee-make-datos`):

- `src/core/fusion.ts`: fusión registro a registro (gana la versión más reciente; los borrados viajan como marcas; lo que solo está en un lado se conserva). En la primera sincronización de un dispositivo se elige si manda la nube o el dispositivo.
- `src/core/github.ts`: lectura y escritura con la API de contenidos. Cada escritura lleva el `sha` leído; si otro dispositivo escribió antes, GitHub la rechaza (409) y se vuelve a leer y fusionar. Las lecturas son condicionales (ETag → 304).
- `src/core/nube.ts`: cuándo se sincroniza (al abrir, al volver a la app, a los 2,5 s de cada cambio y cada 30 s con la app a la vista), qué se escribe aquí y recarga de los módulos cuando llegan datos.
- Los valores por defecto y los datos de serie (equipo, aguas, ejemplos) se guardan con fecha «antigua» (`sembrar`, `escribirAjusteInicial`) para que un dispositivo nuevo nunca pise los datos reales.
- Quedan fuera las fotos y los ajustes propios de cada dispositivo (`copia`, `hogar:migrado`, `cafe:semillas`).

Cada dispositivo se conecta en **Ajustes → Sincronización en la nube** con una clave *fine-grained* de GitHub limitada a ese repositorio (permiso *Contents: Read and write*). La clave vive solo en el navegador (`localStorage`), nunca en el código ni en las copias. `npm run probar-nube` (con `NUBE_TOKEN`) prueba la sincronización real entre dos dispositivos simulados en un archivo aparte.

### Datos

Lo que registras (progreso, preparaciones, kcal, sesiones de running…) vive en el dispositivo y en sus copias de seguridad. Los contenidos (rutina, recetas, plan de entrenamiento) van en el código y se actualizan con cada versión. La carpeta `privado/` está en `.gitignore` para archivos de trabajo que no deban publicarse.

La barra inferior muestra hasta 3 módulos; se eligen en Ajustes. Las versiones nuevas se aplican solas al abrir la app (o se avisa en Inicio si estás usándola).

## Desarrollo

Requisitos: Node 24.

```bash
npm install
npm run dev        # http://127.0.0.1:8123
npm test           # pruebas de la lógica
npm run build      # compila en dist/
```

- Cambiar la rutina del hogar: edita `src/modulos/hogar/rutina.json`. Para una tarea periódica nueva, déjala sin `plan` y ejecuta `npm run repartir -- --solo-nuevas`.
- Regenerar iconos (Windows): `powershell -File tools/iconos.ps1`.

## Despliegue gratuito (GitHub Pages)

`npm run desplegar` prueba, compila y publica `dist/` en la rama `gh-pages`, que GitHub Pages sirve con HTTPS. La app usa rutas relativas, así que funciona en cualquier subcarpeta (también en Netlify o Vercel apuntando a `dist/`).

## Instalar en el iPhone

1. Abre la URL publicada en **Safari**.
2. **Compartir → Añadir a pantalla de inicio → Añadir**.
3. Ábrela siempre desde el icono: a pantalla completa y sin conexión. Los datos del icono y los de la pestaña de Safari son independientes.
4. Haz copias de seguridad desde **Más → Ajustes → Copia de seguridad** (JSON completo o CSV para Excel).

Cuando se publica una versión nueva, la app lo avisa en Inicio («Hay una versión nueva») o la aplica sola la próxima vez que la abras tras cerrarla.

## iPad antiguo (iPad mini 2, iOS 12)

La app se compila para funcionar también en Safari 12, el último del iPad mini 2 (pensado como pantalla en la nevera):

- `vite.config.ts` traduce el JavaScript a lo que entiende Safari 12 (`build.target: ['es2019', 'safari12']`).
- `src/core/compat.ts` (lo primero que se carga) rellena lo que le falta: `matchAll`, `addEventListener` en `matchMedia`, `scrollTo` con opciones, `AudioContext`, `queueMicrotask`, y detecta si falta `gap` en flexbox.
- `tools/compat-css.ts` añade al compilar respaldos de CSS: `color-mix()` → `rgba()` y `dvh` → `vh` en bloques `@supports not (…)`, variables `--x-rgb`, `inset` desglosado, `-webkit-sticky` y márgenes `.sin-gap` en lugar de `gap` en flexbox (pruebas en `tests/compat.test.ts`).
- Las consultas de contenedor no existen en Safari 12: en el iPad todo se ve a una columna, que es lo cómodo a ese tamaño.

## En el ordenador

La misma URL se adapta a pantallas de 1000 px o más (`src/core/pantalla.ts`, estilos en `src/styles/escritorio.css`):

- **Barra lateral** con los módulos y las secciones del que está abierto, en lugar de la barra de pestañas.
- **Inicio**: la semana de todos los módulos en una rejilla (cada módulo aporta su fila con `agendaDia` en su `ModuloApp`).
- **Cocina**: la semana como calendario (comida, cena, niño y postre por día) y las 8 semanas del menú en una tabla.
- **Running**: la semana como calendario, el plan completo en una tabla y el registro de sesiones como tabla.
- **Café**: el diario como tabla; análisis, guía y listas en columnas.
- **Hogar**: la semana en tarjetas por día y las tareas en columnas.
- Las hojas se abren como ventanas centradas. Atajos: `Ctrl/⌘ K` o `/` para buscar, `←` `→` para cambiar de semana y `Esc` para cerrar.

Con la sincronización activada en los dos, lo que cambias en uno aparece en el otro en segundos. Sin ella, cada navegador guarda sus propios datos y se pueden pasar con una copia: arrastra el `.json` exportado a la ventana (o **Ajustes → Importar copia**). En Chrome o Edge se puede instalar como app con el icono de instalar de la barra de direcciones.
