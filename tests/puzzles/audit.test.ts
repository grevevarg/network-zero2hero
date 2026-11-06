import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatIPv4, parseIPv4, splitNetwork, subnetsOverlap } from "../../src/lib/net.ts";
import { audit, broadcastDomains, parseCidr, repairTopology, splitProblems, type Addresses, type Problem, type Topology } from "../../src/puzzles/audit.ts";
import { domainCount, interfaces, links, switches, topology } from "../../content/sections/17-slutuppdrag/network.ts";

const FC = { seed: 20261106 };
const broken: Addresses = Object.fromEntries(interfaces.map((i) => [i.id, i.address]));
const reference: Addresses = Object.fromEntries(interfaces.map((i) => [i.id, i.repaired ?? i.address]));
const kinds = (problems: readonly Problem[]) => problems.map((p) => p.kind).sort();
const link: Topology = { switches: [], interfaces: ["a", "b"], links: [["a", "b"]] };
/** Two separate links, for faults that need two broadcast domains. */
const twoLinks: Topology = {
  switches: [],
  interfaces: ["a1", "a2", "b1", "b2"],
  links: [
    ["a1", "a2"],
    ["b1", "b2"],
  ],
};

describe("parseCidr", () => {
  it("reads an address with a prefix and forgives spaces", () => {
    expect(parseCidr("10.0.0.1/27")).toEqual({ ip: parseIPv4("10.0.0.1"), prefix: 27 });
    expect(parseCidr(" 10.0.0.1 / 27 ")).toEqual({ ip: parseIPv4("10.0.0.1"), prefix: 27 });
  });

  it("refuses what is not one", () => {
    for (const bad of ["", "10.0.0.1", "/27", "10.0.0/27", "10.0.0.256/27", "10.0.0.1/33", "10.0.0.1/x", "banan"]) {
      expect(parseCidr(bad), bad).toBeUndefined();
    }
  });

  it("round-trips every address and prefix", () => {
    fc.assert(
      fc.property(fc.nat(0xffffffff), fc.nat(32), (ip, prefix) => {
        expect(parseCidr(`${formatIPv4(ip)}/${prefix}`)).toEqual({ ip, prefix });
      }),
      FC,
    );
  });
});

describe("subnetsOverlap", () => {
  it("agrees with comparing the two address ranges", () => {
    const small = fc.tuple(fc.nat(0xffff), fc.integer({ min: 16, max: 32 }));
    fc.assert(
      fc.property(small, small, ([a, pa], [b, pb]) => {
        const range = (ip: number, p: number) => {
          const size = 2 ** (32 - p);
          const start = Math.floor(ip / size) * size;
          return [start, start + size - 1];
        };
        const [as, ae] = range(a, pa);
        const [bs, be] = range(b, pb);
        expect(subnetsOverlap(a, pa, b, pb)).toBe(as <= be && bs <= ae);
      }),
      FC,
    );
  });
});

describe("broadcastDomains", () => {
  it("counts each LAN and each link between routers, however many switches a LAN has", () => {
    const domains = broadcastDomains(topology).map((d) => d.slice().sort());
    expect(domains).toHaveLength(5);
    expect(domainCount).toBe(5);
    expect(domains).toContainEqual(["pc1-if", "pc2-if", "r1-lan"]);
    expect(domains).toContainEqual(["r1-r2", "r2-r1"]);
  });

  it("counts a switch with nothing on it as a domain", () => {
    expect(broadcastDomains({ switches: ["sw"], interfaces: [], links: [] })).toEqual([[]]);
  });

  it("agrees with a naive flood fill on random networks", () => {
    const network = fc.integer({ min: 1, max: 8 }).chain((n) => {
      const nodes = Array.from({ length: n }, (_, i) => `n${i}`);
      const pick = fc.constantFrom(...nodes);
      return fc.record({
        nodes: fc.constant(nodes),
        cut: fc.nat(n),
        links: fc.array(fc.tuple(pick, pick), { maxLength: 12 }),
      });
    });
    fc.assert(
      fc.property(network, ({ nodes, cut, links }) => {
        const t: Topology = { switches: nodes.slice(0, cut), interfaces: nodes.slice(cut), links };
        const seen = new Set<string>();
        let count = 0;
        for (const start of nodes) {
          if (seen.has(start)) continue;
          count++;
          const todo = [start];
          while (todo.length > 0) {
            const n = todo.pop() as string;
            if (seen.has(n)) continue;
            seen.add(n);
            for (const [a, b] of links) {
              if (a === n) todo.push(b);
              if (b === n) todo.push(a);
            }
          }
        }
        const domains = broadcastDomains(t);
        expect(domains).toHaveLength(count);
        expect(domains.flat().sort()).toEqual(t.interfaces.slice().sort());
      }),
      FC,
    );
  });
});

describe("repair helpers", () => {
  it("reads the topology out of a question", () => {
    expect(repairTopology({ switches, links, interfaces })).toEqual(topology);
  });

  it("explains problems on what was changed and only counts the rest", () => {
    const problems: Problem[] = [
      { kind: "duplicate", interfaces: ["a", "b"] },
      { kind: "overlap", interfaces: ["c", "d"] },
      { kind: "invalid", interfaces: ["e"] },
    ];
    expect(splitProblems(problems, new Set(["b"]))).toEqual({ shown: [problems[0]], hidden: 2 });
    expect(splitProblems(problems, new Set())).toEqual({ shown: [], hidden: 3 });
  });
});

