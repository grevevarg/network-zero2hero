import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { bus, clientServer, compareModels, encapsulation, fullMesh, pair, ring, stack, star, tree } from "../../scripts/lib/layouts.ts";
import {
  arrowElement,
  blockElements,
  bounds,
  buildScene,
  exitPoint,
  findItem,
  FONT_SIZE,
  labelElement,
  lineElement,
  messageElements,
  placeItem,
  rectElement,
  textElement,
  textWidth,
  type ExElement,
  type Library,
} from "../../scripts/lib/scene.ts";

const el = (over: Partial<ExElement>): ExElement => ({ id: "e", type: "rectangle", x: 0, y: 0, width: 10, height: 10, ...over });

const library: Library = {
  libraryItems: [
    {
      id: "pc",
      name: "PC",
      elements: [
        el({ id: "body", x: 100, y: 100, width: 40, height: 30, groupIds: ["inner"], boundElements: [{ id: "label", type: "text" }] }),
        el({ id: "label", type: "text", x: 105, y: 105, width: 20, height: 10, containerId: "body" }),
        el({ id: "stand", type: "line", x: 120, y: 130, width: 0, height: 10, points: [[0, 0], [0, 10]] }),
      ],
    },
    { id: "sw", name: "Hub", elements: [el({ id: "box", x: -5, y: -5, width: 50, height: 20 })] },
    { id: "srv", name: "Rack", elements: [el({ id: "rack", x: 0, y: 0, width: 30, height: 60 })] },
  ],
};
const roles = { device: "PC", box: "Hub", server: "Rack" };

describe("bounds", () => {
  it("uses points for lines and width/height for shapes", () => {
    expect(bounds([el({ x: 0, y: 0, width: 10, height: 5 }), el({ type: "line", x: 20, y: 20, points: [[0, 0], [-30, 5]] })])).toEqual({
      minX: -10,
      minY: 0,
      maxX: 20,
      maxY: 25,
    });
  });
});

describe("placeItem", () => {
  it("centres the item, renames ids and groups, and keeps references consistent", () => {
    const placed = placeItem(findItem(library, "PC"), 0, 0, "n1");
    const b = bounds(placed);
    expect((b.minX + b.maxX) / 2).toBeCloseTo(0);
    expect((b.minY + b.maxY) / 2).toBeCloseTo(0);
    expect(placed.map((e) => e.id)).toEqual(["n1-body", "n1-label", "n1-stand"]);
    expect(placed[0].groupIds).toEqual(["n1-inner", "n1"]);
    expect(placed[0].boundElements).toEqual([{ id: "n1-label", type: "text" }]);
    expect(placed[1].containerId).toBe("n1-body");
    expect(placed[2].containerId).toBeNull();
    expect(placed[2].boundElements).toBeNull();
  });

  it("is deterministic", () => {
    expect(placeItem(findItem(library, "PC"), 5, 5, "n")).toEqual(placeItem(findItem(library, "PC"), 5, 5, "n"));
  });

  it("findItem names the missing item", () => {
    expect(() => findItem(library, "Router")).toThrow(/no item named "Router"/);
  });
});

describe("exitPoint", () => {
  const box = { minX: -10, minY: -10, maxX: 10, maxY: 10 };

  it("lands on the padded box edge in the target's direction", () => {
    expect(exitPoint(box, 100, 0)).toEqual([16, 0]);
    expect(exitPoint(box, 0, -100)).toEqual([0, -16]);
    expect(exitPoint(box, 0, 0)).toEqual([0, 0]);
    // A target inside the padded box is returned as is.
    expect(exitPoint(box, 3, 4)).toEqual([3, 4]);
  });

  it("never leaves the padded box or overshoots the target", () => {
    fc.assert(
      fc.property(fc.integer({ min: -500, max: 500 }), fc.integer({ min: -500, max: 500 }), (tx, ty) => {
        const [x, y] = exitPoint(box, tx, ty, 6);
        expect(Math.abs(x)).toBeLessThanOrEqual(16 + 1e-9);
        expect(Math.abs(y)).toBeLessThanOrEqual(16 + 1e-9);
        expect(Math.hypot(x, y)).toBeLessThanOrEqual(Math.hypot(tx, ty) + 1e-9);
      }),
    );
  });
});

