// Local-only: write Excalidraw scenes for every spec that has no scene file yet (or all with --force).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROLES, SPECS } from "./diagram-specs.ts";
import { buildScene, type Library } from "./lib/scene.ts";

const root = process.cwd();
const libraryPath = path.join(root, "diagrams/library.excalidrawlib");
if (!existsSync(libraryPath)) {
  console.error("diagrams/library.excalidrawlib is missing (it is local only, export your Excalidraw library there)");
  process.exit(1);
}
const library = JSON.parse(readFileSync(libraryPath, "utf8")) as Library;
const force = process.argv.includes("--force");

let written = 0;
for (const [name, layout] of Object.entries(SPECS)) {
  const file = path.join(root, "diagrams", `${name}.excalidraw`);
  if (existsSync(file) && !force) continue;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(buildScene(layout, library, ROLES), null, 2) + "\n");
  written++;
  console.log(`wrote diagrams/${name}.excalidraw`);
}
console.log(written === 0 ? "all scenes exist (use --force to regenerate)" : `${written} scene(s) written; run npm run diagrams to export`);
