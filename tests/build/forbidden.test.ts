import { describe, expect, it } from "vitest";
import { findObsidianSyntax, findTerms, isAllowed, parseTermList } from "../../src/build/forbidden.ts";

describe("forbidden terms", () => {
  it("parses term lists with comments and whole-word markers", () => {
    expect(parseTermList("# kommentar\nbanan\n\n=äpple \n")).toEqual([
      { text: "banan", wholeWord: false },
      { text: "äpple", wholeWord: true },
    ]);
  });

  it("matches substrings case-insensitively and whole words only when asked", () => {
    const terms = parseTermList("banan\n=päron\nA+B");
    expect(findTerms("Bananskal\nett päronträd\nett Päron.\nA+B=C", terms)).toEqual([
      { term: "banan", line: 1 },
      { term: "päron", line: 3 },
      { term: "A+B", line: 4 },
    ]);
  });

  it("finds Obsidian syntax", () => {
    expect(findObsidianSyntax("---\ntitle: x\n---\nSe ![[bild.png]] och [[länk]]\n> [!note] Hej\nslut ]]")).toEqual([
      { term: "frontmatter", line: 1 },
      { term: "![[", line: 4 },
      { term: "callout", line: 5 },
      { term: "]]", line: 6 },
    ]);
    expect(findObsidianSyntax("vanlig text")).toEqual([]);
  });

  it("checks the allowlist per file and term", () => {
    const allow = [{ file: "a.md", term: "Banan", reason: "test" }];
    expect(isAllowed(allow, "a.md", "banan")).toBe(true);
    expect(isAllowed(allow, "b.md", "banan")).toBe(false);
  });
});
