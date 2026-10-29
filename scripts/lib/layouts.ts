export type NodeShape = "device" | "box" | "server" | "router" | "junction";
export type LayoutNode = { id: string; x: number; y: number; shape: NodeShape };
export type Edge = [string, string];
/** A labelled arrow drawn beside the straight line between two nodes, above or below it. */
export type Message = { from: string; to: string; label: string; side: "above" | "below" };
/**
 * A labelled rectangle with its top-left corner at (x, y). Shaded blocks stand out, like headers.
 * `fill` sets an exact background colour instead, for things that have a real colour (wires).
 */
export type Block = { x: number; y: number; w: number; h: number; label: string; shaded?: boolean; fill?: string };
/** Free text centred on x, with its top at y. */
export type Label = { x: number; y: number; text: string };
/** A free arrow between two points, with an optional label centred above it. */
export type Arrow = { from: [number, number]; to: [number, number]; label?: string };
/** Positions for a diagram in a 200 x 160 box. Scenes scale this up and place library items on it. */
export type Layout = {
  width: number;
  height: number;
  nodes: LayoutNode[];
  edges: Edge[];
  messages?: Message[];
  blocks?: Block[];
  labels?: Label[];
  arrows?: Arrow[];
};
type Node = LayoutNode;

const W = 200;
const H = 160;
const CX = W / 2;
const CY = H / 2;
const R = 58;

const round = (n: number) => Math.round(n * 10) / 10;

/** n points evenly spaced on a circle, the first one at the top. */
export function circlePoints(n: number, radius = R): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: round(CX + radius * Math.cos(a)), y: round(CY + radius * Math.sin(a)) };
  });
}

function devices(n: number): Node[] {
  return circlePoints(n).map((p, i) => ({ id: `d${i + 1}`, ...p, shape: "device" as const }));
}

export function star(n: number): Layout {
  const nodes: Node[] = [{ id: "hub", x: CX, y: CY, shape: "box" }, ...devices(n)];
  return { width: W, height: H, nodes, edges: nodes.slice(1).map((d): Edge => ["hub", d.id]) };
}

export function ring(n: number): Layout {
  const nodes = devices(n);
  return { width: W, height: H, nodes, edges: nodes.map((d, i): Edge => [d.id, nodes[(i + 1) % n].id]) };
}

export function fullMesh(n: number): Layout {
  const nodes = devices(n);
  const edges: Edge[] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([nodes[i].id, nodes[j].id]);
  return { width: W, height: H, nodes, edges };
}

/** One backbone line with n devices hanging off it, alternating above and below. */
export function bus(n: number): Layout {
  const step = (W - 40) / (n + 1);
  const nodes: Node[] = [
    { id: "end-a", x: 12, y: CY, shape: "junction" },
    { id: "end-b", x: W - 12, y: CY, shape: "junction" },
  ];
  const edges: Edge[] = [];
  let previous = "end-a";
  for (let i = 1; i <= n; i++) {
    const x = round(20 + step * i);
    nodes.push({ id: `j${i}`, x, y: CY, shape: "junction" });
    nodes.push({ id: `d${i}`, x, y: i % 2 === 1 ? CY - 48 : CY + 48, shape: "device" });
    edges.push([previous, `j${i}`], [`j${i}`, `d${i}`]);
    previous = `j${i}`;
  }
  edges.push([previous, "end-b"]);
  return { width: W, height: H, nodes, edges };
}

/** A root box with `branches` boxes under it, each with `leaves` devices. */
export function tree(branches: number, leaves: number): Layout {
  const nodes: Node[] = [{ id: "root", x: CX, y: 22, shape: "box" }];
  const edges: Edge[] = [];
  const branchStep = W / branches;
  const leafStep = branchStep / leaves;
  for (let b = 0; b < branches; b++) {
    const bx = round(branchStep * (b + 0.5));
    nodes.push({ id: `b${b + 1}`, x: bx, y: 78, shape: "box" });
    edges.push(["root", `b${b + 1}`]);
    for (let l = 0; l < leaves; l++) {
      const id = `b${b + 1}-d${l + 1}`;
      nodes.push({ id, x: round(branchStep * b + leafStep * (l + 0.5)), y: 136, shape: "device" });
      edges.push([`b${b + 1}`, id]);
    }
  }
  return { width: W, height: H, nodes, edges };
}

/** Two devices and one cable: the smallest possible network. */
export function pair(): Layout {
  return {
    width: W,
    height: H,
    nodes: [
      { id: "d1", x: 45, y: CY, shape: "device" },
      { id: "d2", x: 155, y: CY, shape: "device" },
    ],
    edges: [["d1", "d2"]],
  };
}

/** A client on the left asking a server on the right, and the server answering. */
export function clientServer(question: string, answer: string): Layout {
  return {
    width: W,
    height: H,
    nodes: [
      { id: "client", x: 22, y: CY, shape: "device" },
      { id: "server", x: 178, y: CY, shape: "server" },
    ],
    edges: [],
    messages: [
      { from: "client", to: "server", label: question, side: "above" },
      { from: "server", to: "client", label: answer, side: "below" },
    ],
  };
}

