import { htmlToText } from "../lib/text.ts";
import type { ClientBlock, ClientQuestion, ClientSection } from "../types.ts";

export type Card =
  | { kind: "text"; title: string; bodyHtml: string; block: ClientBlock }
  | { kind: "concepts"; title: string }
  | { kind: "question"; title: string; question: ClientQuestion }
  | { kind: "finish"; title: string };

const LEADING_HEADING = /^\s*<h2[^>]*>([\s\S]*?)<\/h2>\s*/;

/** Split a block's leading <h2> off its body. The content check guarantees every block starts with one. */
export function splitTitle(html: string): { title: string; bodyHtml: string } {
  const m = LEADING_HEADING.exec(html);
  if (!m) return { title: "", bodyHtml: html };
  return { title: htmlToText(m[1]), bodyHtml: html.slice(m[0].length) };
}

/** The deck for one section: text cards, the new-concepts card, one card per question, a finish card. */
export function sectionCards(section: ClientSection): Card[] {
  const cards: Card[] = section.blocks.map((block) => ({ kind: "text", block, ...splitTitle(block.html) }));
  if (section.newConcepts.length > 0) cards.push({ kind: "concepts", title: "Nya begrepp" });
  section.questions.forEach((question, i) =>
    cards.push({ kind: "question", question, title: `Fråga ${i + 1} av ${section.questions.length}` }),
  );
  cards.push({ kind: "finish", title: "Avsnittet är klart" });
  return cards;
}

/** Clamp a 1-based card number into the deck. */
export function clampCard(n: number, count: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.trunc(n)), Math.max(1, count));
}
