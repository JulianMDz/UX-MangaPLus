import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Una entrada por ronda de pruebas. Se rellena después de cada sesión con usuarios.
const iterations = defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/iterations" }),
    schema: z.object({
        version: z.string().regex(/^v\d+$/),
        title: z.string(),
        status: z.enum(["planificada", "en-pruebas", "completada"]),
        fecha: z.coerce.date().optional(),
        participantes: z.number().optional(),
        metodo: z.string().optional(),
        tareas: z.array(z.string()).default([]),
        metricas: z.array(z.object({ nombre: z.string(), valor: z.string() })).default([]),
        hallazgos: z
            .array(
                z.object({
                    problema: z.string(),
                    severidad: z.enum(["alta", "media", "baja"]),
                    decision: z.string(),
                }),
            )
            .default([]),
        cambios: z.array(z.object({ antes: z.string(), despues: z.string(), motivo: z.string() })).default([]),
    }),
});

export const collections = { iterations };
