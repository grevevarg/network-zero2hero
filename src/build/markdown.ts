import { marked } from "marked";
import type { BlockKind } from "../types.ts";

export type SourceBlock = { kind: BlockKind; uses: string[]; markdown: string };

const MARKER = /^<!--\s*uses:\s*([^;>]*?)\s*(?:;\s*kind:\s*([a-z]+)\s*)?-->\s*$/;
const KINDS: readonly BlockKind[] = ["text", "example", "recap"];

/**
 * Split a section's text.md into blocks. Every block starts with a marker line:
 *   <!-- uses: concept-a, concept-b -->
 *   <!-- uses: concept-a; kind: example -->
 */
export function splitBlocks(source: string): SourceBlock[] {
  const blocks: SourceBlock[] = [];
  let current: SourceBlock | undefined;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  lines.forEach((line, i) => {
    const m = MARKER.exec(line.trim());
    if (m) {
      const kind = (m[2] ?? "text") as BlockKind;
      if (!KINDS.includes(kind)) throw new Error(`line ${i + 1}: unknown block kind "${m[2]}"`);
      const uses = m[1].split(",").map((s) => s.trim()).filter(Boolean);
      current = { kind, uses, markdown: "" };
      blocks.push(current);
      return;
    }
    if (!current) {
      if (line.trim() === "") return;
      throw new Error(`line ${i + 1}: text before the first <!-- uses: ... --> marker`);
    }
    current.markdown += line + "\n";
  });
  for (const b of blocks) b.markdown = b.markdown.trim();
  return blocks;
}

const DIAGRAM_LINE = /^<p>@diagram\(([a-z0-9-]+)\)<\/p>$/gm;

/** Render block Markdown to HTML. A line `@diagram(id)` is replaced by that diagram's image. */
export function renderMarkdown(markdown: string, diagrams: Readonly<Record<string, string>> = {}): string {
  const html = marked.parse(markdown, { async: false, gfm: true }).trim();
  return html.replace(DIAGRAM_LINE, (_, id: string) => {
    const html = diagrams[id];
    if (!html) throw new Error(`unknown diagram "${id}"`);
    return `<figure>${html}</figure>`;
  });
}

export function renderInline(markdown: string): string {
  return marked.parseInline(markdown, { async: false, gfm: true }).trim();
}

/** Strip Markdown and HTML down to plain prose, for word counts and LIX. */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/^@diagram\([^)]*\)$/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_#>|]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
