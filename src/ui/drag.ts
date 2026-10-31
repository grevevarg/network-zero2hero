/** Pure helpers for pointer dragging. The components measure the DOM and hand the numbers in here. */

export type Rect = { left: number; top: number; right: number; bottom: number };
export type Point = { x: number; y: number };

/** How far (px) a pointer has to move before a press counts as a drag rather than a tap. */
export const DRAG_THRESHOLD = 6;

export function isDrag(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD;
}

/** The list with the item at `from` taken out and put back in at `to`. */
export function moveTo<T>(list: readonly T[], from: number, to: number): T[] {
  const out = list.slice();
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/**
 * Where the dragged item (now at index `from`) belongs when the pointer is at height y:
 * one place for every other item whose middle is above the pointer.
 */
export function dropIndex(y: number, rects: readonly Rect[], from: number): number {
  return rects.filter((r, i) => i !== from && (r.top + r.bottom) / 2 < y).length;
}

/** Index of the first rect that contains the point, or -1. */
export function hitTest(p: Point, rects: readonly Rect[]): number {
  return rects.findIndex((r) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom);
}

/** The middle of `rect`'s left or right edge, relative to `origin`'s top left corner. */
export function edgePoint(rect: Rect, origin: Rect, side: "left" | "right"): Point {
  return { x: (side === "left" ? rect.left : rect.right) - origin.left, y: (rect.top + rect.bottom) / 2 - origin.top };
}

/** Matching lines, left id → right id. Each item has at most one line. */
export type Links = Readonly<Record<string, string>>;

/**
 * Draw a line between left and right. Any other line at either end goes, since each item pairs
 * with exactly one other. Drawing a line that is already there takes it away instead.
 */
export function connect(links: Links, left: string, right: string): Record<string, string> {
  const rest = Object.fromEntries(Object.entries(links).filter(([l, r]) => l !== left && r !== right));
  return links[left] === right ? rest : { ...rest, [left]: right };
}

/** Remove the line at one item, if it has one. */
export function disconnect(links: Links, side: "left" | "right", id: string): Record<string, string> {
  return Object.fromEntries(Object.entries(links).filter(([l, r]) => (side === "left" ? l : r) !== id));
}

/** Index of the rect that `r` covers the most, or -1 when it covers none of them. */
export function mostOverlap(r: Rect, rects: readonly Rect[]): number {
  const area = (o: Rect) => Math.max(0, Math.min(r.right, o.right) - Math.max(r.left, o.left)) * Math.max(0, Math.min(r.bottom, o.bottom) - Math.max(r.top, o.top));
  let best = -1;
  let bestArea = 0;
  rects.forEach((o, i) => {
    if (area(o) > bestArea) [best, bestArea] = [i, area(o)];
  });
  return best;
}

/** Gap (px) between a fingertip and the tile it is dragging. */
export const FINGER_GAP = 16;

/**
 * Where to draw a dragged tile of size w×h. With a mouse it stays where it was grabbed, so it moves
 * with the pointer like a real object. Under a finger it would be hidden, so it floats just above.
 */
export function floatingRect(pointer: Point, grabbedAt: Point, w: number, h: number, touch: boolean): Rect {
  const left = touch ? pointer.x - w / 2 : pointer.x - grabbedAt.x;
  const top = touch ? pointer.y - FINGER_GAP - h : pointer.y - grabbedAt.y;
  return { left, top, right: left + w, bottom: top + h };
}
