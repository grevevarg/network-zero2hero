import { answerKey } from "../lib/answerHash.ts";
import { matchingAnswer, orderingAnswer } from "../lib/answers.ts";
import { hashString } from "../lib/prng.ts";
import type { ClientChoice, ClientCourse, ClientQuestion, ClientSection } from "../types.ts";
import { diagramHtml, type ImageInfo } from "./diagram.ts";
import { renderInline, renderMarkdown, splitBlocks, type SourceBlock } from "./markdown.ts";
import {
  conceptSchema,
  sectionSchema,
  type Concept,
  type Question,
  type Section,
  type SectionInput,
} from "./schema.ts";
import { matchingRightOptions } from "../puzzles/validators.ts";

export type RawContent = {
  title: string;
  concepts: Concept[];
  sections: { section: SectionInput; text: string }[];
  /** Exported diagram images by scene name (diagrams/manifest.json). */
  images: Record<string, ImageInfo>;
};

export type ParsedSection = Section & { blocks: SourceBlock[] };
export type ParsedContent = { title: string; concepts: Concept[]; sections: ParsedSection[]; images: Record<string, ImageInfo> };

/** Schema-validate everything and split section texts into blocks. Throws on the first problem. */
export function parseContent(raw: RawContent): ParsedContent {
  const concepts = raw.concepts.map((c) => conceptSchema.parse(c));
  const sections = raw.sections.map(({ section, text }) => {
    const parsed = sectionSchema.safeParse(section);
    if (!parsed.success) {
      throw new Error(`section ${section.meta.id}: ${parsed.error.message}`);
    }
    return { ...parsed.data, blocks: splitBlocks(text) };
  });
  return { title: raw.title, concepts, sections, images: raw.images };
}

/** Replace an authored id with an id that says nothing about the answer. */
export function opaqueId(questionId: string, id: string): string {
  return "x" + hashString(`${questionId}#${id}`).toString(36);
}

/** Order choices by their opaque id, so authoring order (often the answer order) is not shipped. */
function hideOrder<T extends { id: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function choices(qid: string, list: { id: string; text: string }[]): ClientChoice[] {
  const out = list.map((c) => ({ id: opaqueId(qid, c.id), html: renderInline(c.text) }));
  if (new Set(out.map((c) => c.id)).size !== out.length) {
    throw new Error(`question ${qid}: opaque id collision, rename an option id`);
  }
  return hideOrder(out);
}

async function buildQuestion(q: Question, diagrams: Record<string, string>): Promise<ClientQuestion> {
  const promptHtml = renderMarkdown(q.prompt);
  const diagram = (id: string | undefined) => {
    if (id === undefined) return undefined;
    const html = diagrams[id];
    if (!html) throw new Error(`question ${q.id}: unknown diagram "${id}"`);
    return html;
  };
  switch (q.kind) {
    case "mcq":
      return {
        kind: "mcq",
        id: q.id,
        promptHtml,
        diagramHtml: diagram(q.diagram),
        options: choices(q.id, q.options),
        key: await answerKey(q.id, opaqueId(q.id, q.correct)),
        explanationHtml: renderMarkdown(q.explanation),
      };
    case "ordering":
      return {
        kind: "ordering",
        id: q.id,
        promptHtml,
        items: choices(q.id, q.items),
        key: await answerKey(q.id, orderingAnswer(q.items.map((i) => opaqueId(q.id, i.id)))),
        explanationHtml: q.explanation === undefined ? undefined : renderMarkdown(q.explanation),
      };
    case "matching": {
      const left = hideOrder(
        q.pairs.map((p) => ({
          id: opaqueId(q.id, p.left.id),
          html: p.left.text === undefined ? "" : renderInline(p.left.text),
          diagramHtml: diagram(p.left.diagram),
        })),
      );
      const solution = Object.fromEntries(
        q.pairs.map((p) => [opaqueId(q.id, p.left.id), opaqueId(q.id, p.right.id)]),
      );
      return {
        kind: "matching",
        id: q.id,
        promptHtml,
        left,
        right: choices(q.id, matchingRightOptions(q)),
        key: await answerKey(q.id, matchingAnswer(left.map((l) => l.id), solution)),
        explanationHtml: q.explanation === undefined ? undefined : renderMarkdown(q.explanation),
      };
    }
  }
}

/** Turn validated content into the data the browser gets: HTML, opaque ids, hashed answers. */
export async function buildCourse(content: ParsedContent): Promise<ClientCourse> {
  const sections: ClientSection[] = [];
  for (const s of content.sections) {
    const diagrams = Object.fromEntries(
      Object.entries(s.meta.diagrams).map(([id, d]) => [id, diagramHtml(d, content.images)]),
    );
    const questions: ClientQuestion[] = [];
    for (const q of s.questions) questions.push(await buildQuestion(q, diagrams));
    sections.push({
      id: s.meta.id,
      number: s.meta.number,
      title: s.meta.title,
      blocks: s.blocks.map((b) => ({ kind: b.kind, html: renderMarkdown(b.markdown, diagrams) })),
      newConcepts: s.meta.introduces.map((cid) => {
        const c = content.concepts.find((x) => x.id === cid);
        if (!c) throw new Error(`section ${s.meta.id}: unknown concept "${cid}"`);
        return { term: c.term, html: renderInline(c.explanation) };
      }),
      questions,
    });
  }
  return { title: content.title, sections };
}
