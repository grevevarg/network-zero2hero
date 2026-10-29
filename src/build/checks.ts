import type { ParsedContent } from "./course.ts";
import type { Matching, Mcq, Ordering, Question } from "./schema.ts";
import {
  isMatchingSolved,
  isMcqSolved,
  isOrderingSolved,
  matchingRightOptions,
} from "../puzzles/validators.ts";

/** Concept registry and section graph rules. Returns human-readable errors, empty when fine. */
export function checkConceptGraph(content: ParsedContent): string[] {
  const errors: string[] = [];
  const conceptIds = new Set<string>();
  for (const c of content.concepts) {
    if (conceptIds.has(c.id)) errors.push(`concept "${c.id}" is defined twice`);
    conceptIds.add(c.id);
  }

  const introducedBy = new Map<string, string>();
  const sectionIds = new Set<string>();
  content.sections.forEach((s, index) => {
    const { meta } = s;
    if (sectionIds.has(meta.id)) errors.push(`section "${meta.id}" is defined twice`);
    sectionIds.add(meta.id);
    if (meta.number !== index + 1) errors.push(`section "${meta.id}" has number ${meta.number}, expected ${index + 1}`);

    for (const cid of meta.requires) {
      if (!conceptIds.has(cid)) errors.push(`section "${meta.id}" requires unknown concept "${cid}"`);
      else if (!introducedBy.has(cid)) errors.push(`section "${meta.id}" requires "${cid}", which no earlier section introduces`);
    }
    for (const cid of meta.introduces) {
      const concept = content.concepts.find((c) => c.id === cid);
      if (!concept) errors.push(`section "${meta.id}" introduces unknown concept "${cid}"`);
      else if (concept.section !== meta.id) errors.push(`concept "${cid}" says section "${concept.section}" but "${meta.id}" introduces it`);
      if (introducedBy.has(cid)) errors.push(`concept "${cid}" is introduced by both "${introducedBy.get(cid)}" and "${meta.id}"`);
      introducedBy.set(cid, meta.id);
    }

    const allowed = new Set([...meta.introduces, ...meta.requires]);
    const checkUses = (where: string, uses: readonly string[]) => {
      for (const u of uses) {
        if (!allowed.has(u)) errors.push(`${where} in section "${meta.id}" uses "${u}", which is neither introduced nor required here`);
      }
    };
    s.blocks.forEach((b, i) => checkUses(`block ${i + 1}`, b.uses));
    s.questions.forEach((q) => checkUses(`question "${q.id}"`, q.uses));
  });

  for (const c of content.concepts) {
    if (!introducedBy.has(c.id)) errors.push(`concept "${c.id}" is never introduced`);
  }
  if (errors.length === 0 && !isAcyclic(sectionGraph(content))) errors.push("section graph has a cycle");
  return errors;
}

/** Edges from the section that introduces a concept to each section that requires it. */
export function sectionGraph(content: ParsedContent): Map<string, Set<string>> {
  const introducedBy = new Map<string, string>();
  for (const s of content.sections) for (const c of s.meta.introduces) introducedBy.set(c, s.meta.id);
  const graph = new Map<string, Set<string>>(content.sections.map((s) => [s.meta.id, new Set<string>()]));
  for (const s of content.sections) {
    for (const c of s.meta.requires) {
      const from = introducedBy.get(c);
      if (from !== undefined) graph.get(from)?.add(s.meta.id);
    }
  }
  return graph;
}

/** Kahn's algorithm. */
export function isAcyclic(graph: ReadonlyMap<string, ReadonlySet<string>>): boolean {
  const indegree = new Map<string, number>([...graph.keys()].map((k) => [k, 0]));
  for (const targets of graph.values()) for (const t of targets) indegree.set(t, (indegree.get(t) ?? 0) + 1);
  const queue = [...indegree].filter(([, d]) => d === 0).map(([k]) => k);
  let seen = 0;
  while (queue.length > 0) {
    const node = queue.shift() as string;
    seen++;
    for (const t of graph.get(node) ?? []) {
      const d = (indegree.get(t) ?? 0) - 1;
      indegree.set(t, d);
      if (d === 0) queue.push(t);
    }
  }
  return seen === indegree.size;
}

