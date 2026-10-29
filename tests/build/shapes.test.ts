import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { diagramSchema } from "../../src/build/schema.ts";
import { bus, circlePoints, fullMesh, ring, star, tree } from "../../src/build/shapes.ts";
import type { DiagramInput } from "../../src/build/schema.ts";

function degrees(d: DiagramInput): Map<string, number> {
  const deg = new Map(d.nodes.map((n) => [n.id, 0]));
  for (const [a, b] of d.edges) {
    deg.set(a, (deg.get(a) ?? 0) + 1);
    deg.set(b, (deg.get(b) ?? 0) + 1);
  }
  return deg;
}

const devicesOf = (d: DiagramInput) => d.nodes.filter((n) => (n.shape ?? "device") === "device");
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
        const d = star(k, "x");
        expect(diagramSchema.safeParse(d).success).toBe(true);
        expect(devicesOf(d)).toHaveLength(k);
        expect(d.edges.every(([a]) => a === "hub")).toBe(true);
        expect(degrees(d).get("hub")).toBe(k);
      }),
    );
  });

  it("ring: every device has exactly two neighbours", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = ring(k, "x");
        expect(diagramSchema.safeParse(d).success).toBe(true);
        expect([...degrees(d).values()].every((v) => v === 2)).toBe(true);
      }),
    );
  });

  it("full mesh: n(n-1)/2 links, every device linked to all others", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = fullMesh(k, "x");
        expect(d.edges).toHaveLength((k * (k - 1)) / 2);
        expect([...degrees(d).values()].every((v) => v === k - 1)).toBe(true);
      }),
    );
  });

  it("bus: devices have one link each, all hanging off one backbone", () => {
    fc.assert(
      fc.property(n, (k) => {
        const d = bus(k, "x");
        expect(diagramSchema.safeParse(d).success).toBe(true);
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
        const d = tree(b, l, "x");
        expect(diagramSchema.safeParse(d).success).toBe(true);
        expect(degrees(d).get("root")).toBe(b);
        expect(devicesOf(d)).toHaveLength(b * l);
        expect(d.edges).toHaveLength(b + b * l);
      }),
    );
  });
});
