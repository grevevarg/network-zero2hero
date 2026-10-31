import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  checkBlocks,
  checkConceptGraph,
  checkQuestions,
  countSentences,
  countSolutions,
  isAcyclic,
  refersToPosition,
  sectionGraph,
} from "../../src/build/checks.ts";
import { parseContent, type RawContent } from "../../src/build/course.ts";
import { questionSchema, type QuestionInput } from "../../src/build/schema.ts";
import { fill, matching, mcq, ordering, rawContent, sectionInput, slots, TEXT } from "../fixtures/content.ts";

const parsed = (raw: RawContent) => parseContent(raw);

function withQuestions(qs: QuestionInput[]): RawContent {
  const raw = rawContent();
  raw.sections[0] = { section: sectionInput({}, qs), text: TEXT };
  return raw;
}

describe("checkConceptGraph", () => {
  it("accepts valid content", () => {
    expect(checkConceptGraph(parsed(rawContent()))).toEqual([]);
  });

  it("reports every rule break", () => {
    const raw = rawContent();
    raw.concepts.push({ id: "a", term: "A2", explanation: "x", section: "s1" });
    raw.concepts.push({ id: "c", term: "C", explanation: "x", section: "s1" });
    raw.sections[1].section.meta.number = 5;
    raw.sections[1].section.meta.requires = ["a", "nope", "b2"];
    raw.concepts.push({ id: "b2", term: "B2", explanation: "x", section: "s2" });
    raw.sections[1].section.meta.introduces = ["b", "a", "ghost", "b2"];
    raw.sections[0].text = "<!-- uses: zzz -->\nText";
    const errors = checkConceptGraph(parsed(raw)).join("\n");
    expect(errors).toMatch(/concept "a" is defined twice/);
    expect(errors).toMatch(/has number 5, expected 2/);
    expect(errors).toMatch(/requires unknown concept "nope"/);
    expect(errors).toMatch(/requires "b2", which no earlier section introduces/);
    expect(errors).toMatch(/introduces unknown concept "ghost"/);
    expect(errors).toMatch(/concept "a" says section "s1" but "s2" introduces it/);
    expect(errors).toMatch(/introduced by both "s1" and "s2"/);
    expect(errors).toMatch(/block 1 in section "s1" uses "zzz"/);
    expect(errors).toMatch(/concept "c" is never introduced/);
  });

  it("reports duplicate sections and question uses outside the section", () => {
    const raw = rawContent();
    raw.sections[1].section.meta.id = "s1";
    raw.sections[1].section.questions = [mcq({ id: "q9", uses: ["b", "zzz"] })];
    const errors = checkConceptGraph(parsed(raw)).join("\n");
    expect(errors).toMatch(/section "s1" is defined twice/);
    expect(errors).toMatch(/question "q9" in section "s1" uses "zzz"/);
  });
});

describe("section graph", () => {
  it("links introducer to requirer", () => {
    const g = sectionGraph(parsed(rawContent()));
    expect([...(g.get("s1") ?? [])]).toEqual(["s2"]);
  });

  it("isAcyclic accepts any graph whose edges follow a fixed order, and rejects a back edge", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 9 }), fc.array(fc.tuple(fc.nat(), fc.nat())), (size, pairs) => {
        const g = new Map<string, Set<string>>(Array.from({ length: size }, (_, i) => [`n${i}`, new Set<string>()]));
        for (const [a, b] of pairs) {
          const [lo, hi] = [a % size, b % size].sort((x, y) => x - y);
          if (lo !== hi) g.get(`n${lo}`)?.add(`n${hi}`);
        }
        expect(isAcyclic(g)).toBe(true);
        g.get(`n${size - 1}`)?.add("n0");
        g.get("n0")?.add(`n${size - 1}`);
        expect(isAcyclic(g)).toBe(false);
      }),
    );
  });
});

