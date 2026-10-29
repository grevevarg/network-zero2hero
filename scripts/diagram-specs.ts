// Generated diagrams: scene name -> layout. `npm run diagrams:generate` writes missing scenes.
// A scene that was hand-edited in Excalidraw is never overwritten unless you pass --force.
import { bus, clientServer, compareModels, encapsulation, fullMesh, pair, rackGrid, ring, stack, star, tree, type Layout } from "./lib/layouts.ts";
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

  // 3. Kablar och kontakter. Wire colours: solid colours for the plain wires, pale tints for the striped ones.
  "03-kablar/text-t568b": stack(
    ["1 Vit/orange", "2 Orange", "3 Vit/grön", "4 Blå", "5 Vit/blå", "6 Grön", "7 Vit/brun", "8 Brun"],
    190,
    ["#fff0dc", "#ffa94d", "#e3f7e6", "#74c0fc", "#e3f1fd", "#69db7c", "#f3e9df", "#c4996c"],
  ),

  // 4. Märkning av uttag. Rack grids: row starts numbered in the text, only 01 in the questions.
  "04-markning/text-rack": rackGrid(
    [
      { row: 3, col: 1, rows: 1, cols: 10, label: "Panel 21" },
      { row: 6, col: 1, rows: 0.5, cols: 10, label: "51A" },
      { row: 6.5, col: 1, rows: 0.5, cols: 10, label: "51B" },
    ],
    [1, 11, 21, 31, 41, 51, 61, 71, 81, 91],
    24,
  ),
  "04-markning/q-rack-rad": rackGrid([{ row: 4, col: 1, rows: 1, cols: 10, label: "Panel" }], [1], 24),
  "04-markning/q-rack-mitt": rackGrid([{ row: 7, col: 6, rows: 1, cols: 5, label: "Panel" }], [1], 24),
};
