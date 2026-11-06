import { useState } from "preact/hooks";
import { audit, repairTopology, splitProblems, type Problem } from "../puzzles/audit.ts";
import { describeProblem, repairHint } from "../puzzles/auditText.ts";
import type { ClientRepair, ClientRepairInterface } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientRepair; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };

/** The whole address must stay readable, so a field is as wide as its text and never narrower than a typical address. */
function fieldStyle(i: ClientRepairInterface, value: string) {
  return { left: `${i.left}%`, top: `${i.top}%`, width: `calc(${Math.max(13, value.length)}ch + 0.5rem)` };
}

/**
 * A network with faults in its addressing. Every address is a text field on the picture, and any
 * network that passes the audit is right. Feedback explains only what the student has touched:
 * the planted faults are the task, so the ones left alone are just counted.
 */
export function Repair({ question: q, onSolved, onAnswered }: Props) {
  const start = () => Object.fromEntries(q.interfaces.map((i) => [i.id, i.address]));
  const [values, setValues] = useState<Record<string, string>>(start);
  const [problems, setProblems] = useState<Problem[]>();
  const [showSolution, setShowSolution] = useState(false);
  const solved = problems?.length === 0;
  const verdict: Verdict = problems === undefined ? undefined : solved ? "right" : "wrong";

  const changed = new Set(q.interfaces.filter((i) => values[i.id].trim() !== i.address).map((i) => i.id));
  const { shown, hidden } = splitProblems(problems ?? [], changed);
  const marked = new Set(shown.flatMap((p) => p.interfaces));
  const label = (id: string) => q.interfaces.find((i) => i.id === id)?.label ?? id;

  function type(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
    setProblems(undefined);
  }

  function check(e: Event) {
    e.preventDefault();
    const found = audit(repairTopology(q), values);
    setProblems(found);
    onAnswered(q.id);
    if (found.length === 0) onSolved(q.id);
  }

  function restart() {
    setValues(start());
    setProblems(undefined);
  }

  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      <div class="repair-map">
        <Html html={q.diagramHtml} className="figure" />
        {q.interfaces.map((i) => (
          <span class={`repair-field${marked.has(i.id) ? " wrong" : ""}`} style={fieldStyle(i, values[i.id])} key={i.id}>
            <input
              type="text"
              inputMode="url"
              autocomplete="off"
              autocapitalize="off"
              spellcheck={false}
              aria-label={`Adress för ${i.label}`}
              aria-invalid={marked.has(i.id) ? "true" : undefined}
              value={values[i.id]}
              disabled={solved}
              onInput={(e) => type(i.id, (e.currentTarget as HTMLInputElement).value)}
            />
            {marked.has(i.id) ? <span class="repair-mark" aria-hidden="true">✗</span> : null}
          </span>
        ))}
      </div>
      {solved ? null : (
        <div class="repair-actions">
          <button type="submit" disabled={changed.size === 0}>
            Kontrollera
          </button>
          <button type="button" disabled={changed.size === 0} onClick={restart}>
            Börja om
          </button>
        </div>
      )}
      <Feedback verdict={verdict} explanationHtml={q.explanationHtml} showExplanation={solved || showSolution} wrongHint={repairHint(shown.length, hidden)}>
        {shown.length > 0 ? (
          <ul class="repair-problems">
            {shown.map((p) => (
              <li key={`${p.kind}:${p.interfaces.join()}`}>{describeProblem(p, label)}</li>
            ))}
          </ul>
        ) : null}
      </Feedback>
      {verdict === "wrong" && !showSolution ? (
        <button type="button" onClick={() => setShowSolution(true)}>
          Visa en lösning
        </button>
      ) : null}
    </form>
  );
}
