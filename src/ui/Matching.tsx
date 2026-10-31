import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { matchingAnswer } from "../lib/answers.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffle } from "../lib/shuffle.ts";
import { htmlToText } from "../lib/text.ts";
import type { ClientChoice, ClientMatching } from "../types.ts";
import { connect, disconnect, edgePoint, hitTest, isDrag, type Point } from "./drag.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientMatching; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };
type Side = "left" | "right";
type Body = Props & { left: ClientMatching["left"]; right: ClientChoice[]; chosen: Record<string, string>; solved: boolean };

/** Matching with pictures keeps dropdowns. Text-only matching draws lines between the two columns. */
export function Matching(props: Props) {
  const { question: q, seed, onSolved, onAnswered } = props;
  const rng = useMemo(() => rngFromSeed(`${seed}:${q.id}`), [q, seed]);
  const left = useMemo(() => shuffle(q.left, rng), [q, rng]);
  const right = useMemo(() => shuffle(q.right, rng), [q, rng]);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<Verdict>();
  const solved = verdict === "right";
  const complete = left.every((l) => chosen[l.id]);
  const pictures = q.left.some((l) => l.diagramHtml);

  function change(next: Record<string, string>) {
    setChosen(next);
    setVerdict(undefined);
  }

  function check(e: Event) {
    e.preventDefault();
    const ok = matchesKey(q.id, matchingAnswer(q.left.map((l) => l.id), chosen), q.key);
    setVerdict(ok ? "right" : "wrong");
    onAnswered(q.id);
    if (ok) onSolved(q.id);
  }

  const body: Body = { ...props, left, right, chosen, solved };
  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      {pictures ? (
        <Dropdowns {...body} pick={(l, r) => change({ ...chosen, [l]: r })} />
      ) : (
        <Lines {...body} change={change} />
      )}
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

function Dropdowns({ left, right, chosen, solved, pick }: Body & { pick: (left: string, right: string) => void }) {
  return (
    <ul class="matching">
      {left.map((l, i) => (
        <li key={l.id}>
          {l.diagramHtml ? <Html html={l.diagramHtml} className="figure" /> : null}
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
  );
}

/**
 * Two columns with a dot on each item. Drag from a dot to an item on the other side, or press one
 * item and then one on the other side (this is also the keyboard way). Pressing a pair that is
 * already joined, or dragging a line out into nothing, removes the line.
 */
function Lines({ left, right, chosen, solved, change }: Body & { change: (next: Record<string, string>) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Record<string, Point>>({});
  const [selected, setSelected] = useState<{ side: Side; id: string }>();
  const drag = useRef<{ pointerId: number; side: Side; id: string; start: Point; moved: boolean }>(undefined);
  const [loose, setLoose] = useState<{ from: Point; to: Point }>();
  const textOf = useMemo(() => new Map([...left, ...right].map((c) => [c.id, htmlToText(c.html ?? "")])), [left, right]);
  const partner = (side: Side, id: string) =>
    side === "left" ? chosen[id] : Object.keys(chosen).find((l) => chosen[l] === id);

  const items = (side: Side) => [...(box.current as HTMLDivElement).querySelectorAll<HTMLElement>(`.match-item[data-side="${side}"]`)];
  const origin = () => (box.current as HTMLDivElement).getBoundingClientRect();

  // Where each line ends: the inner edge of each item. Measured again whenever the box changes size.
  useLayoutEffect(() => {
    const measure = () => {
      const o = origin();
      const at = (side: Side, inner: Side) =>
        items(side).map((el) => [`${side}:${el.dataset.id}`, edgePoint(el.getBoundingClientRect(), o, inner)] as const);
      setPoints(Object.fromEntries([...at("left", "right"), ...at("right", "left")]));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box.current as HTMLDivElement);
    return () => observer.disconnect();
  }, [left, right]);

  function join(side: Side, id: string, otherId: string) {
    change(side === "left" ? connect(chosen, id, otherId) : connect(chosen, otherId, id));
    setSelected(undefined);
  }

  function press(side: Side, id: string) {
    if (solved) return;
    if (selected && selected.side !== side) join(selected.side, selected.id, id);
    else setSelected(selected?.id === id ? undefined : { side, id });
  }

  function relative(e: PointerEvent): Point {
    const o = origin();
    return { x: e.clientX - o.left, y: e.clientY - o.top };
  }

  function grab(e: PointerEvent, side: Side, id: string) {
    if (solved || e.button !== 0) return;
    e.preventDefault();
    drag.current = { pointerId: e.pointerId, side, id, start: relative(e), moved: false };
  }

  function follow(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    const to = relative(e);
    if (!d.moved && isDrag(to.x - d.start.x, to.y - d.start.y)) {
      // Capture only once it is a drag. A tap stays uncaptured, so the item's own click handles it.
      d.moved = true;
      box.current?.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) setLoose({ from: points[`${d.side}:${d.id}`], to });
  }

  function drop(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    drag.current = undefined;
    setLoose(undefined);
    // A tap without moving is left to the item's click handler.
    if (e.type === "pointercancel" || !d.moved) return;
    const other: Side = d.side === "left" ? "right" : "left";
    const targets = items(other);
    const hit = hitTest({ x: e.clientX, y: e.clientY }, targets.map((el) => el.getBoundingClientRect()));
    if (hit >= 0) join(d.side, d.id, targets[hit].dataset.id as string);
    else change(disconnect(chosen, d.side, d.id));
  }

  const column = (side: Side, list: ClientChoice[]) => (
    <ul class={`match-col match-${side}`}>
      {list.map((c) => {
        const mate = partner(side, c.id);
        return (
          <li key={c.id}>
            <button
              type="button"
              class={`match-item${mate ? " linked" : ""}`}
              data-side={side}
              data-id={c.id}
              aria-pressed={selected?.id === c.id}
              disabled={solved}
              onClick={() => press(side, c.id)}
            >
              <Html html={c.html} as="span" />
              {mate ? <span class="sr-only">, ihopkopplad med {textOf.get(mate)}</span> : null}
              <span class="match-dot" aria-hidden="true" onPointerDown={(e) => grab(e, side, c.id)} />
            </button>
          </li>
        );
      })}
    </ul>
  );

  const line = (a: Point | undefined, b: Point | undefined, key: string, cls: string) =>
    a && b ? <line key={key} class={cls} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null;

  return (
    <>
      <p class="match-hint">Dra från en punkt till det som hör ihop med den, eller tryck på båda.</p>
      <div class="match-lines" ref={box} onPointerMove={follow} onPointerUp={drop} onPointerCancel={drop}>
        {column("left", left as ClientChoice[])}
        {column("right", right)}
        <svg class="match-svg" aria-hidden="true">
          {Object.entries(chosen).map(([l, r]) => line(points[`left:${l}`], points[`right:${r}`], l, "match-line"))}
          {loose ? line(loose.from, loose.to, "loose", "match-line loose") : null}
        </svg>
      </div>
    </>
  );
}
