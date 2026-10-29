import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/build/loadContent.ts";
import { rawContent } from "../fixtures/content.ts";

describe("loadContent", () => {
  it("reads the index through the importer and texts from disk", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "content-"));
    const raw = rawContent();
    for (const s of raw.sections) {
      await mkdir(path.join(root, "content/sections", s.section.meta.slug), { recursive: true });
      await writeFile(path.join(root, "content/sections", s.section.meta.slug, "text.md"), s.text);
    }
    const seen: string[] = [];
    const loaded = await loadContent(root, async (file) => {
      seen.push(file);
      return { title: raw.title, concepts: raw.concepts, sections: raw.sections.map((s) => s.section) };
    });
    expect(seen).toEqual([path.join(root, "content/index.ts")]);
    // No diagrams/manifest.json in this folder, so no images.
    expect(loaded).toEqual({ ...raw, images: {} });
  });

  it("loads the real content with the default importer", async () => {
    const loaded = await loadContent(process.cwd());
    expect(loaded.title).toBe("Från noll till nätverk");
    expect(loaded.sections.length).toBeGreaterThan(0);
    expect(Object.keys(loaded.images).length).toBeGreaterThan(0);
  });
});
