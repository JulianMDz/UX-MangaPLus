// Páginas reales de los capítulos: src/assets/mangas/<manga>/<capítulo>/<página>.jpg
// El glob eager registra cada imagen en build, y su .src ya respeta el base (/v1...),
// así que el lector puede usarlas directamente como src de <img>.
const files = import.meta.glob<{ default: { src: string } }>("../assets/mangas/*/*/*.jpg", {
    eager: true,
});

const byChapter = new Map<string, { page: number; src: string }[]>();

for (const [path, mod] of Object.entries(files)) {
    const [id, cap, file] = path.split("/").slice(-3);
    const page = Number(file.replace(/\.[^.]+$/, ""));
    if (!Number.isFinite(page)) continue;
    const key = `${id}/${Number(cap)}`;
    const list = byChapter.get(key) ?? [];
    list.push({ page, src: mod.default.src });
    byChapter.set(key, list);
}

for (const list of byChapter.values()) list.sort((a, b) => a.page - b.page);

/** src de cada página del capítulo, en orden. Vacío si no hay contenido real. */
export function chapterPages(id: string, chapter: number): string[] {
    return (byChapter.get(`${id}/${chapter}`) ?? []).map((p) => p.src);
}
