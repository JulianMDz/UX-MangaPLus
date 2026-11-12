import { useState } from "react";
import { getProgress } from "../../lib/storage";

interface Props {
    id: string;
    chapters: number;
}

const VISIBLE_CHAPTERS = 8;

export default function ChapterList({ id, chapters }: Props) {
    const [progress] = useState(() => getProgress()[id] ?? 0);

    return (
        <ol className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {Array.from({ length: Math.min(chapters, VISIBLE_CHAPTERS) }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                    <a
                        href={`/leer/${id}/${n}`}
                        className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    >
                        <span>Capítulo {n}</span>
                        {n <= progress && (
                            <span
                                className="grid size-6 place-items-center rounded-md bg-status-available text-base"
                                aria-label="Leído"
                            >
                                ✓
                            </span>
                        )}
                    </a>
                </li>
            ))}
        </ol>
    );
}