const BLOCK_H = 18;

/** Boxes stacked on top of each other, first label at the top. `fills` colours them in the same order. */
export function stack(labels: readonly string[], width = 190, fills?: readonly string[]): Layout {
  const blocks = labels.map((label, i): Block => ({ x: 0, y: i * BLOCK_H, w: width, h: BLOCK_H, label, fill: fills?.[i] }));
  return { width, height: labels.length * BLOCK_H, nodes: [], edges: [], blocks };
}

/**
 * Encapsulation, one row per step on the way down. The data block stays put while each layer
 * puts its numbered header in front of what it got; layer 2 also adds a trailer at the end.
 * Each row is named on the right. The last row is the bits that go out on the wire.
 */
export function encapsulation(names: readonly [string, string, string, string, string], bits: string): Layout {
  const row = (i: number) => i * (BLOCK_H + 10);
  const head = 24;
  const dataX = 120;
  const dataW = 50;
  const header = (layer: number, i: number): Block => ({
    x: dataX - head * (5 - layer),
    y: row(i),
    w: head,
    h: BLOCK_H,
    label: String(layer),
    shaded: true,
  });
  const data = (i: number): Block => ({ x: dataX, y: row(i), w: dataW, h: BLOCK_H, label: "Data" });
  const blocks: Block[] = [
    data(0),
    header(4, 1), data(1),
    header(3, 2), header(4, 2), data(2),
    header(2, 3), header(3, 3), header(4, 3), data(3),
    { x: dataX + dataW, y: row(3), w: head, h: BLOCK_H, label: "2", shaded: true },
  ];
  const left = dataX - head * 3;
  const right = dataX + dataW + head;
  const labels: Label[] = names.map((text, i) => ({ x: right + 30, y: row(i) + 2, text }));
  labels.push({ x: (left + right) / 2, y: row(4) + 2, text: bits });
  return { width: right + 60 - left, height: row(4) + BLOCK_H, nodes: [], edges: [], blocks, labels };
}

/**
 * Two layer models side by side, both with the top layer first. `right` gives each layer of the
 * second model a label and how many layers of the first model it spans.
 */
export function compareModels(
  titles: readonly [string, string],
  left: readonly string[],
  right: readonly { label: string; span: number }[],
): Layout {
  const total = right.reduce((n, r) => n + r.span, 0);
  if (total !== left.length) throw new Error(`the right model spans ${total} layers, the left has ${left.length}`);
  const top = 22;
  const w = 90;
  const gap = 10;
  const blocks: Block[] = left.map((label, i) => ({ x: 0, y: top + i * BLOCK_H, w, h: BLOCK_H, label }));
  let row = 0;
  for (const r of right) {
    blocks.push({ x: w + gap, y: top + row * BLOCK_H, w, h: r.span * BLOCK_H, label: r.label });
    row += r.span;
  }
  const labels: Label[] = [
    { x: w / 2, y: 0, text: titles[0] },
    { x: w + gap + w / 2, y: 0, text: titles[1] },
  ];
  return { width: 2 * w + gap, height: top + total * BLOCK_H, nodes: [], edges: [], blocks, labels };
}

/** A piece of equipment in a rack grid: its top-left cell (1-based row and column) and size in cells. */
export type RackItem = { row: number; col: number; rows: number; cols: number; label: string };

/** The cell number in a 10 x 10 rack grid: row 1 is 01-10, row 2 is 11-20 and so on. */
export function rackCell(row: number, col: number): number {
  return (row - 1) * 10 + col;
}

/**
 * A rack seen from the front, split into 10 x 10 numbered cells, with equipment drawn on top.
 * `numbered` lists the cells that show their number (only where no equipment covers them).
 */
export function rackGrid(items: readonly RackItem[], numbered: readonly number[], cell = 18): Layout {
  const covers = (it: RackItem, row: number, col: number) =>
    row >= it.row && row < it.row + it.rows && col >= it.col && col < it.col + it.cols;
  const blocks: Block[] = [];
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 10; col++) {
      if (items.some((it) => covers(it, row, col))) continue;
      const n = rackCell(row, col);
      const label = numbered.includes(n) ? String(n).padStart(2, "0") : "";
      blocks.push({ x: (col - 1) * cell, y: (row - 1) * cell, w: cell, h: cell, label });
    }
  }
  for (const it of items) {
    if (it.row < 1 || it.col < 1 || it.row + it.rows > 11 || it.col + it.cols > 11) throw new Error(`"${it.label}" does not fit in the rack`);
    blocks.push({ x: (it.col - 1) * cell, y: (it.row - 1) * cell, w: it.cols * cell, h: it.rows * cell, label: it.label, shaded: true });
  }
  return { width: 10 * cell, height: 10 * cell, nodes: [], edges: [], blocks };
}

