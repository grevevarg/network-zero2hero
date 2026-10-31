/** Colour themes. The colours live in styles.css under :root[data-theme="…"]; this is the list and the choice. */
export const THEMES = [
  { id: "solarized-dark", label: "Solarized Dark", dark: true },
  { id: "miasma", label: "Miasma", dark: true },
  { id: "noctis", label: "Noctis", dark: true },
  { id: "moonfly", label: "Moonfly", dark: true },
  { id: "solarized-light", label: "Solarized Light", dark: false },
  { id: "kanagawa-lotus", label: "Kanagawa Lotus", dark: false },
  { id: "tokyo-night-day", label: "Tokyo Night Day", dark: false },
  { id: "noctis-lux", label: "Noctis Lux", dark: false },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

/** localStorage key. index.html reads it too, before first paint. */
export const THEME_KEY = "fntn-theme";

export function isTheme(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

/** The theme used while the reader hasn't picked one: follows the system's light/dark setting. */
export function systemTheme(prefersDark: boolean): ThemeId {
  return prefersDark ? "solarized-dark" : "solarized-light";
}

/** The reader's own pick, or undefined when they follow the system (or storage is unavailable). */
export function loadTheme(storage: Storage | undefined): ThemeId | undefined {
  try {
    const value = storage?.getItem(THEME_KEY);
    return isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Remember a pick; undefined forgets it, so the system setting decides again. */
export function saveTheme(storage: Storage | undefined, id: ThemeId | undefined): void {
  try {
    if (id === undefined) storage?.removeItem(THEME_KEY);
    else storage?.setItem(THEME_KEY, id);
  } catch {
    // Private mode or blocked storage: the pick just isn't remembered.
  }
}

export function applyTheme(root: HTMLElement, id: ThemeId): void {
  root.dataset.theme = id;
}

/** The theme to show now: the reader's pick, or the system's light/dark. */
export function currentTheme(storage: Storage | undefined, prefersDark: boolean): ThemeId {
  return loadTheme(storage) ?? systemTheme(prefersDark);
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Apply the current theme and keep following the system's light/dark setting while the reader
 * hasn't picked a theme. Returns a function that stops listening.
 */
export function followSystem(win: Window, storage: Storage | undefined): () => void {
  const query = win.matchMedia(DARK_QUERY);
  const update = () => applyTheme(win.document.documentElement, currentTheme(storage, query.matches));
  update();
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}

/** Whether the system currently asks for a dark theme. */
export function prefersDark(win: Window): boolean {
  return win.matchMedia(DARK_QUERY).matches;
}
