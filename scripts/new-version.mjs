// Cierra la versión actual y crea la siguiente como copia: prototypes/vN -> prototypes/vN+1.
// La anterior queda CONGELADA (es lo que vieron los testers); se edita solo la nueva.
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FROZEN_FILE, freezeVersion, ITERATIONS, listVersions, PROTOTYPES, ROOT } from "./lib.mjs";

const versions = listVersions();
const latest = versions.at(-1);
if (!latest) {
    console.error("No hay ninguna versión base en prototypes/.");
    process.exit(1);
}

const number = Number(latest.slice(1)) + 1;
const next = `v${number}`;
const target = join(PROTOTYPES, next);
if (existsSync(target)) {
    console.error(`${next} ya existe.`);
    process.exit(1);
}

// La copia se hace ANTES de congelar, y sin artefactos generados ni el manifiesto de congelación.
cpSync(join(PROTOTYPES, latest), target, {
    recursive: true,
    filter: (src) => !/[\\/](\.astro|dist|node_modules)([\\/]|$)/.test(src) && !src.endsWith(FROZEN_FILE),
});

const frozenFiles = freezeVersion(latest);

// Ficha de la ronda en el hub, si todavía no existe.
const roundFile = join(ITERATIONS, `${next}.md`);
if (!existsSync(roundFile)) {
    writeFileSync(
        roundFile,
        `---\nversion: ${next}\ntitle: Iteración ${number - 1}\nstatus: planificada\n---\n\n` +
            `Versión creada a partir de ${latest}.\n\n` +
            `> Pendiente: documentar aquí los hallazgos de ${latest} y los cambios aplicados en esta versión.\n`,
    );
}

// Atajo para trabajar en la nueva versión: npm run dev:vN
const pkgPath = join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.scripts[`dev:${next}`] = `astro dev --root prototypes/${next}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`✔ ${latest} congelada (${frozenFiles} archivos).`);
console.log(`✔ Creada prototypes/${next} a partir de ${latest}.`);
console.log(`  Trabaja en ella con: npm run dev:${next}`);
console.log(`  Compara con:         git diff --no-index prototypes/${latest}/src prototypes/${next}/src`);
console.log(`  Documenta la ronda de ${latest} en src/content/iterations/${latest}.md`);
