import type { Addresses, Topology } from "../../src/puzzles/audit.ts";

/**
 * Draft scenario for the network review. Three routers in a row. Two switches share the first LAN,
 * so they are one broadcast domain, and the links between routers are domains of their own.
 */
export const topology: Topology = {
  switches: ["sw1", "sw2", "sw3"],
  interfaces: ["r1-lan", "r1-r2", "r2-r1", "r2-r3", "r2-lan", "r3-r2", "r3-lan", "pc1", "pc2", "pc3", "pc4"],
  links: [
    ["r1-lan", "sw1"],
    ["sw1", "sw2"],
    ["pc1", "sw1"],
    ["pc2", "sw2"],
    ["r1-r2", "r2-r1"],
    ["r2-r3", "r3-r2"],
    ["r2-lan", "sw3"],
    ["pc3", "sw3"],
    ["r3-lan", "pc4"],
  ],
};

/** Three planted faults, and 10.0.0.0/26 next to 10.0.0.64/26 as a clash that isn't one. */
export const broken: Addresses = {
  "r1-lan": "10.0.0.1/26",
  pc1: "10.0.0.10/26",
  pc2: "10.0.0.63/26", // The broadcast address of 10.0.0.0/26.
  "r1-r2": "10.0.0.193/30",
  "r2-r1": "10.0.0.198/30", // In 10.0.0.196/30, not 10.0.0.192/30.
  "r2-r3": "10.0.0.201/30",
  "r3-r2": "10.0.0.202/30",
  "r2-lan": "10.0.0.65/26",
  pc3: "10.0.0.70/26",
  "r3-lan": "10.0.0.97/27", // 10.0.0.96/27 lies inside 10.0.0.64/26.
  pc4: "10.0.0.100/27",
};

export const reference: Addresses = {
  ...broken,
  pc2: "10.0.0.62/26",
  "r2-r1": "10.0.0.194/30",
  "r3-lan": "10.0.0.129/27",
  pc4: "10.0.0.130/27",
};
