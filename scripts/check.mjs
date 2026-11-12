// Comprueba las reglas que mantienen coherente el showcase. Se ejecuta antes de cada build
// (y por tanto en el deploy): si algo las rompe, el build falla con un mensaje que explica qué hacer.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ITERATIONS, listVersions, PROTOTYPES, readFrozen, snapshotVersion, walkFiles } from "./lib.mjs";

const errors = [];
const fail = (message) => errors.push(message);

const versions = listVersions();
const latest = versions.at(-1);

if (versions.length === 0) fail("No hay ningún prototipo en prototypes/.");

// Enlaces que se saldrían de /vN. Siempre se debe usar url("/ruta") de src/lib/paths.ts.
const ABSOLUTE_LINK = [
    /\b(href|action|src)=("\/|\{`\/)/,
    /location\.(href|assign|replace)\s*(=|\()\s*["'`]\//,
];
// Acceso directo a localStorage: mezclaría el estado entre versiones. Solo desde src/lib/storage.ts.
const DIRECT_STORAGE = /\b(localStorage|sessionStorage)\s*(\.\s*(getItem|setItem|removeItem|clear|key)\b|\[)/;
// La barra de versiones enlaza a propósito a la raíz del deploy (el showcase).
const ABSOLUTE_LINK_EXEMPT = new Set(["components/VersionBar.astro"]);

for (const version of versions) {
    const srcDir = join(PROTOTYPES, version, "src");

    for (const { full, rel } of walkFiles(srcDir)) {
        if (!/\.(tsx?|astro)$/.test(rel)) continue;
        readFileSync(full, "utf8")
            .split(/\r?\n/)
            .forEach((line, index) => {
                const where = `prototypes/${version}/src/${rel}:${index + 1}`;
                if (!ABSOLUTE_LINK_EXEMPT.has(rel) && ABSOLUTE_LINK.some((re) => re.test(line))) {
                    fail(`${where}\n    enlace absoluto: usa url("/ruta") de src/lib/paths.ts`);
                }
                if (rel !== "lib/storage.ts" && DIRECT_STORAGE.test(line)) {
                    fail(`${where}\n    localStorage directo: usa las funciones de src/lib/storage.ts`);
                }
            });
    }

    if (!existsSync(join(ITERATIONS, `${version}.md`))) {
        fail(`${version}: falta documentar la ronda en src/content/iterations/${version}.md`);
    }

    // Congelación: solo la última versión se puede editar.
    const frozen = readFrozen(version);
    const next = `v${Number(version.slice(1)) + 1}`;

    if (version !== latest && !frozen) {
        fail(`${version}: ya existe una versión posterior pero ${version} no está congelada.\n    Ejecuta: npm run freeze -- ${version}`);
    }

    if (frozen) {
        const current = snapshotVersion(version);
        const names = new Set([...Object.keys(frozen.files), ...Object.keys(current)]);
        const changes = [];
        for (const name of names) {
            if (!(name in current)) changes.push(`eliminado:  ${name}`);
            else if (!(name in frozen.files)) changes.push(`añadido:    ${name}`);
            else if (current[name] !== frozen.files[name]) changes.push(`modificado: ${name}`);
        }
        if (changes.length > 0) {
            fail(
                `${version} está congelada (es lo que vieron los testers) pero cambió:\n` +
                    changes.map((c) => `      ${c}`).join("\n") +
                    `\n    Los cambios van en ${version === latest ? "una versión nueva: npm run new-version" : next}.\n` +
                    `    Solo si es un arreglo que NO altera la experiencia probada: npm run freeze -- ${version} y anótalo en src/content/iterations/${version}.md`,
            );
        }
    }
}

if (errors.length > 0) {
    console.error(`\n✖ ${errors.length} problema(s) con las reglas del showcase:\n`);
    for (const error of errors) console.error(`  • ${error}\n`);
    console.error("Guía completa: AGENTS.md\n");
    process.exit(1);
}

console.log(`✔ Reglas del showcase correctas (${versions.join(", ")}; editable: ${latest}).`);
