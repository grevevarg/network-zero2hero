// Generated diagrams: scene name -> layout. `npm run diagrams:generate` writes missing scenes.
// A scene that was hand-edited in Excalidraw is never overwritten unless you pass --force.
import { bus, clientServer, fullMesh, pair, ring, star, tree, type Layout } from "./lib/layouts.ts";
import type { Roles } from "./lib/scene.ts";

/** Which library item plays which role. */
export const ROLES: Roles = { device: "Computer (3D)", box: "Switch", server: "Server" };

export const SPECS: Record<string, Layout> = {
  // 1. Vad är ett nätverk? Concept pictures on the text cards:
  "01-natverk/text-pair": pair(),
  "01-natverk/text-client-server": clientServer("Jag vill lyssna på hårdrock", "Okej, här har du hårdrock"),
  // Topologies. Text diagrams and self-check diagrams use different sizes on purpose.
  "01-natverk/text-star": star(4),
  "01-natverk/text-bus": bus(3),
  "01-natverk/text-ring": ring(5),
  "01-natverk/text-tree": tree(2, 2),
  "01-natverk/text-mesh": fullMesh(4),
  "01-natverk/q-star": star(6),
  "01-natverk/q-bus": bus(4),
  "01-natverk/q-ring": ring(6),
  "01-natverk/q-tree": tree(2, 3),
  "01-natverk/q-mesh": fullMesh(5),
};
