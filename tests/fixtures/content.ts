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

export const fill = (over: Partial<QuestionInput> = {}): QuestionInput =>
  ({
    kind: "fill",
    id: "q-fill",
    uses: ["a"],
    prompt: "Skriv",
    fields: [
      { id: "net", label: "Nätadress", answer: "10.0.0.0", format: "ipv4" },
      { id: "n", label: "Antal", answer: "254", format: "number" },
    ],
    explanation: "Nätadressen är 10.0.0.0. Antalet är 254. Mer behövs inte.",
    ...over,
  }) as QuestionInput;

export const slots = (over: Partial<QuestionInput> = {}): QuestionInput =>
  ({
    kind: "slots",
    id: "q-slots",
    uses: ["a"],
    prompt: "Bygg",
    blocks: [
      { id: "aa", text: "aaaa" },
      { id: "bb", text: "bbbb" },
      { id: "cc", text: "cc" },
    ],
    answer: ["aa", "bb", "aa"],
    separator: ":",
    explanation: "Först aaaa. Sedan bbbb. Till sist aaaa igen.",
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
      dia: { scene: "t/dia", alt: "En punkt" },
    },
    ...over,
  },
  questions: questions ?? [mcq(), ordering(), matching()],
});

export const TEXT = "<!-- uses: a -->\n## Rubrik\n\nText om **a**.\n\n@diagram(dia)\n\n<!-- uses: a; kind: example -->\n### Exempel\n\nEtt exempel.\n";

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
        text: "<!-- uses: a, b; kind: recap -->\n## Sammanfattning\n\nKort om a och b.\n",
      },
    ],
    images: { "t/dia": { image: "img/0123456789abcdef0123456789abcdef.svg", width: 40, height: 30 } },
  };
}
