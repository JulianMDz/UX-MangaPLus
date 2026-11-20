import { url } from "../../lib/paths";
import { useEffect, useRef, useState } from "react";
import {
    getList,
    setListState,
    setProgress,
    getReaderPrefs,
    setReaderPrefs,
    READER_LIMITS,
    type ReaderMode,
    type ReaderPrefs,
} from "../../lib/storage";
import { getManga, PAGES_PER_CHAPTER } from "../../data/mangas";

interface Props {
    id: string;
    chapter: number;
    /** src de cada página real del capítulo. Vacío = placeholder como antes. */
    pages: string[];
}

const arrowClass =
    "grid h-12 w-16 shrink-0 cursor-pointer place-items-center rounded-full border-2 text-xl transition-all disabled:cursor-not-allowed disabled:opacity-30 motion-safe:enabled:hover:scale-105";

const toolButton =
    "grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line text-sm font-bold transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-30";

/** Relativo ancho/alto a partir del cual una imagen se considera doble página. */
const SPREAD_RATIO = 1.15;

export default function Reader({ id, chapter, pages }: Props) {
    const manga = getManga(id)!;
    const [page, setPage] = useState(1);
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const total = pages.length > 0 ? pages.length : PAGES_PER_CHAPTER;
    const lastPage = page === total;
    const hasNext = chapter < manga.chapters;

    // Herramientas de lectura (ronda v2): modo, zoom y brillo, recordados entre capítulos.
    const [prefs, setPrefs] = useState<ReaderPrefs>(() => {
        const p = getReaderPrefs();
        if (typeof window !== "undefined" && window.innerWidth < 768 && p.zoom === 1 && p.mode === "page") {
            return { ...p, zoom: 0.75 };
        }
        return p;
    });
    const { mode, zoom, brightness } = prefs;
    const effectiveZoom = isMobile ? zoom * 2 : zoom;
    const updatePrefs = (patch: Partial<ReaderPrefs>) =>
        setPrefs((prev) => {
            const next = { ...prev, ...patch };
            setReaderPrefs(next);
            return next;
        });

    // Páginas dobles: se detectan al cargar la imagen (más ancha que alta).
    const [spreads, setSpreads] = useState<Record<number, boolean>>({});
    const markSpread = (index: number, ratio: number) => {
        if (ratio >= SPREAD_RATIO) setSpreads((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
    };

    // Al cambiar el zoom (o de página en modo página), la vista se re-centra: el zoom crece
    // desde el centro y el scroll queda disponible en las cuatro direcciones.
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const cascadeRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const el = mode === "page" ? scrollRef.current : cascadeRef.current;
        if (!el) return;
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    }, [zoom, mode, page]);

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

    // En cascada, la página "actual" es la más visible: así funciona el progreso y el contador.
    const pageRefs = useRef<(HTMLElement | null)[]>([]);
    useEffect(() => {
        if (mode !== "cascade") return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setPage(Number((entry.target as HTMLElement).dataset.page));
                }
            },
            { threshold: 0.6 },
        );
        for (const el of pageRefs.current) if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [mode, total]);

    const go = (delta: number) => setPage((p) => Math.min(Math.max(p + delta, 1), total));

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    const pct = (value: number) => `${Math.round(value * 100)}%`;

    // -----------------------------------------------------------------------
    // Panel lateral de herramientas: compartido por los dos modos de lectura.
    // -----------------------------------------------------------------------
    const toolPanel = (
        <aside
            aria-label="Herramientas de lectura"
            className="fixed right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-lg backdrop-blur md:flex"
        >
            <button
                onClick={() => updatePrefs({ mode: mode === "page" ? "cascade" : "page" })}
                title={mode === "page" ? "Cambiar a lectura en cascada" : "Cambiar a página a página"}
                aria-label={mode === "page" ? "Cambiar a lectura en cascada" : "Cambiar a página a página"}
                className={`${toolButton} border-accent bg-accent text-white hover:bg-red-600`}
            >
                {mode === "page" ? "▤" : "▢"}
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                {mode === "page" ? "Páginas" : "Cascada"}
            </span>

            <hr className="w-6 border-line" />

            <button
                onClick={() =>
                    updatePrefs({
                        zoom: Math.max(READER_LIMITS.zoom.min, Math.round((zoom - READER_LIMITS.zoom.step) * 100) / 100),
                    })
                }
                disabled={zoom <= READER_LIMITS.zoom.min}
                title="Reducir zoom"
                aria-label="Reducir zoom"
                className={toolButton}
            >
                −
            </button>
            <span className="text-[10px] tabular-nums text-muted" aria-live="polite">
                {pct(zoom)}
            </span>
            <button
                onClick={() =>
                    updatePrefs({
                        zoom: Math.min(READER_LIMITS.zoom.max, Math.round((zoom + READER_LIMITS.zoom.step) * 100) / 100),
                    })
                }
                disabled={zoom >= READER_LIMITS.zoom.max}
                title="Aumentar zoom"
                aria-label="Aumentar zoom"
                className={toolButton}
            >
                +
            </button>

            <hr className="w-6 border-line" />

            <label className="flex flex-col items-center gap-1" aria-label="Brillo">
                <span className="text-[10px] tabular-nums text-muted" aria-live="polite">
                    {pct(brightness)}
                </span>
                <input
                    type="range"
                    min={READER_LIMITS.brightness.min}
                    max={READER_LIMITS.brightness.max}
                    step={READER_LIMITS.brightness.step}
                    value={brightness}
                    onChange={(e) => updatePrefs({ brightness: Number(e.target.value) })}
                    className="h-24 w-1.5 cursor-pointer accent-accent [writing-mode:vertical-lr]"
                    aria-label="Ajustar brillo"
                />
            </label>

            <hr className="w-6 border-line" />

            {/* Progreso del capítulo, en vertical (en cascada es la referencia principal). */}
            <div
                role="progressbar"
                aria-label="Progreso del capítulo"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={page}
                className="h-40 w-1.5 overflow-hidden rounded-full bg-panel"
            >
                <div
                    className="w-full bg-accent transition-[height] duration-200"
                    style={{ height: `${(page / total) * 100}%` }}
                />
            </div>
        </aside>
    );

    // Página del capítulo en curso (src real o placeholder). El tamaño base es la página
    // a alto (85vh, como Manga Plus); el zoom la escala entera, como el zoom del navegador:
    // puede crecer más allá del contenedor y se desplaza en ambas direcciones, sin barras.
    const renderPageImage = (index: number) => {
        const src = pages[index];
        const isSpread = !!spreads[index];
        const alt = `Página ${index + 1} de ${total}`;
        if (!src) {
            return (
                <div
                    role="img"
                    aria-label={alt}
                    style={{ height: `${90 * zoom}vh` }}
                    className="grid aspect-[3/4] shrink-0 place-items-center rounded-sm bg-white text-6xl font-bold text-black/20"
                >
                    {index + 1}
                </div>
            );
        }
        return (
            <figure className="relative m-auto w-fit shrink-0">
                {isSpread && (
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                        Página doble
                    </span>
                )}
                <img
                    src={src}
                    alt={alt}
                    loading={index === page - 1 ? "eager" : "lazy"}
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        markSpread(index, img.naturalWidth / img.naturalHeight);
                        const el = scrollRef.current;
                        if (el) {
                            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
                            el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
                        }
                    }}
                    style={{ height: `${85 * zoom}vh`, maxWidth: "none" }}
                    className="block w-auto rounded-sm bg-white"
                />
            </figure>
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-base">
            {toolPanel}
            <button
                type="button"
                className="fixed right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/95 text-white shadow-lg backdrop-blur md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú de opciones de lectura"
            >
                ☰
            </button>
            {menuOpen && (
                <div className="fixed right-3 top-16 z-30 w-56 rounded-2xl border border-line bg-surface/95 p-3 shadow-lg backdrop-blur md:hidden">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => { updatePrefs({ mode: mode === "page" ? "cascade" : "page" }); }}
                            className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-semibold text-white"
                        >
                            {mode === "page" ? "Modo: Páginas" : "Modo: Cascada"}
                        </button>
                        <div className="flex items-center justify-between gap-2">
                            <button onClick={() => updatePrefs({ zoom: Math.max(0.5, Math.round((zoom - 0.25) * 100) / 100) })} className="rounded-full border border-line px-3 py-1.5">−</button>
                            <span className="text-xs tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => updatePrefs({ zoom: Math.min(3, Math.round((zoom + 0.25) * 100) / 100) })} className="rounded-full border border-line px-3 py-1.5">+</button>
                        </div>
                        <label className="text-xs text-muted">
                            Brillo
                            <input type="range" min={0.5} max={1} step={0.05} value={brightness} onChange={(e) => updatePrefs({ brightness: Number(e.target.value) })} className="w-full accent-accent" />
                        </label>
                    </div>
                </div>
            )}

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

            {mode === "page" ? (
                <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6 md:flex-row md:items-stretch md:justify-center md:gap-4 md:py-6 md:pl-4 md:pr-20">
                    <div
                        ref={scrollRef}
                        className="no-scrollbar order-1 flex max-h-[90vh] w-full overflow-auto md:order-2"
                        style={{ filter: `brightness(${brightness})` }}
                    >
                        {renderPageImage(page - 1)}
                    </div>

                    <div className="order-2 flex w-full items-center justify-center gap-4 md:order-1 md:w-auto">
                        <button
                            onClick={() => go(-1)}
                            disabled={page === 1}
                            aria-label="Página anterior"
                            className={`${arrowClass} border-white`}
                        >
                            ←
                        </button>
                        <button
                            onClick={() => go(1)}
                            disabled={lastPage}
                            aria-label="Página siguiente"
                            className={`${arrowClass} border-accent bg-accent md:hidden`}
                        >
                            →
                        </button>
                    </div>

                    <div className="hidden items-center md:order-3 md:flex">
                        <button
                            onClick={() => go(1)}
                            disabled={lastPage}
                            aria-label="Página siguiente"
                            className={`${arrowClass} border-accent bg-accent`}
                        >
                            →
                        </button>
                    </div>
                </main>
            ) : (
                <main
                    ref={cascadeRef}
                    className="no-scrollbar flex flex-1 flex-col items-center overflow-x-auto py-4 pl-2 pr-20"
                    style={{ filter: `brightness(${brightness})` }}
                >
                    {/* El zoom escala el ancho base de la columna (42rem) en rem: sin
                        porcentajes ni shrink, y con mx-auto + re-centrado el scroll
                        parte del centro. */}
                    <div
                        className="mx-auto flex flex-col items-center gap-3"
                        style={{ width: `${48 * zoom}rem` }}
                    >
                        {Array.from({ length: total }, (_, index) => (
                            <div
                                key={index}
                                data-page={index + 1}
                                ref={(el) => {
                                    pageRefs.current[index] = el;
                                }}
                                className="w-full"
                            >
                                {renderCascadePage(index)}
                            </div>
                        ))}
                    </div>
                </main>
            )}

            <footer className="mx-auto w-full max-w-md px-4 pb-8 pt-4">
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

    // Página en cascada: ocupa todo el ancho de la columna (que escala con el zoom).
    function renderCascadePage(index: number) {
        const src = pages[index];
        const isSpread = !!spreads[index];
        const alt = `Página ${index + 1} de ${total}`;
        if (!src) {
            return (
                <div
                    role="img"
                    aria-label={alt}
                    className="grid aspect-[3/4] w-full place-items-center rounded-sm bg-white text-6xl font-bold text-black/20"
                >
                    {index + 1}
                </div>
            );
        }
        return (
            <figure className="relative">
                {isSpread && (
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                        Página doble
                    </span>
                )}
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        markSpread(index, img.naturalWidth / img.naturalHeight);
                        const el = mode === "cascade" ? cascadeRef.current : scrollRef.current;
                        if (el) {
                            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
                            el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
                        }
                    }}
                    className="block w-full rounded-sm bg-white"
                />
            </figure>
        );
    }
}
