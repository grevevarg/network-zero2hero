import { describe, expect, it } from "vitest";
import { countWords, lix } from "../../src/lib/lix.ts";

describe("lix", () => {
  it("counts words, sentences and long words", () => {
    const r = lix("Det här är en kort mening. Nätverket fungerar utmärkt idag.");
    expect(r.words).toBe(10);
    expect(r.sentences).toBe(2);
    expect(r.longWords).toBe(3); // Nätverket, fungerar, utmärkt
    expect(r.lix).toBeCloseTo(10 / 2 + (100 * 3) / 10, 1);
  });

  it("handles empty text and text without punctuation", () => {
    expect(lix("")).toEqual({ words: 0, sentences: 1, longWords: 0, lix: 0 });
    expect(lix("bara ord").sentences).toBe(1);
  });

  it("countWords counts words with digits and hyphens as one", () => {
    expect(countWords("peer-to-peer och IPv4 är 2 saker")).toBe(6);
    expect(countWords("")).toBe(0);
  });
});
