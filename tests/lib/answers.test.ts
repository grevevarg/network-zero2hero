import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { fillAnswer, matchingAnswer, normalizeAnswer, orderingAnswer } from "../../src/lib/answers.ts";
import { formatIPv4, toBinary } from "../../src/lib/net.ts";

describe("answer strings", () => {
  it("ordering and matching answers are stable strings", () => {
    expect(orderingAnswer(["a", "b"])).toBe("a,b");
    expect(matchingAnswer(["l1", "l2"], { l1: "r1" })).toBe("l1=r1,l2=");
    expect(fillAnswer("f", " 07 ", "number")).toBe("f=7");
  });
});

describe("normalizeAnswer", () => {
  it("text ignores case and extra spaces", () => {
    expect(normalizeAnswer("  Hej   Där ", "text")).toBe("hej där");
  });

  it("numbers, octets and bits ignore leading zeros and spaces", () => {
    expect(normalizeAnswer(" 0254 ", "number")).toBe("254");
    expect(normalizeAnswer("0", "number")).toBe("0");
    expect(normalizeAnswer("192.168.001.010", "ipv4")).toBe("192.168.1.10");
    expect(normalizeAnswer("192 . 168.1.0", "ipv4")).toBe("192.168.1.0");
    expect(normalizeAnswer("0000 1010", "binary")).toBe("1010");
    expect(normalizeAnswer("0000", "binary")).toBe("0");
  });

  it("ipv6 accepts any valid form of the same address", () => {
    expect(normalizeAnswer("FE80:0000:0000:0000:021A:2BFF:FE3C:4D5E", "ipv6")).toBe("fe80::21a:2bff:fe3c:4d5e");
    expect(normalizeAnswer(" fe80::21a:2bff:fe3c:4d5e ", "ipv6")).toBe("fe80::21a:2bff:fe3c:4d5e");
    expect(normalizeAnswer("fe80::1::2", "ipv6")).toBe("fe80::1::2");
  });

  it("falls back to plain text when the format doesn't parse", () => {
    expect(normalizeAnswer("tolv", "number")).toBe("tolv");
    expect(normalizeAnswer("1.2.3", "ipv4")).toBe("1.2.3");
    expect(normalizeAnswer("102", "binary")).toBe("102");
  });

  it("is idempotent, and accepts the padded forms of any octet or address", () => {
    const formats = ["text", "number", "ipv4", "binary", "ipv6"] as const;
    fc.assert(
      fc.property(fc.string(), fc.constantFrom(...formats), (s, f) => {
        expect(normalizeAnswer(normalizeAnswer(s, f), f)).toBe(normalizeAnswer(s, f));
      }),
    );
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 255 }), (n) => {
        expect(normalizeAnswer(toBinary(n), "binary")).toBe(n.toString(2));
        expect(normalizeAnswer(String(n).padStart(3, "0"), "number")).toBe(String(n));
      }),
    );
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffffffff }), (n) => {
        const padded = formatIPv4(n).split(".").map((o) => o.padStart(3, "0")).join(".");
        expect(normalizeAnswer(padded, "ipv4")).toBe(formatIPv4(n));
      }),
    );
  });
});
