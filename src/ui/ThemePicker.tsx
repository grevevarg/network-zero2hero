import { useState } from "preact/hooks";
import { applyTheme, loadTheme, prefersDark, saveTheme, systemTheme, THEMES, type ThemeId } from "../lib/theme.ts";

const SYSTEM = "system";

/** A small native select. "Följ systemet" forgets the pick, so the system's light/dark decides again. */
export function ThemePicker({ storage }: { storage: Storage | undefined }) {
  const [choice, setChoice] = useState<string>(() => loadTheme(storage) ?? SYSTEM);

  function pick(value: string) {
    const id = value === SYSTEM ? undefined : (value as ThemeId);
    saveTheme(storage, id);
    applyTheme(document.documentElement, id ?? systemTheme(prefersDark(window)));
    setChoice(value);
  }

  const group = (dark: boolean) =>
    THEMES.filter((t) => t.dark === dark).map((t) => (
      <option key={t.id} value={t.id}>
        {t.label}
      </option>
    ));

  return (
    <label class="theme-picker">
      Tema
      <select value={choice} onChange={(e) => pick((e.currentTarget as HTMLSelectElement).value)}>
        <option value={SYSTEM}>Följ systemet</option>
        <optgroup label="Mörkt">{group(true)}</optgroup>
        <optgroup label="Ljust">{group(false)}</optgroup>
      </select>
    </label>
  );
}
