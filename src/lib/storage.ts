export type Progress = {
  /** Question ids the student has answered correctly at least once. */
  solved: string[];
  /** Last card (1-based) the student looked at, per section id. */
  position: Record<string, number>;
};

export const STORAGE_KEY = "fntn-progress-v1";

const empty = (): Progress => ({ solved: [], position: {} });

function cleanPosition(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, n]) => typeof n === "number" && Number.isInteger(n) && n >= 1),
  ) as Record<string, number>;
}

/** Storage can be missing or throw (private mode, blocked site data), so every access is guarded. */
export function loadProgress(storage: Storage | undefined): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as { solved?: unknown; position?: unknown } | null;
    const solved = parsed?.solved;
    if (!Array.isArray(solved) || !solved.every((s) => typeof s === "string")) return empty();
    return { solved: [...new Set(solved)], position: cleanPosition(parsed?.position) };
  } catch {
    return empty();
  }
}

export function saveProgress(storage: Storage | undefined, progress: Progress): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is a convenience; losing it is fine.
  }
}

export function resetProgress(storage: Storage | undefined): Progress {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore, see saveProgress.
  }
  return empty();
}

export function markSolved(progress: Progress, questionId: string): Progress {
  if (progress.solved.includes(questionId)) return progress;
  return { ...progress, solved: [...progress.solved, questionId] };
}

export function setPosition(progress: Progress, sectionId: string, card: number): Progress {
  if (progress.position[sectionId] === card) return progress;
  return { ...progress, position: { ...progress.position, [sectionId]: card } };
}

export function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
