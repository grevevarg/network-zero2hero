import type { Fill, Matching, Mcq, Ordering } from "../build/schema.ts";
import { normalizeAnswer } from "../lib/answers.ts";

/** Pure validators over authored (source) questions. Used by tests and the build step. */
export function isMcqSolved(q: Mcq, chosenId: string): boolean {
  return chosenId === q.correct;
}

export function isOrderingSolved(q: Ordering, order: readonly string[]): boolean {
  return order.length === q.items.length && q.items.every((item, i) => item.id === order[i]);
}

export function isMatchingSolved(q: Matching, chosen: Readonly<Record<string, string>>): boolean {
  return q.pairs.every((p) => chosen[p.left.id] === p.right.id);
}

/** Every right-hand option a matching question offers, pairs first, then distractors. */
export function matchingRightOptions(q: Matching): { id: string; text: string }[] {
  return [...q.pairs.map((p) => p.right), ...q.distractors];
}

export function isFillSolved(q: Fill, values: Readonly<Record<string, string>>): boolean {
  return q.fields.every((f) => normalizeAnswer(values[f.id] ?? "", f.format) === normalizeAnswer(f.answer, f.format));
}