describe("buildScene", () => {
  it("draws one line per edge before the icons, and one icon group per device or box", () => {
    for (const layout of [star(5), ring(4), bus(3), tree(2, 2), fullMesh(4), pair()]) {
      const scene = buildScene(layout, library, roles);
      const lines = scene.elements.filter((e) => e.id.startsWith("edge-"));
      expect(lines).toHaveLength(layout.edges.length);
      expect(scene.elements.slice(0, lines.length)).toEqual(lines);
      const icons = layout.nodes.filter((n) => n.shape !== "junction");
      const groups = new Set(scene.elements.slice(lines.length).map((e) => e.groupIds?.at(-1)));
      expect(groups.size).toBe(icons.length);
      expect(new Set(scene.elements.map((e) => e.id)).size).toBe(scene.elements.length);
    }
  });

  it("is deterministic and rejects broken layouts", () => {
    expect(JSON.stringify(buildScene(star(3), library, roles))).toBe(JSON.stringify(buildScene(star(3), library, roles)));
    const broken = { ...star(3), edges: [["hub", "ghost"]] as [string, string][] };
    expect(() => buildScene(broken, library, roles)).toThrow(/missing node/);
  });

  it("lineElement spans the two points", () => {
    const l = lineElement("l", 10, 20, 4, 30);
    expect(l).toMatchObject({ x: 10, y: 20, width: 6, height: 10, points: [[0, 0], [-6, 10]] });
  });

  it("draws a labelled arrow per message, after the icons", () => {
    const scene = buildScene(clientServer("Fråga", "Svar"), library, roles);
    const arrows = scene.elements.filter((e) => e.type === "arrow");
    const labels = scene.elements.filter((e) => e.type === "text" && String(e.id).startsWith("message-"));
    expect(arrows).toHaveLength(2);
    expect(labels.map((l) => l.text)).toEqual(["Fråga", "Svar"]);
    expect(scene.elements.at(-1)?.id).toBe("message-1-label");
    const broken = { ...clientServer("a", "b"), messages: [{ from: "client", to: "ghost", label: "x", side: "above" as const }] };
    expect(() => buildScene(broken, library, roles)).toThrow(/missing node/);
  });
});

describe("messages", () => {
  const left = { minX: 0, minY: 0, maxX: 20, maxY: 20 };
  const right = { minX: 100, minY: 0, maxX: 120, maxY: 20 };

  it("runs between the facing edges, above with the label on top or below with it underneath", () => {
    const [above, aboveLabel] = messageElements({ from: "a", to: "b", label: "Hej", side: "above" }, left, right, 0);
    expect(above).toMatchObject({ type: "arrow", x: 30, endArrowhead: "arrow", points: [[0, 0], [60, 0]] });
    expect(above.y).toBeLessThan(10);
    expect(aboveLabel.y + aboveLabel.height).toBeLessThan(above.y);

    const [below, belowLabel] = messageElements({ from: "b", to: "a", label: "Hej", side: "below" }, right, left, 1);
    expect(below).toMatchObject({ x: 90, points: [[0, 0], [-60, 0]] });
    expect(below.y).toBeGreaterThan(10);
    expect(belowLabel.y).toBeGreaterThan(below.y);
  });

  it("centres text and estimates its width", () => {
    expect(textWidth("abcd", 10)).toBe(22);
    const t = textElement("t", "abcd", 100, 5);
    expect(t).toMatchObject({ type: "text", text: "abcd", originalText: "abcd", y: 5, fontSize: FONT_SIZE, containerId: null });
    expect(t.x + t.width / 2).toBeCloseTo(100);
  });

  it("arrowElement is a line with an arrowhead at the end", () => {
    expect(arrowElement("a", 0, 0, 10, 0)).toMatchObject({ type: "arrow", endArrowhead: "arrow", startArrowhead: null, width: 10 });
  });
});

describe("blocks and labels", () => {
  it("rectElement is shaded only when asked", () => {
    expect(rectElement("r", 1, 2, 3, 4, false)).toMatchObject({ type: "rectangle", x: 1, y: 2, width: 3, height: 4, backgroundColor: "transparent" });
    expect(rectElement("r", 1, 2, 3, 4, true).backgroundColor).not.toBe("transparent");
  });

  it("blockElements scales the box and centres its label inside it", () => {
    const [rect, text] = blockElements({ x: 10, y: 20, w: 30, h: 40, label: "Data", shaded: true }, 3, 2);
    expect(rect).toMatchObject({ id: "block-3", x: 20, y: 40, width: 60, height: 80 });
    expect(text).toMatchObject({ id: "block-3-label", text: "Data" });
    expect(text.x + text.width / 2).toBeCloseTo(50);
    expect(text.y + text.height / 2).toBeCloseTo(80);
  });

  it("labelElement scales the anchor", () => {
    const l = labelElement({ x: 10, y: 5, text: "Hej" }, 0, 2);
    expect(l).toMatchObject({ id: "label-0", text: "Hej", y: 10 });
    expect(l.x + l.width / 2).toBeCloseTo(20);
  });

  it("buildScene draws blocks first and free labels last, with unique ids", () => {
    for (const layout of [stack(["a", "b"]), encapsulation(["a", "b", "c", "d", "e"], "01"), compareModels(["L", "R"], ["a", "b"], [{ label: "x", span: 2 }])]) {
      const scene = buildScene(layout, library, roles);
      const blocks = layout.blocks ?? [];
      const labels = layout.labels ?? [];
      expect(scene.elements).toHaveLength(blocks.length * 2 + labels.length);
      expect(scene.elements.slice(0, blocks.length * 2).every((e) => e.id.startsWith("block-"))).toBe(true);
      expect(scene.elements.slice(blocks.length * 2).every((e) => e.id.startsWith("label-"))).toBe(true);
      expect(new Set(scene.elements.map((e) => e.id)).size).toBe(scene.elements.length);
    }
  });
});

