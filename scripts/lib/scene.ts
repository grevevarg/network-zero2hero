import { hashString } from "../../src/lib/prng.ts";
import type { Block, Label, Layout, LayoutNode, Message } from "./layouts.ts";

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
export type Roles = { device: string; box: string; server: string; router: string };
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

const BASE = {
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
  version: 1,
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
};

export const FONT_SIZE = 26;
/** Rough width of Excalifont text. Excalidraw measures it again when the scene loads. */
export function textWidth(text: string, fontSize = FONT_SIZE): number {
  return Math.ceil(text.length * fontSize * 0.55);
}

export function textElement(id: string, text: string, cx: number, top: number, fontSize = FONT_SIZE): ExElement {
  const width = textWidth(text, fontSize);
  return {
    ...BASE,
    id,
    type: "text",
    x: cx - width / 2,
    y: top,
    width,
    height: fontSize * 1.25,
    seed: hashString(`${id}:seed`),
    versionNonce: hashString(`${id}:nonce`),
    text,
    originalText: text,
    fontSize,
    fontFamily: 5,
    textAlign: "center",
    verticalAlign: "top",
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
  };
}

export function arrowElement(id: string, x1: number, y1: number, x2: number, y2: number): ExElement {
  return {
    ...lineElement(id, x1, y1, x2, y2),
    type: "arrow",
    endArrowhead: "arrow",
    elbowed: false,
  };
}

/** Distance between the cable line and a message arrow, and between the arrow and its label. */
const MESSAGE_OFFSET = 18;
const LABEL_GAP = 8;

/** An arrow parallel to the line between two boxes, offset above or below, with its label outside it. */
export function messageElements(m: Message, from: Box, to: Box, index: number): ExElement[] {
  const cy = (b: Box) => (b.minY + b.maxY) / 2;
  const dir = (to.minX + to.maxX) / 2 >= (from.minX + from.maxX) / 2 ? 1 : -1;
  const y = (cy(from) + cy(to)) / 2 + (m.side === "above" ? -MESSAGE_OFFSET : MESSAGE_OFFSET);
  const x1 = dir === 1 ? from.maxX + 10 : from.minX - 10;
  const x2 = dir === 1 ? to.minX - 10 : to.maxX + 10;
  const top = m.side === "above" ? y - LABEL_GAP - FONT_SIZE * 1.25 : y + LABEL_GAP;
  return [arrowElement(`message-${index}`, x1, y, x2, y), textElement(`message-${index}-label`, m.label, (x1 + x2) / 2, top)];
}

/** Build a scene: library items on every node, lines for every edge, labelled message arrows. Lines come first. */
/** Light grey that the dark-mode invert filter turns into a dark grey. */
const SHADE = "#e9ecef";

export function rectElement(id: string, x: number, y: number, width: number, height: number, background: string): ExElement {
  return {
    ...BASE,
    id,
    type: "rectangle",
    x,
    y,
    width,
    height,
    backgroundColor: background,
    seed: hashString(`${id}:seed`),
    versionNonce: hashString(`${id}:nonce`),
  };
}

/** A block's rectangle with its label centred inside it, in scene units. An empty label draws no text. */
export function blockElements(b: Block, index: number, scale: number): ExElement[] {
  const [x, y, w, h] = [b.x * scale, b.y * scale, b.w * scale, b.h * scale];
  const top = y + (h - FONT_SIZE * 1.25) / 2;
  const rect = rectElement(`block-${index}`, x, y, w, h, b.fill ?? (b.shaded ? SHADE : "transparent"));
  return b.label === "" ? [rect] : [rect, textElement(`block-${index}-label`, b.label, x + w / 2, top)];
}

export function labelElement(l: Label, index: number, scale: number): ExElement {
  return textElement(`label-${index}`, l.text, l.x * scale, l.y * scale);
}

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
  const messages = (layout.messages ?? []).flatMap((m, i) => {
    const from = boxes.get(m.from);
    const to = boxes.get(m.to);
    if (!from || !to) throw new Error(`message ${m.from}->${m.to} points to a missing node`);
    return messageElements(m, from, to, i);
  });
  return {
    type: "excalidraw",
    version: 2,
    source: "network-zero2hero",
    elements: [
      ...lines,
      ...(layout.blocks ?? []).flatMap((b, i) => blockElements(b, i, scale)),
      ...icons,
      ...messages,
      ...(layout.labels ?? []).map((l, i) => labelElement(l, i, scale)),
    ],
    appState: { viewBackgroundColor: "#ffffff", gridSize: null },
    files: {},
  };
}
