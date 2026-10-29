import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { coursePlugin } from "../../src/build/vitePlugin.ts";

type Hook = (...args: unknown[]) => unknown;
const call = (p: Plugin, name: keyof Plugin, ...args: unknown[]) => (p[name] as Hook).call({}, ...args);

describe("coursePlugin", () => {
  it("resolves only its own virtual id", () => {
    const p = coursePlugin();
    expect(call(p, "resolveId", "virtual:course")).toBe("\0virtual:course");
    expect(call(p, "resolveId", "./other")).toBeUndefined();
  });

  it("loads the real content as a module and ignores other ids", async () => {
    const p = coursePlugin();
    call(p, "configResolved", { root: process.cwd() } as ResolvedConfig);
    expect(await call(p, "load", "./other")).toBeUndefined();
    const code = (await call(p, "load", "\0virtual:course")) as string;
    expect(code.startsWith("export default {")).toBe(true);
    expect(code).toContain("Från noll till nätverk");
  });

  it("fails the build on content errors", async () => {
    // Inside the project so the test runner can import it; node_modules is gitignored.
    await mkdir("node_modules/.tmp", { recursive: true });
    const root = await mkdtemp(path.join(process.cwd(), "node_modules/.tmp/plugin-"));
    await mkdir(path.join(root, "content/sections/01-s"), { recursive: true });
    await writeFile(path.join(root, "content/sections/01-s/text.md"), "<!-- uses: ghost -->\nText\n");
    await writeFile(
      path.join(root, "content/index.ts"),
      `export const title = "T";
export const concepts = [];
export const sections = [{ meta: { id: "s", number: 1, title: "S", slug: "01-s", introduces: [], requires: [] },
  questions: [{ kind: "mcq", id: "q", uses: ["ghost"], prompt: "P", correct: "a",
    options: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }],
    explanation: "Ett. Två. Tre." }] }];
`,
    );
    const p = coursePlugin();
    call(p, "configResolved", { root } as ResolvedConfig);
    await expect(call(p, "load", "\0virtual:course")).rejects.toThrow(/content errors/);
  });

  it("uses the dev server loader and reloads on content changes", async () => {
    const root = process.cwd();
    const listeners: ((file: string) => void)[] = [];
    const mod = { id: "\0virtual:course" };
    const server = {
      watcher: { add: vi.fn(), on: (_: string, fn: (file: string) => void) => listeners.push(fn) },
      moduleGraph: { getModuleById: vi.fn(() => mod), invalidateModule: vi.fn() },
      ws: { send: vi.fn() },
      ssrLoadModule: vi.fn((file: string) => import(file)),
    };
    const p = coursePlugin();
    call(p, "configResolved", { root } as ResolvedConfig);
    call(p, "configureServer", server as unknown as ViteDevServer);
    expect(server.watcher.add).toHaveBeenCalledWith(`${root}/content`);

    await call(p, "load", "\0virtual:course");
    expect(server.ssrLoadModule).toHaveBeenCalledWith(path.join(root, "content/index.ts"));

    listeners[0](`${root}/src/other.ts`);
    expect(server.ws.send).not.toHaveBeenCalled();
    listeners[0](`${root}/content/concepts.ts`);
    expect(server.moduleGraph.invalidateModule).toHaveBeenCalledWith(mod);
    expect(server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });

    server.moduleGraph.getModuleById.mockReturnValueOnce(undefined as never);
    listeners[0](`${root}/content/concepts.ts`);
    expect(server.moduleGraph.invalidateModule).toHaveBeenCalledTimes(1);
  });
});
