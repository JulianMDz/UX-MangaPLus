import type { Manga } from "../data/mangas";
import { useCover } from "./CoverContext";

interface Props {
    manga: Manga;
    className?: string;
    /** Ancho real con el que se muestra, para que el navegador elija la variante correcta. */
    sizes?: string;
}

// Si la portada no existe en src/assets/covers, muestra el título sobre un bloque.
export default function Cover({ manga, className = "", sizes = "(min-width: 768px) 20vw, 50vw" }: Props) {
    const image = useCover(manga.cover);

    if (!image) {
        return (
            <div
                role="img"
                aria-label={`Portada de ${manga.title}`}
                className={`grid place-items-center bg-surface p-2 text-center text-sm font-semibold ${className}`}
            >
                {manga.title}
            </div>
        );
    }

    return (
        <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={sizes}
            width={image.width}
            height={image.height}
            alt={`Portada de ${manga.title}`}
            loading="lazy"
            decoding="async"
            className={`object-cover ${className}`}
        />
    );
}
