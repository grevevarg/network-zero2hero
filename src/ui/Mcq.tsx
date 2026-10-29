import { useMemo, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffle } from "../lib/shuffle.ts";
import type { ClientMcq } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientMcq; seed: string; onSolved: (id: string) => void };

export function Mcq({ question: q, seed, onSolved }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [chosen, setChosen] = useState<string | undefined>();
  const [verdict, setVerdict] = useState<Verdict>();
  const options = useMemo(() => shuffle(q.options, rngFromSeed(`${seed}:${q.id}:${attempt}`)), [q, seed, attempt]);
  const answered = verdict !== undefined;

  async function submit(e: Event) {
    e.preventDefault();
    if (chosen === undefined) return;
    const right = await matchesKey(q.id, chosen, q.key);
    setVerdict(right ? "right" : "wrong");
    if (right) onSolved(q.id);
  }

  function retry() {
    setAttempt((a) => a + 1);
    setChosen(undefined);
    setVerdict(undefined);
  }

  return (
    <form class="question" onSubmit={submit}>
      <fieldset disabled={answered}>
        <legend>
          <Html html={q.promptHtml} />
        </legend>
        {q.diagramSvg ? <Html html={q.diagramSvg} className="figure" /> : null}
        {options.map((o) => (
          <label key={o.id} class={`option${chosen === o.id ? " chosen" : ""}`}>
            <input
              type="radio"
              name={`${q.id}-${attempt}`}
              value={o.id}
              checked={chosen === o.id}
              onChange={() => setChosen(o.id)}
            />
            <Html html={o.html} as="span" />
          </label>
        ))}
      </fieldset>
      {answered ? null : (
        <button type="submit" disabled={chosen === undefined}>
          Svara
        </button>
      )}
      <Feedback verdict={verdict} explanationHtml={q.explanationHtml} showExplanation wrongHint="" />
      {verdict === "wrong" ? (
        <button type="button" onClick={retry}>
          Försök igen
        </button>
      ) : null}
    </form>
  );
}
