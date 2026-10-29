/** Fisher-Yates shuffle. Returns a new array and leaves the input untouched. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffle, but never return the original order when another order exists.
 * Used for ordering puzzles so the student never starts with the answer.
 */
export function shuffleAwayFrom<T>(items: readonly T[], rng: () => number): T[] {
  if (items.length < 2) return items.slice();
  for (;;) {
    const out = shuffle(items, rng);
    if (out.some((item, i) => item !== items[i])) return out;
  }
}
