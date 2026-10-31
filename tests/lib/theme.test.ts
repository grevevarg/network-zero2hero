import { readFileSync } from "node:fs";
import path from "node:path";
import fc from "fast-check";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  currentTheme,
  followSystem,
  isTheme,
  loadTheme,
  prefersDark,
  saveTheme,
  systemTheme,
  THEME_KEY,
  THEMES,
} from "../../src/lib/theme.ts";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
});

/** A matchMedia stand-in whose answer can be flipped, like the system switching to dark. */
function fakeMedia(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    addEventListener: (_: string, f: () => void) => listeners.add(f),
    removeEventListener: (_: string, f: () => void) => listeners.delete(f),
  };
  const flip = (to: boolean) => {
    query.matches = to;
    for (const f of listeners) f();
  };
  return { query, flip, listeners };
}

const throwing = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } } as unknown as Storage;

describe("theme choice", () => {
  it("has four dark and four light themes with unique ids", () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(8);
    expect(THEMES.filter((t) => t.dark)).toHaveLength(4);
  });

  it("follows the system until the reader picks, and forgets the pick on request", () => {
    expect(systemTheme(true)).toBe("solarized-dark");
    expect(systemTheme(false)).toBe("solarized-light");
    expect(currentTheme(localStorage, true)).toBe("solarized-dark");
    saveTheme(localStorage, "moonfly");
    expect(localStorage.getItem(THEME_KEY)).toBe("moonfly");
    expect(currentTheme(localStorage, false)).toBe("moonfly");
    saveTheme(localStorage, undefined);
    expect(loadTheme(localStorage)).toBeUndefined();
  });

  it("ignores unknown stored values and survives missing or blocked storage", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        localStorage.setItem(THEME_KEY, s);
        expect(loadTheme(localStorage)).toBe(isTheme(s) ? s : undefined);
      }),
    );
    expect(loadTheme(undefined)).toBeUndefined();
    expect(loadTheme(throwing)).toBeUndefined();
    expect(() => saveTheme(throwing, "noctis")).not.toThrow();
    expect(() => saveTheme(undefined, "noctis")).not.toThrow();
  });

  it("applies a theme to the root element", () => {
    applyTheme(document.documentElement, "noctis-lux");
    expect(document.documentElement.dataset.theme).toBe("noctis-lux");
  });

  it("keeps following the system's light/dark only while nothing is picked", () => {
    const media = fakeMedia(false);
    vi.spyOn(window, "matchMedia").mockReturnValue(media.query as unknown as MediaQueryList);
    const stop = followSystem(window, localStorage);
    expect(document.documentElement.dataset.theme).toBe("solarized-light");
    expect(prefersDark(window)).toBe(false);
    media.flip(true);
    expect(document.documentElement.dataset.theme).toBe("solarized-dark");
    saveTheme(localStorage, "kanagawa-lotus");
    media.flip(false);
    expect(document.documentElement.dataset.theme).toBe("kanagawa-lotus");
    stop();
    expect(media.listeners.size).toBe(0);
  });
});

describe("index.html pre-paint script", () => {
  const html = readFileSync(path.join(process.cwd(), "index.html"), "utf8");
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] as string;

  /** Run the inline script with a given stored value and system setting; return the theme it set. */
  function run(stored: string | null | Error, dark: boolean): string | null {
    const root = { attrs: {} as Record<string, string>, setAttribute(k: string, v: string) { this.attrs[k] = v; } };
    const storage = { getItem: () => { if (stored instanceof Error) throw stored; return stored; } };
    new Function("localStorage", "matchMedia", "document", script)(storage, () => ({ matches: dark }), { documentElement: root });
    return root.attrs["data-theme"] ?? null;
  }

  it("lists the same themes, key and defaults as theme.ts", () => {
    expect(script).toContain(`"${THEME_KEY}"`);
    const listed = JSON.parse(/var themes = (\[[^\]]*\])/.exec(script)?.[1] as string);
    expect(listed).toEqual(THEMES.map((t) => t.id));
    for (const t of THEMES) expect(run(t.id, false)).toBe(t.id);
    expect(run(null, true)).toBe(systemTheme(true));
    expect(run("nonsense", false)).toBe(systemTheme(false));
    expect(run(new Error("blocked"), true)).toBe(systemTheme(true));
  });

  it("has a colour block in the stylesheet for every theme", () => {
    const css = readFileSync(path.join(process.cwd(), "src/styles.css"), "utf8");
    for (const t of THEMES) {
      const block = new RegExp(`:root\\[data-theme="${t.id}"\\][^{]*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
      for (const v of ["--bg", "--fg", "--border", "--accent", "--done", "--wrong", "--shadow"]) expect(block, `${t.id} ${v}`).toContain(`${v}:`);
      expect(block).toContain(`color-scheme: ${t.dark ? "dark" : "light"}`);
    }
    // No colour outside the theme blocks.
    const outside = css.replace(/:root\[data-theme="[^"]+"\][^{]*\{[^}]*\}/g, "");
    expect(outside).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
