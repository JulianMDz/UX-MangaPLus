import type { ImageMetadata } from "astro";

// Todas las imágenes viven en src/assets. Se buscan por nombre de archivo sin extensión:
// portada "naruto" -> src/assets/covers/naruto.jpg. Si el archivo no existe, devuelve undefined
// y el componente muestra un respaldo, así el build no falla mientras faltan imágenes.
type Glob = Record<string, { default: ImageMetadata }>;

const covers = import.meta.glob<{ default: ImageMetadata }>("../assets/covers/*.{jpg,jpeg,png,webp}", { eager: true });
const brand = import.meta.glob<{ default: ImageMetadata }>("../assets/brand/*.{png,jpg,svg,webp}", { eager: true });

function byName(files: Glob, name: string): ImageMetadata | undefined {
    const match = Object.entries(files).find(([path]) => path.split("/").pop()?.replace(/\.\w+$/, "") === name);
    return match?.[1].default;
}

export const getCover = (name: string) => byName(covers, name);
export const getBrand = (name: string) => byName(brand, name);
