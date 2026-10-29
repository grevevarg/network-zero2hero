import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  bus,
  circlePoints,
  clientServer,
  compareModels,
  encapsulation,
  rackCell,
  rackGrid,
  fullMesh,
  pair,
  parts,
  ring,
  stack,
  star,
  tree,
  type Block,
  type Layout,
} from "../../scripts/lib/layouts.ts";

function degrees(d: Layout): Map<string, number> {
  const deg = new Map(d.nodes.map((n) => [n.id, 0]));
  for (const [a, b] of d.edges) {
    deg.set(a, (deg.get(a) ?? 0) + 1);
    deg.set(b, (deg.get(b) ?? 0) + 1);
  }
  return deg;
}

const devicesOf = (d: Layout) => d.nodes.filter((n) => n.shape === "device");
const valid = (d: Layout) => {
  const ids = new Set(d.nodes.map((n) => n.id));
  return ids.size === d.nodes.length && d.edges.every(([a, b]) => ids.has(a) && ids.has(b));
};
const n = fc.integer({ min: 3, max: 8 });

describe("shapes", () => {
  it("circlePoints starts at the top and keeps the radius", () => {
    fc.assert(
      fc.property(n, (k) => {
        const pts = circlePoints(k, 50);
        expect(pts).toHaveLength(k);
        expect(pts[0]).toEqual({ x: 100, y: 30 });
        for (const p of pts) expect(Math.hypot(p.x - 100, p.y - 80)).toBeCloseTo(50, 0);
      }),
    );
  });

  it("star: every device has exactly one link, to the hub", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = star(k);
        expect(valid(d)).toBe(true);
        expect(devicesOf(d)).toHaveLength(k);
        expect(d.edges.every(([a]) => a === "hub")).toBe(true);
        expect(degrees(d).get("hub")).toBe(k);
      }),
    );
  });

  it("ring: every device has exactly two neighbours", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = ring(k);
        expect(valid(d)).toBe(true);
        expect([...degrees(d).values()].every((v) => v === 2)).toBe(true);
      }),
    );
  });

  it("full mesh: n(n-1)/2 links, every device linked to all others", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = fullMesh(k);
        expect(d.edges).toHaveLength((k * (k - 1)) / 2);
        expect([...degrees(d).values()].every((v) => v === k - 1)).toBe(true);
      }),
    );
  });

  it("bus: devices have one link each, all hanging off one backbone", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = bus(k);
        expect(valid(d)).toBe(true);
        const deg = degrees(d);
        expect(devicesOf(d)).toHaveLength(k);
        for (const dev of devicesOf(d)) expect(deg.get(dev.id)).toBe(1);
        // A tree with k devices, k junctions and two ends has 2k + 1 edges.
        expect(d.edges).toHaveLength(2 * k + 1);
      }),
    );
  });

  it("tree: root links to branches, branches link to leaves", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), fc.integer({ min: 1, max: 4 }), (b, l) => {
        const d = tree(b, l);
        expect(valid(d)).toBe(true);
        expect(degrees(d).get("root")).toBe(b);
        expect(devicesOf(d)).toHaveLength(b * l);
        expect(d.edges).toHaveLength(b + b * l);
      }),
    );
  });

  it("pair is two devices and one cable", () => {
    const d = pair();
    expect(valid(d)).toBe(true);
    expect(devicesOf(d)).toHaveLength(2);
    expect(d.edges).toEqual([["d1", "d2"]]);
  });

  it("clientServer is a question one way and an answer back, no cable", () => {
    const d = clientServer("Fråga", "Svar");
    expect(d.nodes.map((n) => n.shape)).toEqual(["device", "server"]);
    expect(d.edges).toEqual([]);
    expect(d.messages).toEqual([
      { from: "client", to: "server", label: "Fråga", side: "above" },
      { from: "server", to: "client", label: "Svar", side: "below" },
    ]);
  });
});

