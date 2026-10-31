import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "../../src/lib/storage.ts";
import { rngFromSeed } from "../../src/lib/prng.ts";
import { shuffle } from "../../src/lib/shuffle.ts";
import type { ClientCourse, ClientMcq } from "../../src/types.ts";
import { App } from "../../src/ui/App.tsx";
import { Deck } from "../../src/ui/Deck.tsx";
import { Feedback } from "../../src/ui/Feedback.tsx";
import { Home } from "../../src/ui/Home.tsx";
import { fixtureCourse, textOf } from "./helpers.ts";

let course: ClientCourse;
beforeAll(async () => {
  course = await fixtureCourse();
});
afterEach(() => {
  cleanup();
  location.hash = "";
  localStorage.clear();
});

const title = () => screen.getByRole("heading", { level: 2 }).textContent;
const forward = () => screen.getByRole("button", { name: "Nästa ›" }) as HTMLButtonElement;
const back = () => screen.getByRole("button", { name: "‹ Föregående" }) as HTMLButtonElement;
const press = (key: string, target: Element = document.body) => fireEvent.keyDown(target, { key });

describe("Home", () => {
  it("shows a box per section with progress, resume link and reset", () => {
    const onReset = vi.fn();
    render(<Home course={course} progress={{ solved: ["q2"], position: { s1: 3, s2: 1 } }} onReset={onReset} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test");
    expect(screen.getByText("0 av 3 frågor klara")).toBeTruthy();
    expect(screen.getByText("1 av 1 frågor klara").closest("li")?.className).toContain("done");
    const resume = screen.getAllByRole("link", { name: "Fortsätt där du var" });
    expect(resume.map((a) => a.getAttribute("href"))).toEqual(["#/avsnitt/s1/3"]);
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    expect(onReset).toHaveBeenCalled();
  });
});

describe("Deck", () => {
  function renderDeck(over: Partial<Parameters<typeof Deck>[0]> = {}) {
    const onPosition = vi.fn();
    const onSolved = vi.fn();
    render(
      <Deck
        section={course.sections[0]}
        next={course.sections[1]}
        startCard={1}
        solved={new Set()}
        seed="s"
        onSolved={onSolved}
        onPosition={onPosition}
        {...over}
      />,
    );
    return { onPosition, onSolved };
  }

  it("moves with buttons and arrow keys, and records the position in the URL", async () => {
    const { onPosition } = renderDeck();
    expect(title()).toBe("Rubrik");
    expect(screen.getByText("1 / 6")).toBeTruthy();
    expect(back().disabled).toBe(true);
    expect(document.querySelector("figure img.diagram")).toBeTruthy();
    expect(document.querySelector(".card .example")?.textContent).toContain("Ett exempel.");

    fireEvent.click(forward());
    expect(title()).toBe("Nya begrepp");
    expect(screen.getByText("Förklaring av a.")).toBeTruthy();
    await waitFor(() => expect(location.hash).toBe("#/avsnitt/s1/2"));
    expect(onPosition).toHaveBeenLastCalledWith("s1", 2);
    expect(document.activeElement?.id).toBe("card-title");

    fireEvent.click(back());
    expect(title()).toBe("Rubrik");
    press("ArrowLeft");
    expect(title()).toBe("Rubrik");
    press("ArrowRight");
    press("ArrowRight");
    expect(title()).toBe("Fråga 1 av 3");
  });

  it("blocks moving past an unanswered question until it is answered, right or wrong", async () => {
    renderDeck({ startCard: 3 });
    expect(title()).toBe("Fråga 1 av 3");
    expect(forward().disabled).toBe(true);
    expect(screen.getByText("Svara först")).toBeTruthy();
    press("ArrowRight");
    expect(title()).toBe("Fråga 1 av 3");

    // Arrow keys inside the radio group belong to the radios.
    const radio = screen.getByLabelText(textOf(course, "q-mcq", "one"));
    press("ArrowLeft", radio);
    expect(title()).toBe("Fråga 1 av 3");

    fireEvent.click(radio);
    fireEvent.click(screen.getByRole("button", { name: "Svara" }));
    await screen.findByText(/Inte riktigt/);
    expect(forward().disabled).toBe(false);
    fireEvent.click(forward());
    expect(title()).toBe("Fråga 2 av 3");
  });

  it("lets previously solved questions through and ends on a finish card", () => {
    renderDeck({ startCard: 99, solved: new Set(["q-mcq", "q-order"]) });
    expect(title()).toBe("Avsnittet är klart");
    expect(forward().disabled).toBe(true);
    expect(screen.getByText("Du har klarat 2 av 3 frågor i det här avsnittet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Nästa avsnitt: Andra ›" }).getAttribute("href")).toBe("#/avsnitt/s2");
    press("ArrowLeft");
    expect(title()).toBe("Fråga 3 av 3");
    press("ArrowLeft");
    expect(screen.getByText("Klarad")).toBeTruthy();
  });

  it("has no next-section link on the last section", () => {
    renderDeck({ section: course.sections[1], next: undefined, startCard: 99 });
    expect(screen.queryByText(/Nästa avsnitt/)).toBeNull();
    expect(screen.getByRole("link", { name: "Till översikten" })).toBeTruthy();
  });
});

