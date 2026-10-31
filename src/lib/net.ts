/**
 * Address arithmetic used by the content (questions compute their answers with it at build time)
 * and by the fill-in answer normaliser. IPv4 addresses are unsigned 32-bit numbers.
 */

export function toBinary(n: number, width = 8): string {
  if (!Number.isInteger(n) || n < 0 || n >= 2 ** width) throw new Error(`${n} does not fit in ${width} bits`);
  return n.toString(2).padStart(width, "0");
}

export function fromBinary(s: string): number {
  if (!/^[01]+$/.test(s)) throw new Error(`"${s}" is not binary`);
  return parseInt(s, 2);
}

export function toHex(n: number, width = 2): string {
  if (!Number.isInteger(n) || n < 0 || n >= 16 ** width) throw new Error(`${n} does not fit in ${width} hex digits`);
  return n.toString(16).toUpperCase().padStart(width, "0");
}

export function fromHex(s: string): number {
  if (!/^[0-9a-f]+$/i.test(s)) throw new Error(`"${s}" is not hex`);
  return parseInt(s, 16);
}

export function parseIPv4(s: string): number {
  const parts = s.trim().split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) throw new Error(`"${s}" is not an IPv4 address`);
  return parts.reduce((acc, p) => acc * 256 + Number(p), 0);
}

export function formatIPv4(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 0xffffffff) throw new Error(`${n} is not a 32-bit address`);
  return [24, 16, 8, 0].map((shift) => Math.floor(n / 2 ** shift) % 256).join(".");
}

/** The four octets of an address, each as eight bits, joined with dots. */
export function ipv4ToBinary(ip: string): string {
  return formatIPv4(parseIPv4(ip))
    .split(".")
    .map((o) => toBinary(Number(o)))
    .join(".");
}

function checkPrefix(prefix: number): void {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error(`/${prefix} is not a prefix length`);
}

