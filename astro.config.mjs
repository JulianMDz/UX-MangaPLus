// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Hub del showcase. Los prototipos viven en prototypes/vN con su propia configuración.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
