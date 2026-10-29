import { describe, expect, it } from "vitest";
import { diagramHtml, escapeAttr } from "../../src/build/diagram.ts";

describe("diagramHtml", () => {
  const images = { "s/a": { image: "img/abc.svg", width: 120, height: 80 } };

  it("escapes attribute text", () => {
    expect(escapeAttr(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("renders a sized image with escaped alt text", () => {
    expect(diagramHtml({ scene: "s/a", alt: 'Två "enheter"' }, images)).toBe(
      '<img class="diagram" src="img/abc.svg" width="120" height="80" alt="Två &quot;enheter&quot;">',
    );
  });

  it("fails for scenes that were never exported", () => {
    expect(() => diagramHtml({ scene: "s/b", alt: "x" }, images)).toThrow(/npm run diagrams/);
  });
});
