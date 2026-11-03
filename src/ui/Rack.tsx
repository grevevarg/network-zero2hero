import { useRef, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { cellAnswer } from "../lib/answers.ts";
import { RACK_SIDE, rackCell, rackLabel, rackMove } from "../puzzles/rack.ts";
import type { ClientRack } from "../types.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientRack; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };

const SIDE = Array.from({ length: RACK_SIDE }, (_, i) => i + 1);

/**
 * A rack seen from the front as a 10 x 10 grid. Only the top-left cell shows its number, so the
 * student has to count to find a cell. Click or tap a cell, or move with the arrow keys and press
 * Enter, then check. A wrong check says which number the chosen cell has.
 */
export function Rack({ question: q, onSolved, onAnswered }: Props) {
  const [chosen, setChosen] = useState<number>();
  // The one cell in the tab order (roving tabindex): the chosen cell, or the first one.
  const [focus, setFocus] = useState(1);
  const [verdict, setVerdict] = useState<Verdict>();
  const [showSolution, setShowSolution] = useState(false);
  const solved = verdict === "right";
  const grid = useRef<HTMLDivElement>(null);

  function choose(cell: number) {
    if (solved) return;
    setChosen(cell);
    setFocus(cell);
    setVerdict(undefined);
  }

  function key(e: KeyboardEvent) {
    const next = rackMove(focus, e.key);
    if (next === undefined) return;
    e.preventDefault();
    setFocus(next);
    grid.current?.querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)?.focus();
  }

  function check(e: Event) {
    e.preventDefault();
    if (chosen === undefined) return;
    const right = matchesKey(q.id, cellAnswer(chosen), q.key);
    setVerdict(right ? "right" : "wrong");
    onAnswered(q.id);
    if (right) onSolved(q.id);
  }

  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      <div class="rack" role="grid" aria-label="Racket framifrån, tio gånger tio rutor" ref={grid} data-arrows onKeyDown={key}>
        {SIDE.map((row) => (
          <div class="rack-row" role="row" key={row}>
            {SIDE.map((col) => {
              const cell = rackCell(row, col);
              const mark = chosen === cell ? verdict : undefined;
              return (
                <div class="rack-cell" role="gridcell" key={cell}>
                  <button
                    type="button"
                    data-cell={cell}
                    class={mark ?? (chosen === cell ? "chosen" : undefined)}
                    tabIndex={focus === cell ? 0 : -1}
                    aria-pressed={chosen === cell}
                    aria-label={`Rad ${row} uppifrån, ruta ${col} från vänster${cell === 1 ? ", märkt 01" : ""}`}
                    disabled={solved && chosen !== cell}
                    onClick={() => choose(cell)}
                  >
                    {mark === "right" ? "✓" : mark === "wrong" ? "✗" : cell === 1 ? rackLabel(1) : null}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {solved ? null : (
        <button type="submit" disabled={chosen === undefined}>
          Kontrollera
        </button>
      )}
      <Feedback
        verdict={verdict}
        explanationHtml={q.explanationHtml}
        showExplanation={solved || showSolution}
        wrongHint={`Du valde ruta ${rackLabel(chosen ?? 1)}. Välj en annan ruta och kontrollera igen.`}
      />
      {verdict === "wrong" && !showSolution ? (
        <button type="button" onClick={() => setShowSolution(true)}>
          Visa lösningen
        </button>
      ) : null}
    </form>
  );
}
