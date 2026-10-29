import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "../../src/lib/storage.ts";
import type { ClientCourse } from "../../src/types.ts";
import { App } from "../../src/ui/App.tsx";
import { Feedback } from "../../src/ui/Feedback.tsx";
import { Home } from "../../src/ui/Home.tsx";
import { SectionPage } from "../../src/ui/SectionPage.tsx";
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

describe("Home", () => {
  it("lists sections with progress and resets", () => {
    const onReset = vi.fn();
    render(<Home course={course} solved={new Set(["q2"])} onReset={onReset} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test");
    expect(screen.getByText("0 av 3 frågor klara")).toBeTruthy();
    expect(screen.getByText("1 av 1 frågor klara").closest("li")?.className).toBe("done");
    fireEvent.click(screen.getByRole("button", { name: "Nollställ mina framsteg" }));
    expect(onReset).toHaveBeenCalled();
  });
});

describe("SectionPage", () => {
  it("renders text, concepts, questions and navigation", () => {
    render(<SectionPage section={course.sections[0]} next={course.sections[1]} solved={new Set()} seed="s" onSolved={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Första");
    expect(screen.getByText("Nya begrepp")).toBeTruthy();
    expect(screen.getByText("Förklaring av a.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Andra →" }).getAttribute("href")).toBe("#/avsnitt/s2");
  });

  it("links back and hides the concept list when a section has none", () => {
    const section = { ...course.sections[1], newConcepts: [] };
    render(<SectionPage section={section} previous={course.sections[0]} solved={new Set()} seed="s" onSolved={() => {}} />);
    expect(screen.queryByText("Nya begrepp")).toBeNull();
    expect(screen.getByRole("link", { name: "← Första" })).toBeTruthy();
  });
});

describe("Feedback", () => {
  it("renders nothing before an answer", () => {
    const { container } = render(<Feedback verdict={undefined} showExplanation wrongHint="" />);
    expect(container.innerHTML).toBe("");
  });
});

describe("App", () => {
  it("routes by hash, saves solved questions and resets after confirmation", async () => {
    const confirm = vi.fn(() => false);
    render(<App course={course} storage={localStorage} seed="s" confirmReset={confirm} />);
    await waitFor(() => expect(document.title).toBe("Test"));

    location.hash = "#/avsnitt/s2";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await screen.findByText("Andra", { exact: false, selector: "h1" });
    await waitFor(() => expect(document.title).toBe("Andra · Test"));

    fireEvent.click(screen.getByLabelText(textOf(course, "q2", "two")));
    fireEvent.click(screen.getByRole("button", { name: "Svara" }));
    await screen.findByText("Rätt.");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({ solved: ["q2"] });

    location.hash = "#/";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await screen.findByText("1 av 1 frågor klara");
    fireEvent.click(screen.getByRole("button", { name: "Nollställ mina framsteg" }));
    expect(screen.getByText("1 av 1 frågor klara")).toBeTruthy();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Nollställ mina framsteg" }));
    await screen.findByText("0 av 1 frågor klara");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("shows home for unknown sections", async () => {
    location.hash = "#/avsnitt/finns-inte";
    render(<App course={course} storage={undefined} seed="s" confirmReset={() => true} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test");
    await waitFor(() => expect(document.title).toBe("Okänt avsnitt · Test"));
  });
});
