import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  cleanSvg,
  orphanImages,
  pruneManifest,
  sha256,
  sortManifest,
  staleScenes,
  svgSize,
  type Manifest,
} from "../../scripts/lib/diagrams.ts";
import { localSetting } from "../../scripts/lib/localConfig.ts";

const entry = (image: string, sourceHash = "h") => ({ sourceHash, image, width: 1, height: 1 });

describe("cleanSvg", () => {
  it("drops the source marker, metadata, doctype and xml declaration", () => {
    const raw = `<?xml version="1.0"?>\n<!DOCTYPE svg PUBLIC "x" "y">\n<svg width="10" height="20"><!-- svg-source:excalidraw --><metadata><!-- payload --></metadata><g/></svg>`;
    expect(cleanSvg(raw)).toBe('<svg width="10" height="20"><g/></svg>\n');
  });
});

describe("svgSize", () => {
  it("reads width/height, falling back to the viewBox", () => {
    expect(svgSize('<svg width="10.4" height="20">')).toEqual({ width: 10, height: 20 });
    expect(svgSize('<svg viewBox="0 0 300 150.6">')).toEqual({ width: 300, height: 151 });
    expect(() => svgSize("<svg>")).toThrow(/no size/);
  });
});

describe("manifest helpers", () => {
  const manifest: Manifest = { a: entry("img/1.svg", "ha"), b: entry("img/2.svg", "hb") };

  it("finds changed and new scenes", () => {
    expect(staleScenes({ a: "ha", b: "changed", c: "hc" }, manifest)).toEqual(["b", "c"]);
  });

  it("finds images nobody uses any more", () => {
    expect(orphanImages(manifest, { a: entry("img/1.svg"), b: entry("img/3.svg") })).toEqual(["img/2.svg"]);
  });

  it("prunes deleted scenes and sorts by name", () => {
    expect(pruneManifest(manifest, { b: "hb" })).toEqual({ b: manifest.b });
    expect(Object.keys(sortManifest({ z: entry("z"), a: entry("a"), m: entry("m"), a2: entry("a2") }))).toEqual(["a", "a2", "m", "z"]);
  });

  it("sha256 hashes text and bytes the same way", () => {
    expect(sha256("abc")).toBe(sha256(new TextEncoder().encode("abc")));
  });
});

describe("localSetting", () => {
  it("prefers the environment, then a trimmed file, else undefined", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "setting-"));
    expect(localSetting(root, "from-env", ".x")).toBe("from-env");
    expect(localSetting(root, undefined, ".x")).toBeUndefined();
    await writeFile(path.join(root, ".x"), "  from-file \n");
    expect(localSetting(root, undefined, ".x")).toBe("from-file");
    await writeFile(path.join(root, ".x"), "\n");
    expect(localSetting(root, undefined, ".x")).toBeUndefined();
  });
});