/** Sentence ends: punctuation followed by end of text or a capital letter or digit. "t.ex. en" is not an end. */
export function countSentences(text: string): number {
  return text.trim().match(/[.!?](?=\s*$|\s+[\p{Lu}\p{N}`*])/gu)?.length ?? 0;
}

const POSITION_REFERENCE =
  /\b(alternativ|svar|svarsalternativ)\s+[A-E1-5]\b|(^|\s)[A-E]\)|\b(första|andra|tredje|fjärde|sista|översta|nedersta)\s+(alternativet|svaret|valet)\b/iu;

export function refersToPosition(text: string): boolean {
  return POSITION_REFERENCE.test(text);
}

function* permutations<T>(items: readonly T[]): Generator<T[]> {
  if (items.length <= 1) {
    yield items.slice();
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) yield [items[i], ...p];
  }
}

function* assignments(keys: readonly string[], values: readonly string[]): Generator<Record<string, string>> {
  if (keys.length === 0) {
    yield {};
    return;
  }
  const [first, ...rest] = keys;
  for (const v of values) for (const a of assignments(rest, values)) yield { [first]: v, ...a };
}

/** Brute-force the number of answers each validator accepts. Must be exactly 1. */
export function countSolutions(q: Question): number {
  let count = 0;
  switch (q.kind) {
    case "mcq":
      for (const o of q.options) if (isMcqSolved(q, o.id)) count++;
      return count;
    case "ordering":
      for (const p of permutations(q.items.map((i) => i.id))) if (isOrderingSolved(q, p)) count++;
      return count;
    case "matching": {
      const rightIds = matchingRightOptions(q).map((r) => r.id);
      for (const a of assignments(q.pairs.map((p) => p.left.id), rightIds)) if (isMatchingSolved(q, a)) count++;
      return count;
    }
  }
}

function duplicates(values: readonly string[]): string[] {
  const norm = values.map((v) => v.trim().toLowerCase());
  return norm.filter((v, i) => norm.indexOf(v) !== i);
}

function checkMcq(q: Mcq): string[] {
  const errors: string[] = [];
  if (!q.options.some((o) => o.id === q.correct)) errors.push(`"${q.id}": correct id "${q.correct}" is not an option`);
  const sentences = countSentences(q.explanation);
  if (sentences < 3 || sentences > 6) errors.push(`"${q.id}": explanation has ${sentences} sentences, expected 3-6`);
  return errors;
}

function checkOrdering(q: Ordering): string[] {
  return duplicates(q.items.map((i) => i.text)).map((d) => `"${q.id}": duplicate item text "${d}"`);
}

function checkMatching(q: Matching): string[] {
  const errors = duplicates(matchingRightOptions(q).map((r) => r.text)).map((d) => `"${q.id}": duplicate option text "${d}"`);
  for (const p of q.pairs) {
    if (p.left.text === undefined && p.left.diagram === undefined) errors.push(`"${q.id}": left item "${p.left.id}" has neither text nor diagram`);
  }
  return errors;
}

/** Per-question rules: ids, one correct answer, explanation length, no position references. */
export function checkQuestions(content: ParsedContent): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of content.sections) {
    for (const q of s.questions) {
      if (ids.has(q.id)) errors.push(`question id "${q.id}" is used twice`);
      ids.add(q.id);
      const choiceIds =
        q.kind === "mcq" ? q.options.map((o) => o.id)
        : q.kind === "ordering" ? q.items.map((i) => i.id)
        : [...q.pairs.map((p) => p.left.id), ...matchingRightOptions(q).map((r) => r.id)];
      for (const d of duplicates(choiceIds)) errors.push(`"${q.id}": duplicate choice id "${d}"`);
      if (q.kind === "mcq") {
        errors.push(...checkMcq(q));
        for (const d of duplicates(q.options.map((o) => o.text))) errors.push(`"${q.id}": duplicate option text "${d}"`);
      }
      if (q.kind === "ordering") errors.push(...checkOrdering(q));
      if (q.kind === "matching") errors.push(...checkMatching(q));
      const explanation = "explanation" in q ? q.explanation : undefined;
      if (explanation !== undefined && refersToPosition(explanation)) errors.push(`"${q.id}": explanation refers to an option by letter or position`);
      const solutions = countSolutions(q);
      if (solutions !== 1) errors.push(`"${q.id}": ${solutions} answers are accepted, expected exactly 1`);
    }
  }
  return errors;
}

/**
 * Every block is one card: it must start with a `##` heading and contain no other `##` heading.
 * Example blocks are boxes inside the card before them: they start with `###` and have no `##`.
 */
export function checkBlocks(content: ParsedContent): string[] {
  const errors: string[] = [];
  for (const s of content.sections) {
    s.blocks.forEach((b, i) => {
      const where = `block ${i + 1} in section "${s.meta.id}"`;
      if (b.kind === "example") {
        if (i === 0) errors.push(`${where} is an example, so it needs a card before it`);
        if (!/^### \S/.test(b.markdown)) errors.push(`${where} is an example and must start with a "### " heading`);
        if (/^## /m.test(b.markdown)) errors.push(`${where} is an example and must not contain a "## " heading`);
        return;
      }
      if (!/^## \S/.test(b.markdown)) errors.push(`${where} must start with a "## " heading (it becomes the card title)`);
      const count = b.markdown.match(/^## /gm)?.length ?? 0;
      if (count > 1) errors.push(`${where} has ${count} "## " headings; split it into one card per heading`);
    });
  }
  return errors;
}
