import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const PROTOTYPES = join(ROOT, "prototypes");
export const DIST = join(ROOT, "dist");
export const ITERATIONS = join(ROOT, "src", "content", "iterations");
export const FROZEN_FILE = ".frozen.json";

const ASTRO_BIN = join(ROOT, "node_modules", "astro", "bin", "astro.mjs");

/** Versiones existentes (v1, v2, ...) ordenadas numéricamente. */
export function listVersions() {
    return readdirSync(PROTOTYPES)
        .filter((name) => /^v\d+$/.test(name) && statSync(join(PROTOTYPES, name)).isDirectory())
        .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

/** Ejecuta la CLI de Astro con el mismo Node (sin depender de npx ni del shell). */
export function astro(args, label) {
    console.log(`\n▶ ${label}`);
    const result = spawnSync(process.execPath, [ASTRO_BIN, ...args], { cwd: ROOT, stdio: "inherit" });
    if (result.status !== 0) {
        console.error(`\n✖ Falló: ${label}`);
        process.exit(result.status ?? 1);
    }
}

// ---------------------------------------------------------------------------
// Congelación: una versión probada con usuarios no debe cambiar. Se guarda el hash
// de cada archivo en .frozen.json y `npm run check` detecta cualquier diferencia.
// ---------------------------------------------------------------------------

const IGNORED_DIRS = new Set([".astro", "dist", "node_modules"]);
const TEXT_FILE = /\.(astro|tsx?|jsx?|mjs|cjs|css|md|json|svg|html|txt)$/i;

export function* walkFiles(dir, base = dir) {
    for (const name of readdirSync(dir)) {
        if (IGNORED_DIRS.has(name)) continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) yield* walkFiles(full, base);
        else yield { full, rel: relative(base, full).split(sep).join("/") };
    }
}

function hashFile(full) {
    const buffer = readFileSync(full);
    // Los finales de línea cambian según el sistema/git (CRLF en Windows): no deben contar como cambio.
    const data = TEXT_FILE.test(full) ? Buffer.from(buffer.toString("utf8").replace(/\r\n/g, "\n")) : buffer;
    return createHash("sha256").update(data).digest("hex");
}

export function snapshotVersion(version) {
    const dir = join(PROTOTYPES, version);
    const files = {};
    for (const { full, rel } of walkFiles(dir)) {
        if (rel !== FROZEN_FILE) files[rel] = hashFile(full);
    }
    return files;
}

export function freezeVersion(version) {
    const manifest = { version, frozenAt: new Date().toISOString(), files: snapshotVersion(version) };
    writeFileSync(join(PROTOTYPES, version, FROZEN_FILE), JSON.stringify(manifest, null, 2) + "\n");
    return Object.keys(manifest.files).length;
}

export function readFrozen(version) {
    const file = join(PROTOTYPES, version, FROZEN_FILE);
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}