describe("Feedback", () => {
  it("renders nothing before an answer", () => {
    const { container } = render(<Feedback verdict={undefined} showExplanation wrongHint="" />);
    expect(container.innerHTML).toBe("");
  });
});

describe("App", () => {
  it("routes by hash, saves solved questions and positions, and resets after confirmation", async () => {
    const confirm = vi.fn(() => false);
    render(<App course={course} storage={localStorage} seed="s" confirmReset={confirm} />);
    await waitFor(() => expect(document.title).toBe("Test"));

    location.hash = "#/avsnitt/s2/3";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await screen.findByText("Fråga 1 av 1");
    await waitFor(() => expect(document.title).toBe("Andra · Test"));

    fireEvent.click(screen.getByLabelText(textOf(course, "q2", "two")));
    fireEvent.click(screen.getByRole("button", { name: "Svara" }));
    await screen.findByText("Rätt.");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({ solved: ["q2"], position: { s2: 3 } });

    location.hash = "#/";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await screen.findByText("1 av 1 frågor klara");
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    expect(screen.getByText("1 av 1 frågor klara")).toBeTruthy();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    await screen.findByText("0 av 1 frågor klara");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("keeps the option order within a visit and reshuffles after leaving the section", async () => {
    const order = () => [...document.querySelectorAll(".option")].map((e) => e.textContent).join("|");
    const go = (hash: string) => {
      location.hash = hash;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    };
    // The first visit and the first one after coming back use different seeds; find a base seed
    // where those two seeds actually give different orders, so the test can tell them apart.
    const options = (course.sections[1].questions[0] as ClientMcq).options;
    const orderFor = (seed: string) => shuffle(options, rngFromSeed(`${seed}:q2`)).map((o) => o.html).join("|");
    const base = ["a", "b", "c", "d", "e", "f"].find((b) => orderFor(`${b}:1`) !== orderFor(`${b}:3`)) as string;
    expect(base).toBeDefined();

    location.hash = "#/avsnitt/s2/3";
    render(<App course={course} storage={undefined} seed={base} confirmReset={() => true} />);
    const first = order();
    expect(first).toBe(orderFor(`${base}:1`));
    fireEvent.click(back());
    fireEvent.click(forward());
    expect(order()).toBe(first);

    go("#/");
    await screen.findByText("0 av 1 frågor klara");
    go("#/avsnitt/s2/3");
    await screen.findByText("Fråga 1 av 1");
    expect(order()).toBe(orderFor(`${base}:3`));
  });

  it("starts a section on its first card when no card is given", async () => {
    location.hash = "#/avsnitt/s1";
    render(<App course={course} storage={undefined} seed="s" confirmReset={() => true} />);
    expect(title()).toBe("Rubrik");
  });

  it("shows home for unknown sections", async () => {
    location.hash = "#/avsnitt/finns-inte";
    render(<App course={course} storage={undefined} seed="s" confirmReset={() => true} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test");
    await waitFor(() => expect(document.title).toBe("Okänt avsnitt · Test"));
  });
});
