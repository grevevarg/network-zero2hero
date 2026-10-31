// Local-only: drive the built site in headless Chromium and check what tests can't see.
// Phone and desktop, light and dark: every card fits without sideways scrolling, diagrams load,
// no requests to other origins, no console errors. Plus a keyboard pass with question gating, and
// real drags on ordering and line-matching questions: the mouse on desktop, touch on a phone.
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright-core";
import { preview } from "vite";

const root = process.cwd();
const browserPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
if (!existsSync(browserPath)) {
  console.log(`smoke skipped (no Chromium at ${browserPath}; set CHROMIUM_PATH)`);
  process.exit(0);
}
if (!existsSync(path.join(root, "dist/index.html"))) throw new Error("no dist/: run npm run build first");

const shots = path.join(root, "review/screens");
mkdirSync(shots, { recursive: true });
const server = await preview({ root, logLevel: "silent", preview: { port: 4174, strictPort: false } });
const base = server.resolvedUrls?.local[0] ?? "http://localhost:4174/";
const origin = new URL(base).origin;
const browser = await chromium.launch({ executablePath: browserPath, args: ["--no-sandbox"] });
const failures: string[] = [];
const fail = (where: string, what: string) => failures.push(`${where}: ${what}`);

// The site is often opened over plain HTTP on a LAN address, which is not a secure context, so
// APIs like crypto.subtle are missing there. localhost is secure, so hide them to catch any use.
async function newPage(options: Parameters<typeof browser.newPage>[0]) {
  const page = await browser.newPage(options);
  await page.addInitScript(() => Object.defineProperty(globalThis.crypto, "subtle", { value: undefined }));
  return page;
}

const title = (page: Page) => page.locator("#card-title").innerText();
const count = (page: Page) => page.locator(".deck-count").innerText();

async function checkLayout(page: Page, where: string) {
  const r = await page.evaluate(() => ({
    hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    broken: [...document.querySelectorAll<HTMLImageElement>("img.diagram")].filter((i) => !i.complete || i.naturalWidth === 0).length,
  }));
  if (r.hscroll) fail(where, "horizontal scroll");
  if (r.broken > 0) fail(where, `${r.broken} diagram(s) did not load`);
}

const modes = [
  { name: "phone-light", viewport: { width: 390, height: 844 }, colorScheme: "light" as const, hasTouch: true, isMobile: true },
  { name: "phone-dark", viewport: { width: 390, height: 844 }, colorScheme: "dark" as const, hasTouch: true, isMobile: true },
  { name: "desktop-light", viewport: { width: 1280, height: 900 }, colorScheme: "light" as const },
  { name: "desktop-dark", viewport: { width: 1280, height: 900 }, colorScheme: "dark" as const },
];

