import { broadcastAddress, networkAddress, parseIPv4, subnetsOverlap } from "../lib/net.ts";

/**
 * A finished layer 3 network to review. Switches join everything connected to them. A router port
 * or a host is an interface, and only a link joins interfaces: a router never joins its own ports,
 * which is what splits broadcast domains.
 */
export type Topology = {
  switches: readonly string[];
  interfaces: readonly string[];
  /** Each end is a switch id or an interface id. */
  links: readonly (readonly [string, string])[];
};

/** What the student sees and edits: interface id -> text like "10.0.0.1/27". */
export type Addresses = Readonly<Record<string, string>>;

export type ProblemKind =
  | "invalid" // Not an address with a prefix.
  | "no-host-room" // /31 or /32: no room for a network and a broadcast address.
  | "network-address" // The net's own network address, on a host or port.
  | "broadcast-address" // The net's broadcast address, on a host or port.
  | "duplicate" // The same address twice in a broadcast domain.
  | "different-nets" // One broadcast domain holds several nets with the same mask.
  | "different-masks" // One broadcast domain holds several masks.
  | "overlap"; // Two broadcast domains share addresses.

export type Problem = { kind: ProblemKind; interfaces: string[] };

export type Cidr = { ip: number; prefix: number };

/** "10.0.0.1/27", with stray spaces allowed. Undefined for anything else, since students type this. */
export function parseCidr(text: string): Cidr | undefined {
  const m = /^\s*([\d.]+)\s*\/\s*(\d{1,2})\s*$/.exec(text);
  if (!m || Number(m[2]) > 32) return undefined;
  try {
    return { ip: parseIPv4(m[1]), prefix: Number(m[2]) };
  } catch {
    return undefined;
  }
}

/** Interface ids per broadcast domain. A switch with nothing on it still counts as a domain of its own. */
export function broadcastDomains(t: Topology): string[][] {
  const parent = new Map<string, string>([...t.switches, ...t.interfaces].map((n) => [n, n]));
  const find = (n: string): string => {
    const up = parent.get(n) as string;
    return up === n ? n : find(up);
  };
  for (const [a, b] of t.links) parent.set(find(a), find(b));
  const domains = new Map<string, string[]>();
  for (const n of parent.keys()) domains.set(find(n), domains.get(find(n)) ?? []);
  for (const n of t.interfaces) domains.get(find(n))?.push(n);
  return [...domains.values()];
}

type Parsed = Cidr & { id: string };

const netKey = (c: Cidr) => `${networkAddress(c.ip, c.prefix)}/${c.prefix}`;

function groupBy(list: readonly Parsed[], key: (p: Parsed) => string): Parsed[][] {
  const groups = new Map<string, Parsed[]>();
  for (const p of list) groups.set(key(p), [...(groups.get(key(p)) ?? []), p]);
  return [...groups.values()];
}

/** Those outside the one largest group. With no single largest group nobody can say who is wrong, so all of them. */
function outliers(groups: readonly Parsed[][]): string[] {
  const largest = Math.max(...groups.map((g) => g.length));
  const top = groups.filter((g) => g.length === largest);
  const odd = top.length === 1 ? groups.filter((g) => g !== top[0]) : groups;
  return odd.flat().map((p) => p.id);
}

function domainProblems(members: readonly Parsed[]): Problem[] {
  const problems: Problem[] = [];
  for (const p of members) {
    if (p.prefix > 30) problems.push({ kind: "no-host-room", interfaces: [p.id] });
    else if (p.ip === networkAddress(p.ip, p.prefix)) problems.push({ kind: "network-address", interfaces: [p.id] });
    else if (p.ip === broadcastAddress(p.ip, p.prefix)) problems.push({ kind: "broadcast-address", interfaces: [p.id] });
  }
  for (const same of groupBy(members, (p) => String(p.ip))) {
    if (same.length > 1) problems.push({ kind: "duplicate", interfaces: same.map((p) => p.id) });
  }
  const nets = groupBy(members, netKey);
  if (nets.length > 1) {
    const masks = new Set(members.map((p) => p.prefix));
    problems.push({ kind: masks.size > 1 ? "different-masks" : "different-nets", interfaces: outliers(nets) });
  }
  return problems;
}

function overlapProblem(a: readonly Parsed[], b: readonly Parsed[]): Problem | undefined {
  const hit = new Set<string>();
  for (const x of a) {
    for (const y of b) {
      if (subnetsOverlap(x.ip, x.prefix, y.ip, y.prefix)) hit.add(x.id).add(y.id);
    }
  }
  return hit.size > 0 ? { kind: "overlap", interfaces: [...hit] } : undefined;
}

/** Everything wrong with the network as typed. Any set of addresses with no problems is a valid repair. */
export function audit(t: Topology, addresses: Addresses): Problem[] {
  const problems: Problem[] = [];
  const domains = broadcastDomains(t).map((ids) => {
    const parsed: Parsed[] = [];
    for (const id of ids) {
      const cidr = parseCidr(addresses[id] ?? "");
      if (cidr) parsed.push({ ...cidr, id });
      else problems.push({ kind: "invalid", interfaces: [id] });
    }
    return parsed;
  });
  for (const members of domains) problems.push(...domainProblems(members));
  domains.forEach((a, i) => {
    for (const b of domains.slice(i + 1)) {
      const overlap = overlapProblem(a, b);
      if (overlap) problems.push(overlap);
    }
  });
  return problems;
}
