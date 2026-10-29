import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { RawContent } from "./course.ts";
import type { Concept, SectionInput } from "./schema.ts";

type ContentIndex = { title: string; concepts: Concept[]; sections: SectionInput[] };

export type Importer = (file: string) => Promise<unknown>;

const nativeImport: Importer = (file) => import(pathToFileURL(file).href);

/** Load content/index.ts and every section's text.md from disk. */
export async function loadContent(root: string, importer: Importer = nativeImport): Promise<RawContent> {
  const index = (await importer(path.join(root, "content/index.ts"))) as ContentIndex;
  const sections = await Promise.all(
    index.sections.map(async (section) => ({
      section,
      text: await readFile(path.join(root, "content/sections", section.meta.slug, "text.md"), "utf8"),
    })),
  );
  return { title: index.title, concepts: index.concepts, sections };
}
