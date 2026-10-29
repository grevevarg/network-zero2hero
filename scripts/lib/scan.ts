import {
  findObsidianSyntax,
  findTerms,
  isAllowed,
  type AllowEntry,
  type Term,
} from "../../src/build/forbidden.ts";

export type Violation = { file: string; line: number; term: string };

/** Scan one file. `prose` also checks Obsidian syntax, which code legitimately contains. */
export function scanText(
  file: string,
  text: string,
  terms: readonly Term[],
  allow: readonly AllowEntry[],
  prose: boolean,
): Violation[] {
  const found = [...findTerms(text, terms), ...(prose ? findObsidianSyntax(text) : [])];
  return found.filter((f) => !isAllowed(allow, file, f.term)).map((f) => ({ file, ...f }));
}

/** Every string inside a JSON-like value, for scanning the built content data. */
export function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

export function isProbablyBinary(buf: Uint8Array): boolean {
  return buf.subarray(0, 8000).includes(0);
}

export function isProseFile(file: string): boolean {
  return /^content\/.*\.md$/.test(file);
}
