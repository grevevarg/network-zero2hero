import { describe, expect, it } from "vitest";
import { questionSchema, type Matching, type Mcq, type Ordering } from "../../src/build/schema.ts";
import {
  isMatchingSolved,
  isMcqSolved,
  isOrderingSolved,
  matchingRightOptions,
} from "../../src/puzzles/validators.ts";
import { matching, mcq, ordering } from "../fixtures/content.ts";

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