describe("question checks", () => {
  it("accepts valid questions", () => {
    expect(checkQuestions(parsed(rawContent()))).toEqual([]);
  });

  it("reports duplicate ids, wrong correct id, explanation length and position references", () => {
    const errors = checkQuestions(
      parsed(
        withQuestions([
          mcq(),
          mcq({ correct: "nine", explanation: "Kort." } as never),
          mcq({ id: "q-pos", explanation: "Svar B är rätt. Det andra alternativet är fel. Mer text här." }),
          mcq({ id: "q-dupe", options: [{ id: "x", text: "Samma" }, { id: "x", text: "samma" }, { id: "y", text: "Annan" }], correct: "y" } as never),
        ]),
      ),
    ).join("\n");
    expect(errors).toMatch(/question id "q-mcq" is used twice/);
    expect(errors).toMatch(/correct id "nine" is not an option/);
    expect(errors).toMatch(/explanation has 1 sentences/);
    expect(errors).toMatch(/refers to an option by letter or position/);
    expect(errors).toMatch(/duplicate choice id "x"/);
    expect(errors).toMatch(/duplicate option text "samma"/);
    expect(errors).toMatch(/"q-mcq": 0 answers are accepted/);
  });

  it("reports slot puzzles with twin tiles, a missing tile or a short explanation", () => {
    const errors = checkQuestions(
      parsed(
        withQuestions([
          slots({
            blocks: [{ id: "aa", text: "Lika" }, { id: "bb", text: "lika" }],
            answer: ["aa", "zz"],
            explanation: "Kort.",
          } as never),
        ]),
      ),
    ).join("\n");
    expect(errors).toMatch(/duplicate tile text "lika"/);
    expect(errors).toMatch(/explanation has 1 sentences/);
    expect(errors).toMatch(/"q-slots": 0 answers are accepted/);
    expect(checkQuestions(parsed(withQuestions([slots()])))).toEqual([]);
  });

  it("reports duplicate ordering texts and incomplete matching items", () => {
    const errors = checkQuestions(
      parsed(
        withQuestions([
          ordering({ items: [{ id: "a", text: "Lika" }, { id: "b", text: "Lika" }, { id: "c", text: "Olika" }] } as never),
          matching({
            pairs: [
              { left: { id: "l1" }, right: { id: "r1", text: "Höger" } },
              { left: { id: "l2", text: "x" }, right: { id: "r2", text: "höger" } },
            ],
            distractors: [],
          } as never),
        ]),
      ),
    ).join("\n");
    expect(errors).toMatch(/duplicate item text "lika"/);
    expect(errors).toMatch(/duplicate option text "höger"/);
    expect(errors).toMatch(/left item "l1" has neither text nor diagram/);
  });
});

describe("countSolutions", () => {
  it("is exactly 1 for well-formed questions of every kind", () => {
    for (const q of [mcq(), ordering(), matching(), slots()]) expect(countSolutions(questionSchema.parse(q))).toBe(1);
  });

  it("is 0 when the correct answer is missing", () => {
    expect(countSolutions(questionSchema.parse(mcq({ correct: "zzz" } as never)))).toBe(0);
    expect(countSolutions(questionSchema.parse(slots({ answer: ["aa", "zz"] } as never)))).toBe(0);
  });

  it("handles single-item permutations", () => {
    const q = questionSchema.parse(ordering());
    if (q.kind !== "ordering") throw new Error("fixture is not an ordering question");
    expect(countSolutions({ ...q, items: q.items.slice(0, 1) })).toBe(1);
  });
});

describe("text helpers", () => {
  it("countSentences ignores abbreviations like t.ex.", () => {
    expect(countSentences("Det här är t.ex. en mening. Och en till! Visst? 3 är ett tal.")).toBe(4);
    expect(countSentences("")).toBe(0);
  });

  it("refersToPosition catches letters and positions", () => {
    expect(refersToPosition("Svar C är fel.")).toBe(true);
    expect(refersToPosition("A) är fel")).toBe(true);
    expect(refersToPosition("Det sista alternativet är fel.")).toBe(true);
    expect(refersToPosition("Kameran är servern.")).toBe(false);
  });
});

describe("checkBlocks", () => {
  it("accepts one card per block", () => {
    expect(checkBlocks(parsed(rawContent()))).toEqual([]);
  });

  it("needs a leading ## heading and no second one", () => {
    const raw = rawContent();
    raw.sections[0].text = "<!-- uses: a -->\nIngen rubrik\n\n<!-- uses: a -->\n## Ett\n\n## Två\n";
    const errors = checkBlocks(parsed(raw)).join("\n");
    expect(errors).toMatch(/block 1 in section "s1" must start with a "## " heading/);
    expect(errors).toMatch(/block 2 in section "s1" has 2 "## " headings/);
  });

  it("wants examples to follow a card, start with ### and have no ##", () => {
    const raw = rawContent();
    raw.sections[0].text = "<!-- uses: a; kind: example -->\n## Fel nivå\n\n<!-- uses: a; kind: example -->\nIngen rubrik\n";
    const errors = checkBlocks(parsed(raw)).join("\n");
    expect(errors).toMatch(/block 1 in section "s1" is an example, so it needs a card before it/);
    expect(errors).toMatch(/block 1 in section "s1" is an example and must start with a "### " heading/);
    expect(errors).toMatch(/block 1 in section "s1" is an example and must not contain a "## " heading/);
    expect(errors).toMatch(/block 2 in section "s1" is an example and must start with a "### " heading/);
  });
});

describe("fill checks", () => {
  it("accepts canonical answers and rejects non-canonical ones and short explanations", () => {
    expect(checkQuestions(parsed(withQuestions([fill()])))).toEqual([]);
    const errors = checkQuestions(
      parsed(
        withQuestions([
          fill({ fields: [{ id: "n", label: "Antal", answer: "0254", format: "number" }] } as never),
          fill({ id: "q-short", explanation: "Kort." }),
        ]),
      ),
    ).join("\n");
    expect(errors).toMatch(/field "n" answer "0254" is not canonical, write "254"/);
    expect(errors).toMatch(/"q-short": explanation has 1 sentences/);
  });
});
