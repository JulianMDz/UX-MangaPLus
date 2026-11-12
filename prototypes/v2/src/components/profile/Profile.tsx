import { url } from "../../lib/paths";
import { useState } from "react";
import { getManga } from "../../data/mangas";
import { endSession, getList, getPrefs, getSession, setPrefs, type Prefs } from "../../lib/storage";
import Cover from "../Cover";
import { CoverProvider, type CoverMap } from "../CoverContext";

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-surface px-4 py-3 text-sm">
            {label}
            <input
                type="checkbox"
                role="switch"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />
            <span
                aria-hidden="true"
                className="relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-status-available peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
            />
        </label>
    );
}

function ProfileContent() {
    const [session] = useState(getSession);
    const [prefs, setPrefsState] = useState<Prefs>(getPrefs);
    const [list] = useState(getList);

    const states = Object.values(list);
    const stats = [
        { value: states.filter((s) => s === "read").length, label: "Mangas leídos", color: "text-status-available" },
        { value: states.filter((s) => s === "reading").length, label: "Leyendo ahora", color: "text-status-airing" },
        { value: states.length, label: "En mi lista", color: "text-status-soon" },
    ];

    const name = session?.guest ? "Invitado" : (session?.email.split("@")[0] ?? "Invitado");
    const favorite = getManga(Object.keys(list)[0] ?? "dragon-ball")!;

    function update(patch: Partial<Prefs>) {
        const next = { ...prefs, ...patch };
        setPrefsState(next);
        setPrefs(next);
    }

    function logout() {
        endSession();
        window.location.href = url("/login");
    }

    return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Mi perfil</h1>
                <button
                    onClick={logout}
                    className="cursor-pointer rounded-full border border-accent px-5 py-1.5 text-sm text-accent transition-colors hover:bg-accent hover:text-white"
                >
                    Cerrar sesión
                </button>
            </div>

            <section className="mt-5 flex items-center gap-5 rounded-lg bg-surface p-4">
                <div className="grid size-16 place-items-center rounded-full bg-accent" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="size-9 fill-black">
                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5Z" />
                    </svg>
                </div>
                <p className="flex-1 text-2xl font-bold capitalize">{name}</p>
                <a href={url(`/manga/${favorite.id}`)} className="flex items-center gap-3 text-xs text-muted">
                    <Cover manga={favorite} sizes="40px" className="h-14 w-10 rounded-sm" />
                    <span>
                        Manga favorito
                        <strong className="block text-sm text-white">{favorite.title}</strong>
                    </span>
                </a>
            </section>

            <ul className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((s) => (
                    <li key={s.label} className="rounded-lg bg-surface p-4">
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs">{s.label}</p>
                    </li>
                ))}
            </ul>

            <section className="mt-6 space-y-2">
                <h2 className="mb-3 text-center text-lg font-bold">Preferencias</h2>
                <Toggle
                    label="Avisarme cuando un manga de mi lista cambie de estado"
                    checked={prefs.notify}
                    onChange={(notify) => update({ notify })}
                />
                <Toggle
                    label="Mostrar solo los mangas que puedo leer ya"
                    checked={prefs.onlyAvailable}
                    onChange={(onlyAvailable) => update({ onlyAvailable })}
                />
            </section>
        </div>
    );
}

export default function Profile({ covers }: { covers: CoverMap }) {
    return (
        <CoverProvider value={covers}>
            <ProfileContent />
        </CoverProvider>
    );
}
