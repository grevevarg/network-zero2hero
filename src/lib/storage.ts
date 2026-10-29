export type Progress = {
  /** Question ids the student has answered correctly at least once. */
  solved: string[];
};

export const STORAGE_KEY = "fntn-progress-v1";

const empty = (): Progress => ({ solved: [] });

function isProgress(value: unknown): value is Progress {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Progress).solved) &&
    (value as Progress).solved.every((s) => typeof s === "string")
  );
}

/** Storage can be missing or throw (private mode, blocked site data), so every access is guarded. */
export function loadProgress(storage: Storage | undefined): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? { solved: [...new Set(parsed.solved)] } : empty();
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
  return { solved: [...progress.solved, questionId] };
}

export function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
