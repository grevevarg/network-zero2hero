import { useMemo, useRef, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { orderingAnswer } from "../lib/answers.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffleAwayFrom } from "../lib/shuffle.ts";
import { htmlToText } from "../lib/text.ts";
import type { ClientChoice, ClientOrdering } from "../types.ts";
import { dropIndex, moveTo } from "./drag.ts";
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
  const list = useRef<HTMLOListElement>(null);
  // The item being dragged, where the pointer grabbed it, and the order to go back to on cancel.
  const drag = useRef<{ pointerId: number; id: string; startY: number; startTop: number; before: ClientChoice[] }>(undefined);
  const [dragging, setDragging] = useState<{ id: string; dy: number }>();

  function shift(i: number, dir: -1 | 1) {
    setItems((list) => move(list, i, dir));
    setVerdict(undefined);
  }

  const rows = () => [...(list.current as HTMLOListElement).children] as HTMLElement[];

  /** Drag by the grip: the list captures the pointer, so the grip can move around in the DOM. */
  function grab(e: PointerEvent, id: string, i: number) {
    if (solved || e.button !== 0) return;
    e.preventDefault();
    list.current?.setPointerCapture?.(e.pointerId);
    drag.current = { pointerId: e.pointerId, id, startY: e.clientY, startTop: rows()[i].offsetTop, before: items };
    setDragging({ id, dy: 0 });
  }

  function follow(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    const els = rows();
    const from = items.findIndex((it) => it.id === d.id);
    const to = dropIndex(e.clientY, els.map((el) => el.getBoundingClientRect()), from);
    if (to !== from) {
      setItems(moveTo(items, from, to));
      setVerdict(undefined);
    }
    // Keep the row under the finger: offsetTop ignores the transform, so this is the row's own slot.
    setDragging({ id: d.id, dy: e.clientY - d.startY - (els[from].offsetTop - d.startTop) });
  }

  function drop(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    if (e.type === "pointercancel") setItems(d.before);
    drag.current = undefined;
    setDragging(undefined);
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
      <ol class="ordering" ref={list} onPointerMove={follow} onPointerUp={drop} onPointerCancel={drop}>
        {items.map((item, i) => (
          <li
            key={item.id}
            class={dragging?.id === item.id ? "dragging" : undefined}
            style={dragging?.id === item.id ? { transform: `translateY(${dragging.dy}px)` } : undefined}
          >
            {solved ? null : <span class="drag-handle" aria-hidden="true" onPointerDown={(e) => grab(e, item.id, i)} />}
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
