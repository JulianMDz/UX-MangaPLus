import { url } from "../lib/paths";
import { useEffect } from "react";
import { getSession } from "../lib/storage";
import { getBrand } from "../lib/images";

const logo = getBrand("logo-manga-plus");

interface Props {
    current: "inicio" | "lista" | "perfil";
    query?: string;
}

const linkClass = (active: boolean) =>
    `border-b-2 pb-0.5 text-sm transition-colors hover:text-white ${
        active ? "border-accent text-white" : "border-transparent text-muted"
    }`;

export default function Navbar({ current, query = "" }: Props) {
    // Páginas protegidas: sin sesión (ni invitado) se vuelve al login.
    useEffect(() => {
        if (!getSession()) window.location.href = url("/login");
    }, []);

    return (
        <header className="sticky top-0 z-10 border-b border-line bg-base/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
                <a href={url("/")} aria-label="Manga Plus, inicio">
                    {logo ? (
                        <img src={logo.src} alt="Manga Plus" width={logo.width} height={logo.height} className="h-9 w-auto" />
                    ) : (
                        <span className="text-sm font-bold text-accent">MANGA PLUS</span>
                    )}
                </a>
                <a href={url("/")} className={linkClass(current === "inicio")}>
                    Inicio
                </a>
                <a href={url("/mi-lista")} className={linkClass(current === "lista")}>
                    Mi lista
                </a>

                <form action={url("/")} method="get" role="search" className="ml-auto hidden flex-1 sm:block sm:max-w-md">
                    <label htmlFor="q" className="sr-only">
                        Buscar manga
                    </label>
                    <input
                        id="q"
                        name="q"
                        type="search"
                        defaultValue={query}
                        placeholder="Buscar Manga"
                        className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-white placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
                    />
                </form>

                <a
                    href={url("/perfil")}
                    aria-label="Mi perfil"
                    className="ml-auto grid size-9 place-items-center rounded-full bg-accent transition-transform hover:scale-105 sm:ml-0"
                >
                    <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden="true">
                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5Z" />
                    </svg>
                </a>
            </nav>
        </header>
    );
}
