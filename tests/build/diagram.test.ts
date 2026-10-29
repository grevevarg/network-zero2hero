import { describe, expect, it } from "vitest";
import { diagramToSvg, escapeXml } from "../../src/build/diagram.ts";

describe("diagramToSvg", () => {
  it("escapes XML", () => {
    expect(escapeXml(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("draws every node shape, edges, labels and accessible text", () => {
    const svg = diagramToSvg({
      width: 100,
      height: 50,
      alt: "Två <enheter>",
      nodes: [
        { id: "a", x: 10, y: 10, shape: "device", label: "PC" },
        { id: "b", x: 50, y: 10, shape: "box" },
        { id: "c", x: 90, y: 10, shape: "junction" },
      ],
      edges: [["a", "b"], ["b", "c"]],
    });
    expect(svg).toContain('viewBox="0 0 100 50"');
    expect(svg).toContain('aria-label="Två &lt;enheter&gt;"');
    expect(svg.match(/<line /g)).toHaveLength(2);
    expect(svg).toContain('class="dg-node"');
    expect(svg).toContain("dg-box");
    expect(svg).toContain("dg-junction");
    expect(svg).toContain(">PC</text>");
  });

  it("rejects edges to missing nodes", () => {
    expect(() =>
      diagramToSvg({ width: 1, height: 1, alt: "x", nodes: [{ id: "a", x: 0, y: 0, shape: "device" }], edges: [["a", "z"]] }),
    ).toThrow(/missing node/);
  });
});
