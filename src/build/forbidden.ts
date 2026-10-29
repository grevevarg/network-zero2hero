export type Term = { text: string; wholeWord: boolean };
export type Finding = { term: string; line: number };
export type AllowEntry = { file: string; term: string; reason: string };

/** One term per line. `#` starts a comment, a leading `=` means whole word only. */
export function parseTermList(source: string): Term[] {
  return source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .map((l) => (l.startsWith("=") ? { text: l.slice(1).trim(), wholeWord: true } : { text: l, wholeWord: false }));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termPattern(term: Term): RegExp {
  const body = escapeRegExp(term.text);
  return term.wholeWord ? new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "iu") : new RegExp(body, "iu");
}

export function findTerms(text: string, terms: readonly Term[]): Finding[] {
  const patterns = terms.map((t) => [t.text, termPattern(t)] as const);
  const findings: Finding[] = [];
  text.split("\n").forEach((line, i) => {
    for (const [name, re] of patterns) if (re.test(line)) findings.push({ term: name, line: i + 1 });
  });
  return findings;
}

/** Obsidian syntax. Only meaningful for prose (content sources and the built content data), not for code. */
export function findObsidianSyntax(text: string): Finding[] {
  const findings: Finding[] = [];
  if (/^---\r?\n/.test(text)) findings.push({ term: "frontmatter", line: 1 });
  text.split("\n").forEach((line, i) => {
    for (const token of ["![[", "[[", "]]"]) {
      if (line.includes(token)) {
        findings.push({ term: token, line: i + 1 });
        break;
      }
    }
    if (/^>\s*\[![a-z]+\]/i.test(line)) findings.push({ term: "callout", line: i + 1 });
  });
  return findings;
}

export function isAllowed(allow: readonly AllowEntry[], file: string, term: string): boolean {
  return allow.some((a) => a.file === file && a.term.toLowerCase() === term.toLowerCase());
}
