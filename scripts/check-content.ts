// Fails when tracked files, dist/ or the built content contain forbidden terms or vault leftovers.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { buildCourse, parseContent } from "../src/build/course.ts";
import { parseTermList, type AllowEntry } from "../src/build/forbidden.ts";
import { loadContent } from "../src/build/loadContent.ts";
import { collectStrings, isProbablyBinary, isProseFile, scanText, type Violation } from "./lib/scan.ts";

const root = process.cwd();
const SKIP = new Set(["forbidden-generic.txt", "content-allowlist.json"]);
// Local-only term lists. Names and vault folder names must never be written into tracked files.
const LOCAL_LISTS = [".forbidden-terms", ".vault-terms"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const terms = parseTermList(readFileSync(path.join(root, "forbidden-generic.txt"), "utf8"));
for (const list of LOCAL_LISTS) {
  const file = path.join(root, list);
  if (existsSync(file)) terms.push(...parseTermList(readFileSync(file, "utf8")));
  else console.warn(`warning: ${list} is missing, its terms are not checked`);
}
const allow = (JSON.parse(readFileSync(path.join(root, "content-allowlist.json"), "utf8")) as { terms: AllowEntry[] }).terms;

const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((f) => f !== "" && !SKIP.has(f) && existsSync(path.join(root, f)));
const dist = existsSync(path.join(root, "dist")) ? walk(path.join(root, "dist")).map((f) => path.relative(root, f)) : [];

const violations: Violation[] = [];
for (const file of [...tracked, ...dist]) {
  const buf = readFileSync(path.join(root, file));
  if (isProbablyBinary(buf)) continue;
  violations.push(...scanText(file, buf.toString("utf8"), terms, allow, isProseFile(file)));
}

const course = buildCourse(parseContent(await loadContent(root)));
for (const s of collectStrings(course)) violations.push(...scanText("<built content>", s, terms, allow, true));

if (violations.length > 0) {
  for (const v of violations) console.error(`${v.file}:${v.line}: "${v.term}"`);
  console.error(`\ncheck:content failed with ${violations.length} finding(s)`);
  process.exit(1);
}
console.log(`check:content ok (${tracked.length} tracked files, ${dist.length} dist files, built content)`);
