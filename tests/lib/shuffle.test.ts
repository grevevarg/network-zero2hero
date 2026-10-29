import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { mulberry32 } from "../../src/lib/prng.ts";
import { shuffle, shuffleAwayFrom } from "../../src/lib/shuffle.ts";

const sorted = (xs: readonly number[]) => xs.slice().sort((a, b) => a - b);

describe("shuffle", () => {
  it("preserves the multiset and leaves the input untouched", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.integer(), (xs, seed) => {
        const copy = xs.slice();
        const out = shuffle(xs, mulberry32(seed));
        expect(xs).toEqual(copy);
        expect(sorted(out)).toEqual(sorted(xs));
      }),
    );
  });

  it("is deterministic for a seed", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.integer(), (xs, seed) => {
        expect(shuffle(xs, mulberry32(seed))).toEqual(shuffle(xs, mulberry32(seed)));
      }),
    );
  });
});

describe("shuffleAwayFrom", () => {
  it("never returns the original order for two or more distinct items", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer(), { minLength: 2, maxLength: 8 }), fc.integer(), (xs, seed) => {
        const out = shuffleAwayFrom(xs, mulberry32(seed));
        expect(sorted(out)).toEqual(sorted(xs));
        expect(out).not.toEqual(xs);
      }),
    );
  });

  it("returns a copy for zero or one item", () => {
    const one = [7];
    const out = shuffleAwayFrom(one, mulberry32(1));
    expect(out).toEqual([7]);
    expect(out).not.toBe(one);
    expect(shuffleAwayFrom([], mulberry32(1))).toEqual([]);
  });
});
