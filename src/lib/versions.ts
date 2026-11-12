import { existsSync } from "node:fs";
import { join } from "node:path";

// Solo corre en build/servidor. Un prototipo es "abrible" si existe su carpeta en prototypes/.
// (El build se lanza siempre desde la raíz del repo.)
export function prototypeExists(version: string): boolean {
    return existsSync(join(process.cwd(), "prototypes", version, "src"));
}
