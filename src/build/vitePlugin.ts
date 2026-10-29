import type { Plugin, ViteDevServer } from "vite";
import { checkBlocks, checkConceptGraph, checkQuestions } from "./checks.ts";
import { buildCourse, parseContent } from "./course.ts";
import { loadContent } from "./loadContent.ts";

const PUBLIC_ID = "virtual:course";
const RESOLVED_ID = "\0virtual:course";

/** Provides `virtual:course`: validated, pre-rendered content with hashed answers. */
export function coursePlugin(): Plugin {
  let root = process.cwd();
  let server: ViteDevServer | undefined;
  return {
    name: "course-content",
    configResolved(config) {
      root = config.root;
    },
    configureServer(s) {
      server = s;
      s.watcher.add(`${root}/content`);
      s.watcher.on("change", (file) => {
        if (!file.startsWith(`${root}/content`)) return;
        const mod = s.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) s.moduleGraph.invalidateModule(mod);
        s.ws.send({ type: "full-reload" });
      });
    },
    resolveId(id) {
      return id === PUBLIC_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const dev = server;
      const raw = await loadContent(root, dev ? (file) => dev.ssrLoadModule(file) : undefined);
      const content = parseContent(raw);
      const errors = [...checkBlocks(content), ...checkConceptGraph(content), ...checkQuestions(content)];
      if (errors.length > 0) throw new Error(`content errors:\n  ${errors.join("\n  ")}`);
      return `export default ${JSON.stringify(buildCourse(content))};`;
    },
  };
}
