// Congela (o vuelve a congelar) una versión: npm run freeze -- v1
import { existsSync } from "node:fs";
import { join } from "node:path";
import { freezeVersion, listVersions, PROTOTYPES } from "./lib.mjs";

const version = process.argv[2];
if (!version || !listVersions().includes(version)) {
    console.error(`Indica una versión existente: npm run freeze -- <${listVersions().join("|")}>`);
    process.exit(1);
}
if (!existsSync(join(PROTOTYPES, version, "src"))) {
    console.error(`prototypes/${version} no tiene src/.`);
    process.exit(1);
}

const count = freezeVersion(version);
console.log(`✔ ${version} congelada (${count} archivos). Desde ahora cualquier cambio hará fallar npm run check.`);
