// Único punto de acceso a localStorage. Si un día hay backend, solo cambia este archivo.

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

const KEYS = {
    session: "mangaplus:session",
    list: "mangaplus:list",
    prefs: "mangaplus:prefs",
    progress: "mangaplus:progress",
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
