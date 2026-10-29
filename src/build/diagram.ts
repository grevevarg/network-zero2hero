import type { Diagram } from "./schema.ts";

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NODE_RADIUS = 14;
const BOX_SIZE = 30;

/** Render a node-and-edge diagram to a self-contained, theme-aware SVG string. */
export function diagramToSvg(d: Diagram): string {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const edges = d.edges.map(([a, b]) => {
    const from = byId.get(a);
    const to = byId.get(b);
    if (!from || !to) throw new Error(`diagram edge ${a}-${b} points to a missing node`);
    return `<line class="dg-edge" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
  });
  const nodes = d.nodes.map((n) => {
    const shape =
      n.shape === "junction"
        ? `<circle class="dg-junction" cx="${n.x}" cy="${n.y}" r="3"/>`
        : n.shape === "box"
          ? `<rect class="dg-node dg-box" x="${n.x - BOX_SIZE / 2}" y="${n.y - BOX_SIZE / 2}" width="${BOX_SIZE}" height="${BOX_SIZE}" rx="5"/>`
          : `<circle class="dg-node" cx="${n.x}" cy="${n.y}" r="${NODE_RADIUS}"/>`;
    const label = n.label
      ? `<text class="dg-label" x="${n.x}" y="${n.y + NODE_RADIUS + 16}" text-anchor="middle">${escapeXml(n.label)}</text>`
      : "";
    return shape + label;
  });
  const alt = escapeXml(d.alt);
  return (
    `<svg class="diagram" viewBox="0 0 ${d.width} ${d.height}" role="img" aria-label="${alt}">` +
    `<title>${alt}</title>${edges.join("")}${nodes.join("")}</svg>`
  );
}
