import { describe, expect, it } from "vitest";
import { htmlToText } from "../../src/lib/text.ts";
import { orderingAnswer, pairAnswer, slotAnswer } from "../../src/lib/answers.ts";

describe("htmlToText", () => {
  it("strips tags and decodes the entities marked produces", () => {
    expect(htmlToText("<strong>A &amp; B</strong> &lt;3 &quot;x&quot; &#39;y&#39; &gt;")).toBe(`A & B <3 "x" 'y' >`);
  });
});

describe("answers", () => {
  it("serialises ordering and matching answers canonically", () => {
    expect(orderingAnswer(["b", "a"])).toBe("b,a");
    expect(pairAnswer("l1", "r2")).toBe("l1=r2");
    expect(slotAnswer(3, "x1")).toBe("3=x1");
  });
});
