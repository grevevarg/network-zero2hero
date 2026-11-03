import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { answerKey } from "../../src/lib/answerHash.ts";
import { rankAnswer } from "../../src/lib/answers.ts";
import { itemRanks, rowsToMove } from "../../src/puzzles/ordering.ts";

/** A shuffled order of n items: perm[i] is the rank of the item shown in row i. */
const perm = fc.integer({ min: 0, max: 8 }).chain((n) => fc.shuffledSubarray([...Array(n).keys()], { minLength: n, maxLength: n }));

/** Reference: the longest strictly increasing subsequence, by trying every subset of rows. */
function naiveLongestRun(ranks: number[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << ranks.length; mask++) {
    const picked = ranks.filter((_, i) => mask & (1 << i));
    if (picked.every((r, i) => i === 0 || picked[i - 1] < r)) best = Math.max(best, picked.length);
  }
  return best;
}

describe("rowsToMove", () => {
  it("marks nothing exactly when the order is right", () => {
    fc.assert(
      fc.property(perm, (ranks) => {
        expect(rowsToMove(ranks).length === 0).toBe(ranks.every((r, i) => r === i));
      }),
    );
  });

  it("marks as few rows as possible, and the rows it keeps are already in order", () => {
    fc.assert(
      fc.property(perm, (ranks) => {
        const moved = rowsToMove(ranks);
        expect(moved.length).toBe(ranks.length - naiveLongestRun(ranks));
        const kept = ranks.filter((_, i) => !moved.includes(i));
        expect(kept.every((r, i) => i === 0 || kept[i - 1] < r)).toBe(true);
        expect(moved).toEqual(moved.slice().sort((a, b) => a - b));
      }),
    );
  });

  it("moving the marked rows to their places solves it", () => {
    fc.assert(
      fc.property(perm, (ranks) => {
        const moved = new Set(rowsToMove(ranks));
        const kept = ranks.filter((_, i) => !moved.has(i));
        // Insert each moved rank into the kept run at its sorted place.
        const fixed = [...kept, ...ranks.filter((_, i) => moved.has(i))].sort((a, b) => a - b);
        expect(fixed).toEqual([...ranks.keys()]);
        expect(kept).toEqual(fixed.filter((r) => kept.includes(r)));
      }),
    );
  });

  it("marks one row for one item put in the wrong place, not every row it pushed along", () => {
    expect(rowsToMove([1, 2, 3, 0])).toEqual([3]);
    expect(rowsToMove([3, 0, 1, 2])).toEqual([0]);
    expect(rowsToMove([0, 3, 1, 2])).toEqual([1]);
  });

  it("among equally short fixes, keeps rows that are already at their place", () => {
    // Swapping the first two: either could move; the third row is home and stays.
    expect(rowsToMove([1, 0, 2])).toEqual([1]);
    // Reversed: any single row is a longest run; keep the middle one, which is home.
    expect(rowsToMove([2, 1, 0])).toEqual([0, 2]);
  });

  it("always moves rows whose place is unknown", () => {
    expect(rowsToMove([0, undefined, 1])).toEqual([1]);
    expect(rowsToMove([undefined])).toEqual([0]);
    expect(rowsToMove([])).toEqual([]);
  });
});

describe("itemRanks", () => {
  it("finds each item's place from the keys, whatever order they are shown in", () => {
    fc.assert(
      fc.property(perm, (ranks) => {
        const correct = ranks.map((_, r) => `x${r}`);
        const keys = correct.map((id, r) => answerKey("q", rankAnswer(id, r))).sort();
        const shown = ranks.map((r) => correct[r]);
        expect(itemRanks("q", shown, keys)).toEqual(ranks);
      }),
    );
  });

  it("gives undefined for an item no key matches, and keys from another question do not count", () => {
    const keys = [answerKey("q", rankAnswer("a", 0)), answerKey("q", rankAnswer("b", 1))];
    expect(itemRanks("q", ["b", "z"], keys)).toEqual([1, undefined]);
    expect(itemRanks("other", ["a", "b"], keys)).toEqual([undefined, undefined]);
  });
});
