type KeyLike = {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  target: EventTarget | null;
};

const OWNS_ARROWS = new Set(["INPUT", "SELECT", "TEXTAREA"]);

/**
 * Which way an arrow key moves the deck: -1, +1, or 0 for "not ours".
 * Radios, selects and text fields use arrows themselves, so those keep them, and so does anything
 * inside an element marked data-arrows (the rack grid moves between cells with them).
 */
export function navDirection(e: KeyLike): -1 | 0 | 1 {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return 0;
  const el = e.target as HTMLElement | null;
  if (el && (OWNS_ARROWS.has(el.tagName) || el.isContentEditable || el.closest?.("[data-arrows]"))) return 0;
  if (e.key === "ArrowRight") return 1;
  if (e.key === "ArrowLeft") return -1;
  return 0;
}
