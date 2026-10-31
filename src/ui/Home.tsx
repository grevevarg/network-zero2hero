import { useEffect, useRef, useState } from "preact/hooks";
import type { Progress } from "../lib/storage.ts";
import type { ClientCourse, ClientSection } from "../types.ts";
import { sectionHref } from "./router.ts";
import { ThemePicker } from "./ThemePicker.tsx";

type Props = { course: ClientCourse; progress: Progress; storage?: Storage; onReset: () => void };

/** Where a section opens: where the reader left it if they are partway through, else the start. */
export function entryHref(section: ClientSection, progress: Progress): string {
  const position = progress.position[section.id];
  return position !== undefined && position > 1 ? sectionHref(section.id, position) : sectionHref(section.id);
}

/** The menu row a key moves to from `index` in a list of `count`, or undefined for keys that aren't ours. */
export function menuMove(key: string, index: number, count: number): number | undefined {
  switch (key) {
    case "ArrowUp":
    case "k":
      return Math.max(0, index - 1);
    case "ArrowDown":
    case "j":
      return Math.min(count - 1, index + 1);
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return undefined;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The section list as a boot-menu style listbox. Up/Down (and j/k), Home and End move the
 * selection, Enter opens. The pointer selects on hover and opens on click.
 */
export function Home({ course, progress, storage, onReset }: Props) {
  const solved = new Set(progress.solved);
  const counts = course.sections.map((s) => s.questions.filter((q) => solved.has(q.id)).length);
  const isDone = (i: number) => counts[i] === course.sections[i].questions.length;
  // Start on the first section that isn't finished: usually the one to read next.
  const [selected, setSelected] = useState(() => Math.max(0, course.sections.findIndex((_, i) => !isDone(i))));
  const list = useRef<HTMLUListElement>(null);
  const optionId = (i: number) => `avsnitt-${course.sections[i].id}`;

  const open = (i: number) => {
    location.hash = entryHref(course.sections[i], progress);
  };

  function key(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      return open(selected);
    }
    const next = menuMove(e.key, selected, course.sections.length);
    if (next === undefined) return;
    e.preventDefault();
    setSelected(next);
  }

  // The menu takes the keys from the start, like a boot menu, and gets them back if focus drops
  // to the page (after a click on the background, say).
  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => {
    list.current?.focus({ preventScroll: true });
    const fromPage = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      list.current?.focus({ preventScroll: true });
      keyRef.current(e);
    };
    window.addEventListener("keydown", fromPage);
    return () => window.removeEventListener("keydown", fromPage);
  }, []);

  // Keep the selected row in view when the list scrolls inside the box.
  useEffect(() => {
    document.getElementById(optionId(selected))?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  return (
    <main class="home">
      <div class="menu">
        <h1 class="menu-title">{course.title}</h1>
        <p class="menu-lead">
          Från "vad är ett nätverk?" till att förstå hur paket hittar fram. Läs i ordning, varje avsnitt bygger på
          det förra. Avsluta varje avsnitt med frågorna i slutet.
        </p>
        <ul
          class="menu-list"
          role="listbox"
          aria-label="Avsnitt"
          tabIndex={0}
          aria-activedescendant={optionId(selected)}
          ref={list}
          onKeyDown={key}
        >
          {course.sections.map((s, i) => {
            const total = s.questions.length;
            const chosen = i === selected;
            return (
              <li
                key={s.id}
                id={optionId(i)}
                role="option"
                aria-selected={chosen}
                aria-label={`${s.number}. ${s.title}, ${counts[i]} av ${total} frågor klara`}
                class={`menu-row${chosen ? " selected" : ""}`}
                onMouseEnter={() => setSelected(i)}
                onClick={() => open(i)}
              >
                <span class="menu-caret" aria-hidden="true">
                  {chosen ? ">" : ""}
                </span>
                <span class="menu-number">{pad(s.number)}</span>
                <span class="menu-name">{s.title}</span>
                <span class="menu-progress">
                  {counts[i]}/{total}
                  {isDone(i) ? <span class="menu-done"> ✓</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
        <div class="menu-footer">
          <p class="menu-hint">Använd ↑ ↓ för att välja, Enter för att öppna.</p>
          <ThemePicker storage={storage} />
        </div>
      </div>
      <p class="reset">
        <button type="button" onClick={onReset}>
          Rensa sparade svar
        </button>
        <span class="hint">Svaren sparas bara i din webbläsare.</span>
      </p>
    </main>
  );
}