/** /24 -> 255.255.255.0, as a number. */
export function prefixToMask(prefix: number): number {
  checkPrefix(prefix);
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

/** The wildcard mask used in ACLs: the subnet mask turned inside out (/24 -> 0.0.0.255). */
export function wildcardMask(prefix: number): number {
  return ~prefixToMask(prefix) >>> 0;
}

export function isContiguousMask(mask: number): boolean {
  const inverted = ~mask >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

export function maskToPrefix(mask: number): number {
  if (!isContiguousMask(mask)) throw new Error(`${formatIPv4(mask)} is not a contiguous mask`);
  let prefix = 0;
  for (let m = mask; m & 0x80000000; m = (m << 1) >>> 0) prefix++;
  return prefix;
}

export function networkAddress(ip: number, prefix: number): number {
  return (ip & prefixToMask(prefix)) >>> 0;
}

export function broadcastAddress(ip: number, prefix: number): number {
  return (networkAddress(ip, prefix) | (~prefixToMask(prefix) >>> 0)) >>> 0;
}

/** Usable host addresses: 2^(32-prefix) - 2, except /31 (two hosts on a point-to-point link) and /32 (one). */
export function hostCount(prefix: number): number {
  checkPrefix(prefix);
  if (prefix === 32) return 1;
  if (prefix === 31) return 2;
  return 2 ** (32 - prefix) - 2;
}

/** First and last usable host for prefixes up to /30. */
export function hostRange(ip: number, prefix: number): [number, number] {
  checkPrefix(prefix);
  if (prefix > 30) throw new Error(`/${prefix} has no network and broadcast address to skip`);
  return [networkAddress(ip, prefix) + 1, broadcastAddress(ip, prefix) - 1];
}

export function inSubnet(ip: number, network: number, prefix: number): boolean {
  return networkAddress(ip, prefix) === networkAddress(network, prefix);
}

/** Split a network into equal subnets with a longer prefix, in address order. */
export function splitNetwork(network: number, prefix: number, newPrefix: number): { network: number; prefix: number }[] {
  checkPrefix(prefix);
  checkPrefix(newPrefix);
  if (newPrefix < prefix) throw new Error(`/${newPrefix} is shorter than /${prefix}`);
  const base = networkAddress(network, prefix);
  const size = 2 ** (32 - newPrefix);
  return Array.from({ length: 2 ** (newPrefix - prefix) }, (_, i) => ({ network: base + i * size, prefix: newPrefix }));
}

export type AddressClass = "A" | "B" | "C" | "D" | "E";

/** Classful address class from the first octet. */
export function addressClass(ip: number): AddressClass {
  const first = Math.floor(ip / 2 ** 24);
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D";
  return "E";
}

/** The class's default prefix: A /8, B /16, C /24. Classes D and E have none. */
export function classPrefix(c: AddressClass): number | undefined {
  return c === "A" ? 8 : c === "B" ? 16 : c === "C" ? 24 : undefined;
}

const inRange = (ip: number, net: string, prefix: number) => inSubnet(ip, parseIPv4(net), prefix);

/** RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. */
export function isPrivate(ip: number): boolean {
  return inRange(ip, "10.0.0.0", 8) || inRange(ip, "172.16.0.0", 12) || inRange(ip, "192.168.0.0", 16);
}

export function isLoopback(ip: number): boolean {
  return inRange(ip, "127.0.0.0", 8);
}

/** 169.254.0.0/16, what a host gives itself when no DHCP server answers. */
export function isApipa(ip: number): boolean {
  return inRange(ip, "169.254.0.0", 16);
}

/** Eight groups of four lowercase hex digits. Accepts any valid shortened form. */
export function expandIPv6(s: string): string {
  const text = s.trim().toLowerCase();
  const halves = text.split("::");
  if (halves.length > 2) throw new Error(`"${s}" has more than one ::`);
  const groups = (part: string) => (part === "" ? [] : part.split(":"));
  const head = groups(halves[0]);
  const tail = halves.length === 2 ? groups(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) throw new Error(`"${s}" does not have eight groups`);
  const all = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (all.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) throw new Error(`"${s}" has a group that is not 1-4 hex digits`);
  return all.map((g) => g.padStart(4, "0")).join(":");
}

/**
 * The canonical short form (RFC 5952): leading zeros dropped in every group, and the longest run of
 * two or more all-zero groups (the first one if tied) replaced by ::.
 */
export function compressIPv6(s: string): string {
  const groups = expandIPv6(s).split(":").map((g) => g.replace(/^0+(?=.)/, ""));
  let best = { start: -1, length: 0 };
  for (let i = 0; i < 8; ) {
    if (groups[i] !== "0") {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && groups[j] === "0") j++;
    if (j - i > best.length) best = { start: i, length: j - i };
    i = j;
  }
  if (best.length < 2) return groups.join(":");
  return `${groups.slice(0, best.start).join(":")}::${groups.slice(best.start + best.length).join(":")}`;
}

/**
 * The 64-bit interface id made from a MAC address with EUI-64: split the MAC in half, put FFFE in the
 * middle and flip the seventh bit of the first byte. Returned as four lowercase groups.
 */
export function eui64(mac: string): string {
  const bytes = mac
    .trim()
    .split(/[:-]/)
    .map((b) => {
      if (!/^[0-9a-f]{2}$/i.test(b)) throw new Error(`"${mac}" is not a MAC address`);
      return fromHex(b);
    });
  if (bytes.length !== 6) throw new Error(`"${mac}" is not a MAC address`);
  const id = [bytes[0] ^ 0x02, bytes[1], bytes[2], 0xff, 0xfe, bytes[3], bytes[4], bytes[5]];
  return [0, 2, 4, 6].map((i) => (toHex(id[i]) + toHex(id[i + 1])).toLowerCase()).join(":");
}

/** OSPF cost: reference bandwidth (default 100 Mbit/s) divided by the link speed, never below 1. */
export function ospfCost(bitsPerSecond: number, reference = 100_000_000): number {
  if (!(bitsPerSecond > 0)) throw new Error(`${bitsPerSecond} is not a link speed`);
  return Math.max(1, Math.floor(reference / bitsPerSecond));
}

/** STP port cost per link speed, from the classic table. Other speeds have no cost in it. */
const STP_COSTS: ReadonlyMap<number, number> = new Map([
  [10_000_000, 100],
  [100_000_000, 19],
  [1_000_000_000, 4],
  [2_000_000_000, 3],
  [10_000_000_000, 2],
]);

export function stpCost(bitsPerSecond: number): number {
  const cost = STP_COSTS.get(bitsPerSecond);
  if (cost === undefined) throw new Error(`${bitsPerSecond} bit/s has no STP cost in the table`);
  return cost;
}

export type BridgeId = { priority: number; mac: string };

/** Bridge IDs compare on priority first and MAC address second. Negative when a is lower (better). */
export function compareBridgeId(a: BridgeId, b: BridgeId): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const hex = (mac: string) => mac.replace(/[:-]/g, "").toLowerCase();
  const [x, y] = [hex(a.mac), hex(b.mac)];
  return x < y ? -1 : x > y ? 1 : 0;
}

/** The switch that becomes root bridge: the one with the lowest Bridge ID. */
export function rootBridge<T extends BridgeId>(switches: readonly T[]): T {
  if (switches.length === 0) throw new Error("no switches to choose a root bridge from");
  return switches.reduce((best, s) => (compareBridgeId(s, best) < 0 ? s : best));
}
