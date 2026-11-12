import { url } from "../../lib/paths";
import { useEffect, useState } from "react";
import { getList, setListState, setProgress } from "../../lib/storage";
import { getManga, PAGES_PER_CHAPTER } from "../../data/mangas";

interface Props {
    id: string;
    chapter: number;
    /** src de cada página real del capítulo. Vacío = placeholder como antes. */
    pages: string[];
}

const arrowClass =
    "grid h-12 w-16 shrink-0 cursor-pointer place-items-center rounded-full border-2 text-xl transition-all disabled:cursor-not-allowed disabled:opacity-30 motion-safe:enabled:hover:scale-105";

export default function Reader({ id, chapter, pages }: Props) {
    const manga = getManga(id)!;
    const [page, setPage] = useState(1);
    const total = pages.length > 0 ? pages.length : PAGES_PER_CHAPTER;
    const lastPage = page === total;
    const hasNext = chapter < manga.chapters;

    // Al abrir un capítulo, el manga pasa a "Leyendo" si no estaba en la lista.
    useEffect(() => {
        if (!getList()[id]) setListState(id, "reading");
    }, [id]);

    useEffect(() => {
        if (lastPage) {
            setProgress(id, chapter);
            if (!hasNext) setListState(id, "read");
        }
    }, [lastPage, id, chapter, hasNext]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, total));
            if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 1));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    return (
        <div className="flex min-h-screen flex-col bg-base">
            <header className="grid grid-cols-3 items-center border-b border-line px-4 py-3 text-xs">
                <a
                    href={url(`/manga/${id}`)}
                    className="w-fit rounded-full border border-accent px-4 py-1.5 text-accent transition-colors hover:bg-accent hover:text-white"
                >
                    Volver al detalle
                </a>
                <p className="text-center font-semibold">
                    {manga.title} · Cap. {chapter}
                </p>
                <p className="text-right text-muted" aria-live="polite">
                    Página {page} de {total}
                </p>
            </header>

            <main className="flex flex-1 items-center justify-center gap-4 px-4 py-6">
                <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    aria-label="Página anterior"
                    className={`${arrowClass} border-white`}
                >
                    ←
                </button>

                {pages.length > 0 ? (
                    <img
                        src={pages[page - 1]}
                        alt={`Página ${page} de ${total}`}
                        loading="eager"
                        className="max-h-[80vh] w-auto max-w-md rounded-sm bg-white"
                    />
                ) : (
                    <div
                        role="img"
                        aria-label={`Página ${page} de ${total}`}
                        className="grid aspect-[3/4] w-full max-w-md place-items-center rounded-sm bg-white text-6xl font-bold text-black/20"
                    >
                        {page}
                    </div>
                )}

                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={lastPage}
                    aria-label="Página siguiente"
                    className={`${arrowClass} border-accent bg-accent`}
                >
                    →
                </button>
            </main>

            <footer className="mx-auto w-full max-w-md px-4 pb-8">
                <div
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={total}
                    aria-valuenow={page}
                    className="h-1.5 overflow-hidden rounded-full bg-surface"
                >
                    <div
                        className="h-full bg-accent transition-[width] duration-200"
                        style={{ width: `${(page / total) * 100}%` }}
                    />
                </div>

                {lastPage && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted">Terminaste el capítulo {chapter}.</p>
                        <a
                            href={url(hasNext ? `/leer/${id}/${chapter + 1}` : `/manga/${id}`)}
                            className="mt-3 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-red-600"
                        >
                            {hasNext ? "Siguiente capítulo" : "Volver al detalle"}
                        </a>
                    </div>
                )}
            </footer>
        </div>
    );
}
