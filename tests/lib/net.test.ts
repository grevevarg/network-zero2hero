import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  addressClass,
  broadcastAddress,
  classPrefix,
  compressIPv6,
  eui64,
  expandIPv6,
  formatIPv4,
  fromBinary,
  fromHex,
  hostCount,
  hostRange,
  inSubnet,
  ipv4ToBinary,
  isApipa,
  isContiguousMask,
  isLoopback,
  isPrivate,
  maskToPrefix,
  networkAddress,
  ospfCost,
  parseIPv4,
  prefixToMask,
  splitNetwork,
  toBinary,
  toHex,
  wildcardMask,
} from "../../src/lib/net.ts";

const u32 = fc.integer({ min: 0, max: 0xffffffff });
const prefix = fc.integer({ min: 0, max: 32 });
const ip = (s: string) => parseIPv4(s);

/** Naive reference: compare the first `prefix` bits one by one. */
function naiveSameNet(a: number, b: number, p: number): boolean {
  const bits = (n: number) => n.toString(2).padStart(32, "0");
  return bits(a).slice(0, p) === bits(b).slice(0, p);
}

describe("number bases", () => {
  it("binary and hex round-trip and pad to width", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 255 }), (n) => {
        expect(fromBinary(toBinary(n))).toBe(n);
        expect(toBinary(n)).toHaveLength(8);
        expect(fromHex(toHex(n))).toBe(n);
        expect(toHex(n)).toMatch(/^[0-9A-F]{2}$/);
      }),
    );
    expect(toBinary(10)).toBe("00001010");
    expect(toHex(255)).toBe("FF");
    expect(fromHex("ff")).toBe(255);
  });

  it("rejects values that do not fit and text that is not a number", () => {
    expect(() => toBinary(256)).toThrow(/does not fit/);
    expect(() => toBinary(-1)).toThrow(/does not fit/);
    expect(() => toHex(256)).toThrow(/does not fit/);
    expect(() => fromBinary("102")).toThrow(/not binary/);
    expect(() => fromHex("xy")).toThrow(/not hex/);
  });
});

describe("IPv4", () => {
  it("parse and format are inverses", () => {
    fc.assert(fc.property(u32, (n) => {
      expect(parseIPv4(formatIPv4(n))).toBe(n);
    }));
    expect(parseIPv4(" 192.168.1.10 ")).toBe(0xc0a8010a);
    expect(ipv4ToBinary("192.168.1.10")).toBe("11000000.10101000.00000001.00001010");
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["1.2.3", "1.2.3.4.5", "256.1.1.1", "a.b.c.d", "1..2.3", "1234.1.1.1"]) expect(() => parseIPv4(bad)).toThrow(/not an IPv4/);
    expect(() => formatIPv4(-1)).toThrow(/32-bit/);
    expect(() => formatIPv4(2 ** 32)).toThrow(/32-bit/);
  });

  it("prefix and mask are inverses, and masks are contiguous", () => {
    fc.assert(
      fc.property(prefix, (p) => {
        const mask = prefixToMask(p);
        expect(isContiguousMask(mask)).toBe(true);
        expect(maskToPrefix(mask)).toBe(p);
        expect([...toBinary(mask, 32)].filter((bit) => bit === "1")).toHaveLength(p);
      }),
    );
    expect(formatIPv4(prefixToMask(24))).toBe("255.255.255.0");
    expect(formatIPv4(prefixToMask(26))).toBe("255.255.255.192");
    expect(isContiguousMask(ip("255.0.255.0"))).toBe(false);
    expect(() => maskToPrefix(ip("255.0.255.0"))).toThrow(/contiguous/);
    expect(() => prefixToMask(33)).toThrow(/prefix/);
    expect(() => prefixToMask(1.5)).toThrow(/prefix/);
  });

  it("host count is 2^(32-prefix) - 2 up to /30, with /31 and /32 as special cases", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 30 }), (p) => {
      expect(hostCount(p)).toBe(2 ** (32 - p) - 2);
    }));
    expect(hostCount(24)).toBe(254);
    expect(hostCount(31)).toBe(2);
    expect(hostCount(32)).toBe(1);
  });

  it("network and broadcast bound every address, and membership agrees with a naive reference", () => {
    fc.assert(
      fc.property(u32, u32, prefix, (a, b, p) => {
        const net = networkAddress(a, p);
        const bc = broadcastAddress(a, p);
        expect(net).toBeLessThanOrEqual(a);
        expect(a).toBeLessThanOrEqual(bc);
        expect(bc - net + 1).toBe(2 ** (32 - p));
        expect(inSubnet(b, a, p)).toBe(naiveSameNet(a, b, p));
      }),
    );
    expect(formatIPv4(networkAddress(ip("192.168.10.77"), 26))).toBe("192.168.10.64");
    expect(formatIPv4(broadcastAddress(ip("192.168.10.77"), 26))).toBe("192.168.10.127");
  });

  it("host range skips the network and broadcast addresses", () => {
    fc.assert(
      fc.property(u32, fc.integer({ min: 0, max: 30 }), (a, p) => {
        const [first, last] = hostRange(a, p);
        expect(first).toBe(networkAddress(a, p) + 1);
        expect(last).toBe(broadcastAddress(a, p) - 1);
        expect(last - first + 1).toBe(hostCount(p));
      }),
    );
    expect(() => hostRange(0, 31)).toThrow(/no network/);
  });

  it("splitting gives non-overlapping subnets that cover the network exactly", () => {
    fc.assert(
      fc.property(u32, fc.integer({ min: 16, max: 30 }), fc.integer({ min: 0, max: 4 }), (a, p, extra) => {
        const np = Math.min(32, p + extra);
        const subnets = splitNetwork(a, p, np);
        expect(subnets).toHaveLength(2 ** (np - p));
        expect(subnets[0].network).toBe(networkAddress(a, p));
        subnets.forEach((s, i) => {
          expect(networkAddress(s.network, np)).toBe(s.network);
          if (i > 0) expect(s.network).toBe(broadcastAddress(subnets[i - 1].network, np) + 1);
        });
        expect(broadcastAddress(subnets.at(-1)!.network, np)).toBe(broadcastAddress(a, p));
      }),
    );
    expect(() => splitNetwork(0, 24, 16)).toThrow(/shorter/);
  });

  it("classes, private ranges, loopback and APIPA", () => {
    expect(["10.0.0.1", "127.0.0.1", "128.0.0.1", "191.255.0.1", "192.0.0.1", "223.1.1.1", "224.0.0.1", "240.0.0.1"].map((a) => addressClass(ip(a)))).toEqual([
      "A", "A", "B", "B", "C", "C", "D", "E",
    ]);
    expect(["A", "B", "C", "D", "E"].map((c) => classPrefix(c as "A"))).toEqual([8, 16, 24, undefined, undefined]);
    expect(["10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.0.1"].every((a) => isPrivate(ip(a)))).toBe(true);
    expect(["172.32.0.1", "11.0.0.1", "192.169.0.1", "8.8.8.8"].some((a) => isPrivate(ip(a)))).toBe(false);
    expect(isLoopback(ip("127.5.5.5"))).toBe(true);
    expect(isLoopback(ip("128.0.0.1"))).toBe(false);
    expect(isApipa(ip("169.254.10.20"))).toBe(true);
    expect(isApipa(ip("169.255.0.1"))).toBe(false);
  });
});

