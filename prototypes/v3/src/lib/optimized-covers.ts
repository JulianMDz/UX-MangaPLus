// Solo para usar en el frontmatter de archivos .astro (usa astro:assets, que corre en build/servidor).
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import type { CoverMap, OptimizedCover } from "../components/CoverContext";
import { mangas } from "../data/mangas";
import { getCover } from "./images";

const WIDTHS = [240, 480];

async function optimize(image: ImageMetadata): Promise<OptimizedCover> {
    const variants = await Promise.all(WIDTHS.map((width) => getImage({ src: image, width, format: "webp" })));
    const width = WIDTHS[WIDTHS.length - 1];

    return {
        src: variants[variants.length - 1].src,
        srcSet: variants.map((variant, i) => `${variant.src} ${WIDTHS[i]}w`).join(", "),
        width,
        height: Math.round((width * image.height) / image.width),
    };
}

// Se calcula una sola vez por build, no una vez por página.
let cache: Promise<CoverMap> | undefined;

export function getCoverMap(): Promise<CoverMap> {
    cache ??= (async () => {
        const map: CoverMap = {};
        for (const name of new Set(mangas.map((manga) => manga.cover))) {
            const image = getCover(name);
            if (image) map[name] = await optimize(image);
        }
        return map;
    })();
    return cache;
}
