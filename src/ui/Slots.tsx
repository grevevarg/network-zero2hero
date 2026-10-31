import { useMemo, useRef, useState } from "preact/hooks";
import { matchesKey } from "../lib/answerHash.ts";
import { slotAnswer } from "../lib/answers.ts";
import { rngFromSeed } from "../lib/prng.ts";
import { shuffle } from "../lib/shuffle.ts";
import { htmlToText } from "../lib/text.ts";
import type { ClientSlots } from "../types.ts";
import { floatingRect, isDrag, mostOverlap, type Point, type Rect } from "./drag.ts";
import { Feedback, type Verdict } from "./Feedback.tsx";
import { Html } from "./Html.tsx";

type Props = { question: ClientSlots; seed: string; onSolved: (id: string) => void; onAnswered: (id: string) => void };
type Pick = { kind: "tile"; id: string } | { kind: "slot"; index: number };

/** The row with one slot set (or emptied), leaving the input alone. */
export function setSlot<T>(filled: readonly (T | undefined)[], index: number, value: T | undefined): (T | undefined)[] {
  const out = filled.slice();
  out[index] = value;
  return out;
}

/**
 * A row of empty slots and a tray of tiles. A tile can go in any number of slots.
 * Press a tile, then the slots it goes in; or press a slot, then tiles in order (the slot moves on
 * by itself, which is also the keyboard way). Tiles and filled slots can be dragged to a slot.
 * Dragging a filled slot out into nothing empties it, and so do Delete and Backspace.
 */
