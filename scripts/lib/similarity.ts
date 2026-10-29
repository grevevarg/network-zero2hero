export type QuizItem = { label: string; text: string; options: string[] };
export type OwnItem = { id: string; text: string; options: string[] };
export type SimilarityFinding = { id: string; against: string; reason: string };
export type Thresholds = { ngram: number; n: number; minNgrams: number; optionOverlap: number };

export const DEFAULT_THRESHOLDS: Thresholds = { ngram: 0.25, n: 3, minNgrams: 6, optionOverlap: 0.75 };

export function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function ngrams(tokens: readonly string[], n: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i + n <= tokens.length; i++) out.add(tokens.slice(i, i + n).join(" "));
  return out;
}

/** Share of `ours` that also appears in `theirs`. */
export function containment(ours: ReadonlySet<string>, theirs: ReadonlySet<string>): number {
  if (ours.size === 0) return 0;
  let shared = 0;
  for (const g of ours) if (theirs.has(g)) shared++;
  return shared / ours.size;
}

export function optionOverlap(ours: readonly string[], theirs: readonly string[]): number {
  if (ours.length === 0) return 0;
  const norm = (s: string) => words(s).join(" ");
  const theirSet = new Set(theirs.map(norm));
  return ours.filter((o) => theirSet.has(norm(o))).length / ours.length;
}

/** Flag our questions whose wording or option set is too close to an existing quiz item. */
export function compare(
  own: readonly OwnItem[],
  quiz: readonly QuizItem[],
  t: Thresholds = DEFAULT_THRESHOLDS,
): SimilarityFinding[] {
  const quizGrams = quiz.map((q) => ({ q, grams: ngrams(words(`${q.text} ${q.options.join(" ")}`), t.n) }));
  const findings: SimilarityFinding[] = [];
  for (const o of own) {
    const grams = ngrams(words(`${o.text} ${o.options.join(" ")}`), t.n);
    for (const { q, grams: theirs } of quizGrams) {
      const c = containment(grams, theirs);
      if (grams.size >= t.minNgrams && c > t.ngram) {
        findings.push({ id: o.id, against: q.label, reason: `${Math.round(c * 100)}% shared ${t.n}-grams` });
      }
      const ov = optionOverlap(o.options, q.options);
      if (o.options.length >= 3 && ov >= t.optionOverlap) {
        findings.push({ id: o.id, against: q.label, reason: `${Math.round(ov * 100)}% identical options` });
      }
    }
  }
  return findings;
}

type RawQuiz = { chapter?: number; prompt?: string; options?: Record<string, string>; explanation?: string; blanks?: string[] };

export function quizItemsFrom(data: unknown, source: string): QuizItem[] {
  if (!Array.isArray(data)) return [];
  return (data as RawQuiz[]).map((q, i) => ({
    label: `${source}#${i}`,
    text: `${q.prompt ?? ""} ${q.explanation ?? ""} ${(q.blanks ?? []).join(" ")}`,
    options: Object.values(q.options ?? {}),
  }));
}
