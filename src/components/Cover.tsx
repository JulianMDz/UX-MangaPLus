import { useState } from "react";
import type { Manga } from "../data/mangas";

interface Props {
    manga: Manga;
    className?: string;
}

// Si la imagen no existe en /public/covers, muestra el título sobre un bloque.
export default function Cover({ manga, className = "" }: Props) {
    const [failed, setFailed] = useState(false);

    if (failed) {
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
            src={manga.cover}
            alt={`Portada de ${manga.title}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className={`object-cover ${className}`}
        />
    );
}
