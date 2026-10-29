import { describe, expect, it } from "vitest";
import { questionSchema, type Fill, type Matching, type Mcq, type Ordering } from "../../src/build/schema.ts";
import {
  isFillSolved,
  isMatchingSolved,
  isMcqSolved,
  isOrderingSolved,
  matchingRightOptions,
} from "../../src/puzzles/validators.ts";
import { fill, matching, mcq, ordering } from "../fixtures/content.ts";

describe("validators", () => {
  it("mcq accepts only the correct id", () => {
    const q = questionSchema.parse(mcq()) as Mcq;
    expect(isMcqSolved(q, "two")).toBe(true);
    expect(isMcqSolved(q, "one")).toBe(false);
  });

  it("ordering needs the full authored order", () => {
    const q = questionSchema.parse(ordering()) as Ordering;
    expect(isOrderingSolved(q, ["first", "second", "third"])).toBe(true);
    expect(isOrderingSolved(q, ["second", "first", "third"])).toBe(false);
    expect(isOrderingSolved(q, ["first", "second"])).toBe(false);
  });

  it("matching needs every pair and lists distractors last", () => {
    const q = questionSchema.parse(matching()) as Matching;
    expect(isMatchingSolved(q, { l1: "r1", l2: "r2" })).toBe(true);
    expect(isMatchingSolved(q, { l1: "r1", l2: "r3" })).toBe(false);
    expect(isMatchingSolved(q, { l1: "r1" })).toBe(false);
    expect(matchingRightOptions(q).map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });
});

describe("fill validator", () => {
  const q = questionSchema.parse(fill()) as Fill;
  it("accepts the answers in any harmless form and nothing else", () => {
    expect(q.fields[0].format).toBe("ipv4");
    expect(isFillSolved(q, { net: "10.0.0.0", n: "254" })).toBe(true);
    expect(isFillSolved(q, { net: " 010.000.0.00 ", n: "0254" })).toBe(true);
    expect(isFillSolved(q, { net: "10.0.0.1", n: "254" })).toBe(false);
    expect(isFillSolved(q, { net: "10.0.0.0" })).toBe(false);
    expect((questionSchema.parse(fill({ fields: [{ id: "x", label: "X", answer: "a" }] } as never)) as Fill).fields[0].format).toBe("text");
  });
});
