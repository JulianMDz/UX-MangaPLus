import { url } from "../lib/paths";
import type { Manga } from "../data/mangas";
import Cover from "./Cover";
import StatusBadge from "./StatusBadge";

export default function MangaCard({ manga }: { manga: Manga }) {
    return (
        <a
            href={url(`/manga/${manga.id}`)}
            className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                <Cover
                    manga={manga}
                    sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="size-full transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
                <div className="absolute inset-x-0 top-2 flex justify-center">
                    <span className="bg-base/80 rounded-full backdrop-blur">
                        <StatusBadge status={manga.status} />
                    </span>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 translate-y-full overflow-y-auto bg-base/90 p-2 text-xs text-white opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 flex items-start">
                    <p>{manga.description}</p>
                </div>
            </div>
            <h3 className="mt-2 text-sm font-semibold">{manga.title}</h3>
            <p className="text-xs text-muted">
                {manga.chapters} capítulos · ★ {manga.rating}
            </p>
        </a>
    );
}
