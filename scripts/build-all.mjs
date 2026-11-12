// Compila el showcase (hub en la raíz) y cada prototipo congelado en su subcarpeta:
//   dist/            -> hub
//   dist/vN/         -> prototypes/vN construido con base /vN
//   dist/versions.json  -> lista que usa la barra de versiones de cada prototipo
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { astro, DIST, listVersions, PROTOTYPES } from "./lib.mjs";

const versions = listVersions();
if (versions.length === 0) {
    console.error("No hay prototipos en prototypes/. Crea al menos prototypes/v1.");
    process.exit(1);
}

// El hub va primero: Astro vacía su outDir al compilar y borraría las versiones.
astro(["build"], "Hub (showcase)");

for (const version of versions) {
    astro(
        ["build", "--root", join(PROTOTYPES, version), "--base", `/${version}`, "--outDir", join(DIST, version)],
        `Prototipo ${version}`,
    );
}

writeFileSync(join(DIST, "versions.json"), JSON.stringify(versions));
console.log(`\n✔ Listo: hub + ${versions.join(", ")} en dist/`);
