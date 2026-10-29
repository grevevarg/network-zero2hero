import type { ClientCourse } from "../types.ts";
import { sectionHref } from "./router.ts";

type Props = { course: ClientCourse; solved: ReadonlySet<string>; onReset: () => void };

export function Home({ course, solved, onReset }: Props) {
  return (
    <main class="home">
      <h1>{course.title}</h1>
      <p class="lead">
        Från "vad är ett nätverk?" till att förstå hur paket hittar fram. Läs i ordning, varje avsnitt bygger på
        det förra. Avsluta varje avsnitt med frågorna i slutet.
      </p>
      <ol class="toc">
        {course.sections.map((s) => {
          const done = s.questions.filter((q) => solved.has(q.id)).length;
          const all = done === s.questions.length;
          return (
            <li key={s.id} class={all ? "done" : undefined}>
              <a href={sectionHref(s.id)}>{s.title}</a>
              <span class="progress">
                {done} av {s.questions.length} frågor klara
              </span>
            </li>
          );
        })}
      </ol>
      <p class="reset">
        <button type="button" onClick={onReset}>
          Nollställ mina framsteg
        </button>
        <span class="hint">Framstegen sparas bara i den här webbläsaren.</span>
      </p>
    </main>
  );
}
