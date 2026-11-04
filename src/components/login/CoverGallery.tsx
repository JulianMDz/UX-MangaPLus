// Mientras no tengas las imágenes en /public/covers, se ven como bloques vacíos.
const covers = [
    { title: "Dragon Ball Super", src: "/covers/dragon-ball.jpg" },
    { title: "One Punch Man", src: "/covers/one-punch-man.jpg" },
    { title: "Spy x Family", src: "/covers/spy-family.jpg" },
    { title: "Saiko One-Shots", src: "/covers/saiko.jpg" },
    { title: "Naruto", src: "/covers/naruto.jpg" },
    { title: "Tokyo Ghoul", src: "/covers/tokyo-ghoul.jpg" },
];

export default function CoverGallery() {
    return (
        <section className="bg-dots p-8" aria-label="Mangas destacados">
            <ul className="grid grid-cols-3 gap-4">
                {covers.map((cover) => (
                    <li key={cover.title} className="aspect-[2/3] overflow-hidden rounded-sm bg-surface">
                        <img
                            src={cover.src}
                            alt={`Portada de ${cover.title}`}
                            loading="lazy"
                            className="block h-full w-full object-cover"
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
