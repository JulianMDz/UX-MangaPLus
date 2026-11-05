import { useMemo, useState } from "react";
import { getManga, isReadable, mangas, type Manga } from "../../data/mangas";
import { getPrefs } from "../../lib/storage";
import MangaCard from "../MangaCard";
import StatusBadge from "../StatusBadge";
import Cover from "../Cover";

const FILTERS = [
    { id: "popular", label: "Populares", test: (m: Manga) => m.tags.includes("popular") },
    { id: "new", label: "Nuevos", test: (m: Manga) => m.tags.includes("new") },
    { id: "airing", label: "En emisión", test: (m: Manga) => m.status === "airing" },
    { id: "soon", label: "Próximos", test: (m: Manga) => m.status === "soon" },
] as const;

export default function HomeCatalog() {
    const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("popular");
    const [onlyAvailable] = useState(() => getPrefs().onlyAvailable);
    const [query] = useState(() => new URLSearchParams(window.location.search).get("q")?.trim() ?? "");

    const featured = getManga("dragon-ball")!;

    const visible = useMemo(() => {
        const test = FILTERS.find((f) => f.id === filter)!.test;
        return mangas
            .filter((m) => (query ? m.title.toLowerCase().includes(query.toLowerCase()) : test(m)))
            .filter((m) => !onlyAvailable || isReadable(m));
    }, [filter, query, onlyAvailable]);

    return (
        <>
            <section
                aria-label="Destacado de la semana"
                className="overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-amber-900/70 via-orange-900/50 to-base p-6 sm:p-10"
            >
                <div className="flex items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <p className="text-sm text-accent">Destacado de la semana</p>
                        <h1 className="mt-1 text-4xl font-bold">{featured.title}</h1>
                        <p className="mt-3 text-sm text-muted">{featured.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <StatusBadge status={featured.status} />
                            <span className="text-xs text-muted">{featured.chapters} Capítulos · España</span>
                        </div>
                        <a
                            href={`/manga/${featured.id}`}
                            className="mt-5 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            Leer más
                        </a>
                    </div>
                    <Cover manga={featured} className="hidden size-48 shrink-0 rounded-full md:block" />
                </div>
            </section>

            <section className="mt-10" aria-labelledby="explore-title">
                <h2 id="explore-title" className="text-2xl font-bold">
                    {query ? `Resultados para “${query}”` : "Sigue explorando"}
                </h2>

                {!query && (
                    <div role="tablist" aria-label="Filtros" className="mt-4 flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                role="tab"
                                aria-selected={filter === f.id}
                                onClick={() => setFilter(f.id)}
                                className={`cursor-pointer rounded-full border px-5 py-1.5 text-sm transition-colors ${
                                    filter === f.id
                                        ? "border-white bg-white text-base"
                                        : "border-line text-white hover:border-white"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {visible.length === 0 ? (
                    <p className="mt-8 text-muted">No encontramos mangas con ese criterio.</p>
                ) : (
                    <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {visible.map((manga) => (
                            <li key={manga.id}>
                                <MangaCard manga={manga} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
