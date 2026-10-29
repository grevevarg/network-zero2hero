import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { hashString, mulberry32, rngFromSeed } from "../../src/lib/prng.ts";

describe("prng", () => {
  it("hashString is a stable unsigned 32-bit value", () => {
    expect(hashString("")).toBe(0x811c9dc5);
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
    fc.assert(fc.property(fc.string(), (s) => Number.isInteger(hashString(s)) && hashString(s) >= 0 && hashString(s) < 2 ** 32));
  });

  it("mulberry32 is deterministic and stays in [0, 1)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 32 - 1 }), (seed) => {
        const a = mulberry32(seed);
        const b = mulberry32(seed);
        for (let i = 0; i < 20; i++) {
          const x = a();
          expect(x).toBe(b());
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThan(1);
        }
      }),
    );
  });

  it("rngFromSeed gives the same stream for the same string", () => {
    const a = rngFromSeed("q1:0");
    const b = rngFromSeed("q1:0");
    const c = rngFromSeed("q1:1");
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect([c(), c(), c()]).not.toEqual(first);
  });
});
