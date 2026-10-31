import type { Progress } from "../lib/storage.ts";
import type { ClientCourse } from "../types.ts";
import { sectionHref } from "./router.ts";

type Props = { course: ClientCourse; progress: Progress; onReset: () => void };

export function Home({ course, progress, onReset }: Props) {
  const solved = new Set(progress.solved);
  return (
    <main class="home">
      <h1>{course.title}</h1>
      <p class="lead">
        Från "vad är ett nätverk?" till att förstå hur paket hittar fram. Läs i ordning, varje avsnitt bygger på
        det förra. Avsluta varje avsnitt med frågorna i slutet.
      </p>
      <ol class="section-grid">
        {course.sections.map((s) => {
          const done = s.questions.filter((q) => solved.has(q.id)).length;
          const position = progress.position[s.id];
          return (
            <li key={s.id} class={`section-box${done === s.questions.length ? " done" : ""}`}>
              <span class="section-box-number">{s.number}</span>
              <a class="section-box-title" href={sectionHref(s.id)}>
                {s.title}
              </a>
              <span class="progress">
                {done} av {s.questions.length} frågor klara
              </span>
              {position !== undefined && position > 1 ? (
                <a class="resume" href={sectionHref(s.id, position)}>
                  Fortsätt där du var
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p class="reset">
        <button type="button" onClick={onReset}>
          Rensa sparade svar
        </button>
        <span class="hint">Svaren sparas bara i din webbläsare.</span>
      </p>
    </main>
  );
}
