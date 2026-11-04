import { useState, type FormEvent } from "react";

const SESSION_KEY = "mangaplus:session";

function startSession(session: { email: string; guest: boolean }) {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        // localStorage puede no estar disponible (modo privado); seguimos igual.
    }
    window.location.href = "/";
}

const inputClass =
    "rounded-lg border border-line bg-surface px-4 py-3.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Animación compartida: transición suave de color/sombra, elevación al hover y
// "presionado" al hacer clic. motion-safe respeta prefers-reduced-motion.
const buttonBase =
    "cursor-pointer rounded-full border-2 px-4 py-3.5 font-semibold transition-all duration-200 ease-out " +
    "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        startSession({ email, guest: false });
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="email">Correo:</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="password">Contraseña:</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                />
            </div>

            <button
                type="submit"
                className={`${buttonBase} border-transparent bg-accent hover:bg-red-600 hover:shadow-[0_8px_24px_-6px_var(--color-accent)]`}
            >
                Iniciar sesión
            </button>
            <button
                type="button"
                onClick={() => startSession({ email: "", guest: true })}
                className={`${buttonBase} border-white bg-transparent hover:bg-white hover:text-base`}
            >
                Entrar como invitado
            </button>
        </form>
    );
}
