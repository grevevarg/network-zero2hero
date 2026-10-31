import { describe, expect, it } from "vitest";
import { buildCourse, opaqueId, parseContent } from "../../src/build/course.ts";
import { matchesKey } from "../../src/lib/answerHash.ts";
import { fillAnswer, orderingAnswer, pairAnswer, slotAnswer } from "../../src/lib/answers.ts";
import type { ClientFill, ClientMatching, ClientMcq, ClientOrdering, ClientSlots } from "../../src/types.ts";
import { fill, matching, mcq, rawContent, sectionInput, slots, TEXT } from "../fixtures/content.ts";

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
  it("ships keys that accept exactly the authored answers", () => {
    const course = buildCourse(parseContent(rawContent()));
    const [m, o, x] = course.sections[0].questions as [ClientMcq, ClientOrdering, ClientMatching];

    expect(matchesKey(m.id, opaqueId(m.id, "two"), m.key)).toBe(true);
    expect(matchesKey(m.id, opaqueId(m.id, "one"), m.key)).toBe(false);

    const order = ["first", "second", "third"].map((i) => opaqueId(o.id, i));
    expect(matchesKey(o.id, orderingAnswer(order), o.key)).toBe(true);
    expect(matchesKey(o.id, orderingAnswer(order.slice().reverse()), o.key)).toBe(false);

    // One key per pair, so each pair can be marked on its own.
    const [l1, l2, r1, r2] = ["l1", "l2", "r1", "r2"].map((id) => opaqueId(x.id, id));
    expect(Object.keys(x.keys).sort()).toEqual([l1, l2].sort());
    expect(matchesKey(x.id, pairAnswer(l1, r1), x.keys[l1])).toBe(true);
    expect(matchesKey(x.id, pairAnswer(l2, r2), x.keys[l2])).toBe(true);
    expect(matchesKey(x.id, pairAnswer(l1, r2), x.keys[l1])).toBe(false);
    expect(x.right).toHaveLength(3);
    expect(x.left.find((l) => l.diagramHtml)?.html).toBe("");
  });

  it("ships slot puzzles with hidden tile ids and a key per slot", () => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [slots({ diagram: "dia" } as never)]), text: TEXT };
    const q = buildCourse(parseContent(raw)).sections[0].questions[0] as ClientSlots;
    expect(q).toMatchObject({ kind: "slots", slots: 3, separator: ":" });
    expect(q.diagramHtml).toContain("<img");
    expect(q.blocks.map((b) => b.html).sort()).toEqual(["aaaa", "bbbb", "cc"]);
    const [a, b] = ["aa", "bb"].map((id) => opaqueId(q.id, id));
    expect(q.keys).toHaveLength(3);
    [a, b, a].forEach((id, i) => expect(matchesKey(q.id, slotAnswer(i, id), q.keys[i])).toBe(true));
    expect(matchesKey(q.id, slotAnswer(2, b), q.keys[2])).toBe(false);
    expect(matchesKey(q.id, slotAnswer(1, a), q.keys[2])).toBe(false);
    expect(JSON.stringify(q)).not.toMatch(/"aa"|"bb"/);
  });

  it("does not ship authored ids or authoring order", () => {
    const course = buildCourse(parseContent(rawContent()));
    const json = JSON.stringify(course);
    for (const id of ["\"two\"", "\"first\"", "\"r1\"", "correct"]) expect(json).not.toContain(id);
    const o = course.sections[0].questions[1] as ClientOrdering;
    const ids = o.items.map((i) => i.id);
    expect(ids).toEqual(ids.slice().sort());
  });

  it("renders blocks, diagrams, new concepts and optional explanations", () => {
    const raw = rawContent();
    raw.sections[0].section.questions = [mcq(), matching({ explanation: undefined })];
    const course = buildCourse(parseContent(raw));
    const s = course.sections[0];
    expect(s.blocks[0].html).toContain("<img");
    expect(s.newConcepts).toEqual([{ term: "A", html: "Förklaring av a." }]);
    expect((s.questions[1] as ClientMatching).explanationHtml).toBeUndefined();
    expect(course.sections[1].blocks[0].kind).toBe("recap");
  });

  it("orders ordering explanations as optional too", () => {
    const raw = rawContent();
    const q = raw.sections[0].section.questions[1];
    raw.sections[0].section.questions[1] = { ...q, explanation: undefined } as typeof q;
    const course = buildCourse(parseContent(raw));
    expect((course.sections[0].questions[1] as ClientOrdering).explanationHtml).toBeUndefined();
  });

  it("fails on diagrams that were never exported", () => {
    const raw = rawContent();
    raw.images = {};
    expect(() => buildCourse(parseContent(raw))).toThrow(/has not been exported/);
  });

  it("fails on unknown diagrams and concepts", () => {
    const badDiagram = rawContent();
    badDiagram.sections[0].section.questions = [mcq({ diagram: "nope" } as never)];
    expect(() => buildCourse(parseContent(badDiagram))).toThrow(/unknown diagram/);

    const badConcept = rawContent();
    badConcept.sections[0].section.meta.introduces = ["ghost"];
    expect(() => buildCourse(parseContent(badConcept))).toThrow(/unknown concept/);
  });

  it("shows an mcq diagram when one is given", () => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [mcq({ diagram: "dia" } as never)]), text: TEXT };
    const course = buildCourse(parseContent(raw));
    expect((course.sections[0].questions[0] as ClientMcq).diagramHtml).toContain("<img");
  });
});

describe("fill questions", () => {
  it("ship one key per field that accepts the normalised answer", () => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [fill({ diagram: "dia" } as never)]), text: TEXT };
    const q = buildCourse(parseContent(raw)).sections[0].questions[0] as ClientFill;
    expect(q.diagramHtml).toContain("<img");
    expect(q.fields.map((f) => f.format)).toEqual(["ipv4", "number"]);
    const [net, n] = q.fields;
    expect(net.id).toBe(opaqueId("q-fill", "net"));
    expect(matchesKey("q-fill", fillAnswer(net.id, "10.000.0.0", "ipv4"), net.key)).toBe(true);
    expect(matchesKey("q-fill", fillAnswer(n.id, "254", "number"), n.key)).toBe(true);
    expect(matchesKey("q-fill", fillAnswer(n.id, "255", "number"), n.key)).toBe(false);
    expect(JSON.stringify(q.fields)).not.toMatch(/254|10\.0\.0\.0/);
  });
});
