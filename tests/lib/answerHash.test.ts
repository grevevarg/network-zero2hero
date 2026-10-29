import { describe, expect, it } from "vitest";
import { answerKey, matchesKey, sha256Hex } from "../../src/lib/answerHash.ts";

describe("answerHash", () => {
  it("sha256Hex matches a known test vector", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("answerKey depends on both question and answer", async () => {
    const k = await answerKey("q1", "a");
    expect(k).toMatch(/^[0-9a-f]{64}$/);
    expect(await answerKey("q1", "a")).toBe(k);
    expect(await answerKey("q2", "a")).not.toBe(k);
    expect(await answerKey("q1", "b")).not.toBe(k);
  });

  it("matchesKey accepts only the right answer", async () => {
    const key = await answerKey("q1", "right");
    expect(await matchesKey("q1", "right", key)).toBe(true);
    expect(await matchesKey("q1", "wrong", key)).toBe(false);
  });
});
