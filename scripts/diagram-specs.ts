// Generated diagrams: scene name -> layout. `npm run diagrams:generate` writes missing scenes.
// A scene that was hand-edited in Excalidraw is never overwritten unless you pass --force.
import { bus, chain, clientServer, compareModels, encapsulation, fullMesh, pair, parts, pathChoice, rackGrid, ring, sequence, stack, star, tree, twoLans, type Layout } from "./lib/layouts.ts";
import type { Roles } from "./lib/scene.ts";

/** Which library item plays which role. */
export const ROLES: Roles = { device: "Computer (3D)", box: "Switch", server: "Server", router: "Router" };

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

  // 5. Switchar och MAC-adresser
  "05-switchar/text-mac": parts([
    { text: "00:1A:2B", caption: "Tillverkare", shaded: true },
    { text: "3C:4D:5E", caption: "Unik del" },
  ]),
  "05-switchar/text-ram": stack(["Preamble och SFD", "Mottagarens MAC", "Avsändarens MAC", "Typ", "Data", "FCS"], 190),

  // 6. IPv4-adresser. Bit values over the bits of 192; an address split into its two parts.
  "06-ipv4/text-binar": parts(
    [128, 64, 32, 16, 8, 4, 2, 1].map((v, i) => ({ text: String(v), caption: i < 2 ? "1" : "0", shaded: i < 2 })),
    6,
  ),
  "06-ipv4/text-delar": parts([
    { text: "192.168.1", caption: "Nätdel", shaded: true },
    { text: "10", caption: "Värddel" },
  ]),

  // 7. Subnetting. A /24 split into four /26 blocks.
  "07-subnat/text-block": parts(
    ["0–63", "64–127", "128–191", "192–255"].map((text, i) => ({ text, caption: `Nät ${i + 1}`, shaded: i % 2 === 0 })),
    6,
    true,
  ),

  // 8. Routing och default gateway
  "08-routing/text-tva-nat": twoLans("192.168.1.0/24", "192.168.2.0/24"),
  "08-routing/text-ttl": chain([
    { shape: "device", label: "TTL 64" },
    { shape: "router", label: "63" },
    { shape: "router", label: "62" },
    { shape: "router", label: "61" },
    { shape: "server" },
  ]),

  // 9. Routingprotokoll. One direct slow link against two fast ones.
  "09-routingprotokoll/q-vag": pathChoice("10 Mbit/s", "1 Gbit/s", "1 Gbit/s"),

  // 10. TCP, UDP och portar. The three-way handshake.
  "10-transport/text-handskakning": sequence([
    { toRight: true, label: "SYN" },
    { toRight: false, label: "SYN + ACK" },
    { toRight: true, label: "ACK" },
  ]),

  // 11. DHCP och DNS
  "11-dhcpdns/text-dora": sequence([
    { toRight: true, label: "DISCOVER" },
    { toRight: false, label: "OFFER" },
    { toRight: true, label: "REQUEST" },
    { toRight: false, label: "ACK" },
  ]),
  "11-dhcpdns/text-hierarki": stack(["Rot  .", "Toppdomän  se", "coolabilar.se", "www.coolabilar.se"], 190),

  // 12. NAT och ACL. Addresses from the documentation ranges (203.0.113.0/24, 198.51.100.0/24).
  "12-natacl/text-nat": chain(
    [
      { shape: "device", label: "192.168.1.10" },
      { shape: "router", label: "203.0.113.5" },
      { shape: "server", label: "198.51.100.7" },
    ],
    95,
  ),

  // 13. VLAN. Switch ports coloured by VLAN; the last port is a trunk that carries all three.
  "13-vlan/text-portar": stack(
    ["Port 1: VLAN 10", "Port 2: VLAN 10", "Port 3: VLAN 20", "Port 4: VLAN 20", "Port 5: VLAN 30", "Port 6: trunk, alla VLAN"],
    190,
    ["#d0ebff", "#d0ebff", "#d3f9d8", "#d3f9d8", "#fff3bf", "transparent"],
  ),

  // 13. STP. SW1 is the root bridge; the text example and the question use different speeds.
  "13-vlan/text-stp": pathChoice("100 Mbit/s", "1 Gbit/s", "1 Gbit/s", "box", ["SW2", "SW3", "SW1"]),
  "13-vlan/q-stp": pathChoice("10 Mbit/s", "100 Mbit/s", "100 Mbit/s", "box", ["SW2", "SW3", "SW1"]),

  // 14. Trådlöst nätverk. Access points in a corridor, with their channels.
  "14-wlan/text-kanaler": parts(
    ["1", "6", "11", "1"].map((ch, i) => ({ text: `Kanal ${ch}`, caption: `AP ${i + 1}`, shaded: i % 2 === 1 })),
    6,
    true,
  ),
  "14-wlan/q-kanaler": parts(
    ["1", "?", "11"].map((ch, i) => ({ text: ch === "?" ? "?" : `Kanal ${ch}`, caption: `AP ${i + 1}`, shaded: i === 1 })),
    6,
    true,
  ),

  // 15. IPv6. A /64 split into its halves, and EUI-64 putting FFFE in the middle of a MAC.
  "15-ipv6/text-64": parts([
    { text: "2001:db8:0:1", caption: "Nätdel, /64", shaded: true },
    { text: "21a:2bff:fe3c:4d5e", caption: "Interface-ID" },
  ]),
  "15-ipv6/text-eui64": parts([
    { text: "02:1A:2B", caption: "Första halvan" },
    { text: "FF:FE", caption: "Inlagt", shaded: true },
    { text: "3C:4D:5E", caption: "Andra halvan" },
  ]),

  // 16. Felsökning. Ping outwards step by step, from the machine itself to beyond the gateway.
  "16-felsokning/text-ping": chain(
    [
      { shape: "device", label: "Steg 1 och 2" },
      { shape: "box" },
      { shape: "router", label: "Steg 3" },
      { shape: "server", label: "Steg 4" },
    ],
    80,
  ),
};
