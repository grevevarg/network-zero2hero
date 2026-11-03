import { answerKey } from "../lib/answerHash.ts";
import { rankAnswer } from "../lib/answers.ts";

/** The place each item belongs at, found by trying every place against the item keys; undefined if none matches. */
export function itemRanks(questionId: string, ids: readonly string[], keys: readonly string[]): (number | undefined)[] {
  const known = new Set(keys);
  return ids.map((id) => {
    const rank = ids.findIndex((_, r) => known.has(answerKey(questionId, rankAnswer(id, r))));
    return rank === -1 ? undefined : rank;
  });
}

/**
 * Which rows need to move, as a list of row indices, ascending.
 * Keeps the longest run of rows that are already in the right order relative to each other
 * (a longest increasing subsequence of the ranks) and marks every other row, so one item put in
 * the wrong place marks that one row, not every row it pushed along. Among equally long runs it
 * keeps the one with the most rows already at their final place. Unknown ranks always move.
 */
export function rowsToMove(ranks: readonly (number | undefined)[]): number[] {
  // best[i]: [length, rows at their final place] of the best run that ends at row i.
  const best: [number, number][] = [];
  const prev: number[] = [];
  let end = -1;
  const better = (a: [number, number], b: [number, number]) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  ranks.forEach((r, i) => {
    if (r === undefined) return;
    const home = r === i ? 1 : 0;
    best[i] = [1, home];
    prev[i] = -1;
    for (let j = 0; j < i; j++) {
      const rj = ranks[j];
      if (rj === undefined || rj >= r) continue;
      const cand: [number, number] = [best[j][0] + 1, best[j][1] + home];
      if (better(cand, best[i])) {
        best[i] = cand;
        prev[i] = j;
      }
    }
    if (end === -1 || better(best[i], best[end])) end = i;
  });
  const keep = new Set<number>();
  for (let i = end; i !== -1; i = prev[i]) keep.add(i);
  return ranks.map((_, i) => i).filter((i) => !keep.has(i));
}
