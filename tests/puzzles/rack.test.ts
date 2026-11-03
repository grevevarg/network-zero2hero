import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { RACK_CELLS, RACK_SIDE, rackCell, rackLabel, rackMove, rackPosition } from "../../src/puzzles/rack.ts";

const cell = fc.integer({ min: 1, max: RACK_CELLS });
const side = fc.integer({ min: 1, max: RACK_SIDE });

describe("rack numbering", () => {
  it("numbers rows of ten from the top left, as the text describes", () => {
    expect(rackCell(1, 1)).toBe(1);
    expect(rackCell(1, 10)).toBe(10);
    expect(rackCell(2, 1)).toBe(11);
    expect(rackCell(4, 10)).toBe(40);
    expect(rackCell(8, 3)).toBe(73);
    expect(rackCell(10, 10)).toBe(100);
  });

  it("cell number and position are inverses over the whole grid", () => {
    fc.assert(
      fc.property(cell, (n) => {
        const { row, col } = rackPosition(n);
        expect(rackCell(row, col)).toBe(n);
      }),
    );
    fc.assert(
      fc.property(side, side, (row, col) => {
        const n = rackCell(row, col);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(RACK_CELLS);
        expect(rackPosition(n)).toEqual({ row, col });
      }),
    );
  });

  it("writes cell numbers with two digits", () => {
    expect(rackLabel(1)).toBe("01");
    expect(rackLabel(40)).toBe("40");
    expect(rackLabel(100)).toBe("100");
  });
});

describe("rackMove", () => {
  const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];

  it("never leaves the grid and moves at most one step per arrow", () => {
    fc.assert(
      fc.property(cell, fc.constantFrom(...arrows), (n, k) => {
        const next = rackMove(n, k) as number;
        expect(next).toBeGreaterThanOrEqual(1);
        expect(next).toBeLessThanOrEqual(RACK_CELLS);
        const [a, b] = [rackPosition(n), rackPosition(next)];
        if (k.startsWith("Arrow")) expect(Math.abs(a.row - b.row) + Math.abs(a.col - b.col)).toBeLessThanOrEqual(1);
        else expect(b.row).toBe(a.row);
      }),
    );
  });

  it("opposite arrows undo each other away from the edges", () => {
    const inner = fc.integer({ min: 2, max: RACK_SIDE - 1 });
    fc.assert(
      fc.property(inner, inner, (row, col) => {
        const n = rackCell(row, col);
        expect(rackMove(rackMove(n, "ArrowRight") as number, "ArrowLeft")).toBe(n);
        expect(rackMove(rackMove(n, "ArrowDown") as number, "ArrowUp")).toBe(n);
        expect(rackMove(n, "ArrowDown")).toBe(n + RACK_SIDE);
      }),
    );
  });

  it("stops at the edges, jumps to the row's ends, and ignores other keys", () => {
    expect(rackMove(1, "ArrowLeft")).toBe(1);
    expect(rackMove(1, "ArrowUp")).toBe(1);
    expect(rackMove(10, "ArrowRight")).toBe(10);
    expect(rackMove(100, "ArrowDown")).toBe(100);
    expect(rackMove(45, "Home")).toBe(41);
    expect(rackMove(45, "End")).toBe(50);
    expect(rackMove(45, "Enter")).toBeUndefined();
  });
});