/** Characters' rough width in layout units at the default font size (scene.ts estimates 0.55 em). */
const CHAR_W = 5.5;

/**
 * A row of boxes, each as wide as its text needs, with a caption centred under each box.
 * Used for things split into parts, like the two halves of an address. `equal` makes every box as
 * wide as the widest, for parts that are the same size.
 */
export function parts(items: readonly { text: string; caption?: string; shaded?: boolean }[], pad = 10, equal = false): Layout {
  const blocks: Block[] = [];
  const labels: Label[] = [];
  const need = (it: (typeof items)[number]) => Math.max(it.text.length, (it.caption ?? "").length) * CHAR_W + pad * 2;
  const widest = Math.max(...items.map(need));
  let x = 0;
  for (const it of items) {
    const w = equal ? widest : need(it);
    blocks.push({ x, y: 0, w, h: BLOCK_H, label: it.text, shaded: it.shaded });
    if (it.caption) labels.push({ x: x + w / 2, y: BLOCK_H + 4, text: it.caption });
    x += w;
  }
  return { width: x, height: BLOCK_H + (labels.length > 0 ? 20 : 0), nodes: [], edges: [], blocks, labels };
}

/**
 * Two LANs joined by a router: two devices on a switch on each side. Each LAN is named under it,
 * for example with its network address.
 */
export function twoLans(left: string, right: string): Layout {
  const nodes: LayoutNode[] = [
    { id: "a1", x: 20, y: 35, shape: "device" },
    { id: "a2", x: 20, y: 115, shape: "device" },
    { id: "sa", x: 75, y: 75, shape: "box" },
    { id: "r", x: 140, y: 75, shape: "router" },
    { id: "sb", x: 205, y: 75, shape: "box" },
    { id: "b1", x: 260, y: 35, shape: "device" },
    { id: "b2", x: 260, y: 115, shape: "device" },
  ];
  const edges: Edge[] = [["a1", "sa"], ["a2", "sa"], ["sa", "r"], ["r", "sb"], ["sb", "b1"], ["sb", "b2"]];
  const labels: Label[] = [
    { x: 48, y: 150, text: left },
    { x: 232, y: 150, text: right },
  ];
  return { width: 280, height: 165, nodes, edges, labels };
}

/** Nodes in a row joined by single links, each with an optional label above it. */
export function chain(items: readonly { shape: NodeShape; label?: string }[], step = 55): Layout {
  const nodes: LayoutNode[] = items.map((it, i) => ({ id: `n${i + 1}`, x: i * step, y: 40, shape: it.shape }));
  const edges = nodes.slice(1).map((n, i): Edge => [nodes[i].id, n.id]);
  const labels = items.flatMap((it, i): Label[] => (it.label ? [{ x: i * step, y: 0, text: it.label }] : []));
  return { width: (items.length - 1) * step, height: 60, nodes, edges, labels };
}

/**
 * Three routers in a triangle: R1 and R3 joined directly at the bottom, and a second way round
 * through R2 at the top. Each link is labelled (for example with its speed).
 */
export function pathChoice(direct: string, viaLeft: string, viaRight: string): Layout {
  const nodes: LayoutNode[] = [
    { id: "r1", x: 0, y: 110, shape: "router" },
    { id: "r2", x: 110, y: 20, shape: "router" },
    { id: "r3", x: 220, y: 110, shape: "router" },
  ];
  const edges: Edge[] = [["r1", "r3"], ["r1", "r2"], ["r2", "r3"]];
  const labels: Label[] = [
    { x: 0, y: 132, text: "R1" },
    { x: 110, y: -8, text: "R2" },
    { x: 220, y: 132, text: "R3" },
    { x: 110, y: 117, text: direct },
    { x: 30, y: 45, text: viaLeft },
    { x: 190, y: 45, text: viaRight },
  ];
  return { width: 220, height: 145, nodes, edges, labels };
}

/**
 * A sequence picture: a device on the left and a server on the right with a line down from each,
 * and one labelled arrow per message, top to bottom, in the direction it is sent.
 */
export function sequence(messages: readonly { toRight: boolean; label: string }[], width = 200, step = 30): Layout {
  const bottom = 40 + messages.length * step;
  const nodes: LayoutNode[] = [
    { id: "client", x: 0, y: 0, shape: "device" },
    { id: "server", x: width, y: 0, shape: "server" },
    { id: "client-end", x: 0, y: bottom, shape: "junction" },
    { id: "server-end", x: width, y: bottom, shape: "junction" },
  ];
  const edges: Edge[] = [["client", "client-end"], ["server", "server-end"]];
  const arrows = messages.map((m, i): Arrow => {
    const y = 40 + (i + 1) * step - 6;
    return m.toRight ? { from: [0, y], to: [width, y], label: m.label } : { from: [width, y], to: [0, y], label: m.label };
  });
  return { width, height: bottom, nodes, edges, arrows };
}
