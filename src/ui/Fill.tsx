import { useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { fillAnswer } from "../lib/answers.ts";
import type { ClientFill, ClientFillField } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientFill; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };

/** Phone keyboards: digits for numbers and bits, digits with a dot for addresses. */
function inputMode(format: ClientFillField["format"]): "numeric" | "decimal" | "text" {
  return format === "number" || format === "binary" ? "numeric" : format === "ipv4" ? "decimal" : "text";
}

export function Fill({ question: q, onSolved, onAnswered }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean> | undefined>();
  const [showSolution, setShowSolution] = useState(false);
  const solved = checked !== undefined && q.fields.every((f) => checked[f.id]);
  const verdict: Verdict = checked === undefined ? undefined : solved ? "right" : "wrong";
  const complete = q.fields.every((f) => (values[f.id] ?? "").trim() !== "");

  function type(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
    setChecked(undefined);
  }

  function check(e: Event) {
    e.preventDefault();
    const result = Object.fromEntries(q.fields.map((f) => [f.id, matchesKey(q.id, fillAnswer(f.id, values[f.id] ?? "", f.format), f.key)]));
    setChecked(result);
    onAnswered(q.id);
    if (q.fields.every((f) => result[f.id])) onSolved(q.id);
  }

  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      {q.diagramHtml ? <Html html={q.diagramHtml} className="figure" /> : null}
      <ul class="fill">
        {q.fields.map((f) => {
          const state = checked === undefined ? undefined : checked[f.id];
          return (
            <li key={f.id}>
              <label>
                <Html html={f.labelHtml} as="span" />
                <span class="fill-input">
                  <input
                    type="text"
                    inputMode={inputMode(f.format)}
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck={false}
                    value={values[f.id] ?? ""}
                    disabled={solved}
                    aria-invalid={state === false ? "true" : undefined}
                    onInput={(e) => type(f.id, (e.currentTarget as HTMLInputElement).value)}
                  />
                  {state === undefined ? null : <span class={`fill-mark fill-${state ? "right" : "wrong"}`}>{state ? "Rätt" : "Fel"}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {solved ? null : (
        <button type="submit" disabled={!complete}>
          Kontrollera
        </button>
      )}
      <Feedback
        verdict={verdict}
        explanationHtml={q.explanationHtml}
        showExplanation={solved || showSolution}
        wrongHint="Rutorna som är märkta Fel stämmer inte. Ändra och kontrollera igen."
      />
      {verdict === "wrong" && !showSolution ? (
        <button type="button" onClick={() => setShowSolution(true)}>
          Visa lösningen
        </button>
      ) : null}
    </form>
  );
}
