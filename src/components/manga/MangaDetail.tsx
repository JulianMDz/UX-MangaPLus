import { useState } from "react";
import { getManga, isReadable, type Manga } from "../../data/mangas";
import { getList, getProgress, LIST_LABELS, setListState, type ListState } from "../../lib/storage";
import Cover from "../Cover";
import MangaCard from "../MangaCard";
import StatusBadge from "../StatusBadge";

const STATES: ListState[] = ["want", "reading", "read"];

const NOTICE: Record<Manga["status"], string> = {
    available: "Disponible para leer",
    airing: "En emisión: se publican nuevos capítulos",
    soon: "Todavía no se puede leer",
    unavailable: "No disponible en tu región por ahora",
};

export default function MangaDetail({ id }: { id: string }) {
    const manga = getManga(id)!;
    const readable = isReadable(manga);
    const [state, setState] = useState<ListState | null>(() => getList()[id] ?? null);
    const [progress] = useState(() => getProgress()[id] ?? 0);

    const related = manga.related.map(getManga).filter((m): m is Manga => !!m);
    const nextChapter = Math.min(progress + 1, manga.chapters);

    function choose(next: ListState | null) {
        setListState(id, next);
        setState(next);
    }

    return (
        <>
            <article className="flex flex-col gap-8 rounded-2xl border border-line bg-panel p-6 md:flex-row">
                <Cover manga={manga} className="aspect-[2/3] w-48 shrink-0 self-center rounded-lg md:self-start" />

                <div className="flex-1">
                    <p className="text-xs text-muted">
                        {manga.genre} · ★ {manga.rating} · {manga.chapters} capítulos
                    </p>
                    <h1 className="mt-1 text-4xl font-bold">{manga.title}</h1>

                    <p
                        role="status"
                        className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm"
                    >
                        <StatusBadge status={manga.status} />
                        {NOTICE[manga.status]}
                        {manga.status === "soon" && manga.releaseLabel && ` · ${manga.releaseLabel}`}
                    </p>

                    <p className="mt-4 text-sm text-muted">{manga.description}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {readable ? (
                            <a
                                href={`/leer/${id}/${nextChapter}`}
                                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-red-600"
                            >
                                {progress > 0 ? `Continuar: capítulo ${nextChapter}` : "Empezar a leer"}
                            </a>
                        ) : (
                            <button
                                disabled
                                className="cursor-not-allowed rounded-full bg-surface px-6 py-2.5 text-sm font-semibold text-muted"
                            >
                                Aún no disponible
                            </button>
                        )}

                        <div role="group" aria-label="Agregar a mi lista" className="flex gap-1">
                            {STATES.map((s) => (
                                <button
                                    key={s}
                                    aria-pressed={state === s}
                                    onClick={() => choose(state === s ? null : s)}
                                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                                        state === s ? "border-white bg-white text-base" : "border-line hover:border-white"
                                    }`}
                                >
                                    {LIST_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </article>

            {readable && (
                <section className="mt-8" aria-labelledby="chapters-title">
                    <h2 id="chapters-title" className="text-xl font-bold">
                        Capítulos
                    </h2>
                    <ol className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                        {Array.from({ length: Math.min(manga.chapters, 8) }, (_, i) => i + 1).map((n) => (
                            <li key={n}>
                                <a
                                    href={`/leer/${id}/${n}`}
                                    className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/5"
                                >
                                    <span>Capítulo {n}</span>
                                    {n <= progress && (
                                        <span className="grid size-6 place-items-center rounded-md bg-status-available text-base" aria-label="Leído">
                                            ✓
                                        </span>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section className="mt-10" aria-labelledby="related-title">
                <h2 id="related-title" className="text-xl font-bold">
                    Relacionado con
                </h2>
                <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
                    {related.map((m) => (
                        <li key={m.id}>
                            <MangaCard manga={m} />
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
