import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** A machine-specific setting: environment variable first, then a gitignored one-line file in the repo root. */
export function localSetting(root: string, env: string | undefined, file: string): string | undefined {
  if (env) return env;
  const full = path.join(root, file);
  return existsSync(full) ? readFileSync(full, "utf8").trim() || undefined : undefined;
}
