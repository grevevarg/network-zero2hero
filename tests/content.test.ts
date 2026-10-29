// Rules for the real content in content/.
import { describe, expect, it } from "vitest";
import { checkConceptGraph, checkQuestions } from "../src/build/checks.ts";
import { buildCourse, parseContent, type ParsedContent } from "../src/build/course.ts";
import { loadContent } from "../src/build/loadContent.ts";

let content: ParsedContent;

describe("content", async () => {
  content = parseContent(await loadContent(process.cwd()));

  it("passes the concept graph rules (DAG, no forward references, introduced once)", () => {
    expect(checkConceptGraph(content)).toEqual([]);
  });

  it("passes the question rules (one answer, explanations, no position references)", () => {
    expect(checkQuestions(content)).toEqual([]);
  });

  it("mixes multiple choice and puzzles in every section", () => {
    for (const s of content.sections) {
      const kinds = new Set(s.questions.map((q) => q.kind));
      expect(kinds.has("mcq"), s.meta.id).toBe(true);
      expect(kinds.size, s.meta.id).toBeGreaterThan(1);
    }
  });

  it("every concept a section introduces is used somewhere in its text", () => {
    for (const s of content.sections) {
      const used = new Set(s.blocks.flatMap((b) => b.uses));
      for (const c of s.meta.introduces) expect(used.has(c), `${s.meta.id}: ${c}`).toBe(true);
    }
  });

  it("ships no authored answer ids", async () => {
    const json = JSON.stringify(await buildCourse(content));
    for (const s of content.sections) {
      for (const q of s.questions) if (q.kind === "mcq") expect(json).not.toContain(`"${q.correct}"`);
    }
  });
});
