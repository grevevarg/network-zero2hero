// Generated diagrams: scene name -> layout. `npm run diagrams:generate` writes missing scenes.
// A scene that was hand-edited in Excalidraw is never overwritten unless you pass --force.
import { bus, clientServer, compareModels, encapsulation, fullMesh, pair, ring, stack, star, tree, type Layout } from "./lib/layouts.ts";
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

  // 2. Lager på lager
  "02-lager/text-osi": stack(["7 Applikation", "6 Presentation", "5 Session", "4 Transport", "3 Nätverk", "2 Datalänk", "1 Fysiskt"]),
  "02-lager/text-inkapsling": encapsulation(["Data", "Segment", "Paket", "Frame", "Bitar"], "0110 1001 0011 …"),
  "02-lager/text-tcpip": compareModels(
    ["OSI", "TCP/IP"],
    ["Applikation", "Presentation", "Session", "Transport", "Nätverk", "Datalänk", "Fysiskt"],
    [
      { label: "Applikation", span: 3 },
      { label: "Transport", span: 1 },
      { label: "Internet", span: 1 },
      { label: "Network Access", span: 2 },
    ],
  ),
};
