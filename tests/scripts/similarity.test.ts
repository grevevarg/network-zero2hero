import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { compare, containment, ngrams, optionOverlap, quizItemsFrom, words } from "../../scripts/lib/similarity.ts";

describe("similarity", () => {
  it("tokenises to lowercase words", () => {
    expect(words("Hej, VÄRLDEN! 10/100")).toEqual(["hej", "världen", "10", "100"]);
    expect(words("...")).toEqual([]);
  });

  it("ngrams and containment behave like sets", () => {
    expect([...ngrams(["a", "b", "c", "d"], 3)]).toEqual(["a b c", "b c d"]);
    expect(containment(new Set(), new Set(["x"]))).toBe(0);
    fc.assert(
      fc.property(fc.array(fc.string()), (xs) => {
        const s = new Set(xs);
        expect(containment(s, s)).toBe(s.size === 0 ? 0 : 1);
      }),
    );
  });

  it("optionOverlap compares normalised options", () => {
    expect(optionOverlap(["Star topology", "Bus"], ["star  topology!", "Ring"])).toBe(0.5);
    expect(optionOverlap([], ["x"])).toBe(0);
  });

  it("flags copied wording and copied option sets, but not unrelated text", () => {
    const quiz = quizItemsFrom(
      [
        { prompt: "Which network type connects buildings on one campus owned by one organisation?", options: { A: "MAN", B: "CAN", C: "WAN", D: "PAN" }, explanation: "Because." },
        { prompt: "A _____ is small", blanks: ["LAN"] },
      ],
      "mc.json",
    );
    expect(quiz[1]).toEqual({ label: "mc.json#1", text: "A _____ is small  LAN", options: [] });
    const findings = compare(
      [
        { id: "copy", text: "Which network type connects buildings on one campus owned by one organisation", options: [] },
        { id: "opts", text: "Helt egen fråga", options: ["MAN", "CAN", "WAN", "PAN"] },
        { id: "fine", text: "Vilken enhet är servern när kameran skickar bild till mobilen", options: ["Kameran", "Mobilen", "Båda"] },
      ],
      quiz,
    );
    expect(findings.map((f) => f.id)).toEqual(["copy", "opts"]);
  });

  it("ignores data that is not a list", () => {
    expect(quizItemsFrom({}, "x")).toEqual([]);
  });
});
