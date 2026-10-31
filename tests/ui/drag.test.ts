import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { connect, disconnect, dropIndex, edgePoint, hitTest, isDrag, moveTo, type Rect } from "../../src/ui/drag.ts";

const list = fc.array(fc.integer(), { minLength: 1, maxLength: 10 });
const withIndices = list.chain((xs) => fc.tuple(fc.constant(xs), fc.nat(xs.length - 1), fc.nat(xs.length - 1)));

/** Rows stacked top to bottom, like the items of a list, with random heights and gaps. */
const stacked = fc.array(fc.tuple(fc.integer({ min: 1, max: 80 }), fc.integer({ min: 0, max: 20 })), { minLength: 1, maxLength: 8 }).map((sizes) => {
  let top = 0;
  return sizes.map(([h, gap]): Rect => {
    const r = { left: 0, right: 100, top, bottom: top + h };
    top += h + gap;
    return r;
  });
});

const sorted = <T,>(xs: readonly T[]) => xs.slice().sort();

describe("moveTo", () => {
  it("keeps every item, puts the moved one at `to` and leaves the input alone", () => {
    fc.assert(
      fc.property(withIndices, ([xs, from, to]) => {
        const copy = xs.slice();
        const out = moveTo(xs, from, to);
        expect(xs).toEqual(copy);
        expect(sorted(out)).toEqual(sorted(xs));
        expect(out[to]).toBe(xs[from]);
      }),
    );
  });

  it("is undone by moving back", () => {
    fc.assert(
      fc.property(withIndices, ([xs, from, to]) => {
        expect(moveTo(moveTo(xs, from, to), to, from)).toEqual(xs);
      }),
    );
  });

  it("agrees with a swap for neighbours", () => {
    expect(moveTo(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    expect(moveTo(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });
});

describe("dropIndex", () => {
  it("stays in range and never decreases as the pointer goes down", () => {
    fc.assert(
      fc.property(stacked, fc.nat(), fc.integer({ min: -50, max: 800 }), fc.integer({ min: 0, max: 100 }), (rects, f, y, dy) => {
        const from = f % rects.length;
        const a = dropIndex(y, rects, from);
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(rects.length - 1);
        expect(dropIndex(y + dy, rects, from)).toBeGreaterThanOrEqual(a);
      }),
    );
  });

  it("goes first above everything, last below everything, and stays put over its own row", () => {
    fc.assert(
      fc.property(stacked, fc.nat(), (rects, f) => {
        const from = f % rects.length;
        expect(dropIndex(-1000, rects, from)).toBe(0);
        expect(dropIndex(10_000, rects, from)).toBe(rects.length - 1);
        const own = rects[from];
        expect(dropIndex((own.top + own.bottom) / 2, rects, from)).toBe(from);
      }),
    );
  });
});

describe("hitTest", () => {
  it("finds the row a point is in, or -1 between and outside rows", () => {
    const rows: Rect[] = [
      { left: 0, right: 10, top: 0, bottom: 10 },
      { left: 0, right: 10, top: 20, bottom: 30 },
    ];
    expect(hitTest({ x: 5, y: 25 }, rows)).toBe(1);
    expect(hitTest({ x: 5, y: 15 }, rows)).toBe(-1);
    expect(hitTest({ x: 11, y: 5 }, rows)).toBe(-1);
  });

  it("agrees with dropping a point inside each row", () => {
    fc.assert(
      fc.property(stacked, fc.nat(), (rects, f) => {
        const i = f % rects.length;
        const r = rects[i];
        expect(hitTest({ x: 50, y: (r.top + r.bottom) / 2 }, rects)).toBe(i);
      }),
    );
  });
});

describe("edgePoint and isDrag", () => {
  it("gives the middle of an edge relative to the origin", () => {
    const origin = { left: 10, top: 20, right: 0, bottom: 0 };
    const r = { left: 30, right: 70, top: 40, bottom: 60 };
    expect(edgePoint(r, origin, "left")).toEqual({ x: 20, y: 30 });
    expect(edgePoint(r, origin, "right")).toEqual({ x: 60, y: 30 });
  });

  it("only counts movement past the threshold as a drag", () => {
    expect(isDrag(0, 0)).toBe(false);
    expect(isDrag(3, 3)).toBe(false);
    expect(isDrag(0, -6)).toBe(true);
  });
});

describe("connect and disconnect", () => {
  const ids = fc.constantFrom("a", "b", "c", "d");
  const ops = fc.array(fc.tuple(ids, ids), { maxLength: 20 });
  const build = (steps: [string, string][]) => steps.reduce<Record<string, string>>((links, [l, r]) => connect(links, l, r), {});

  it("keeps every item on at most one line", () => {
    fc.assert(
      fc.property(ops, (steps) => {
        const links = build(steps);
        expect(new Set(Object.values(links)).size).toBe(Object.keys(links).length);
      }),
    );
  });

  it("joins the pair, and joining it again removes it", () => {
    fc.assert(
      fc.property(ops, ids, ids, (steps, l, r) => {
        const once = connect(disconnect(build(steps), "left", l), l, r);
        expect(once[l]).toBe(r);
        const twice = connect(once, l, r);
        expect(twice[l]).toBeUndefined();
        expect(Object.values(twice)).not.toContain(r);
      }),
    );
  });

  it("removes the line at either end and nothing else", () => {
    const links = { a: "x", b: "y" };
    expect(disconnect(links, "left", "a")).toEqual({ b: "y" });
    expect(disconnect(links, "right", "y")).toEqual({ a: "x" });
    expect(disconnect(links, "left", "z")).toEqual(links);
  });
});
