# Instrucciones para agentes y colaboradores

Este repo es un **showcase de la evolución de un prototipo UX**: un hub con la línea de tiempo de las rondas de
pruebas con usuarios y, por cada ronda, una **versión congelada** del prototipo (`/v1`, `/v2`, `/v3`).
La dinámica solo funciona si las versiones pasadas **no cambian**. Lee esto antes de tocar código.

## Regla de oro

**Solo se edita la última versión** (el `vN` más alto en `prototypes/`). Las anteriores son lo que vieron los
testers: modificarlas falsea la historia del showcase. `npm run check` indica cuál es la editable.

Si te piden un cambio y **no dicen la versión**, asume la editable y dilo en tu respuesta.
Si el cambio exigiría tocar una versión congelada, **no lo hagas: avisa y propón crear una versión nueva**.

## Estructura

```text
src/                       hub (Astro + Tailwind) → "/" y "/rondas/vN/"
  content/iterations/vN.md   ficha de cada ronda de pruebas (datos reales, ver abajo)
prototypes/vN/             proyecto Astro + React + Tailwind completo → "/vN/"
  .frozen.json               manifiesto de congelación (hashes); no editar a mano
scripts/                   check · freeze · new-version · build-all
```

## ¿Qué hago si me piden…?

| Petición | Qué hacer |
|---|---|
| Cambiar, arreglar o mejorar el prototipo | Editar **solo** `prototypes/<última>/`. |
| Aplicar los cambios tras una ronda de pruebas | `npm run new-version`, y luego editar la versión nueva. |
| Corregir algo en una versión ya probada | No tocarla. Si es un fallo técnico que **no altera** lo que vieron los testers (p. ej. una imagen rota): `npm run freeze -- vN` después del arreglo y anotarlo en `src/content/iterations/vN.md`. Ante la duda, preguntar. |
| Añadir resultados de una ronda | Editar `src/content/iterations/vN.md` (solo datos reales aportados por el equipo). |
| Cambiar el hub (línea de tiempo, estilos) | Editar `src/`. No afecta a los prototipos. |
| Compartir código entre versiones | No existe código compartido a propósito: cada versión es autónoma. Copiar, no importar entre carpetas. |

## Reglas de código en los prototipos

`npm run check` (y por tanto `npm run build` y el deploy) falla si se rompen las dos primeras.

1. **Enlaces siempre con `url("/ruta")`** de `src/lib/paths.ts` (`href`, `action`, `src`, `window.location.href`).
   Cada versión vive bajo `/vN/`; una ruta absoluta como `href="/login"` la saca de su versión.
2. **`localStorage` solo desde `src/lib/storage.ts`.** Las claves llevan el prefijo de la versión (`mangaplus:v1:...`);
   las versiones comparten origen y, si no, se pisarían la sesión, la lista y el progreso.
3. **Imágenes en `src/assets/`** (portadas en `covers/`, logo en `brand/`, páginas en `mangas/`). Los archivos
   reales viven en `shared/assets/` (raíz del repo) y cada versión los enlaza con un **junction** en
   `src/assets` (lo crea `npm run new-version`); así no se duplican megas en cada iteración. Se buscan por
   nombre con `src/lib/images.ts`. En archivos `.astro` usar `<Image>` de `astro:assets`; en React las portadas
   llegan ya optimizadas por `CoverContext` (ver `src/lib/optimized-covers.ts`).
4. **Astro por defecto, React solo donde hay interactividad** (estado, eventos, `localStorage`). Lo estático va en `.astro`.
5. Tailwind con los tokens de `src/styles/global.css` (`bg-surface`, `text-accent`, `text-status-*`...). Estados de
   manga en `src/data/statuses.ts`; no repetir colores ni etiquetas.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Hub en desarrollo |
| `npm run dev:vN` | Prototipo en desarrollo (los `dev:vN` nuevos los añade `new-version`) |
| `npm run check` | Valida las reglas anteriores y que ninguna versión congelada haya cambiado |
| `npm run new-version` | **Congela** la versión actual, crea la siguiente como copia y su ficha en `iterations/` |
| `npm run freeze -- vN` | Congela (o recongela) una versión |
| `npm run build` | `check` + compila hub y todas las versiones en `dist/` |
| `npm run preview` | Sirve `dist/` |

### Servidor de desarrollo en segundo plano

- Hub (raíz): `astro dev --background`; se gestiona con `astro dev stop`, `astro dev status` y `astro dev logs`.
- Prototipo: **entrar en su carpeta** y lanzar ahí el servidor:
  `cd prototypes/vN && npx astro dev --background`. **No usar `--root` junto con `--background`**: no arranca y deja
  una carpeta `prototypes/` basura dentro de la versión.
- **Detén los servidores antes de mover o renombrar carpetas** (`astro dev stop`): en Windows bloquean `src/`.

## Ciclo de una ronda de pruebas

1. **Preparar:** definir hipótesis y 3–4 tareas en `src/content/iterations/vN.md`. La versión a probar no se toca más.
2. **Testear** con ~5 usuarios (moderado, pensando en voz alta). Medir éxito de tarea, tiempo, errores y facilidad.
3. **Sintetizar** y priorizar por severidad × frecuencia.
4. **Registrar** en `iterations/vN.md`: `metricas`, `hallazgos` (problema, severidad, decisión) y `cambios`
   (antes / después / motivo) con capturas en `src/assets/iterations/vN/`.
5. **`npm run new-version`** y aplicar solo los cambios decididos en la versión nueva.
6. **Publicar:** el deploy (Vercel/Netlify, `npm run build` → `dist/`) recompone todo.

## Qué NO hacer

- **No inventes datos de pruebas** (participantes, métricas, hallazgos, citas, fechas). Las fichas de `iterations/` solo
  contienen lo que el equipo aporta; si falta, déjalo pendiente.
- No edites `prototypes/vN/.frozen.json` a mano ni lo borres para "arreglar" un `check` que falla: el fallo es el aviso.
- No crees `prototypes/vN` copiando carpetas a mano; usa `npm run new-version` (congela la anterior y crea la ficha).
- No desactives ni saltes `npm run check` en el build.
- No escribas en `localStorage` ni uses rutas absolutas "solo esta vez".
- **No hagas commits, stash, push ni cambies de rama salvo que se pida explícitamente.** El equipo commitea a mano.

## Si `npm run check` falla

Lee el mensaje: indica archivo, línea y el comando para resolverlo. Un fallo de "versión congelada modificada" casi
siempre significa que el cambio debía hacerse en la versión nueva: restaura el archivo y aplícalo allí.

## Documentación de Astro

Documentación completa: <https://docs.astro.build>

Consulta estas guías antes de trabajar en tareas relacionadas:

- [Páginas, rutas dinámicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes de Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componentes de React u otros frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Contenido y colecciones](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
- [Imágenes](https://docs.astro.build/en/guides/images/)
