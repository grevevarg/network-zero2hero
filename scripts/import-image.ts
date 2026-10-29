// Local-only: copy an image into public/img/<md5>.<ext> without metadata.
// The original path is recorded in the gitignored review/images.json, never in the repo.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hashedName, stripMetadata } from "./lib/images.ts";

const source = process.argv[2];
if (!source) {
  console.error("usage: npm run import:image -- <image file>");
  process.exit(1);
}
const root = process.cwd();
const { data, ext } = stripMetadata(new Uint8Array(readFileSync(source)));
const name = hashedName(data, ext);
mkdirSync(path.join(root, "public/img"), { recursive: true });
writeFileSync(path.join(root, "public/img", name), data);

const logPath = path.join(root, "review/images.json");
mkdirSync(path.dirname(logPath), { recursive: true });
const log = existsSync(logPath) ? (JSON.parse(readFileSync(logPath, "utf8")) as Record<string, string>) : {};
log[name] = path.resolve(source);
writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
console.log(`img/${name}`);
