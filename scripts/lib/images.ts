import { createHash } from "node:crypto";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** Chunks needed to draw the image. Everything else (text, EXIF, time, ICC names) is dropped. */
const PNG_KEEP = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB"]);

export function isPng(buf: Uint8Array): boolean {
  return PNG_SIGNATURE.every((b, i) => buf[i] === b);
}

export function isJpeg(buf: Uint8Array): boolean {
  return buf[0] === 0xff && buf[1] === 0xd8;
}

export function stripPngMetadata(buf: Uint8Array): Uint8Array {
  if (!isPng(buf)) throw new Error("not a PNG");
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const parts: Uint8Array[] = [buf.subarray(0, 8)];
  let pos = 8;
  while (pos + 8 <= buf.length) {
    const length = view.getUint32(pos);
    const type = String.fromCharCode(...buf.subarray(pos + 4, pos + 8));
    const end = pos + 12 + length;
    if (end > buf.length) throw new Error("truncated PNG chunk");
    if (PNG_KEEP.has(type)) parts.push(buf.subarray(pos, end));
    pos = end;
    if (type === "IEND") break;
  }
  return concat(parts);
}

/** Drop APP1..APP15 (EXIF, XMP, ...) and COM segments; keep APP0 and everything needed to decode. */
export function stripJpegMetadata(buf: Uint8Array): Uint8Array {
  if (!isJpeg(buf)) throw new Error("not a JPEG");
  const parts: Uint8Array[] = [buf.subarray(0, 2)];
  let pos = 2;
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff) throw new Error("bad JPEG marker");
    const marker = buf[pos + 1];
    if (marker === 0xda) {
      // Start of scan: the rest is image data.
      parts.push(buf.subarray(pos));
      return concat(parts);
    }
    const length = (buf[pos + 2] << 8) | buf[pos + 3];
    const end = pos + 2 + length;
    const isMetadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!isMetadata) parts.push(buf.subarray(pos, end));
    pos = end;
  }
  return concat(parts);
}

export function stripMetadata(buf: Uint8Array): { data: Uint8Array; ext: string } {
  if (isPng(buf)) return { data: stripPngMetadata(buf), ext: "png" };
  if (isJpeg(buf)) return { data: stripJpegMetadata(buf), ext: "jpg" };
  throw new Error("only PNG and JPEG are supported");
}

export function md5Hex(buf: Uint8Array): string {
  return createHash("md5").update(buf).digest("hex");
}

export function hashedName(buf: Uint8Array, ext: string): string {
  return `${md5Hex(buf)}.${ext}`;
}

export const HASHED_NAME = /^([0-9a-f]{32})\.[a-z0-9]+$/;

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}
