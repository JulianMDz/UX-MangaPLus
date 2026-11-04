export type MangaStatus = "available" | "airing" | "soon" | "unavailable";

export const STATUS_LABELS: Record<MangaStatus, string> = {
    available: "Disponible",
    airing: "En emisión",
    soon: "Próximamente",
    unavailable: "No disponible",
};

// Clases completas (no concatenadas) para que Tailwind las detecte al escanear.
export const STATUS_CLASSES: Record<MangaStatus, string> = {
    available: "text-status-available",
    airing: "text-status-airing",
    soon: "text-status-soon",
    unavailable: "text-status-unavailable",
};
