import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import type { ClientSection } from "../types.ts";
import { clampCard, sectionCards, type Card } from "./cards.ts";
import { Html } from "./Html.tsx";
import { navDirection } from "./keys.ts";
import { Question } from "./Question.tsx";
import { sectionHref } from "./router.ts";

type Props = {
  section: ClientSection;
  next?: ClientSection;
  /** 1-based card to start on. */
  startCard: number;
  solved: ReadonlySet<string>;
  seed: string;
  onSolved: (id: string) => void;
  onPosition: (sectionId: string, card: number) => void;
};

/** One section as a deck of cards, moved through with buttons or the arrow keys. */
export function Deck({ section, next, startCard, solved, seed, onSolved, onPosition }: Props) {
  const cards = useMemo(() => sectionCards(section), [section]);
  const [index, setIndex] = useState(() => clampCard(startCard, cards.length) - 1);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(() => new Set());
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const card = cards[index];
  const blocked = card.kind === "question" && !answered.has(card.question.id) && !solved.has(card.question.id);
  const canBack = index > 0;
  const canForward = index < cards.length - 1 && !blocked;

  function go(dir: -1 | 1) {
    if ((dir === -1 && !canBack) || (dir === 1 && !canForward)) return;
    setIndex(index + dir);
  }

  // Layout effect: focus moves to the new heading before the browser paints, so it can never
  // land after (and steal focus from) whatever the student does next on the new card.
  useLayoutEffect(() => {
    const number = index + 1;
    history.replaceState(null, "", sectionHref(section.id, number));
    onPosition(section.id, number);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, [index]);

  // One listener for the deck's lifetime. It reads the latest `go` through a ref, so a key pressed
  // right after an answer already sees the unlocked state (no gap while effects re-run).
  const latestGo = useRef(go);
  latestGo.current = go;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = navDirection(e);
      if (dir === 0) return;
      e.preventDefault();
      latestGo.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function markAnswered(id: string) {
    setAnswered((a) => new Set([...a, id]));
  }

  return (
    <main class="deck">
      <header class="deck-header">
        <a href="#/">Alla avsnitt</a>
        <p class="deck-title">
          {section.number}. {section.title}
        </p>
        <p class="deck-count" aria-label={`Kort ${index + 1} av ${cards.length}`}>
          {index + 1} / {cards.length}
        </p>
      </header>
      <article class={`card card-${card.kind}${card.kind === "text" ? ` card-${card.block.kind}` : ""}`} aria-labelledby="card-title">
        <h2 id="card-title" tabIndex={-1} ref={heading}>
          {card.title}
        </h2>
        <CardBody
          card={card}
          section={section}
          next={next}
          solved={solved}
          seed={seed}
          onSolved={onSolved}
          onAnswered={markAnswered}
        />
      </article>
      <nav class="deck-nav" aria-label="Kort">
        <button type="button" class="nav-back" disabled={!canBack} onClick={() => go(-1)}>
          ‹ Föregående
        </button>
        {blocked ? <span class="nav-hint">Svara först</span> : null}
        <button type="button" class="nav-forward" disabled={!canForward} onClick={() => go(1)}>
          Nästa ›
        </button>
      </nav>
    </main>
  );
}

type BodyProps = {
  card: Card;
  section: ClientSection;
  next?: ClientSection;
  solved: ReadonlySet<string>;
  seed: string;
  onSolved: (id: string) => void;
  onAnswered: (id: string) => void;
};

function CardBody({ card, section, next, solved, seed, onSolved, onAnswered }: BodyProps) {
  switch (card.kind) {
    case "text":
      return <Html html={card.bodyHtml} className="card-body" />;
    case "concepts":
      return (
        <dl class="concepts">
          {section.newConcepts.map((c) => (
            <div key={c.term}>
              <dt>{c.term}</dt>
              <dd>
                <Html html={c.html} as="span" />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "question":
      return (
        <Question
          key={card.question.id}
          question={card.question}
          seed={seed}
          solved={solved.has(card.question.id)}
          onSolved={onSolved}
          onAnswered={onAnswered}
        />
      );
    case "finish": {
      const done = section.questions.filter((q) => solved.has(q.id)).length;
      return (
        <div class="card-body">
          <p>
            Du har klarat {done} av {section.questions.length} frågor i det här avsnittet.
          </p>
          <p class="finish-links">
            {next ? <a href={sectionHref(next.id)}>Nästa avsnitt: {next.title} ›</a> : null}
            <a href="#/">Till översikten</a>
          </p>
        </div>
      );
    }
  }
}
