# Manga Plus · Rediseño UX — showcase de la evolución

Un solo deploy con el **hub** (línea de tiempo de las rondas de pruebas) y cada **versión del prototipo**
congelada tal como la vieron los usuarios.

```text
/                  hub: línea de tiempo y contexto del reto
/rondas/vN/        detalle de la ronda de pruebas (tareas, hallazgos, cambios)
/v1/  /v2/  /v3/   prototipos navegables (cada uno con su sesión, lista y progreso aislados)
```

## Estructura

```text
src/                 hub (Astro + Tailwind); rondas en src/content/iterations/vN.md
prototypes/vN/       un proyecto Astro + React + Tailwind completo por versión
scripts/             build-all.mjs · new-version.mjs
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Hub en desarrollo |
| `npm run dev:v1` | Prototipo v1 en desarrollo (también `dev:v2`, `dev:v3`… se crean solos) |
| `npm run new-version` | **Congela** la versión actual y crea la siguiente como copia (`v1` → `v2`) |
| `npm run freeze -- vN` | Congela (o recongela) una versión |
| `npm run check` | Valida las reglas del showcase y que las versiones congeladas no hayan cambiado |
| `npm run build` | `check` + compila el hub y todos los prototipos en `dist/` |
| `npm run preview` | Sirve `dist/` para revisar el deploy completo |

## Workflow de cada ronda

1. **Preparar:** define hipótesis y 3–4 tareas en `src/content/iterations/vN.md`. La versión que se va a probar queda congelada.
2. **Testear** con ~5 usuarios (moderado, pensando en voz alta). Mide éxito de tarea, tiempo, errores y facilidad (1–5 o SUS).
3. **Sintetizar:** agrupa observaciones y prioriza por severidad × frecuencia.
4. **Registrar** en `iterations/vN.md`: `metricas`, `hallazgos` (problema, severidad, decisión) y `cambios` (antes / después / motivo).
5. **Nueva versión:** `npm run new-version`, y aplica solo los cambios decididos en `prototypes/vN+1`.
   Para ver exactamente qué cambió: `git diff --no-index prototypes/vN/src prototypes/vN+1/src`.
6. **Publicar:** commit y push; el deploy recompone todo.

## Reglas para no romper las versiones

> Colaboradores y agentes: lean [AGENTS.md](AGENTS.md) antes de tocar código. `npm run check` hace cumplir estas reglas
> y se ejecuta en cada build, así que un deploy no sale con una versión probada modificada.

- **Enlaces siempre con `url("/ruta")`** (`src/lib/paths.ts`): cada prototipo vive bajo `/vN`, una ruta absoluta lo sacaría de su versión.
- **`localStorage` solo desde `src/lib/storage.ts`**: las claves llevan el prefijo de la versión; guardar directamente mezclaría la sesión entre versiones.
- **No edites una versión ya probada.** Los cambios van en la siguiente; `new-version` congela la anterior y `check` falla si cambia.

## Deploy

Vercel o Netlify (`vercel.json` / `netlify.toml` ya configurados): comando `npm run build`, carpeta `dist`.
Las portadas van en `prototypes/vN/src/assets/covers/` y el logo en `prototypes/vN/src/assets/brand/logo-manga-plus.png`.
