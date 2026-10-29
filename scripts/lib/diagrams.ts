import { createHash } from "node:crypto";

export type ManifestEntry = { sourceHash: string; image: string; width: number; height: number };
/** Scene name (e.g. "01-natverk/q-star") to its exported image. */
export type Manifest = Record<string, ManifestEntry>;

export function sha256(text: string | Uint8Array): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Drop the Excalidraw source marker, metadata and doctype from an exported SVG. */
export function cleanSvg(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/g, "")
    .replace(/<!DOCTYPE[^>]*>\s*/g, "")
    .replace(/<!--[\s\S]*?-->\s*/g, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>\s*/g, "")
    .trim() + "\n";
}

export function svgSize(svg: string): { width: number; height: number } {
  const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? "";
  const viewBox = /viewBox="([\d.\s-]+)"/.exec(root)?.[1].trim().split(/\s+/).map(Number);
  const attr = (name: string) => Number(new RegExp(`\\b${name}="([\\d.]+)`).exec(root)?.[1]);
  const width = attr("width") || viewBox?.[2];
  const height = attr("height") || viewBox?.[3];
  if (!width || !height) throw new Error("SVG has no size");
  return { width: Math.round(width), height: Math.round(height) };
}

/** Scenes whose source changed since the last export, or that were never exported. */
export function staleScenes(scenes: Readonly<Record<string, string>>, manifest: Manifest): string[] {
  return Object.entries(scenes)
    .filter(([name, hash]) => manifest[name]?.sourceHash !== hash)
    .map(([name]) => name)
    .sort();
}

/** Images the old manifest pointed to that the new one no longer uses. */
export function orphanImages(before: Manifest, after: Manifest): string[] {
  const kept = new Set(Object.values(after).map((e) => e.image));
  return [...new Set(Object.values(before).map((e) => e.image))].filter((i) => !kept.has(i)).sort();
}

/** Drop manifest entries for scenes that no longer exist. */
export function pruneManifest(manifest: Manifest, scenes: Readonly<Record<string, string>>): Manifest {
  return Object.fromEntries(Object.entries(manifest).filter(([name]) => name in scenes));
}

export function sortManifest(manifest: Manifest): Manifest {
  return Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
