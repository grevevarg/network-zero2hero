import type { Diagram } from "./schema.ts";

/** Where an exported scene lives and how big it is. Read from diagrams/manifest.json. */
export type ImageInfo = { image: string; width: number; height: number };

export function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** An <img> for an exported Excalidraw scene. Width and height reserve space before it loads. */
export function diagramHtml(d: Diagram, images: Readonly<Record<string, ImageInfo>>): string {
  const info = images[d.scene];
  if (!info) throw new Error(`diagram scene "${d.scene}" has not been exported; run npm run diagrams`);
  return `<img class="diagram" src="${escapeAttr(info.image)}" width="${info.width}" height="${info.height}" alt="${escapeAttr(d.alt)}">`;
}
