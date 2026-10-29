import type { RawContent } from "../../src/build/course.ts";
import type { QuestionInput, SectionInput } from "../../src/build/schema.ts";

export const mcq = (over: Partial<QuestionInput> = {}): QuestionInput =>
  ({
    kind: "mcq",
    id: "q-mcq",
    uses: ["a"],
    prompt: "Vilken?",
    options: [
      { id: "one", text: "Ett" },
      { id: "two", text: "Två" },
      { id: "three", text: "Tre" },
    ],
    correct: "two",
    explanation: "Två är rätt. Ett är fel. Tre är också fel.",
    ...over,
  }) as QuestionInput;

export const ordering = (over: Partial<QuestionInput> = {}): QuestionInput =>
  ({
    kind: "ordering",
    id: "q-order",
    uses: ["a"],
    prompt: "Ordna",
    items: [
      { id: "first", text: "Först" },
      { id: "second", text: "Sen" },
      { id: "third", text: "Sist" },
    ],
    explanation: "Så här är det.",
    ...over,
  }) as QuestionInput;

export const matching = (over: Partial<QuestionInput> = {}): QuestionInput =>
  ({
    kind: "matching",
    id: "q-match",
    uses: ["a"],
    prompt: "Para ihop",
    pairs: [
      { left: { id: "l1", text: "Vänster 1" }, right: { id: "r1", text: "Höger 1" } },
      { left: { id: "l2", diagram: "dia" }, right: { id: "r2", text: "Höger 2" } },
    ],
    distractors: [{ id: "r3", text: "Höger 3" }],
    ...over,
  }) as QuestionInput;

export const sectionInput = (over: Partial<SectionInput["meta"]> = {}, questions?: QuestionInput[]): SectionInput => ({
  meta: {
    id: "s1",
    number: 1,
    title: "Första",
    slug: "01-s1",
    introduces: ["a"],
    requires: [],
    diagrams: {
      dia: { width: 10, height: 10, alt: "En punkt", nodes: [{ id: "n", x: 5, y: 5 }], edges: [] },
    },
    ...over,
  },
  questions: questions ?? [mcq(), ordering(), matching()],
});

export const TEXT = "<!-- uses: a -->\n## Rubrik\n\nText om **a**.\n\n@diagram(dia)\n";

export function rawContent(): RawContent {
  return {
    title: "Test",
    concepts: [
      { id: "a", term: "A", explanation: "Förklaring av a.", section: "s1" },
      { id: "b", term: "B", explanation: "Förklaring av b.", section: "s2" },
    ],
    sections: [
      { section: sectionInput(), text: TEXT },
      {
        section: sectionInput({ id: "s2", number: 2, title: "Andra", slug: "02-s2", introduces: ["b"], requires: ["a"] }, [
          mcq({ id: "q2", uses: ["a", "b"] }),
        ]),
        text: "<!-- uses: a, b; kind: recap -->\nKort om a och b.\n",
      },
    ],
  };
}
