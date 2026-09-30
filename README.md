# Rutina del hogar

App web instalable (PWA) para llevar las tareas de la casa día a día. Funciona sin conexión, sin cuentas y sin servidor: el progreso se guarda solo en el propio dispositivo.

## Estructura

| Ruta | Qué es |
|---|---|
| `data/rutina.json` | **Toda la rutina**: coladas, tareas diarias, semanales y periódicas. Se edita sin tocar el código. |
| `js/schedule.js` | Qué toca cada día (semana A/B, periodicidad, caducidad de lo no hecho). |
| `js/planner.js` | Reparto de las tareas periódicas por semanas y días. |
| `js/store.js` | Estado local (`localStorage`), ediciones del usuario, copia de seguridad. |
| `js/vistas/` | Hoy, Semana, Tareas y Ajustes. |
| `sw.js`, `manifest.webmanifest`, `icons/` | Sin conexión e instalación en la pantalla de inicio. |
| `tools/` | Utilidades: servidor local, reparto de periódicas, generador de iconos. |
| `test/` | Comprobaciones de la lógica de calendario. |

## Desarrollo

```bash
node tools/servir.mjs          # http://localhost:8123 (sin caché)
node test/repartir.test.mjs    # informe y comprobaciones del calendario
node tools/repartir.mjs        # recalcula el "plan" de las tareas periódicas
```

### Cambiar la rutina

Edita `data/rutina.json`. Cada tarea tiene `frecuencia` (`diaria`, `semanal`, `mensual`, `trimestral`, `semestral`, `anual`), `momento` (`manana`, `dia`, `fija`, `noche`), `categoria`, `minutos` y, si procede, `dias` (1 = lunes … 7 = domingo) o `plan` (`mes`, `semana`, `dia`). Para una tarea periódica nueva, déjala sin `plan` y ejecuta `node tools/repartir.mjs --solo-nuevas`.

Al publicar una versión con cambios, sube `VERSION` en `sw.js` para que los dispositivos refresquen la caché.

## Publicación

Se publica como sitio estático (GitHub Pages) desde la rama `main`, carpeta raíz. Necesita HTTPS para poder instalarse.
