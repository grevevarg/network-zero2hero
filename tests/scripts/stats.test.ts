import { describe, expect, it } from "vitest";
import { parseContent } from "../../src/build/course.ts";
import { formatStats, sectionStats } from "../../scripts/lib/stats.ts";
import { rawContent } from "../fixtures/content.ts";

describe("stats", () => {
  it("counts prose words and estimates minutes", () => {
    const s = sectionStats(parseContent(rawContent()).sections[0]);
    expect(s).toMatchObject({ id: "s1", words: 7, questions: 3, minutes: 3 });
  });

  it("formats a table with a total and LIX warnings", () => {
    const out = formatStats([
      { id: "a", words: 100, lix: 30, questions: 2, minutes: 3 },
      { id: "b", words: 100, lix: 50, questions: 2, minutes: 4 },
    ]);
    expect(out).toContain("total");
    expect(out).toMatch(/\b7\n/);
    expect(out).toMatch(/50!/);
    expect(out).not.toMatch(/30!/);
  });
});
