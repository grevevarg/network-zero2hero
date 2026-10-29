import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildCourse, parseContent } from "../../src/build/course.ts";
import type { ClientCourse, ClientFill, ClientMatching, ClientMcq, ClientOrdering } from "../../src/types.ts";
import { Fill } from "../../src/ui/Fill.tsx";
import { Matching } from "../../src/ui/Matching.tsx";
import { Mcq } from "../../src/ui/Mcq.tsx";
import { move, Ordering } from "../../src/ui/Ordering.tsx";
import { Question } from "../../src/ui/Question.tsx";
import { fill, rawContent, sectionInput, TEXT } from "../fixtures/content.ts";
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

