// Local-only: drive the built site in headless Chromium and check what tests can't see.
// Phone and desktop, light and dark: every card fits without sideways scrolling, diagrams load,
// no requests to other origins, no console errors. Plus a keyboard pass with question gating.
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
  { name: "phone-light", viewport: { width: 390, height: 844 }, colorScheme: "light" as const },
  { name: "phone-dark", viewport: { width: 390, height: 844 }, colorScheme: "dark" as const },
  { name: "desktop-light", viewport: { width: 1280, height: 900 }, colorScheme: "light" as const },
  { name: "desktop-dark", viewport: { width: 1280, height: 900 }, colorScheme: "dark" as const },
];

try {
  for (const mode of modes) {
    const page = await newPage({ viewport: mode.viewport, colorScheme: mode.colorScheme });
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
    await page.getByRole("button", { name: "Kontrollera" }).focus();
    await page.keyboard.press("Enter");
  } else if ((await radios.count()) > 0) {
    await radios.first().focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Svara" }).focus();
    await page.keyboard.press("Enter");
  } else if ((await page.locator(".ordering").count()) > 0) {
    await page.getByRole("button", { name: "Kontrollera" }).focus();
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
