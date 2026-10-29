import { createHash } from "node:crypto";
import fc from "fast-check";
import { afterEach, describe, expect, it, vi } from "vitest";
import { answerKey, matchesKey, sha256Hex } from "../../src/lib/answerHash.ts";

describe("answerHash", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sha256Hex matches the FIPS 180-4 test vectors", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("sha256Hex agrees with node:crypto for any string, across block boundaries", () => {
    fc.assert(
      fc.property(fc.string({ unit: "grapheme", maxLength: 200 }), (s) => {
        expect(sha256Hex(s)).toBe(createHash("sha256").update(s, "utf8").digest("hex"));
      }),
    );
  });

  it("works without crypto.subtle (plain HTTP on a LAN address is not a secure context)", () => {
    vi.stubGlobal("crypto", {});
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("answerKey depends on both question and answer", () => {
    const k = answerKey("q1", "a");
    expect(k).toMatch(/^[0-9a-f]{64}$/);
    expect(answerKey("q1", "a")).toBe(k);
    expect(answerKey("q2", "a")).not.toBe(k);
    expect(answerKey("q1", "b")).not.toBe(k);
  });

  it("matchesKey accepts only the right answer", () => {
    const key = answerKey("q1", "right");
    expect(matchesKey("q1", "right", key)).toBe(true);
    expect(matchesKey("q1", "wrong", key)).toBe(false);
  });
});
