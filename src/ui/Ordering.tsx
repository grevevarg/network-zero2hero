import { useMemo, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { orderingAnswer } from "../lib/answers.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffleAwayFrom } from "../lib/shuffle.ts";
import { htmlToText } from "../lib/text.ts";
import type { ClientChoice, ClientOrdering } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientOrdering; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };

/** Swap item i with its neighbour in direction dir. Out-of-range moves return the list unchanged. */
export function move<T>(list: readonly T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list.slice();
  const out = list.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

export function Ordering({ question: q, seed, onSolved, onAnswered }: Props) {
  const start = useMemo(() => shuffleAwayFrom(q.items, rngFromSeed(`${seed}:${q.id}`)), [q, seed]);
  const [items, setItems] = useState<ClientChoice[]>(start);
  const [verdict, setVerdict] = useState<Verdict>();
  const solved = verdict === "right";

  function shift(i: number, dir: -1 | 1) {
    setItems((list) => move(list, i, dir));
    setVerdict(undefined);
  }

  function check(e: Event) {
    e.preventDefault();
    const right = matchesKey(q.id, orderingAnswer(items.map((i) => i.id)), q.key);
    setVerdict(right ? "right" : "wrong");
    onAnswered(q.id);
    if (right) onSolved(q.id);
  }

  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      <ol class="ordering">
        {items.map((item, i) => (
          <li key={item.id}>
            <Html html={item.html} as="span" className="ordering-text" />
            <span class="ordering-buttons">
              <button
                type="button"
                aria-label={`Flytta upp: ${htmlToText(item.html)}`}
                disabled={solved || i === 0}
                onClick={() => shift(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Flytta ner: ${htmlToText(item.html)}`}
                disabled={solved || i === items.length - 1}
                onClick={() => shift(i, 1)}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      {solved ? null : <button type="submit">Kontrollera</button>}
      <Feedback
        verdict={verdict}
        explanationHtml={q.explanationHtml}
        showExplanation={solved}
        wrongHint="Flytta om och kontrollera igen."
      />
    </form>
  );
}
