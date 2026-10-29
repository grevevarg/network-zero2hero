/** Data shape the browser receives. Built by src/build/course.ts. */
export type BlockKind = "text" | "example" | "recap";

export type ClientBlock = { kind: BlockKind; html: string };

export type ClientConcept = { term: string; html: string };

export type ClientChoice = { id: string; html: string };

export type ClientMcq = {
  kind: "mcq";
  id: string;
  promptHtml: string;
  diagramHtml?: string;
  options: ClientChoice[];
  key: string;
  explanationHtml: string;
};

export type ClientOrdering = {
  kind: "ordering";
  id: string;
  promptHtml: string;
  items: ClientChoice[];
  key: string;
  explanationHtml?: string;
};

export type ClientMatching = {
  kind: "matching";
  id: string;
  promptHtml: string;
  left: (ClientChoice & { diagramHtml?: string })[];
  right: ClientChoice[];
  key: string;
  explanationHtml?: string;
};

export type ClientFillField = { id: string; labelHtml: string; format: "text" | "number" | "ipv4" | "binary" | "ipv6"; key: string };

export type ClientFill = {
  kind: "fill";
  id: string;
  promptHtml: string;
  diagramHtml?: string;
  fields: ClientFillField[];
  explanationHtml: string;
};

export type ClientQuestion = ClientMcq | ClientOrdering | ClientMatching | ClientFill;

export type ClientSection = {
  id: string;
  number: number;
  title: string;
  blocks: ClientBlock[];
  newConcepts: ClientConcept[];
  questions: ClientQuestion[];
};

export type ClientCourse = { title: string; sections: ClientSection[] };
