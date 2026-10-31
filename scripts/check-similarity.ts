// Local-only: compares our questions with the old quiz data. Skips when the quiz is not on this machine.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseContent } from "../src/build/course.ts";
import { loadContent } from "../src/build/loadContent.ts";
import type { Question } from "../src/build/schema.ts";
import { matchingRightOptions } from "../src/puzzles/validators.ts";
import { compare, quizItemsFrom, type OwnItem } from "./lib/similarity.ts";

const root = process.cwd();
const pathFile = path.join(root, ".quiz-path");
const quizRoot = process.env.QUIZ_PATH ?? (existsSync(pathFile) ? readFileSync(pathFile, "utf8").trim() : "");
const dataDir = path.join(quizRoot, "data");
if (quizRoot === "" || !existsSync(dataDir)) {
  console.log("check:similarity skipped (quiz data not found; set QUIZ_PATH or .quiz-path)");
  process.exit(0);
}

const quiz = readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => quizItemsFrom(JSON.parse(readFileSync(path.join(dataDir, f), "utf8")), f));

function ownItem(q: Question): OwnItem {
  switch (q.kind) {
    case "mcq":
      return { id: q.id, text: `${q.prompt} ${q.explanation}`, options: q.options.map((o) => o.text) };
    case "ordering":
      return { id: q.id, text: `${q.prompt} ${q.explanation ?? ""}`, options: q.items.map((i) => i.text) };
    case "matching":
      return { id: q.id, text: `${q.prompt} ${q.explanation ?? ""}`, options: matchingRightOptions(q).map((r) => r.text) };
    case "slots":
      return { id: q.id, text: `${q.prompt} ${q.explanation}`, options: q.blocks.map((b) => b.text) };
    case "fill":
      return { id: q.id, text: `${q.prompt} ${q.fields.map((f) => f.label).join(" ")} ${q.explanation}`, options: [] };
  }
}

const content = parseContent(await loadContent(root));
const allowed = new Set(
  (JSON.parse(readFileSync(path.join(root, "content-allowlist.json"), "utf8")) as { similarity: string[] }).similarity,
);
const own = content.sections.flatMap((s) => s.questions.map(ownItem)).filter((o) => !allowed.has(o.id));
const findings = compare(own, quiz);
if (findings.length > 0) {
  for (const f of findings) console.error(`${f.id} vs ${f.against}: ${f.reason}`);
  process.exit(1);
}
console.log(`check:similarity ok (${own.length} questions vs ${quiz.length} quiz items)`);
