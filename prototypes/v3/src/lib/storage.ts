// Único punto de acceso a localStorage. Si un día hay backend, solo cambia este archivo.
import { VERSION } from "./paths";

export type ListState = "want" | "reading" | "read";
export interface Session {
    email: string;
    guest: boolean;
}
export interface Prefs {
    notify: boolean;
    onlyAvailable: boolean;
}

export const LIST_LABELS: Record<ListState, string> = {
    want: "Quiero leer",
    reading: "Leyendo",
    read: "Leídos",
};

// Las claves llevan el nombre de la versión: v1, v2 y v3 comparten origen en el deploy
// y sin este prefijo se pisarían la sesión, la lista y el progreso.
const KEYS = {
    session: `mangaplus:${VERSION}:session`,
    list: `mangaplus:${VERSION}:list`,
    prefs: `mangaplus:${VERSION}:prefs`,
    progress: `mangaplus:${VERSION}:progress`,
};

function load<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function save(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // localStorage no disponible (modo privado): seguimos sin persistir.
    }
}

export const getSession = () => load<Session | null>(KEYS.session, null);
export const setSession = (session: Session) => save(KEYS.session, session);
export function endSession() {
    try {
        localStorage.removeItem(KEYS.session);
    } catch {
        /* noop */
    }
}

export const getList = () => load<Record<string, ListState>>(KEYS.list, {});
export function setListState(id: string, state: ListState | null) {
    const list = getList();
    if (state) list[id] = state;
    else delete list[id];
    save(KEYS.list, list);
}

export const getPrefs = () => load<Prefs>(KEYS.prefs, { notify: true, onlyAvailable: false });
export const setPrefs = (prefs: Prefs) => save(KEYS.prefs, prefs);

// Último capítulo terminado por manga.
export const getProgress = () => load<Record<string, number>>(KEYS.progress, {});
export function setProgress(id: string, chapter: number) {
    const progress = getProgress();
    progress[id] = Math.max(progress[id] ?? 0, chapter);
    save(KEYS.progress, progress);
}

// Preferencias del lector (ronda v2): modo de lectura, zoom y brillo.
export type ReaderMode = "page" | "cascade";
export interface ReaderPrefs {
    mode: ReaderMode;
    zoom: number;
    brightness: number;
}

export const READER_LIMITS = {
    zoom: { min: 0.5, max: 3, step: 0.25 },
    brightness: { min: 0.5, max: 1, step: 0.05 },
};

export const getReaderPrefs = () =>
    load<ReaderPrefs>(`mangaplus:${VERSION}:reader`, { mode: "page", zoom: 1, brightness: 1 });
export function setReaderPrefs(prefs: ReaderPrefs) {
    save(`mangaplus:${VERSION}:reader`, prefs);
}
