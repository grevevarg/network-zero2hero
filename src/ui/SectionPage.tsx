import type { ClientSection } from "../types.ts";
import { Html } from "./Html.tsx";
import { Question } from "./Question.tsx";
import { sectionHref } from "./router.ts";

type Props = {
  section: ClientSection;
  previous?: ClientSection;
  next?: ClientSection;
  solved: ReadonlySet<string>;
  seed: string;
  onSolved: (id: string) => void;
};

export function SectionPage({ section, previous, next, solved, seed, onSolved }: Props) {
  return (
    <main class="section">
      <p class="crumbs">
        <a href="#/">Alla avsnitt</a>
      </p>
      <h1>
        <span class="section-number">{section.number}.</span> {section.title}
      </h1>
      {section.blocks.map((b, i) => (
        <Html key={i} html={b.html} className={`block block-${b.kind}`} />
      ))}
      {section.newConcepts.length > 0 ? (
        <section class="concepts" aria-labelledby="concepts-heading">
          <h2 id="concepts-heading">Nya begrepp</h2>
          <dl>
            {section.newConcepts.map((c) => (
              <div key={c.term}>
                <dt>{c.term}</dt>
                <dd>
                  <Html html={c.html} as="span" />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <section class="self-check" aria-labelledby="check-heading">
        <h2 id="check-heading">Testa dig själv</h2>
        {section.questions.map((q) => (
          <Question key={q.id} question={q} seed={seed} solved={solved.has(q.id)} onSolved={onSolved} />
        ))}
      </section>
      <nav class="pager" aria-label="Avsnitt">
        {previous ? <a href={sectionHref(previous.id)}>← {previous.title}</a> : <span />}
        {next ? <a href={sectionHref(next.id)}>{next.title} →</a> : <span />}
      </nav>
    </main>
  );
}
