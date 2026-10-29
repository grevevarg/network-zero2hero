import fc from "fast-check";
import { beforeAll, describe, expect, it } from "vitest";
import type { ClientCourse } from "../../src/types.ts";
import { clampCard, sectionCards, splitTitle } from "../../src/ui/cards.ts";
import { navDirection } from "../../src/ui/keys.ts";
import { fixtureCourse } from "./helpers.ts";

let course: ClientCourse;
beforeAll(async () => {
  course = await fixtureCourse();
});

describe("splitTitle", () => {
  it("takes the leading h2 as title and keeps the rest", () => {
    expect(splitTitle('<h2 id="x">A &amp; <em>B</em></h2>\n<p>Text</p>')).toEqual({ title: "A & B", bodyHtml: "<p>Text</p>" });
    expect(splitTitle("<p>Ingen rubrik</p>")).toEqual({ title: "", bodyHtml: "<p>Ingen rubrik</p>" });
  });
});

describe("sectionCards", () => {
  it("orders text, concepts, questions and a finish card", () => {
    const cards = sectionCards(course.sections[0]);
    expect(cards.map((c) => c.kind)).toEqual(["text", "concepts", "question", "question", "question", "finish"]);
    expect(cards[0].title).toBe("Rubrik");
    expect(cards[3].title).toBe("Fråga 2 av 3");
  });

  it("skips the concepts card when a section introduces nothing", () => {
    const cards = sectionCards({ ...course.sections[1], newConcepts: [] });
    expect(cards.map((c) => c.kind)).toEqual(["text", "question", "finish"]);
  });
});

describe("clampCard", () => {
  it("always lands inside the deck", () => {
    fc.assert(
      fc.property(fc.double(), fc.integer({ min: 0, max: 50 }), (n, count) => {
        const c = clampCard(n, count);
        expect(Number.isInteger(c)).toBe(true);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(Math.max(1, count));
      }),
    );
    expect(clampCard(3, 10)).toBe(3);
    expect(clampCard(Number.NaN, 10)).toBe(1);
  });
});

describe("navDirection", () => {
  const key = (k: string, target: EventTarget | null = document.body, mods = {}) =>
    navDirection({ key: k, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, target, ...mods });

  it("maps left and right arrows", () => {
    expect(key("ArrowRight")).toBe(1);
    expect(key("ArrowLeft")).toBe(-1);
    expect(key("ArrowUp")).toBe(0);
    expect(key("ArrowRight", null)).toBe(1);
  });

  it("leaves arrows to form fields, editable text and modified keys", () => {
    for (const tag of ["input", "select", "textarea"]) expect(key("ArrowRight", document.createElement(tag))).toBe(0);
    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    expect(key("ArrowRight", editable)).toBe(0);
    expect(key("ArrowRight", document.body, { altKey: true })).toBe(0);
    expect(key("ArrowLeft", document.body, { shiftKey: true })).toBe(0);
  });
});
