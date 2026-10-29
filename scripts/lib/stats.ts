import type { ParsedSection } from "../../src/build/course.ts";
import { toPlainText } from "../../src/build/markdown.ts";
import { lix } from "../../src/lib/lix.ts";

export type SectionStats = { id: string; words: number; lix: number; questions: number; minutes: number };

export const WORDS_PER_MINUTE = 150;
export const MINUTES_PER_QUESTION = 1;
export const LIX_WARN = 45;

export function sectionStats(s: ParsedSection): SectionStats {
  const prose = s.blocks.map((b) => toPlainText(b.markdown)).join(" ");
  const r = lix(prose);
  const minutes = r.words / WORDS_PER_MINUTE + s.questions.length * MINUTES_PER_QUESTION;
  return { id: s.meta.id, words: r.words, lix: r.lix, questions: s.questions.length, minutes: Math.round(minutes) };
}

export function formatStats(rows: readonly SectionStats[]): string {
  const lines = rows.map(
    (r) =>
      `${r.id.padEnd(22)} ${String(r.words).padStart(6)} ${String(r.lix).padStart(6)}${r.lix > LIX_WARN ? "!" : " "} ${String(r.questions).padStart(4)} ${String(r.minutes).padStart(5)}`,
  );
  const total = rows.reduce((n, r) => n + r.minutes, 0);
  return [
    `${"section".padEnd(22)} ${"words".padStart(6)} ${"LIX".padStart(6)}  ${"q".padStart(4)} ${"min".padStart(5)}`,
    ...lines,
    `${"total".padEnd(22)} ${"".padStart(6)} ${"".padStart(6)}  ${"".padStart(4)} ${String(total).padStart(5)}`,
    `(LIX above ${LIX_WARN} is marked with !; minutes are a rough guide)`,
  ].join("\n");
}
