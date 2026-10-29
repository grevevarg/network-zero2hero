// Local-only: export changed Excalidraw scenes to public/img/<md5>.svg through the self-hosted Excalidraw.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, type Page } from "playwright-core";
import { md5Hex } from "./lib/images.ts";
import {
  cleanSvg,
  orphanImages,
  pruneManifest,
  sha256,
  sortManifest,
  staleScenes,
  svgSize,
  type Manifest,
} from "./lib/diagrams.ts";
import { localSetting } from "./lib/localConfig.ts";

const root = process.cwd();
const diagramsDir = path.join(root, "diagrams");
const manifestPath = path.join(diagramsDir, "manifest.json");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const scenes = Object.fromEntries(
  walk(diagramsDir)
    .filter((f) => f.endsWith(".excalidraw"))
    .map((f) => [path.relative(diagramsDir, f).replace(/\.excalidraw$/, ""), sha256(readFileSync(f))]),
);
const before: Manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const manifest = pruneManifest(before, scenes);
const stale = staleScenes(scenes, manifest);

function writeManifest() {
  writeFileSync(manifestPath, JSON.stringify(sortManifest(manifest), null, 2) + "\n");
}

/** Ctrl+O sometimes fires before the app listens for it, so focus the canvas and retry. */
async function openScene(page: Page, file: string) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await page.mouse.click(700, 450);
    try {
      const [chooser] = await Promise.all([page.waitForEvent("filechooser", { timeout: 4000 }), page.keyboard.press("Control+o")]);
      await chooser.setFiles(file);
      return;
    } catch {
      await page.waitForTimeout(1000);
    }
  }
  throw new Error(`could not open ${file} in Excalidraw`);
}

if (stale.length > 0) {
  const url = localSetting(root, process.env.EXCALIDRAW_URL, ".excalidraw-url");
  const browserPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
  if (!url) throw new Error("no Excalidraw server: set EXCALIDRAW_URL or write the URL into .excalidraw-url");
  if (!existsSync(browserPath)) throw new Error(`no Chromium at ${browserPath}: set CHROMIUM_PATH`);
  const ok = await fetch(url).then((r) => r.ok, () => false);
  if (!ok) throw new Error(`Excalidraw is not reachable at ${url}`);

  const browser = await chromium.launch({ executablePath: browserPath, args: ["--no-sandbox"] });
  const tmp = path.join(tmpdir(), `diagrams-${process.pid}.svg`);
  try {
    for (const name of stale) {
      const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
      await page.goto(url);
      await page.waitForSelector(".excalidraw");
      await page.waitForTimeout(1500);
      await openScene(page, path.join(diagramsDir, `${name}.excalidraw`));
      await page.waitForTimeout(1000);
      await page.keyboard.press("Control+Shift+e");
      const exportButton = page.getByRole("button", { name: "Export to SVG" });
      await exportButton.waitFor();
      // Transparent background so the image sits on the card colour; light mode (the site inverts it
      // for dark themes); no embedded scene, so nothing but the drawing ships.
      for (const [id, on] of [["exportBackgroundSwitch", false], ["exportDarkModeSwitch", false], ["exportEmbedSwitch", false]] as const) {
        await page.locator(`#${id}`).setChecked(on, { force: true });
      }
      const [download] = await Promise.all([page.waitForEvent("download"), exportButton.click()]);
      await download.saveAs(tmp);
      await page.close();

      const svg = cleanSvg(readFileSync(tmp, "utf8"));
      const image = `img/${md5Hex(Buffer.from(svg))}.svg`;
      mkdirSync(path.join(root, "public/img"), { recursive: true });
      writeFileSync(path.join(root, "public", image), svg);
      manifest[name] = { sourceHash: scenes[name], image, ...svgSize(svg) };
      writeManifest();
      console.log(`exported ${name} -> ${image}`);
    }
  } finally {
    await browser.close();
    rmSync(tmp, { force: true });
  }
}

for (const image of orphanImages(before, manifest)) {
  rmSync(path.join(root, "public", image), { force: true });
  console.log(`removed ${image}`);
}
writeManifest();
console.log(stale.length === 0 ? "diagrams up to date" : `${stale.length} diagram(s) exported`);
