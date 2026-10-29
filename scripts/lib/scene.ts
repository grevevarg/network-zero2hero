import { hashString } from "../../src/lib/prng.ts";
import type { Layout, LayoutNode } from "./layouts.ts";

/** The parts of an Excalidraw element this module reads or rewrites. Everything else is copied as is. */
export type ExElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  groupIds?: string[];
  points?: [number, number][];
  containerId?: string | null;
  boundElements?: { id: string; type: string }[] | null;
  [key: string]: unknown;
};

export type LibraryItem = { id: string; name?: string; elements: ExElement[] };
export type Library = { libraryItems: LibraryItem[] };
export type Box = { minX: number; minY: number; maxX: number; maxY: number };
export type Roles = { device: string; box: string };
export type Scene = {
  type: "excalidraw";
  version: 2;
  source: string;
  elements: ExElement[];
  appState: { viewBackgroundColor: string; gridSize: null };
  files: Record<string, never>;
};

export function bounds(elements: readonly ExElement[]): Box {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const e of elements) {
    if (e.points && e.points.length > 0) {
      for (const [px, py] of e.points) {
        xs.push(e.x + px);
        ys.push(e.y + py);
      }
    } else {
      xs.push(e.x, e.x + e.width);
      ys.push(e.y, e.y + e.height);
    }
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

export function findItem(library: Library, name: string): LibraryItem {
  const item = library.libraryItems.find((i) => i.name === name);
  if (!item) throw new Error(`library has no item named "${name}"`);
  return item;
}

/** Copy a library item centred on (cx, cy) with ids, groups and seeds derived from `prefix`. */
export function placeItem(item: LibraryItem, cx: number, cy: number, prefix: string): ExElement[] {
  const b = bounds(item.elements);
  const dx = cx - (b.minX + b.maxX) / 2;
  const dy = cy - (b.minY + b.maxY) / 2;
  const rename = (id: string) => `${prefix}-${id}`;
  return item.elements.map((e) => ({
    ...e,
    id: rename(e.id),
    x: e.x + dx,
    y: e.y + dy,
    groupIds: [...(e.groupIds ?? []).map(rename), prefix],
    containerId: e.containerId ? rename(e.containerId) : (e.containerId ?? null),
    boundElements: e.boundElements ? e.boundElements.map((be) => ({ ...be, id: rename(be.id) })) : (e.boundElements ?? null),
    frameId: null,
    seed: hashString(`${prefix}:${e.id}:seed`),
    versionNonce: hashString(`${prefix}:${e.id}:nonce`),
    updated: 1,
  }));
}

/** Where the segment from the centre of `box` towards (tx, ty) leaves the box, pushed out by `pad`. */
export function exitPoint(box: Box, tx: number, ty: number, pad = 6): [number, number] {
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const hw = (box.maxX - box.minX) / 2 + pad;
  const hh = (box.maxY - box.minY) / 2 + pad;
  const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy), 1);
  return [cx + dx * t, cy + dy * t];
}

export function lineElement(id: string, x1: number, y1: number, x2: number, y2: number): ExElement {
  return {
    id,
    type: "line",
    x: x1,
    y: y1,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: hashString(`${id}:seed`),
    version: 1,
    versionNonce: hashString(`${id}:nonce`),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    points: [
      [0, 0],
      [x2 - x1, y2 - y1],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
  };
}

/** Build a scene: library items on every device/box node, lines for every edge, lines drawn first. */
export function buildScene(layout: Layout, library: Library, roles: Roles, scale = 2.6): Scene {
  const icons: ExElement[] = [];
  const boxes = new Map<string, Box>();
  const point = (n: LayoutNode): [number, number] => [n.x * scale, n.y * scale];
  for (const n of layout.nodes) {
    const [x, y] = point(n);
    if (n.shape === "junction") {
      boxes.set(n.id, { minX: x, minY: y, maxX: x, maxY: y });
      continue;
    }
    const placed = placeItem(findItem(library, roles[n.shape]), x, y, n.id);
    icons.push(...placed);
    boxes.set(n.id, bounds(placed));
  }
  const center = (b: Box): [number, number] => [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
  const lines = layout.edges.map(([a, b]) => {
    const ba = boxes.get(a);
    const bb = boxes.get(b);
    if (!ba || !bb) throw new Error(`edge ${a}-${b} points to a missing node`);
    const [x1, y1] = exitPoint(ba, ...center(bb), ba.maxX === ba.minX ? 0 : 6);
    const [x2, y2] = exitPoint(bb, ...center(ba), bb.maxX === bb.minX ? 0 : 6);
    return lineElement(`edge-${a}-${b}`, x1, y1, x2, y2);
  });
  return {
    type: "excalidraw",
    version: 2,
    source: "network-zero2hero",
    elements: [...lines, ...icons],
    appState: { viewBackgroundColor: "#ffffff", gridSize: null },
    files: {},
  };
}
