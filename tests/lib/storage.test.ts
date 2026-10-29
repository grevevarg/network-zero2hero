import { afterEach, describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  browserStorage,
  loadProgress,
  markSolved,
  resetProgress,
  saveProgress,
  setPosition,
} from "../../src/lib/storage.ts";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

function throwingStorage(): Storage {
  const fail = () => {
    throw new Error("blocked");
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

describe("storage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips progress", () => {
    const s = memoryStorage();
    saveProgress(s, { solved: ["a", "b"], position: { natverk: 3 } });
    expect(loadProgress(s)).toEqual({ solved: ["a", "b"], position: { natverk: 3 } });
  });

  it("returns empty progress for missing, corrupt or wrongly shaped data", () => {
    const s = memoryStorage();
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
    s.setItem(STORAGE_KEY, "{not json");
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
    s.setItem(STORAGE_KEY, JSON.stringify({ solved: [1, 2] }));
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
    s.setItem(STORAGE_KEY, JSON.stringify(null));
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
    expect(loadProgress(undefined)).toEqual({ solved: [], position: {} });
  });

  it("removes duplicate ids on load", () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ solved: ["a", "a"] }));
    expect(loadProgress(s)).toEqual({ solved: ["a"], position: {} });
  });

  it("never throws when storage is blocked", () => {
    const s = throwingStorage();
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
    expect(() => saveProgress(s, { solved: ["a"], position: {} })).not.toThrow();
    expect(resetProgress(s)).toEqual({ solved: [], position: {} });
  });

  it("reset clears saved progress", () => {
    const s = memoryStorage();
    saveProgress(s, { solved: ["a"], position: {} });
    expect(resetProgress(s)).toEqual({ solved: [], position: {} });
    expect(loadProgress(s)).toEqual({ solved: [], position: {} });
  });

  it("drops invalid positions and tolerates the old shape without positions", () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ solved: ["a"], position: { ok: 2, zero: 0, half: 1.5, text: "3" } }));
    expect(loadProgress(s)).toEqual({ solved: ["a"], position: { ok: 2 } });
    s.setItem(STORAGE_KEY, JSON.stringify({ solved: ["a"], position: [1] }));
    expect(loadProgress(s).position).toEqual({});
  });

  it("setPosition updates only when the card changes", () => {
    const p = setPosition({ solved: [], position: {} }, "s", 4);
    expect(p.position).toEqual({ s: 4 });
    expect(setPosition(p, "s", 4)).toBe(p);
  });

  it("markSolved adds once", () => {
    const p = markSolved({ solved: [], position: {} }, "a");
    expect(p).toEqual({ solved: ["a"], position: {} });
    expect(markSolved(p, "a")).toBe(p);
  });

  it("browserStorage returns localStorage, or undefined when access throws", () => {
    expect(browserStorage()).toBe(globalThis.localStorage);
    vi.stubGlobal("localStorage", undefined);
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    expect(browserStorage()).toBeUndefined();
  });
});
