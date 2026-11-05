import type { MangaStatus } from "./statuses";

export interface Manga {
    id: string;
    title: string;
    cover: string;
    status: MangaStatus;
    genre: string;
    description: string;
    chapters: number;
    rating: number;
    releaseDate?: string; // solo para "soon" (ISO)
    releaseLabel?: string;
    tags: ("popular" | "new")[];
    related: string[];
}

export const mangas: Manga[] = [
    {
        id: "dragon-ball",
        title: "Dragon Ball",
        cover: "/covers/dragon-ball.jpg",
        status: "available",
        genre: "Acción · Aventura",
        description:
            "Narra la épica historia de Son Goku, un niño con cola de mono y una fuerza asombrosa, que se convierte en el guerrero y protector más poderoso del universo.",
        chapters: 62,
        rating: 4.9,
        tags: ["popular"],
        related: ["naruto", "one-piece", "one-punch-man", "boku-no-hero", "bleach"],
    },
    {
        id: "kimetsu-no-yaiba",
        title: "Kimetsu no yaiba",
        cover: "/covers/kimetsu-no-yaiba.jpg",
        status: "available",
        genre: "Shonen · Acción",
        description:
            "Tanjiro Kamado se convierte en cazador de demonios para encontrar una cura que devuelva a su hermana Nezuko a su forma humana.",
        chapters: 43,
        rating: 4.7,
        tags: ["popular"],
        related: ["blue-lock", "one-piece", "bleach", "boku-no-hero", "chainsaw-man"],
    },
    {
        id: "blue-lock",
        title: "Blue Lock",
        cover: "/covers/blue-lock.jpg",
        status: "airing",
        genre: "Shonen · Deportes",
        description:
            "Trescientos delanteros encerrados en un programa que busca crear al egoísta futbolista que llevará a Japón a ganar el Mundial.",
        chapters: 48,
        rating: 4.7,
        tags: ["new"],
        related: ["kimetsu-no-yaiba", "boku-no-hero", "chainsaw-man", "one-piece", "bleach"],
    },
    {
        id: "one-piece",
        title: "One Piece",
        cover: "/covers/one-piece.jpg",
        status: "soon",
        genre: "Shonen · Aventura",
        description:
            "Monkey D. Luffy y su tripulación recorren los mares en busca del tesoro más grande del mundo: el One Piece.",
        chapters: 40,
        rating: 4.8,
        releaseDate: "2026-11-30",
        releaseLabel: "30 de Noviembre",
        tags: ["popular"],
        related: ["dragon-ball", "naruto", "bleach", "kimetsu-no-yaiba", "boku-no-hero"],
    },
    {
        id: "bleach",
        title: "Bleach",
        cover: "/covers/bleach.jpg",
        status: "unavailable",
        genre: "Shonen · Sobrenatural",
        description:
            "Ichigo Kurosaki obtiene los poderes de un Shinigami y debe proteger a los vivos de los espíritus malignos.",
        chapters: 30,
        rating: 4.6,
        tags: [],
        related: ["kimetsu-no-yaiba", "naruto", "one-piece", "chainsaw-man", "blue-lock"],
    },
    {
        id: "boku-no-hero",
        title: "Boku no hero",
        cover: "/covers/boku-no-hero.jpg",
        status: "available",
        genre: "Shonen · Superhéroes",
        description:
            "En un mundo donde casi todos tienen poderes, Izuku Midoriya, sin ninguno, sueña con convertirse en el mayor héroe.",
        chapters: 45,
        rating: 4.7,
        tags: ["popular"],
        related: ["one-punch-man", "kimetsu-no-yaiba", "blue-lock", "dragon-ball", "naruto"],
    },
    {
        id: "chainsaw-man",
        title: "Chainsawman",
        cover: "/covers/chainsaw-man.jpg",
        status: "airing",
        genre: "Shonen · Oscuro",
        description:
            "Denji, un joven endeudado, se fusiona con su perro demonio y se convierte en Chainsaw Man para cazar demonios.",
        chapters: 38,
        rating: 4.7,
        tags: ["new", "popular"],
        related: ["tokyo-ghoul", "bleach", "kimetsu-no-yaiba", "blue-lock", "spy-x-family"],
    },
    {
        id: "spy-x-family",
        title: "Spy x Family",
        cover: "/covers/spy-family.jpg",
        status: "available",
        genre: "Comedia · Acción",
        description:
            "Un espía, una asesina y una telépata forman una familia falsa sin saber el secreto de los demás.",
        chapters: 22,
        rating: 4.8,
        tags: ["popular"],
        related: ["one-punch-man", "boku-no-hero", "naruto", "chainsaw-man", "blue-lock"],
    },
    {
        id: "one-punch-man",
        title: "One punch man",
        cover: "/covers/one-punch-man.jpg",
        status: "airing",
        genre: "Lucha · Comedia",
        description:
            "Saitama, un héroe tan fuerte que derrota a cualquiera de un solo golpe, busca un rival que le devuelva la emoción.",
        chapters: 22,
        releaseLabel: "Nuevo capítulo cada jueves",
        rating: 4.8,
        tags: ["new", "popular"],
        related: ["boku-no-hero", "spy-x-family", "dragon-ball", "naruto", "blue-lock"],
    },
    {
        id: "naruto",
        title: "Naruto",
        cover: "/covers/naruto.jpg",
        status: "available",
        genre: "Aventura · Ninjas",
        description:
            "Naruto Uzumaki, un joven ninja marginado, sueña con convertirse en Hokage y ganarse el reconocimiento de su aldea.",
        chapters: 120,
        rating: 4.8,
        tags: ["popular"],
        related: ["dragon-ball", "one-piece", "bleach", "boku-no-hero", "one-punch-man"],
    },
    {
        id: "tokyo-ghoul",
        title: "Tokyo Ghoul",
        cover: "/covers/tokyo-ghoul.jpg",
        status: "soon",
        genre: "Fantasía oscura",
        description:
            "Ken Kaneki sobrevive a un ataque de un ghoul y queda atrapado entre dos mundos: el humano y el de los devoradores.",
        chapters: 30,
        rating: 4.6,
        releaseDate: "2026-11-30",
        releaseLabel: "30 de Noviembre",
        tags: ["new"],
        related: ["chainsaw-man", "bleach", "kimetsu-no-yaiba", "spy-x-family", "blue-lock"],
    },
];

export function getManga(id: string): Manga | undefined {
    return mangas.find((m) => m.id === id);
}

export function isReadable(manga: Manga): boolean {
    return manga.status === "available" || manga.status === "airing";
}

export const PAGES_PER_CHAPTER = 38;
