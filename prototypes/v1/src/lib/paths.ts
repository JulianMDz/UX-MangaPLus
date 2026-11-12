// El prototipo se publica bajo un prefijo (/v1, /v2...) así que ningún enlace puede ser
// absoluto a la raíz del dominio. Siempre pasar las rutas por url().
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const url = (path: string) => `${base}${path.startsWith("/") ? path : `/${path}`}`;

// Nombre de la versión (v1, v2...) según el prefijo. En desarrollo no hay prefijo.
// Las versiones comparten origen, así que localStorage se separa con este valor.
export const VERSION = import.meta.env.BASE_URL.replace(/\//g, "") || "dev";
