// The committed diagrams: every scene exported and current, every image clean and self-contained.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseContent } from "../src/build/course.ts";
import { loadContent } from "../src/build/loadContent.ts";
import { sha256, type Manifest } from "../scripts/lib/diagrams.ts";
import { md5Hex } from "../scripts/lib/images.ts";

const root = process.cwd();
const manifest: Manifest = JSON.parse(readFileSync(path.join(root, "diagrams/manifest.json"), "utf8"));

function scenes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? scenes(path.join(dir, d.name)) : d.name.endsWith(".excalidraw") ? [path.join(dir, d.name)] : [],
  );
}

describe("diagrams", async () => {
  const content = parseContent(await loadContent(root));

  it("every scene is exported from its current source (else run npm run diagrams)", () => {
    for (const file of scenes(path.join(root, "diagrams"))) {
      const name = path.relative(path.join(root, "diagrams"), file).replace(/\.excalidraw$/, "");
      expect(manifest[name]?.sourceHash, `stale export: ${name}`).toBe(sha256(readFileSync(file)));
    }
  });

  it("every scene the content uses is in the manifest", () => {
    for (const s of content.sections) {
      for (const d of Object.values(s.meta.diagrams)) expect(manifest[d.scene], d.scene).toBeDefined();
    }
  });

  it("every manifest image exists, is named by its md5, and has no metadata or external references", () => {
    for (const [name, e] of Object.entries(manifest)) {
      const file = path.join(root, "public", e.image);
      expect(existsSync(file), name).toBe(true);
      const svg = readFileSync(file, "utf8");
      expect(path.basename(e.image, ".svg")).toBe(md5Hex(Buffer.from(svg)));
      expect(svg).not.toMatch(/<metadata|<!--|svg-source/);
      const urls = svg.match(/https?:\/\/[^"'\s)]+/g) ?? [];
      expect(urls.filter((u) => !u.startsWith("http://www.w3.org/")), name).toEqual([]);
    }
  });
});
