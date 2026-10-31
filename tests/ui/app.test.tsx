import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { STORAGE_KEY } from "../../src/lib/storage.ts";
import { THEME_KEY } from "../../src/lib/theme.ts";
import { rngFromSeed } from "../../src/lib/prng.ts";
import { shuffle } from "../../src/lib/shuffle.ts";
import type { ClientCourse, ClientMcq } from "../../src/types.ts";
import { App } from "../../src/ui/App.tsx";
import { Deck } from "../../src/ui/Deck.tsx";
import { Feedback } from "../../src/ui/Feedback.tsx";
import { entryHref, Home, menuMove } from "../../src/ui/Home.tsx";
import { ThemePicker } from "../../src/ui/ThemePicker.tsx";
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
  const progress = { solved: ["q2"], position: { s1: 3, s2: 1 } };
  const options = () => within(screen.getByRole("listbox", { name: "Avsnitt" })).getAllByRole("option");
  const selected = () => options().findIndex((o) => o.getAttribute("aria-selected") === "true");
  const list = () => screen.getByRole("listbox", { name: "Avsnitt" });

  it("lists every section as a menu row with progress that reads without colour", () => {
    render(<Home course={course} progress={progress} onReset={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test");
    expect(options().map((o) => o.getAttribute("aria-label"))).toEqual([
      "1. Första, 0 av 3 frågor klara",
      "2. Andra, 1 av 1 frågor klara",
    ]);
    expect(options().map((o) => o.querySelector(".menu-progress")?.textContent)).toEqual(["0/3", "1/1 ✓"]);
    expect(options()[0].querySelector(".menu-number")?.textContent).toBe("01");
    // The first unfinished section starts selected, marked with "> " and not only by colour.
    expect(selected()).toBe(0);
    expect(options()[0].querySelector(".menu-caret")?.textContent).toBe(">");
    expect(options()[1].querySelector(".menu-caret")?.textContent).toBe("");
    expect(list().getAttribute("aria-activedescendant")).toBe(options()[0].id);
    expect(document.activeElement).toBe(list());
    expect(screen.getByText("Använd ↑ ↓ för att välja, Enter för att öppna.")).toBeTruthy();
  });

  it("moves with arrows, j/k, Home and End, and opens with Enter where the reader left off", () => {
    render(<Home course={course} progress={progress} onReset={() => {}} />);
    const press = (key: string, extra = {}) => fireEvent.keyDown(list(), { key, ...extra });
    press("ArrowDown");
    expect(selected()).toBe(1);
    press("ArrowDown");
    expect(selected()).toBe(1);
    press("k");
    expect(selected()).toBe(0);
    press("ArrowUp");
    expect(selected()).toBe(0);
    press("End");
    expect(selected()).toBe(1);
    press("Home");
    expect(selected()).toBe(0);
    press("j");
    press("x");
    press("ArrowUp", { ctrlKey: true });
    expect(selected()).toBe(1);
    // s2 is at its first page, so it opens from the start; s1 is partway through, so it resumes.
    press("Enter");
    expect(location.hash).toBe("#/avsnitt/s2");
    press("ArrowUp");
    press("Enter");
    expect(location.hash).toBe("#/avsnitt/s1/3");
  });

  it("takes keys that land on the page itself, but not those meant for other controls", () => {
    render(<Home course={course} progress={progress} onReset={() => {}} />);
    (document.activeElement as HTMLElement).blur();
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    expect(selected()).toBe(1);
    expect(document.activeElement).toBe(list());
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowUp" });
    expect(selected()).toBe(1);
  });

  it("selects on hover and opens on click", () => {
    render(<Home course={course} progress={{ solved: [], position: {} }} onReset={() => {}} />);
    fireEvent.mouseEnter(options()[1]);
    expect(selected()).toBe(1);
    fireEvent.click(options()[0]);
    expect(location.hash).toBe("#/avsnitt/s1");
  });

  it("starts on the first section when everything is done, and offers reset", () => {
    const onReset = vi.fn();
    render(<Home course={course} progress={{ solved: ["q-mcq", "q-order", "q-match", "q2"], position: {} }} onReset={onReset} />);
    expect(selected()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    expect(onReset).toHaveBeenCalled();
  });

  it("menuMove stays inside the list and ignores other keys", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), fc.nat(), fc.constantFrom("ArrowUp", "ArrowDown", "j", "k", "Home", "End"), (count, i, key) => {
        const next = menuMove(key, i % count, count) as number;
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(count);
      }),
    );
    expect(menuMove("Tab", 0, 3)).toBeUndefined();
  });

  it("entryHref resumes only past the first page", () => {
    const s = course.sections[0];
    expect(entryHref(s, { solved: [], position: {} })).toBe("#/avsnitt/s1");
    expect(entryHref(s, { solved: [], position: { s1: 1 } })).toBe("#/avsnitt/s1");
    expect(entryHref(s, { solved: [], position: { s1: 4 } })).toBe("#/avsnitt/s1/4");
  });
});

describe("ThemePicker", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.restoreAllMocks();
  });

  it("starts on the stored pick, applies and remembers a new one, and can go back to the system", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    localStorage.setItem(THEME_KEY, "noctis");
    render(<ThemePicker storage={localStorage} />);
    const select = screen.getByRole("combobox", { name: "Tema" }) as HTMLSelectElement;
    expect(select.value).toBe("noctis");
    expect([...select.querySelectorAll("optgroup")].map((g) => g.label)).toEqual(["Mörkt", "Ljust"]);
    fireEvent.change(select, { target: { value: "kanagawa-lotus" } });
    expect(document.documentElement.dataset.theme).toBe("kanagawa-lotus");
    expect(localStorage.getItem(THEME_KEY)).toBe("kanagawa-lotus");
    fireEvent.change(select, { target: { value: "system" } });
    expect(document.documentElement.dataset.theme).toBe("solarized-dark");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("follows the system when nothing is stored", () => {
    render(<ThemePicker storage={undefined} />);
    expect((screen.getByRole("combobox", { name: "Tema" }) as HTMLSelectElement).value).toBe("system");
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
    await screen.findByRole("option", { name: "2. Andra, 1 av 1 frågor klara" });
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    expect(screen.getByRole("option", { name: "2. Andra, 1 av 1 frågor klara" })).toBeTruthy();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Rensa sparade svar" }));
    await screen.findByRole("option", { name: "2. Andra, 0 av 1 frågor klara" });
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
    await screen.findByRole("option", { name: "2. Andra, 0 av 1 frågor klara" });
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