try {
  for (const mode of modes) {
    const { name: _, ...options } = mode;
    const page = await newPage(options);
    page.on("request", (r) => {
      if (!r.url().startsWith(origin) && !r.url().startsWith("data:")) fail(mode.name, `request to ${r.url()}`);
    });
    page.on("pageerror", (e) => fail(mode.name, `page error: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") fail(mode.name, `console error: ${m.text()}`);
    });

    await page.goto(base);
    await page.waitForSelector(".section-grid");
    await checkLayout(page, `${mode.name} home`);
    await page.screenshot({ path: path.join(shots, `${mode.name}-home.png`) });

    const sections = await page.locator(".section-box-title").count();
    for (let sec = 0; sec < sections; sec++) {
      await page.goto(base);
      await page.waitForSelector(".section-grid");
      await page.locator(".section-box-title").nth(sec).click();
      await page.waitForSelector("#card-title");
      const deck = `${mode.name} §${sec + 1}`;
      // Walk the deck: right arrow until a question blocks, answering questions wrongly to unlock them.
      // The navigation bar must sit in the same place on every card.
      const navTops = new Set<number>();
      for (let step = 0; step < 60; step++) {
        navTops.add(await page.evaluate(() => Math.round(document.querySelector(".deck-nav")?.getBoundingClientRect().top ?? -1)));
        const where = `${deck} card ${await count(page)} "${await title(page)}"`;
        await page.waitForFunction(() => [...document.querySelectorAll("img.diagram")].every((i) => (i as HTMLImageElement).complete));
        await checkLayout(page, where);
        const name = (await title(page)).replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase();
        if (/stjärna|inkapsling|osi-modellen|tcp-ip|fråga-1|avsnittet/.test(name)) {
          await page.screenshot({ path: path.join(shots, `${mode.name}-${sec + 1}-${name}.png`), fullPage: true });
        }
        const forward = page.getByRole("button", { name: "Nästa ›" });
        if (await forward.isDisabled()) {
          if ((await page.locator(".question-body").count()) === 0) break; // finish card
          await dragSomething(page, where, "hasTouch" in mode);
          await answerSomething(page, where);
          if (await forward.isDisabled()) fail(where, "still blocked after answering");
        }
        await page.locator("body").press("ArrowRight");
      }
      if ((await title(page)) !== "Avsnittet är klart") fail(deck, `deck ended on "${await title(page)}"`);
      if (navTops.size !== 1) fail(deck, `navigation bar moved between cards (tops: ${[...navTops].join(", ")})`);
    }
    await page.close();
  }

  // Keyboard only, from the first question card: gating, answering, moving on.
  const page = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base);
  await page.click(".section-box-title");
  await page.waitForSelector("#card-title");
  while ((await page.locator(".question-body").count()) === 0) await page.keyboard.press("ArrowRight");
  const first = await title(page);
  await page.keyboard.press("ArrowRight");
  if ((await title(page)) !== first) fail("keyboard", "ArrowRight skipped an unanswered question");
  await answerSomething(page, "keyboard");
  await page.keyboard.press("ArrowRight");
  if ((await title(page)) === first) fail("keyboard", "ArrowRight did not move on after answering");
  await page.keyboard.press("ArrowLeft");
  if ((await title(page)) !== first) fail("keyboard", "ArrowLeft did not go back");
  await page.close();
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}

/** True when the focused element is fully above the sticky navigation bar. */
async function isClearOfNav(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement?.getBoundingClientRect();
    const nav = document.querySelector(".deck-nav")?.getBoundingClientRect();
    return !el || !nav || el.bottom <= nav.top + 1;
  });
}

type Spot = { x: number; y: number };

/** Press at `from`, move to `to` in small steps and let go, with the mouse or with one finger. */
async function pointerDrag(page: Page, from: Spot, to: Spot, touch: boolean) {
  const steps = 10;
  const at = (i: number) => ({ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
  if (!touch) {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) await page.mouse.move(at(i).x, at(i).y);
    await page.mouse.up();
    return;
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  for (let i = 1; i <= steps; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [at(i)] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

async function centreOf(page: Page, selector: string, nth: number): Promise<Spot> {
  const el = page.locator(selector).nth(nth);
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box) throw new Error(`${selector} #${nth} has no box`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** On ordering and line-matching questions, drag something for real and check that it took. */
async function dragSomething(page: Page, where: string, touch: boolean) {
  const how = touch ? "touch" : "mouse";
  if ((await page.locator(".drag-handle").count()) > 0) {
    const texts = () => page.locator(".ordering-text").allInnerTexts();
    const before = await texts();
    await page.locator(".ordering").scrollIntoViewIfNeeded();
    const from = await centreOf(page, ".drag-handle", 0);
    const to = await centreOf(page, ".ordering li", before.length - 1);
    const scrolled = await page.evaluate(() => scrollY);
    await pointerDrag(page, from, { x: from.x, y: to.y + 5 }, touch);
    const after = await texts();
    if (after.at(-1) !== before[0]) fail(where, `${how} drag did not move the first row to the end (got ${after.join(" / ")})`);
    if ((await page.evaluate(() => scrollY)) !== scrolled) fail(where, `${how} drag on the grip scrolled the page`);
    if ((await page.locator(".dragging").count()) > 0) fail(where, `${how} drag left a row lifted`);
  } else if ((await page.locator(".match-lines").count()) > 0) {
    await page.locator(".match-lines").scrollIntoViewIfNeeded();
    const from = await centreOf(page, '.match-item[data-side="left"] .match-dot', 0);
    const to = await centreOf(page, '.match-item[data-side="right"]', 0);
    await pointerDrag(page, from, to, touch);
    const lines = await page.locator(".match-line:not(.loose)").count();
    if (lines !== 1) fail(where, `${how} drag drew ${lines} line(s), expected 1`);
    const linked = await page.locator('.match-item[data-side="right"]').first().getAttribute("class");
    if (!linked?.includes("linked")) fail(where, `${how} drag did not join the first items`);
  } else {
    return;
  }
  const name = where.replace(/ card .*/, "").replace(/[^\p{L}\p{N}]+/gu, "-");
  await page.screenshot({ path: path.join(shots, `drag-${name}-${await count(page).then((c) => c.replace(/\D+/g, "-"))}.png`), fullPage: true });
}

/** Answer the current question using only the keyboard. Right or wrong does not matter here. */
async function answerSomething(page: Page, where: string) {
  const selects = page.locator(".matching select");
  const radios = page.locator(".question input[type=radio]");
  if ((await selects.count()) > 0) {
    for (let i = 0; i < (await selects.count()); i++) {
      const select = selects.nth(i);
      await select.focus();
      for (let tries = 0; tries < 3 && (await select.inputValue()) === ""; tries++) await page.keyboard.press("ArrowDown");
      if ((await select.inputValue()) === "") fail(where, `select ${i + 1} did not change with ArrowDown`);
      if (!(await isClearOfNav(page))) fail(where, `focused select ${i + 1} is hidden behind the card navigation`);
    }
    await page.getByRole("button", { name: "Kontrollera", exact: true }).focus();
    await page.keyboard.press("Enter");
  } else if ((await radios.count()) > 0) {
    await radios.first().focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Svara", exact: true }).focus();
    await page.keyboard.press("Enter");
  } else if ((await page.locator(".fill input").count()) > 0) {
    const inputs = page.locator(".fill input");
    for (let i = 0; i < (await inputs.count()); i++) {
      await inputs.nth(i).focus();
      await page.keyboard.type("1");
      if (!(await isClearOfNav(page))) fail(where, `focused input ${i + 1} is hidden behind the card navigation`);
    }
    await page.getByRole("button", { name: "Kontrollera", exact: true }).focus();
    await page.keyboard.press("Enter");
  } else if ((await page.locator(".match-lines").count()) > 0) {
    // Press a free item on the left, then a free one on the right, until every left item has a line.
    const free = (side: string) => page.locator(`.match-item[data-side="${side}"]:not(.linked)`);
    for (let guard = 0; guard < 8 && (await free("left").count()) > 0; guard++) {
      for (const side of ["left", "right"]) {
        await free(side).first().focus();
        await page.keyboard.press("Enter");
        if (!(await isClearOfNav(page))) fail(where, `focused ${side} item is hidden behind the card navigation`);
      }
    }
    await page.getByRole("button", { name: "Kontrollera", exact: true }).focus();
    await page.keyboard.press("Enter");
  } else if ((await page.locator(".ordering").count()) > 0) {
    await page.getByRole("button", { name: "Kontrollera", exact: true }).focus();
    await page.keyboard.press("Enter");
  } else {
    fail(where, "unknown question type");
    return;
  }
  try {
    await page.locator(".feedback").waitFor({ timeout: 5000 });
  } catch {
    const file = path.join(shots, `failed-${where.replace(/[^\p{L}\p{N}]+/gu, "-")}.png`);
    await page.screenshot({ path: file, fullPage: true });
    fail(where, `no feedback after answering (see ${path.relative(root, file)})`);
  }
}

if (failures.length > 0) {
  for (const f of failures) console.error(f);
  console.error(`\nsmoke failed with ${failures.length} problem(s); screenshots in review/screens/`);
  process.exit(1);
}
console.log(`smoke ok (${modes.length} modes, keyboard pass); screenshots in review/screens/`);