export function Slots({ question: q, seed, onSolved, onAnswered }: Props) {
  const tiles = useMemo(() => shuffle(q.blocks, rngFromSeed(`${seed}:${q.id}`)), [q, seed]);
  const html = useMemo(() => new Map(q.blocks.map((b) => [b.id, b.html])), [q]);
  const [filled, setFilled] = useState<(string | undefined)[]>(() => Array.from({ length: q.slots }, () => undefined));
  const [picked, setPicked] = useState<Pick>();
  // Right or wrong per slot after a check. A slot loses its mark when it changes.
  const [marks, setMarks] = useState<(boolean | undefined)[]>([]);
  const [verdict, setVerdict] = useState<Verdict>();
  const [showSolution, setShowSolution] = useState(false);
  const solved = verdict === "right";
  const complete = filled.every((id) => id !== undefined);

  const root = useRef<HTMLDivElement>(null);
  type Drag = { pointerId: number; from: Pick; id: string; start: Point; grabbedAt: Point; w: number; h: number; touch: boolean; moved: boolean };
  const drag = useRef<Drag>(undefined);
  // The floating tile and the slot it would land in: the one it covers most, not the one under the pointer.
  const [ghost, setGhost] = useState<{ id: string; rect: Rect; target: number }>();

  function put(index: number, id: string | undefined) {
    setFilled((f) => setSlot(f, index, id));
    setMarks((m) => setSlot(m, index, undefined));
    setVerdict(undefined);
  }

  function pressTile(id: string) {
    if (solved) return;
    if (picked?.kind === "slot") {
      put(picked.index, id);
      setPicked(picked.index + 1 < q.slots ? { kind: "slot", index: picked.index + 1 } : undefined);
    } else {
      setPicked(picked?.kind === "tile" && picked.id === id ? undefined : { kind: "tile", id });
    }
  }

  function pressSlot(index: number) {
    if (solved) return;
    if (picked?.kind === "tile") put(index, picked.id);
    else setPicked(picked?.kind === "slot" && picked.index === index ? undefined : { kind: "slot", index });
  }

  function key(e: KeyboardEvent, index: number) {
    if (solved || (e.key !== "Delete" && e.key !== "Backspace")) return;
    e.preventDefault();
    put(index, undefined);
  }

  function grab(e: PointerEvent, from: Pick, id: string | undefined) {
    if (solved || e.button !== 0 || id === undefined) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    drag.current = {
      pointerId: e.pointerId,
      from,
      id,
      start: { x: e.clientX, y: e.clientY },
      grabbedAt: { x: e.clientX - r.left, y: e.clientY - r.top },
      w: r.right - r.left,
      h: r.bottom - r.top,
      touch: e.pointerType === "touch",
      moved: false,
    };
  }

  function landing(d: Drag, e: PointerEvent) {
    const rect = floatingRect({ x: e.clientX, y: e.clientY }, d.grabbedAt, d.w, d.h, d.touch);
    const slots = [...(root.current as HTMLDivElement).querySelectorAll<HTMLElement>(".slot")];
    return { id: d.id, rect, target: mostOverlap(rect, slots.map((el) => el.getBoundingClientRect())) };
  }

  function follow(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    if (!d.moved && isDrag(e.clientX - d.start.x, e.clientY - d.start.y)) {
      // Capture only once it is a drag. A tap stays uncaptured, so the button's click handles it.
      d.moved = true;
      root.current?.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) setGhost(landing(d, e));
  }

  function drop(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    drag.current = undefined;
    setGhost(undefined);
    if (e.type === "pointercancel" || !d.moved) return;
    const hit = landing(d, e).target;
    if (d.from.kind === "slot" && d.from.index !== hit) put(d.from.index, undefined);
    if (hit >= 0) put(hit, d.id);
    setPicked(undefined);
  }

  function check(e: Event) {
    e.preventDefault();
    const result = filled.map((id, i) => matchesKey(q.id, slotAnswer(i, id as string), q.keys[i]));
    setMarks(result);
    const ok = result.every(Boolean);
    setVerdict(ok ? "right" : "wrong");
    onAnswered(q.id);
    if (ok) onSolved(q.id);
  }

  const text = (id: string) => htmlToText(html.get(id) as string);
  return (
    <form class="question" onSubmit={check}>
      <Html html={q.promptHtml} className="prompt" />
      {q.diagramHtml ? <Html html={q.diagramHtml} className="figure" /> : null}
      <div class="slots" ref={root} onPointerMove={follow} onPointerUp={drop} onPointerCancel={drop}>
        <ol class="slot-row">
          {filled.map((id, i) => (
            <li key={i}>
              <button
                type="button"
                class={`slot${id === undefined ? "" : " filled"}${ghost?.target === i ? " target" : ""}${marks[i] === undefined ? "" : marks[i] ? " right" : " wrong"}`}
                aria-label={`Ruta ${i + 1}: ${id === undefined ? "tom" : text(id)}${marks[i] === undefined ? "" : marks[i] ? ", rätt" : ", fel"}`}
                aria-pressed={picked?.kind === "slot" && picked.index === i}
                disabled={solved}
                onClick={() => pressSlot(i)}
                onKeyDown={(e) => key(e, i)}
                onPointerDown={(e) => grab(e, { kind: "slot", index: i }, id)}
              >
                {id === undefined ? null : <Html html={html.get(id) as string} as="span" />}
              </button>
              {q.separator && i < q.slots - 1 ? (
                <span class="slot-sep" aria-hidden="true">
                  {q.separator}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        {solved ? null : (
          <>
            <p class="match-hint">
              Dra en bricka till en ruta, eller tryck på brickan och sedan på rutan. Samma bricka kan användas flera gånger.
            </p>
            <ul class="slot-tray">
              {tiles.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    class="slot-tile"
                    aria-pressed={picked?.kind === "tile" && picked.id === t.id}
                    onClick={() => pressTile(t.id)}
                    onPointerDown={(e) => grab(e, { kind: "tile", id: t.id }, t.id)}
                  >
                    <Html html={t.html} as="span" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {ghost ? (
          <span
            class="slot-ghost"
            aria-hidden="true"
            style={{
              left: `${ghost.rect.left}px`,
              top: `${ghost.rect.top}px`,
              width: `${ghost.rect.right - ghost.rect.left}px`,
              height: `${ghost.rect.bottom - ghost.rect.top}px`,
            }}
          >
            <Html html={html.get(ghost.id) as string} as="span" />
          </span>
        ) : null}
      </div>
      {solved ? null : (
        <button type="submit" disabled={!complete}>
          Kontrollera
        </button>
      )}
      <Feedback
        verdict={verdict}
        explanationHtml={q.explanationHtml}
        showExplanation={solved || showSolution}
        wrongHint="Rutorna som är märkta med ✗ stämmer inte. Ändra och kontrollera igen."
      />
      {verdict === "wrong" && !showSolution ? (
        <button type="button" onClick={() => setShowSolution(true)}>
          Visa lösningen
        </button>
      ) : null}
    </form>
  );
}
