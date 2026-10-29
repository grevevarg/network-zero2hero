export type NodeShape = "device" | "box" | "junction";
export type LayoutNode = { id: string; x: number; y: number; shape: NodeShape };
export type Edge = [string, string];
/** Positions for a diagram in a 200 x 160 box. Scenes scale this up and place library items on it. */
export type Layout = { width: number; height: number; nodes: LayoutNode[]; edges: Edge[] };
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
