import { useState } from "react";
import { getManga, isReadable, type Manga } from "../../data/mangas";
import { getList, LIST_LABELS, type ListState } from "../../lib/storage";
import Cover from "../Cover";
import { CoverProvider, type CoverMap } from "../CoverContext";
import StatusBadge from "../StatusBadge";

const TABS: ListState[] = ["want", "reading", "read"];

function Item({ manga }: { manga: Manga }) {
    const readable = isReadable(manga);
    return (
        <li className="flex gap-4 rounded-xl border border-line bg-surface p-3">
            <Cover manga={manga} sizes="112px" className="aspect-[2/3] w-28 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <h3 className="text-xl font-bold">{manga.title}</h3>
                <StatusBadge status={manga.status} />
                <p className="text-xs text-muted">{manga.releaseLabel && manga.status === "soon" ? `Sale el ${manga.releaseLabel}` : manga.genre}</p>
                <div className="mt-1 flex gap-2">
                    <a
                        href={`/manga/${manga.id}`}
                        className="rounded-full border border-white px-5 py-1.5 text-sm font-semibold transition-colors hover:bg-white hover:text-base"
                    >
                        Ver detalles
                    </a>
                    {readable && (
                        <a
                            href={`/leer/${manga.id}/1`}
                            className="rounded-full bg-accent px-5 py-1.5 text-sm font-semibold transition-colors hover:bg-red-600"
                        >
                            Empezar a leer
                        </a>
                    )}
                </div>
            </div>
        </li>
    );
}

function MyListContent() {
    const [list] = useState(getList);
    const [tab, setTab] = useState<ListState>("want");

    const entries = Object.entries(list)
        .map(([id, state]) => ({ manga: getManga(id), state }))
        .filter((e): e is { manga: Manga; state: ListState } => !!e.manga);

    const countOf = (state: ListState) => entries.filter((e) => e.state === state).length;
    const visible = entries.filter((e) => e.state === tab);
    const upcoming = entries.filter((e) => e.manga.status === "soon");

    return (
        <>
            <h1 className="text-3xl font-bold">Mi lista</h1>

            <div role="tablist" aria-label="Estados de lectura" className="mt-4 flex flex-wrap gap-2">
                {TABS.map((state) => (
                    <button
                        key={state}
                        role="tab"
                        aria-selected={tab === state}
                        onClick={() => setTab(state)}
                        className={`cursor-pointer rounded-full border px-5 py-1.5 text-sm transition-colors ${
                            tab === state ? "border-white bg-white text-base" : "border-line hover:border-white"
                        }`}
                    >
                        {LIST_LABELS[state]} ({countOf(state)})
                    </button>
                ))}
            </div>

            {upcoming.map(({ manga }) => (
                <p
                    key={manga.id}
                    role="status"
                    className="mt-4 rounded-lg border border-status-soon bg-status-soon/10 px-4 py-2 text-sm"
                >
                    <span className="mr-2 rounded-full border border-status-soon px-2 py-0.5 text-xs text-status-soon">
                        Próximamente
                    </span>
                    {manga.title}, de tu lista, pasa a Disponible el {manga.releaseLabel}. Te avisaremos.
                </p>
            ))}

            {visible.length === 0 ? (
                <div className="mt-10 rounded-xl border border-dashed border-line p-10 text-center">
                    <p className="text-muted">Aún no tienes mangas en “{LIST_LABELS[tab]}”.</p>
                    <a href="/" className="mt-4 inline-block rounded-full bg-accent px-6 py-2 text-sm font-semibold hover:bg-red-600">
                        Explorar mangas
                    </a>
                </div>
            ) : (
                <ul className="mt-6 grid gap-5 md:grid-cols-2">
                    {visible.map(({ manga }) => (
                        <Item key={manga.id} manga={manga} />
                    ))}
                </ul>
            )}
        </>
    );
}

export default function MyList({ covers }: { covers: CoverMap }) {
    return (
        <CoverProvider value={covers}>
            <MyListContent />
        </CoverProvider>
    );
}
