import { describe, expect, it } from "vitest";
import { parseTermList } from "../../src/build/forbidden.ts";
import { collectStrings, isProbablyBinary, isProseFile, scanText } from "../../scripts/lib/scan.ts";

describe("scan", () => {
  const terms = parseTermList("banan\n=päron");

  it("finds terms in any file and Obsidian syntax only in prose", () => {
    expect(scanText("src/a.ts", "const x = a[b[0]]; // banan", terms, [], false)).toEqual([{ file: "src/a.ts", term: "banan", line: 1 }]);
    expect(scanText("content/x.md", "Se [[länk]]", terms, [], true)).toEqual([{ file: "content/x.md", term: "[[", line: 1 }]);
  });

  it("respects the allowlist", () => {
    const allow = [{ file: "a.md", term: "banan", reason: "test" }];
    expect(scanText("a.md", "banan", terms, allow, false)).toEqual([]);
  });

  it("collects nested strings", () => {
    expect(collectStrings({ a: "x", b: [1, "y", { c: "z" }], d: null })).toEqual(["x", "y", "z"]);
  });

  it("detects binary files and prose files", () => {
    expect(isProbablyBinary(new Uint8Array([65, 0, 66]))).toBe(true);
    expect(isProbablyBinary(new TextEncoder().encode("hej"))).toBe(false);
    expect(isProseFile("content/sections/01-x/text.md")).toBe(true);
    expect(isProseFile("README.md")).toBe(false);
  });
});