describe("IPv6", () => {
  const group = fc.integer({ min: 0, max: 0xffff });
  const full = fc.array(group, { minLength: 8, maxLength: 8 }).map((g) => g.map((n) => n.toString(16).padStart(4, "0")).join(":"));

  it("expand and compress round-trip, and compressing is idempotent", () => {
    fc.assert(
      fc.property(full, (addr) => {
        const short = compressIPv6(addr);
        expect(expandIPv6(short)).toBe(addr);
        expect(compressIPv6(short)).toBe(short);
        expect((short.match(/::/g) ?? []).length).toBeLessThanOrEqual(1);
      }),
    );
  });

  it("follows the canonical short form", () => {
    expect(compressIPv6("2001:0db8:0000:0000:0000:ff00:0042:8329")).toBe("2001:db8::ff00:42:8329");
    expect(compressIPv6("fe80:0000:0000:0000:0202:b3ff:fe1e:8329")).toBe("fe80::202:b3ff:fe1e:8329");
    expect(compressIPv6("2001:db8:0:1:0:0:0:1")).toBe("2001:db8:0:1::1");
    expect(compressIPv6("2001:db8:0:0:1:0:0:1")).toBe("2001:db8::1:0:0:1");
    expect(compressIPv6("2001:db8:1:1:1:1:0:1")).toBe("2001:db8:1:1:1:1:0:1");
    expect(compressIPv6("0:0:0:0:0:0:0:1")).toBe("::1");
    expect(compressIPv6("0:0:0:0:0:0:0:0")).toBe("::");
    expect(expandIPv6("::1")).toBe("0000:0000:0000:0000:0000:0000:0000:0001");
    expect(expandIPv6("FE80::1")).toBe("fe80:0000:0000:0000:0000:0000:0000:0001");
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["1::2::3", "1:2:3", "1:2:3:4:5:6:7:8:9", "1:2:3:4::5:6:7:8", "12345::", "g::1"]) expect(() => expandIPv6(bad)).toThrow();
  });

  it("eui64 puts fffe in the middle and flips the seventh bit", () => {
    expect(eui64("00:1A:2B:3C:4D:5E")).toBe("021a:2bff:fe3c:4d5e");
    expect(eui64("02-00-00-00-00-01")).toBe("0000:00ff:fe00:0001");
    expect(() => eui64("00:1A:2B")).toThrow(/not a MAC/);
    expect(() => eui64("00:1A:2B:3C:4D:ZZ")).toThrow(/not a MAC/);
  });
});

describe("ospfCost", () => {
  it("divides the reference by the speed, rounds down and never goes below 1", () => {
    expect([10e6, 100e6, 1e9, 64e3].map((b) => ospfCost(b))).toEqual([10, 1, 1, 1562]);
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e11 }), (b) => {
        const c = ospfCost(b);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(c)).toBe(true);
        if (b <= 1e8) expect(c).toBe(Math.floor(1e8 / b));
      }),
    );
    expect(() => ospfCost(0)).toThrow(/link speed/);
  });
});

describe("wildcardMask", () => {
  it("is the mask turned inside out: mask + wildcard is all ones", () => {
    expect(formatIPv4(wildcardMask(24))).toBe("0.0.0.255");
    expect(formatIPv4(wildcardMask(26))).toBe("0.0.0.63");
    expect(formatIPv4(wildcardMask(0))).toBe("255.255.255.255");
    fc.assert(
      fc.property(prefix, (p) => {
        expect(prefixToMask(p) + wildcardMask(p)).toBe(0xffffffff);
        expect(prefixToMask(p) & wildcardMask(p)).toBe(0);
      }),
    );
  });
});

