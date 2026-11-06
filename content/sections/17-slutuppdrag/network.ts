import { broadcastDomains, type Topology } from "../../../src/puzzles/audit.ts";

/** Positions are in a tall box, so the picture and the address fields fit a phone. */
export const WIDTH = 220;
export const HEIGHT = 445;

export type NetworkDevice = { id: string; name: string; kind: "router" | "switch" | "host"; x: number; y: number };
/** A router port or a host. x and y place its address field on the picture. */
export type NetworkInterface = { id: string; device: string; label: string; x: number; y: number; address: string; repaired?: string };

export const devices: NetworkDevice[] = [
  { id: "pc1", name: "PC1", kind: "host", x: 45, y: 22 },
  { id: "pc2", name: "PC2", kind: "host", x: 175, y: 22 },
  { id: "sw1", name: "SW1", kind: "switch", x: 45, y: 100 },
  { id: "sw2", name: "SW2", kind: "switch", x: 175, y: 100 },
  { id: "r1", name: "R1", kind: "router", x: 45, y: 180 },
  { id: "pc3", name: "PC3", kind: "host", x: 175, y: 222 },
  { id: "r2", name: "R2", kind: "router", x: 45, y: 302 },
  { id: "sw3", name: "SW3", kind: "switch", x: 175, y: 302 },
  { id: "r3", name: "R3", kind: "router", x: 45, y: 424 },
  { id: "pc4", name: "PC4", kind: "host", x: 175, y: 424 },
];

/**
 * Three planted faults: PC2 has a broadcast address, the two ends of the R1-R2 link are in different
 * /30 nets, and R3's LAN lies inside R2's. 10.0.0.0/26 next to 10.0.0.64/26 only looks like a clash.
 */
export const interfaces: NetworkInterface[] = [
  { id: "pc1-if", device: "pc1", label: "PC1", x: 45, y: 62, address: "10.0.0.10/26" },
  { id: "pc2-if", device: "pc2", label: "PC2", x: 175, y: 62, address: "10.0.0.63/26", repaired: "10.0.0.62/26" },
  { id: "r1-lan", device: "r1", label: "R1 mot SW1", x: 45, y: 140, address: "10.0.0.1/26" },
  { id: "r1-r2", device: "r1", label: "R1 mot R2", x: 45, y: 220, address: "10.0.0.193/30" },
  { id: "r2-r1", device: "r2", label: "R2 mot R1", x: 45, y: 262, address: "10.0.0.198/30", repaired: "10.0.0.194/30" },
  { id: "pc3-if", device: "pc3", label: "PC3", x: 175, y: 262, address: "10.0.0.70/26" },
  { id: "r2-lan", device: "r2", label: "R2 mot SW3", x: 110, y: 302, address: "10.0.0.65/26" },
  { id: "r2-r3", device: "r2", label: "R2 mot R3", x: 45, y: 342, address: "10.0.0.201/30" },
  { id: "r3-r2", device: "r3", label: "R3 mot R2", x: 45, y: 384, address: "10.0.0.202/30" },
  { id: "pc4-if", device: "pc4", label: "PC4", x: 175, y: 384, address: "10.0.0.114/28", repaired: "10.0.0.130/28" },
  { id: "r3-lan", device: "r3", label: "R3 mot PC4", x: 110, y: 424, address: "10.0.0.113/28", repaired: "10.0.0.129/28" },
];

export const switches = devices.filter((d) => d.kind === "switch").map((d) => d.id);

export const links: [string, string][] = [
  ["pc1-if", "sw1"],
  ["pc2-if", "sw2"],
  ["sw1", "sw2"],
  ["r1-lan", "sw1"],
  ["r1-r2", "r2-r1"],
  ["r2-r3", "r3-r2"],
  ["r2-lan", "sw3"],
  ["pc3-if", "sw3"],
  ["r3-lan", "pc4-if"],
];

const deviceOf = (end: string) => interfaces.find((i) => i.id === end)?.device ?? end;

/** The same links between devices, for the picture. */
export const cables = links.map(([a, b]): [string, string] => [deviceOf(a), deviceOf(b)]);

export const topology: Topology = { switches, interfaces: interfaces.map((i) => i.id), links };

export const domainCount = broadcastDomains(topology).length;