describe("block diagrams", () => {
  const overlaps = (a: Block, b: Block) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const noOverlaps = (blocks: readonly Block[]) =>
    blocks.every((a, i) => blocks.slice(i + 1).every((b) => !overlaps(a, b)));

  it("stack: one box per label, top first, touching and never overlapping", () => {
    fc.assert(
      fc.property(fc.array(fc.string({ minLength: 1, maxLength: 12 }), { minLength: 1, maxLength: 9 }), (labels) => {
        const d = stack(labels);
        expect(d.blocks?.map((b) => b.label)).toEqual(labels);
        expect(noOverlaps(d.blocks ?? [])).toBe(true);
        d.blocks?.forEach((b, i) => i > 0 && expect(b.y).toBe(d.blocks![i - 1].y + d.blocks![i - 1].h));
        expect(d.height).toBe((d.blocks ?? []).reduce((h, b) => h + b.h, 0));
      }),
    );
    expect(stack(["a", "b"], 50, ["#111111", "#222222"]).blocks?.map((b) => b.fill)).toEqual(["#111111", "#222222"]);
    expect(stack(["a"]).blocks?.[0].fill).toBeUndefined();
  });

  it("encapsulation: each row adds the next header in front, layer 2 also adds a trailer", () => {
    const d = encapsulation(["A", "B", "C", "D", "E"], "0101");
    const blocks = d.blocks ?? [];
    expect(noOverlaps(blocks)).toBe(true);
    const rows = [...new Set(blocks.map((b) => b.y))].map((y) => blocks.filter((b) => b.y === y).sort((a, b) => a.x - b.x));
    expect(rows.map((r) => r.map((b) => b.label))).toEqual([
      ["Data"],
      ["4", "Data"],
      ["3", "4", "Data"],
      ["2", "3", "4", "Data", "2"],
    ]);
    // The data block stays in the same place on every row, and only headers and trailers are shaded.
    expect(new Set(rows.map((r) => r.find((b) => b.label === "Data")?.x)).size).toBe(1);
    expect(blocks.filter((b) => b.shaded).every((b) => b.label !== "Data")).toBe(true);
    // Names on the right of each row, bits under the last row, all below or beside the blocks.
    expect(d.labels?.map((l) => l.text)).toEqual(["A", "B", "C", "D", "E", "0101"]);
    const right = Math.max(...blocks.map((b) => b.x + b.w));
    expect(d.labels?.slice(0, 5).every((l) => l.x > right)).toBe(true);
    expect(d.labels?.at(-1)!.y).toBeGreaterThan(Math.max(...blocks.map((b) => b.y)));
  });

  it("compareModels: the right model spans the left one row for row", () => {
    const d = compareModels(["L", "R"], ["a", "b", "c", "d"], [{ label: "x", span: 3 }, { label: "y", span: 1 }]);
    const blocks = d.blocks ?? [];
    expect(noOverlaps(blocks)).toBe(true);
    const [a, , c, dd, x, y] = blocks;
    expect(x).toMatchObject({ label: "x", y: a.y, h: c.y + c.h - a.y });
    expect(y).toMatchObject({ label: "y", y: dd.y, h: dd.h });
    expect(d.labels?.map((l) => l.text)).toEqual(["L", "R"]);
    expect(() => compareModels(["L", "R"], ["a", "b"], [{ label: "x", span: 3 }])).toThrow(/spans 3 layers/);
  });
});

describe("rack grid", () => {
  it("rackCell numbers rows of ten: 01-10, 11-20 ... 91-100", () => {
    expect([rackCell(1, 1), rackCell(1, 10), rackCell(2, 1), rackCell(6, 1), rackCell(10, 10)]).toEqual([1, 10, 11, 51, 100]);
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), fc.integer({ min: 1, max: 10 }), (row, col) => {
        const n = rackCell(row, col);
        expect(Math.floor((n - 1) / 10) + 1).toBe(row);
        expect(((n - 1) % 10) + 1).toBe(col);
      }),
    );
  });

  it("draws every uncovered cell once, equipment on top, numbers only where asked and visible", () => {
    const d = rackGrid([{ row: 3, col: 1, rows: 1, cols: 10, label: "Panel" }, { row: 5, col: 6, rows: 2, cols: 5, label: "Switch" }], [1, 21, 51, 56]);
    const blocks = d.blocks ?? [];
    const cells = blocks.filter((b) => !b.shaded);
    expect(cells).toHaveLength(100 - 10 - 10);
    expect(blocks.filter((b) => b.shaded).map((b) => b.label)).toEqual(["Panel", "Switch"]);
    expect(cells.filter((b) => b.label !== "").map((b) => b.label)).toEqual(["01", "51"]);
    const sw = blocks.find((b) => b.label === "Switch")!;
    expect(sw).toMatchObject({ x: 5 * 18, y: 4 * 18, w: 5 * 18, h: 2 * 18 });
    expect(() => rackGrid([{ row: 10, col: 1, rows: 2, cols: 1, label: "Big" }], [])).toThrow(/does not fit/);
    expect(() => rackGrid([{ row: 1, col: 0, rows: 1, cols: 1, label: "Off" }], [])).toThrow(/does not fit/);
  });
});

describe("parts", () => {
  it("puts boxes side by side, each wide enough for its text or caption, captions under their box", () => {
    const d = parts([{ text: "00:1A:2B", caption: "Tillverkare", shaded: true }, { text: "3C" }]);
    const [a, b] = d.blocks ?? [];
    expect(a).toMatchObject({ x: 0, label: "00:1A:2B", shaded: true });
    expect(b.x).toBe(a.x + a.w);
    expect(a.w).toBeGreaterThan(b.w);
    expect(d.width).toBe(b.x + b.w);
    expect(d.labels).toEqual([{ x: a.w / 2, y: a.h + 4, text: "Tillverkare" }]);
    expect(parts([{ text: "x" }]).labels).toEqual([]);
    const eq = parts([{ text: "x" }, { text: "longer" }], 10, true).blocks ?? [];
    expect(eq[0].w).toBe(eq[1].w);
  });
});

