import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are kebab-case ascii");
const text = z.string().trim().min(1);

export const conceptSchema = z.strictObject({
  id,
  term: text,
  /** Short Swedish explanation shown in the "Nya begrepp" recap. */
  explanation: text,
  /** Id of the section that introduces this concept. */
  section: id,
});

const diagramNodeSchema = z.strictObject({
  id,
  x: z.number(),
  y: z.number(),
  label: z.string().optional(),
  shape: z.enum(["device", "box", "junction"]).default("device"),
});

export const diagramSchema = z.strictObject({
  width: z.number().positive(),
  height: z.number().positive(),
  /** Describes what is drawn. Must not give away a question's answer. */
  alt: text,
  nodes: z.array(diagramNodeSchema).min(1),
  edges: z.array(z.tuple([id, id])),
});

const choiceSchema = z.strictObject({ id, text });

const questionBase = { id, uses: z.array(id).min(1), prompt: text };

export const mcqSchema = z.strictObject({
  ...questionBase,
  kind: z.literal("mcq"),
  diagram: id.optional(),
  options: z.array(choiceSchema).min(3).max(5),
  correct: id,
  explanation: text,
});

export const orderingSchema = z.strictObject({
  ...questionBase,
  kind: z.literal("ordering"),
  /** Items in the correct order. The build step hides this order. */
  items: z.array(choiceSchema).min(3).max(8),
  explanation: text.optional(),
});

export const matchingSchema = z.strictObject({
  ...questionBase,
  kind: z.literal("matching"),
  pairs: z
    .array(
      z.strictObject({
        left: z.strictObject({ id, text: z.string().optional(), diagram: id.optional() }),
        right: choiceSchema,
      }),
    )
    .min(2)
    .max(6),
  /** Extra right-hand options that belong to no left item. */
  distractors: z.array(choiceSchema).default([]),
  explanation: text.optional(),
});

export const questionSchema = z.discriminatedUnion("kind", [mcqSchema, orderingSchema, matchingSchema]);

export const sectionMetaSchema = z.strictObject({
  id,
  number: z.number().int().positive(),
  title: text,
  /** Folder name under content/sections. */
  slug: id,
  introduces: z.array(id),
  requires: z.array(id),
  diagrams: z.record(id, diagramSchema).default({}),
});

export const sectionSchema = z.strictObject({
  meta: sectionMetaSchema,
  questions: z.array(questionSchema).min(1),
});

export type Concept = z.input<typeof conceptSchema>;
export type Diagram = z.output<typeof diagramSchema>;
export type DiagramInput = z.input<typeof diagramSchema>;
export type Question = z.output<typeof questionSchema>;
export type QuestionInput = z.input<typeof questionSchema>;
export type Mcq = z.output<typeof mcqSchema>;
export type Ordering = z.output<typeof orderingSchema>;
export type Matching = z.output<typeof matchingSchema>;
export type SectionMeta = z.output<typeof sectionMetaSchema>;
export type SectionMetaInput = z.input<typeof sectionMetaSchema>;
export type Section = z.output<typeof sectionSchema>;
export type SectionInput = z.input<typeof sectionSchema>;