describe("audit", () => {
  it("finds both faults when the ends of a link are in different nets and one is a broadcast address", () => {
    const problems = audit(link, { a: "10.0.0.1/27", b: "10.0.0.127/27" });
    expect(kinds(problems)).toEqual(["broadcast-address", "different-nets"]);
    expect(problems.find((p) => p.kind === "different-nets")?.interfaces.sort()).toEqual(["a", "b"]);
  });

  it("finds only the broadcast address when both ends are in one /25", () => {
    expect(audit(link, { a: "10.0.0.1/25", b: "10.0.0.127/25" })).toEqual([{ kind: "broadcast-address", interfaces: ["b"] }]);
  });

  it("finds a network address, a duplicate, a mask mismatch and a net with no room for hosts", () => {
    expect(kinds(audit(link, { a: "10.0.0.0/30", b: "10.0.0.1/30" }))).toEqual(["network-address"]);
    expect(kinds(audit(link, { a: "10.0.0.1/30", b: "10.0.0.1/30" }))).toEqual(["duplicate"]);
    expect(kinds(audit(link, { a: "10.0.0.1/27", b: "10.0.0.30/28" }))).toEqual(["different-masks"]);
    expect(kinds(audit(link, { a: "10.0.0.0/31", b: "10.0.0.1/31" }))).toEqual(["no-host-room", "no-host-room"]);
  });

  it("reports text that isn't an address, and still checks the rest", () => {
    const problems = audit(twoLinks, { a1: "10.0.0.1/24", a2: "hej", b1: "10.0.0.2/24", b2: "10.0.0.3/24" });
    expect(problems).toContainEqual({ kind: "invalid", interfaces: ["a2"] });
    expect(problems).toContainEqual({ kind: "overlap", interfaces: ["a1", "b1", "b2"] });
    expect(kinds(audit(link, { a: "10.0.0.1/24" }))).toEqual(["invalid"]);
  });

  it("points at the odd one out in a LAN, but at everyone when nobody can tell", () => {
    const lan: Topology = {
      switches: ["sw"],
      interfaces: ["a", "b", "c", "d"],
      links: [["a", "sw"], ["b", "sw"], ["c", "sw"], ["d", "sw"]],
    };
    const base = { a: "10.0.0.1/24", b: "10.0.0.2/24", c: "10.0.0.3/24" };
    expect(audit(lan, { ...base, d: "10.0.1.4/24" })).toEqual([{ kind: "different-nets", interfaces: ["d"] }]);
    const even = audit(lan, { a: "10.0.0.1/24", b: "10.0.0.2/24", c: "10.0.1.3/24", d: "10.0.1.4/24" });
    expect(even).toHaveLength(1);
    expect(even[0].interfaces.sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("sees the same net in two broadcast domains, also with another mask", () => {
    const with27 = audit(twoLinks, { a1: "10.0.0.1/24", a2: "10.0.0.2/24", b1: "10.0.0.1/27", b2: "10.0.0.2/27" });
    expect(kinds(with27)).toEqual(["overlap"]);
  });

  it("does not fall for nets that only look alike", () => {
    expect(audit(twoLinks, { a1: "10.0.0.1/27", a2: "10.0.0.2/27", b1: "10.0.0.33/27", b2: "10.0.0.34/27" })).toEqual([]);
  });

  it("finds exactly the planted faults in the draft scenario, and none in its reference", () => {
    expect(kinds(audit(topology, broken))).toEqual(["broadcast-address", "different-nets", "overlap"]);
    expect(audit(topology, reference)).toEqual([]);
  });

  it("accepts a repair that differs from the reference", () => {
    expect(audit(topology, { ...reference, "r1-r2": "10.0.0.197/30", "r2-r1": "10.0.0.198/30", "r3-lan": "172.16.0.1/24", "pc4-if": "172.16.0.2/24" })).toEqual([]);
  });

  it("passes any plan with one net per domain, and catches a host moved to its broadcast address", () => {
    const plan = fc.tuple(fc.integer({ min: 25, max: 30 }), fc.integer({ min: 2, max: 8 })).map(([prefix, count]) => {
      const nets = splitNetwork(parseIPv4("10.0.0.0"), 24, prefix).slice(0, count);
      const t: Topology = {
        switches: [],
        interfaces: nets.flatMap((_, i) => [`a${i}`, `b${i}`]),
        links: nets.map((_, i): [string, string] => [`a${i}`, `b${i}`]),
      };
      const addresses: Record<string, string> = {};
      nets.forEach((n, i) => {
        addresses[`a${i}`] = `${formatIPv4(n.network + 1)}/${n.prefix}`;
        addresses[`b${i}`] = `${formatIPv4(n.network + 2)}/${n.prefix}`;
      });
      return { t, addresses, last: nets[0].network + 2 ** (32 - nets[0].prefix) - 1, prefix: nets[0].prefix };
    });
    fc.assert(
      fc.property(plan, ({ t, addresses, last, prefix }) => {
        expect(audit(t, addresses)).toEqual([]);
        const bad: Addresses = { ...addresses, b0: `${formatIPv4(last)}/${prefix}` };
        expect(kinds(audit(t, bad))).toEqual(["broadcast-address"]);
      }),
      FC,
    );
  });
});
