import { describe, expect, it } from "vitest";
import { buildCourse, opaqueId, parseContent } from "../../src/build/course.ts";
import { matchesKey } from "../../src/lib/answerHash.ts";
import { matchingAnswer, orderingAnswer } from "../../src/lib/answers.ts";
import type { ClientMatching, ClientMcq, ClientOrdering } from "../../src/types.ts";
import { matching, mcq, rawContent, sectionInput, TEXT } from "../fixtures/content.ts";

describe("parseContent", () => {
  it("validates and splits blocks", () => {
    const c = parseContent(rawContent());
    expect(c.sections).toHaveLength(2);
    expect(c.sections[0].blocks[0].uses).toEqual(["a"]);
    expect(c.sections[0].questions[2].kind).toBe("matching");
  });

  it("names the section on schema errors", () => {
    const raw = rawContent();
    raw.sections[0].section = sectionInput({ title: "" });
    expect(() => parseContent(raw)).toThrow(/section s1/);
  });
});

describe("opaqueId", () => {
  it("is deterministic and hides the authored id", () => {
    expect(opaqueId("q", "correct")).toBe(opaqueId("q", "correct"));
    expect(opaqueId("q", "correct")).not.toContain("correct");
    expect(opaqueId("q", "a")).not.toBe(opaqueId("q2", "a"));
  });
});

describe("buildCourse", () => {
  it("ships keys that accept exactly the authored answers", async () => {
    const course = await buildCourse(parseContent(rawContent()));
    const [m, o, x] = course.sections[0].questions as [ClientMcq, ClientOrdering, ClientMatching];

    expect(await matchesKey(m.id, opaqueId(m.id, "two"), m.key)).toBe(true);
    expect(await matchesKey(m.id, opaqueId(m.id, "one"), m.key)).toBe(false);

    const order = ["first", "second", "third"].map((i) => opaqueId(o.id, i));
    expect(await matchesKey(o.id, orderingAnswer(order), o.key)).toBe(true);
    expect(await matchesKey(o.id, orderingAnswer(order.slice().reverse()), o.key)).toBe(false);

    const left = x.left.map((l) => l.id);
    const right = { [opaqueId(x.id, "l1")]: opaqueId(x.id, "r1"), [opaqueId(x.id, "l2")]: opaqueId(x.id, "r2") };
    expect(await matchesKey(x.id, matchingAnswer(left, right), x.key)).toBe(true);
    expect(x.right).toHaveLength(3);
    expect(x.left.find((l) => l.diagramSvg)?.html).toBe("");
  });

  it("does not ship authored ids or authoring order", async () => {
    const course = await buildCourse(parseContent(rawContent()));
    const json = JSON.stringify(course);
    for (const id of ["\"two\"", "\"first\"", "\"r1\"", "correct"]) expect(json).not.toContain(id);
    const o = course.sections[0].questions[1] as ClientOrdering;
    const ids = o.items.map((i) => i.id);
    expect(ids).toEqual(ids.slice().sort());
  });

  it("renders blocks, diagrams, new concepts and optional explanations", async () => {
    const raw = rawContent();
    raw.sections[0].section.questions = [mcq(), matching({ explanation: undefined })];
    const course = await buildCourse(parseContent(raw));
    const s = course.sections[0];
    expect(s.blocks[0].html).toContain("<svg");
    expect(s.newConcepts).toEqual([{ term: "A", html: "Förklaring av a." }]);
    expect((s.questions[1] as ClientMatching).explanationHtml).toBeUndefined();
    expect(course.sections[1].blocks[0].kind).toBe("recap");
  });

  it("orders ordering explanations as optional too", async () => {
    const raw = rawContent();
    const q = raw.sections[0].section.questions[1];
    raw.sections[0].section.questions[1] = { ...q, explanation: undefined } as typeof q;
    const course = await buildCourse(parseContent(raw));
    expect((course.sections[0].questions[1] as ClientOrdering).explanationHtml).toBeUndefined();
  });

  it("fails on unknown diagrams and concepts", async () => {
    const badDiagram = rawContent();
    badDiagram.sections[0].section.questions = [mcq({ diagram: "nope" } as never)];
    await expect(buildCourse(parseContent(badDiagram))).rejects.toThrow(/unknown diagram/);

    const badConcept = rawContent();
    badConcept.sections[0].section.meta.introduces = ["ghost"];
    await expect(buildCourse(parseContent(badConcept))).rejects.toThrow(/unknown concept/);
  });

  it("shows an mcq diagram when one is given", async () => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [mcq({ diagram: "dia" } as never)]), text: TEXT };
    const course = await buildCourse(parseContent(raw));
    expect((course.sections[0].questions[0] as ClientMcq).diagramSvg).toContain("<svg");
  });
});
