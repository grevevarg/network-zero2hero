import { useMemo, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { matchingAnswer } from "../lib/answers.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffle } from "../lib/shuffle.ts";
import { htmlToText } from "../lib/text.ts";
import type { ClientMatching } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientMatching; seed: string; onSolved: (id: string) => void };

export function Matching({ question: q, seed, onSolved }: Props) {
  const rng = useMemo(() => rngFromSeed(`${seed}:${q.id}`), [q, seed]);
  const left = useMemo(() => shuffle(q.left, rng), [q, rng]);
  const right = useMemo(() => shuffle(q.right, rng), [q, rng]);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<Verdict>();
  const solved = verdict === "right";
  const complete = left.every((l) => chosen[l.id]);

  function pick(leftId: string, rightId: string) {
    setChosen((c) => ({ ...c, [leftId]: rightId }));
    setVerdict(undefined);
  }

  async function check(e: Event) {
    e.preventDefault();
    const right = await matchesKey(q.id, matchingAnswer(q.left.map((l) => l.id), chosen), q.key);
    setVerdict(right ? "right" : "wrong");
    if (right) onSolved(q.id);
  }

  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      <ul class="matching">
        {left.map((l, i) => (
          <li key={l.id}>
            {l.diagramSvg ? <Html html={l.diagramSvg} className="figure" /> : null}
            <label>
              {l.html ? <Html html={l.html} as="span" /> : <span>Bild {i + 1}</span>}
              <select
                value={chosen[l.id] ?? ""}
                disabled={solved}
                onChange={(e) => pick(l.id, (e.currentTarget as HTMLSelectElement).value)}
              >
                <option value="" disabled>
                  Välj …
                </option>
                {right.map((r) => (
                  <option key={r.id} value={r.id}>
                    {htmlToText(r.html)}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
      {solved ? null : (
        <button type="submit" disabled={!complete}>
          Kontrollera
        </button>
      )}
      <Feedback
        verdict={verdict}
        explanationHtml={q.explanationHtml}
        showExplanation={solved}
        wrongHint="Minst en koppling är fel. Ändra och kontrollera igen."
      />
    </form>
  );
}
