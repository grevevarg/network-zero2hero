import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  HASHED_NAME,
  hashedName,
  isJpeg,
  isPng,
  md5Hex,
  stripJpegMetadata,
  stripMetadata,
  stripPngMetadata,
} from "../../scripts/lib/images.ts";

function chunk(type: string, data: number[]): number[] {
  const len = data.length;
  // CRC is not checked by the stripper, so zeros are fine here.
  return [(len >>> 24) & 255, (len >>> 16) & 255, (len >>> 8) & 255, len & 255, ...[...type].map((c) => c.charCodeAt(0)), ...data, 0, 0, 0, 0];
}

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const png = (...chunks: number[][]) => new Uint8Array([...SIG, ...chunks.flat()]);
const text = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("PNG metadata", () => {
  it("drops text, EXIF and time chunks and keeps image chunks", () => {
    const input = png(chunk("IHDR", [1, 2]), chunk("tEXt", text("Author\0Someone")), chunk("eXIf", [9]), chunk("tIME", [1]), chunk("IDAT", [5, 6]), chunk("IEND", []));
    const out = stripPngMetadata(input);
    expect(isPng(out)).toBe(true);
    expect(Buffer.from(out).includes("Someone")).toBe(false);
    expect(out).toEqual(png(chunk("IHDR", [1, 2]), chunk("IDAT", [5, 6]), chunk("IEND", [])));
  });

  it("rejects non-PNG and truncated input", () => {
    expect(() => stripPngMetadata(new Uint8Array([1, 2, 3]))).toThrow(/not a PNG/);
    expect(() => stripPngMetadata(new Uint8Array([...SIG, 0, 0, 0, 50, 73, 72, 68, 82]))).toThrow(/truncated/);
  });
});

describe("JPEG metadata", () => {
  const seg = (marker: number, data: number[]) => [0xff, marker, ((data.length + 2) >> 8) & 255, (data.length + 2) & 255, ...data];

  it("drops APP1-APP15 and comments, keeps APP0 and scan data", () => {
    const input = new Uint8Array([0xff, 0xd8, ...seg(0xe0, [1]), ...seg(0xe1, text("Exif secret")), ...seg(0xfe, text("comment")), ...seg(0xdb, [2]), 0xff, 0xda, 7, 7, 0xff, 0xd9]);
    const out = stripJpegMetadata(input);
    expect(isJpeg(out)).toBe(true);
    expect(Buffer.from(out).includes("secret")).toBe(false);
    expect(Buffer.from(out).includes("comment")).toBe(false);
    expect(out).toEqual(new Uint8Array([0xff, 0xd8, ...seg(0xe0, [1]), ...seg(0xdb, [2]), 0xff, 0xda, 7, 7, 0xff, 0xd9]));
  });

  it("handles a JPEG without scan data and rejects bad input", () => {
    expect(stripJpegMetadata(new Uint8Array([0xff, 0xd8, ...seg(0xe1, [1])]))).toEqual(new Uint8Array([0xff, 0xd8]));
    expect(() => stripJpegMetadata(new Uint8Array([0, 0]))).toThrow(/not a JPEG/);
    expect(() => stripJpegMetadata(new Uint8Array([0xff, 0xd8, 1, 2, 3, 4]))).toThrow(/bad JPEG marker/);
  });
});

describe("stripMetadata and naming", () => {
  it("dispatches on file type", () => {
    expect(stripMetadata(png(chunk("IEND", []))).ext).toBe("png");
    expect(stripMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xda])).ext).toBe("jpg");
    expect(() => stripMetadata(new Uint8Array([1, 2, 3, 4]))).toThrow(/only PNG and JPEG/);
  });

  it("names files by the md5 of their contents", () => {
    const data = new Uint8Array([1, 2, 3]);
    expect(md5Hex(data)).toBe(createHash("md5").update(data).digest("hex"));
    expect(hashedName(data, "png")).toMatch(HASHED_NAME);
  });

  it("every shipped image is named by the md5 of its contents", () => {
    const dir = "public/img";
    const files = existsSync(dir) ? readdirSync(dir) : [];
    for (const f of files) {
      const m = HASHED_NAME.exec(f);
      expect(m, f).not.toBeNull();
      expect(md5Hex(readFileSync(`${dir}/${f}`))).toBe(m?.[1]);
    }
  });
});
