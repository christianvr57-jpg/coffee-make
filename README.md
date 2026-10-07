# Coffee Make

Segundo cerebro personal en forma de app web instalable (PWA): un núcleo común y **módulos** para cada ámbito. Funciona sin conexión, sin cuentas y sin servidor; los datos viven en el propio dispositivo (IndexedDB).

Módulos actuales:

- **Hogar**: rutina de la casa (coladas, tareas diarias, semanales y periódicas repartidas por el mes).
- **Café**: biblioteca de cafés con reposo y existencias, registro de preparaciones con temporizador guiado por fases, equipo y aguas, TDS/extracción con control chart, "repetir cambiando una variable", cata con rueda de sabores y diagnóstico de extracción, recetas (de referencia con su fuente y propias) que guían el temporizador paso a paso, un recomendador que aprende de tus registros, una guía (extracción, agua, variedades y procesos) y análisis con gráficos, mejores recetas por café y comparador.

Las recetas de referencia (`src/modulos/cafe/datos/recetas.ts`) y las fichas de la guía (`datos/guia.ts`) llevan cada una el enlace a su fuente. Las cantidades, tiempos y temperaturas son los del autor; los clics del Comandante C40 son una estimación de la app y se muestran como tal.

## Estructura

```
src/
  core/          base de datos (Dexie), enrutado, contrato de módulos, copias, PWA
  ui/            componentes compartidos (formularios, hojas, diálogos, iconos, gráficos SVG)
  vistas/        Inicio, Más, Buscar, Ajustes
  modulos/
    hogar/       calendario.ts (lógica), reparto.ts, rutina.json (datos), vistas/
    cafe/        modelo.ts, calculos.ts, diagnostico.ts, recetas.ts, aprendizaje.ts (recomendador),
                 estadisticas.ts, temporizador.ts,
                 datos/ (métodos, catálogos, rueda de sabores, recetas, guía), vistas/
tests/           pruebas de la lógica (Vitest)
tools/           reparto de tareas periódicas e iconos
```

### Añadir un módulo nuevo

1. Crea `src/modulos/<nombre>/index.tsx` exportando un objeto `ModuloApp` (ver `src/core/modulos.ts`): rutas, secciones, tarjeta de Inicio, búsqueda, ajustes y exportación CSV.
2. Si necesita tablas, añádelas en `src/core/db.ts` con una nueva `version()` de Dexie (las migraciones son automáticas).
3. Regístralo en `src/core/registro.ts`.

### Preparado para sincronizar

Cada registro tiene identificador ULID (se genera sin servidor), `creado`, `actualizado` y borrado lógico (`borrado`). Cada escritura deja constancia en la tabla `cambios`. Para sincronizar en el futuro basta con un adaptador que suba esa cola y descargue los cambios remotos (última escritura gana por registro).

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
