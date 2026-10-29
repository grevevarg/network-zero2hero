export type LixResult = { words: number; sentences: number; longWords: number; lix: number };

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

/** Count words in plain text. */
export function countWords(text: string): number {
  return text.match(WORD)?.length ?? 0;
}

/**
 * LIX readability index: words/sentences + 100 * longWords/words,
 * where a long word has more than six letters.
 */
export function lix(text: string): LixResult {
  const words = text.match(WORD) ?? [];
  const sentenceEnds = text.match(/[.!?:]+(?=\s|$)/g)?.length ?? 0;
  const sentences = Math.max(1, sentenceEnds);
  const longWords = words.filter((w) => w.replace(/[^\p{L}]/gu, "").length > 6).length;
  const value = words.length === 0 ? 0 : words.length / sentences + (100 * longWords) / words.length;
  return { words: words.length, sentences, longWords, lix: Math.round(value * 10) / 10 };
}
