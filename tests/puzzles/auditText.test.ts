import { describe, expect, it } from "vitest";
import { PROBLEM_KINDS } from "../../src/puzzles/audit.ts";
import { describeProblem, joinNames, repairHint } from "../../src/puzzles/auditText.ts";

const upper = (id: string) => id.toUpperCase();

describe("joinNames", () => {
  it("lists names the Swedish way", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames(["A"])).toBe("A");
    expect(joinNames(["A", "B"])).toBe("A och B");
    expect(joinNames(["A", "B", "C"])).toBe("A, B och C");
  });
});

describe("describeProblem", () => {
  it("says something different for every kind and names who it is about", () => {
    const texts = PROBLEM_KINDS.map((kind) => describeProblem({ kind, interfaces: ["a", "b"] }, upper));
    expect(new Set(texts).size).toBe(PROBLEM_KINDS.length);
    for (const t of texts) expect(t).toContain("A och B");
  });

  it("calls a single device the odd one out", () => {
    expect(describeProblem({ kind: "different-nets", interfaces: ["a"] }, upper)).toBe("A ligger i ett annat nät än resten av broadcastdomänen.");
    expect(describeProblem({ kind: "different-masks", interfaces: ["a"] }, upper)).toBe("A har en annan mask än resten av broadcastdomänen.");
  });
});

describe("repairHint", () => {
  it("only counts what the student has not touched", () => {
    expect(repairHint(0, 3)).toBe("3 fel kvar bland adresserna du inte har ändrat.");
    expect(repairHint(2, 0)).toBe("Det är fel kvar i det du har ändrat.");
    expect(repairHint(1, 2)).toContain("och 2 till");
  });
});
