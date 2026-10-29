import { describe, expect, it } from "vitest";
import { renderInline, renderMarkdown, splitBlocks, toPlainText } from "../../src/build/markdown.ts";

describe("splitBlocks", () => {
  it("splits on markers and reads uses and kind", () => {
    const blocks = splitBlocks("\n<!-- uses: a, b -->\nEtt\n\n<!-- uses: c; kind: example -->\r\nTvå\n");
    expect(blocks).toEqual([
      { kind: "text", uses: ["a", "b"], markdown: "Ett" },
      { kind: "example", uses: ["c"], markdown: "Två" },
    ]);
  });

  it("rejects text before the first marker and unknown kinds", () => {
    expect(() => splitBlocks("hej\n<!-- uses: a -->")).toThrow(/before the first/);
    expect(() => splitBlocks("<!-- uses: a; kind: poem -->\nx")).toThrow(/unknown block kind/);
  });
});

describe("renderMarkdown", () => {
  it("renders Markdown and swaps diagram lines for SVG", () => {
    const html = renderMarkdown("## Rubrik\n\n**fet**\n\n@diagram(d1)", { d1: "<svg></svg>" });
    expect(html).toContain("<h2>Rubrik</h2>");
    expect(html).toContain("<strong>fet</strong>");
    expect(html).toContain("<figure><svg></svg></figure>");
  });

  it("throws on an unknown diagram", () => {
    expect(() => renderMarkdown("@diagram(nope)")).toThrow(/unknown diagram/);
  });

  it("renderInline does not wrap in a paragraph", () => {
    expect(renderInline("a *b*")).toBe("a <em>b</em>");
  });
});

describe("toPlainText", () => {
  it("removes markup, diagrams and link targets", () => {
    expect(toPlainText("## Rubrik\n\n@diagram(x)\n\n**fet** `kod` [länk](http://x) <b>t</b>")).toBe("Rubrik fet kod länk t");
  });
});
