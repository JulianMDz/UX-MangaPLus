import { url } from "../../lib/paths";
import { useState } from "react";
import { getList, getProgress, LIST_LABELS, setListState, type ListState } from "../../lib/storage";

interface Props {
    id: string;
    readable: boolean;
    chapters: number;
}

const STATES: ListState[] = ["want", "reading", "read"];

// Única parte interactiva de la cabecera del detalle: depende de localStorage.
export default function MangaActions({ id, readable, chapters }: Props) {
    const [state, setState] = useState<ListState | null>(() => getList()[id] ?? null);
    const [progress] = useState(() => getProgress()[id] ?? 0);
    const nextChapter = Math.min(progress + 1, chapters);

    function choose(next: ListState | null) {
        setListState(id, next);
        setState(next);
    }

    return (
        <>
        <div className="mt-5 flex flex-wrap items-center gap-3">
            {readable ? (
                <a
                    href={url(`/leer/${id}/${nextChapter}`)}
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
        <p className="mt-2 text-xs text-muted">
            Quiero leer = pendiente · Leyendo = en curso · Leídos = terminado. Toca de nuevo para quitar.
        </p>
        </>
    );
}
