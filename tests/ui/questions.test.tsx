import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildCourse, parseContent } from "../../src/build/course.ts";
import type { ClientCourse, ClientFill, ClientMatching, ClientMcq, ClientOrdering } from "../../src/types.ts";
import { Fill } from "../../src/ui/Fill.tsx";
import { Matching } from "../../src/ui/Matching.tsx";
import { Mcq } from "../../src/ui/Mcq.tsx";
import { move, Ordering } from "../../src/ui/Ordering.tsx";
import { Question } from "../../src/ui/Question.tsx";
import { fill, matching, rawContent, sectionInput, TEXT } from "../fixtures/content.ts";
import { fixtureCourse, textOf } from "./helpers.ts";

let course: ClientCourse;
beforeAll(async () => {
  course = await fixtureCourse();
});
afterEach(cleanup);

const q = <T,>(i: number) => course.sections[0].questions[i] as T;

describe("Mcq", () => {
  it("marks a right answer and reports it", async () => {
    const onSolved = vi.fn();
    render(<Mcq question={q<ClientMcq>(0)} seed="s" onSolved={onSolved} onAnswered={() => {}} />);
    const submit = screen.getByRole("button", { name: "Svara" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(textOf(course, "q-mcq", "two")));
    fireEvent.click(submit);
    await screen.findByText("Rätt.");
    expect(onSolved).toHaveBeenCalledWith("q-mcq");
    expect(screen.getByText(/Två är rätt/)).toBeTruthy();
  });

  it("explains a wrong answer, reports it as answered and lets the student retry", async () => {
    const onSolved = vi.fn();
    const onAnswered = vi.fn();
    render(<Mcq question={q<ClientMcq>(0)} seed="s" onSolved={onSolved} onAnswered={onAnswered} />);
    fireEvent.click(screen.getByLabelText(textOf(course, "q-mcq", "one")));
    fireEvent.click(screen.getByRole("button", { name: "Svara" }));
    await screen.findByText(/Inte riktigt/);
    expect(screen.getByText(/Två är rätt/)).toBeTruthy();
    expect(onSolved).not.toHaveBeenCalled();
    expect(onAnswered).toHaveBeenCalledWith("q-mcq");
    const order = [...document.querySelectorAll(".option")].map((e) => e.textContent);
    fireEvent.click(screen.getByRole("button", { name: "Försök igen" }));
    expect(screen.queryByText(/Inte riktigt/)).toBeNull();
    expect(screen.getByRole("button", { name: "Svara" })).toBeTruthy();
    expect([...document.querySelectorAll(".option")].map((e) => e.textContent)).toEqual(order);
  });

  it("ignores submit with nothing chosen", () => {
    const onSolved = vi.fn();
    const { container } = render(<Mcq question={q<ClientMcq>(0)} seed="s" onSolved={onSolved} onAnswered={() => {}} />);
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("Ordering", () => {
  it("move swaps neighbours and ignores moves past the ends", () => {
    expect(move([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(move([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(move([1, 2, 3], 2, 1)).toEqual([1, 2, 3]);
  });

  async function arrange(target: string[]) {
    for (let pos = 0; pos < target.length; pos++) {
      for (;;) {
        const items = [...document.querySelectorAll(".ordering-text")].map((e) => e.textContent);
        const at = items.indexOf(target[pos]);
        if (at === pos) break;
        fireEvent.click(screen.getByRole("button", { name: `Flytta upp: ${target[pos]}` }));
      }
    }
  }

  it("accepts the right order and rejects others", async () => {
    const onSolved = vi.fn();
    render(<Ordering question={q<ClientOrdering>(1)} seed="s" onSolved={onSolved} onAnswered={() => {}} />);
    const names = ["first", "second", "third"].map((id) => textOf(course, "q-order", id));
    await arrange([names[1], names[0], names[2]]);
    fireEvent.click(screen.getByRole("button", { name: "Kontrollera" }));
    await screen.findByText(/Flytta om/);
    fireEvent.click(screen.getByRole("button", { name: `Flytta ner: ${names[1]}` }));
    expect(screen.queryByText(/Flytta om/)).toBeNull();
    await arrange(names);
    fireEvent.click(screen.getByRole("button", { name: "Kontrollera" }));
    await screen.findByText("Rätt.");
    expect(onSolved).toHaveBeenCalledWith("q-order");
    expect(screen.getByText("Så här är det.")).toBeTruthy();
  });
});

describe("Matching", () => {
  it("needs every select filled, then checks the pairs", async () => {
    const onSolved = vi.fn();
    const question = q<ClientMatching>(2);
    render(<Matching question={question} seed="s" onSolved={onSolved} onAnswered={() => {}} />);
    const check = screen.getByRole("button", { name: "Kontrollera" }) as HTMLButtonElement;
    expect(check.disabled).toBe(true);
    expect(screen.getByText(/Bild \d/)).toBeTruthy();

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const leftIds = [...document.querySelectorAll(".matching li")].map((li, i) => ({ li, i }));
    expect(leftIds).toHaveLength(2);
    const r = (id: string) => [...selects[0].options].find((o) => o.textContent === textOf(course, "q-match", id))?.value as string;

    // Fill wrong first: both get the distractor.
    for (const s of selects) fireEvent.change(s, { target: { value: r("r3") } });
    fireEvent.click(check);
    await screen.findByText(/Minst en koppling/);

    // The text item is l1 (Vänster 1); the diagram item is l2.
    const textIndex = [...document.querySelectorAll(".matching li")].findIndex((li) => li.textContent?.includes("Vänster 1"));
    fireEvent.change(selects[textIndex], { target: { value: r("r1") } });
    fireEvent.change(selects[1 - textIndex], { target: { value: r("r2") } });
    fireEvent.click(check);
    await screen.findByText("Rätt.");
    expect(onSolved).toHaveBeenCalledWith("q-match");
  });
});

/** Lay rows out on a grid: row i of a list is 40px tall at y = 50i, right-hand items sit at x 200-300. */
function mockRects() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const row = this.matches(".ordering li") ? this : this.matches(".match-item") ? this.closest("li") : null;
    const i = row?.parentElement ? [...row.parentElement.children].indexOf(row) : 0;
    const left = this.dataset.side === "right" ? 200 : 0;
    const [x, y, w, h] = row ? [left, i * 50, 100, 40] : [0, 0, 0, 0];
    return { x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) } as DOMRect;
  });
}

describe("Ordering by dragging", () => {
  const texts = () => [...document.querySelectorAll(".ordering-text")].map((e) => e.textContent);
  const list = () => document.querySelector(".ordering") as HTMLElement;

  it("moves the grabbed row to where the pointer is, and only for that pointer", () => {
    const spy = mockRects();
    render(<Ordering question={q<ClientOrdering>(1)} seed="s" onSolved={() => {}} onAnswered={() => {}} />);
    const before = texts();
    const handle = document.querySelectorAll(".drag-handle")[0];
    fireEvent.pointerDown(handle, { pointerId: 1, button: 2, clientY: 20 });
    expect(document.querySelector(".dragging")).toBeNull();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientY: 20 });
    expect(document.querySelector(".dragging .ordering-text")?.textContent).toBe(before[0]);
    fireEvent.pointerMove(list(), { pointerId: 2, clientY: 130 });
    expect(texts()).toEqual(before);
    fireEvent.pointerMove(list(), { pointerId: 1, clientY: 30 });
    expect(texts()).toEqual(before);
    fireEvent.pointerMove(list(), { pointerId: 1, clientY: 130 });
    expect(texts()).toEqual([before[1], before[2], before[0]]);
    expect((document.querySelector(".dragging") as HTMLElement).style.transform).toBe("translateY(110px)");
    fireEvent.pointerUp(list(), { pointerId: 2 });
    expect(document.querySelector(".dragging")).toBeTruthy();
    fireEvent.pointerUp(list(), { pointerId: 1 });
    expect(document.querySelector(".dragging")).toBeNull();
    expect(texts()).toEqual([before[1], before[2], before[0]]);
    spy.mockRestore();
  });

  it("puts everything back when the browser cancels the drag, and hides the grips once solved", async () => {
    const spy = mockRects();
    render(<Ordering question={q<ClientOrdering>(1)} seed="s" onSolved={() => {}} onAnswered={() => {}} />);
    const before = texts();
    fireEvent.pointerDown(document.querySelectorAll(".drag-handle")[2], { pointerId: 1, button: 0, clientY: 120 });
    fireEvent.pointerMove(list(), { pointerId: 1, clientY: -10 });
    expect(texts()[0]).toBe(before[2]);
    fireEvent.pointerCancel(list(), { pointerId: 1 });
    expect(texts()).toEqual(before);

    const names = ["first", "second", "third"].map((id) => textOf(course, "q-order", id));
    for (let n = 0; n < 3 && texts().join() !== names.join(); n++) {
      for (const [to, name] of names.entries()) {
        const from = texts().indexOf(name);
        fireEvent.pointerDown(document.querySelectorAll(".drag-handle")[from], { pointerId: 1, button: 0, clientY: from * 50 + 20 });
        fireEvent.pointerMove(list(), { pointerId: 1, clientY: to * 50 + (to > from ? 30 : 10) });
        fireEvent.pointerUp(list(), { pointerId: 1 });
      }
    }
    expect(texts()).toEqual(names);
    fireEvent.click(screen.getByRole("button", { name: "Kontrollera" }));
    await screen.findByText("Rätt.");
    expect(document.querySelector(".drag-handle")).toBeNull();
    spy.mockRestore();
  });
});

describe("Matching with lines", () => {
  const textQuestion = (): ClientMatching => {
    const raw = rawContent();
    const pairs = [
      { left: { id: "l1", text: "Vänster 1" }, right: { id: "r1", text: "Höger 1" } },
      { left: { id: "l2", text: "Vänster 2" }, right: { id: "r2", text: "Höger 2" } },
    ];
    raw.sections[0] = { section: sectionInput({}, [matching({ pairs } as never)]), text: TEXT };
    return buildCourse(parseContent(raw)).sections[0].questions[0] as ClientMatching;
  };
  const item = (text: string) => screen.getByRole("button", { name: new RegExp(`^${text}`) });
  const box = () => document.querySelector(".match-lines") as HTMLElement;
  const lines = () => document.querySelectorAll(".match-line:not(.loose)").length;
  /** Middle of an item in the mocked layout. */
  const centre = (text: string) => {
    const li = item(text).closest("li") as HTMLElement;
    const i = [...(li.parentElement as HTMLElement).children].indexOf(li);
    return { clientX: item(text).dataset.side === "right" ? 250 : 50, clientY: i * 50 + 20 };
  };
  const dot = (text: string) => item(text).querySelector(".match-dot") as HTMLElement;

  it("joins items by pressing one on each side, and says what each one is joined with", async () => {
    const onSolved = vi.fn();
    render(<Matching question={textQuestion()} seed="s" onSolved={onSolved} onAnswered={() => {}} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    const check = screen.getByRole("button", { name: "Kontrollera" }) as HTMLButtonElement;

    fireEvent.click(item("Vänster 1"));
    expect(item("Vänster 1").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(item("Vänster 1"));
    expect(item("Vänster 1").getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(item("Vänster 1"));
    fireEvent.click(item("Vänster 2"));
    expect(item("Vänster 1").getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(item("Höger 1"));
    expect(item("Vänster 2").textContent).toContain("ihopkopplad med Höger 1");
    expect(item("Höger 1").textContent).toContain("ihopkopplad med Vänster 2");
    expect(check.disabled).toBe(true);

    fireEvent.click(item("Höger 2"));
    fireEvent.click(item("Vänster 1"));
    expect(check.disabled).toBe(false);
    fireEvent.click(check);
    await screen.findByText(/Minst en koppling/);

    // Joining Vänster 1 to Höger 1 takes Höger 1's old line away.
    fireEvent.click(item("Vänster 1"));
    fireEvent.click(item("Höger 1"));
    expect(screen.queryByText(/Minst en koppling/)).toBeNull();
    expect(item("Vänster 2").textContent).not.toContain("ihopkopplad");
    fireEvent.click(item("Vänster 2"));
    fireEvent.click(item("Höger 2"));
    fireEvent.click(check);
    await screen.findByText("Rätt.");
    expect(onSolved).toHaveBeenCalledWith("q-match");
    expect((item("Vänster 1") as HTMLButtonElement).disabled).toBe(true);
  });

  it("draws lines by dragging from a dot, and pulls them out when dropped in empty space", async () => {
    const spy = mockRects();
    render(<Matching question={textQuestion()} seed="s" onSolved={() => {}} onAnswered={() => {}} />);

    // A tap on the dot is left to the click handler: no line, no selection from the pointer alone.
    fireEvent.pointerDown(dot("Vänster 1"), { pointerId: 1, button: 0, ...centre("Vänster 1") });
    fireEvent.pointerUp(box(), { pointerId: 1, ...centre("Vänster 1") });
    expect(lines()).toBe(0);
    expect(item("Vänster 1").getAttribute("aria-pressed")).toBe("false");

    // Wrong button, other pointers and a cancelled drag do nothing.
    fireEvent.pointerDown(dot("Vänster 1"), { pointerId: 1, button: 2, ...centre("Vänster 1") });
    fireEvent.pointerMove(box(), { pointerId: 1, ...centre("Höger 1") });
    expect(document.querySelector(".loose")).toBeNull();
    fireEvent.pointerDown(dot("Vänster 1"), { pointerId: 1, button: 0, ...centre("Vänster 1") });
    fireEvent.pointerMove(box(), { pointerId: 2, ...centre("Höger 1") });
    fireEvent.pointerUp(box(), { pointerId: 2, ...centre("Höger 1") });
    expect(document.querySelector(".loose")).toBeNull();
    fireEvent.pointerMove(box(), { pointerId: 1, ...centre("Höger 1") });
    expect(document.querySelector(".loose")).toBeTruthy();
    fireEvent.pointerCancel(box(), { pointerId: 1 });
    expect(document.querySelector(".loose")).toBeNull();
    expect(lines()).toBe(0);

    // Left to right, then right to left.
    for (const [from, to] of [["Vänster 1", "Höger 1"], ["Höger 2", "Vänster 2"]]) {
      fireEvent.pointerDown(dot(from), { pointerId: 1, button: 0, ...centre(from) });
      fireEvent.pointerMove(box(), { pointerId: 1, ...centre(to) });
      fireEvent.pointerUp(box(), { pointerId: 1, ...centre(to) });
    }
    expect(lines()).toBe(2);
    expect(item("Vänster 2").textContent).toContain("ihopkopplad med Höger 2");

    // Dragging a line out into the gap removes it.
    fireEvent.pointerDown(dot("Höger 2"), { pointerId: 1, button: 0, ...centre("Höger 2") });
    fireEvent.pointerMove(box(), { pointerId: 1, clientX: 150, clientY: 500 });
    fireEvent.pointerUp(box(), { pointerId: 1, clientX: 150, clientY: 500 });
    expect(lines()).toBe(1);
    expect(item("Vänster 2").textContent).not.toContain("ihopkopplad");

    fireEvent.click(item("Vänster 2"));
    fireEvent.click(item("Höger 2"));
    fireEvent.click(screen.getByRole("button", { name: "Kontrollera" }));
    await screen.findByText("Rätt.");
    // Once solved, nothing moves.
    fireEvent.pointerDown(dot("Vänster 1"), { pointerId: 1, button: 0, ...centre("Vänster 1") });
    fireEvent.pointerMove(box(), { pointerId: 1, clientX: 150, clientY: 500 });
    fireEvent.pointerUp(box(), { pointerId: 1, clientX: 150, clientY: 500 });
    expect(lines()).toBe(2);
    spy.mockRestore();
  });
});

describe("Question", () => {
  it("dispatches on kind and shows a badge when solved before", () => {
    const { rerender } = render(<Question question={q(0)} seed="s" solved onSolved={() => {}} onAnswered={() => {}} />);
    expect(screen.getByText("Klarad")).toBeTruthy();
    rerender(<Question question={q(1)} seed="s" solved={false} onSolved={() => {}} onAnswered={() => {}} />);
    expect(screen.queryByText("Klarad")).toBeNull();
    expect(document.querySelector(".ordering")).toBeTruthy();
    rerender(<Question question={q(2)} seed="s" solved={false} onSolved={() => {}} onAnswered={() => {}} />);
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });
});

describe("shuffling", () => {
  it("shows the same option order for the same seed", async () => {
    const order = () => [...document.querySelectorAll(".option")].map((e) => e.textContent);
    render(<Mcq question={q<ClientMcq>(0)} seed="fixed" onSolved={() => {}} onAnswered={() => {}} />);
    const first = order();
    cleanup();
    render(<Mcq question={q<ClientMcq>(0)} seed="fixed" onSolved={() => {}} onAnswered={() => {}} />);
    await waitFor(() => expect(order()).toEqual(first));
  });
});

describe("Fill", () => {
  const fillQuestion = (): ClientFill => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [fill()]), text: TEXT };
    return buildCourse(parseContent(raw)).sections[0].questions[0] as ClientFill;
  };

  it("needs every field, marks each field, offers the solution and accepts padded answers", async () => {
    const onSolved = vi.fn();
    const onAnswered = vi.fn();
    render(<Fill question={fillQuestion()} seed="s" onSolved={onSolved} onAnswered={onAnswered} />);
    const check = screen.getByRole("button", { name: "Kontrollera" }) as HTMLButtonElement;
    const [net, n] = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(net.getAttribute("inputmode")).toBe("decimal");
    expect(n.getAttribute("inputmode")).toBe("numeric");
    expect(check.disabled).toBe(true);

    fireEvent.input(net, { target: { value: "10.0.0.0" } });
    fireEvent.input(n, { target: { value: "255" } });
    fireEvent.click(check);
    await screen.findByText(/Inte riktigt/);
    expect(onAnswered).toHaveBeenCalledWith("q-fill");
    expect(screen.getByText("Rätt")).toBeTruthy();
    expect(screen.getByText("Fel")).toBeTruthy();
    expect(n.getAttribute("aria-invalid")).toBe("true");
    expect(document.querySelector(".explanation")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Visa lösningen" }));
    expect(document.querySelector(".explanation")).toBeTruthy();

    fireEvent.input(n, { target: { value: "0254" } });
    expect(screen.queryByText("Fel")).toBeNull();
    fireEvent.click(check);
    await screen.findByText("Rätt.");
    expect(onSolved).toHaveBeenCalledWith("q-fill");
    expect(net.disabled).toBe(true);
  });

  it("uses a text keyboard for text answers and is dispatched by Question", () => {
    const raw = rawContent();
    raw.sections[0] = { section: sectionInput({}, [fill({ fields: [{ id: "t", label: "Ord", answer: "hej" }] } as never)]), text: TEXT };
    const question = buildCourse(parseContent(raw)).sections[0].questions[0];
    render(<Question question={question} seed="s" solved={false} onSolved={() => {}} onAnswered={() => {}} />);
    expect(screen.getByRole("textbox").getAttribute("inputmode")).toBe("text");
  });
});

