// Dev-only: words, LIX and a rough duration per section. Never shown in the UI.
import { parseContent } from "../src/build/course.ts";
import { loadContent } from "../src/build/loadContent.ts";
import { formatStats, sectionStats } from "./lib/stats.ts";

const content = parseContent(await loadContent(process.cwd()));
console.log(formatStats(content.sections.map(sectionStats)));
