import type { QuestionInput } from "../../../src/build/schema.ts";
import { ospfCost } from "../../../src/lib/net.ts";

export const questions: QuestionInput[] = [
  {
    kind: "mcq",
    id: "routingprotokoll-rip-vag",
    uses: ["rip", "metric", "hop"],
    diagram: "q-vag",
    prompt: "Routrarna kör RIP. Vilken väg väljer R1 för att nå ett nät bakom R3?",
    options: [
      { id: "direkt", text: "Den direkta länken till R3" },
      { id: "via-r2", text: "Vägen via R2" },
      { id: "dela", text: "Båda vägarna, varannan gång" },
      { id: "ingen", text: "Ingen av dem, R3 är för långt bort" },
    ],
    correct: "direkt",
    explanation:
      "RIP räknar bara antalet hopp. Den direkta länken är ett hopp och vägen via R2 är två, så RIP väljer den direkta, trots att den är långsammast. RIP växlar inte mellan vägar. Gränsen för RIP är 15 hopp, och här handlar det om ett eller två.",
  },
  {
    kind: "mcq",
    id: "routingprotokoll-ospf-vag",
    uses: ["ospf", "ospf-cost", "metric", "bithastighet"],
    diagram: "q-vag",
    prompt: "Samma nät kör i stället OSPF. Vilken väg väljer R1 för att nå ett nät bakom R3?",
    options: [
      { id: "via-r2", text: "Vägen via R2" },
      { id: "direkt", text: "Den direkta länken till R3" },
      { id: "dela", text: "Båda vägarna, varannan gång" },
      { id: "ingen", text: "Ingen av dem, OSPF klarar inte tre routrar" },
    ],
    correct: "via-r2",
    explanation:
      "OSPF räknar cost utifrån hastigheten. Den direkta länken på 10 Mbit/s kostar 10. Länkarna på 1 Gbit/s kostar 1 vardera, så vägen via R2 kostar bara 2. Den billigaste vägen vinner, och det är vägen via R2.",
  },
  {
    kind: "fill",
    id: "routingprotokoll-cost",
    uses: ["ospf-cost", "bithastighet"],
    prompt: "Räkna ut OSPF-kostnaden för en länk. Använd 100 000 000 delat med hastigheten i bitar per sekund.",
    fields: [
      { id: "m10", label: "10 Mbit/s", answer: String(ospfCost(10_000_000)), format: "number" },
      { id: "m100", label: "100 Mbit/s", answer: String(ospfCost(100_000_000)), format: "number" },
      { id: "g1", label: "1 Gbit/s", answer: String(ospfCost(1_000_000_000)), format: "number" },
    ],
    explanation:
      "10 Mbit/s är 10 000 000 bitar per sekund, och 100 000 000 delat med det blir 10. 100 Mbit/s ger precis 1. 1 Gbit/s skulle ge 0,1, men kostnaden kan inte bli lägre än 1, så även den blir 1.",
  },
  {
    kind: "mcq",
    id: "routingprotokoll-v2",
    uses: ["rip", "multicast", "broadcast", "metric", "hop"],
    prompt: "Vad gör RIP v2 som RIP v1 inte gör?",
    options: [
      { id: "multicast", text: "Skickar sina uppdateringar som multicast" },
      { id: "fler-hopp", text: "Tillåter vägar som är längre än 15 hopp" },
      { id: "hastighet", text: "Väljer väg utifrån länkarnas hastighet" },
      { id: "30s", text: "Skickar hela tabellen var 30:e sekund" },
    ],
    correct: "multicast",
    explanation:
      "RIP v1 skickar sina uppdateringar som broadcast, och RIP v2 som multicast. Båda versionerna tillåter högst 15 hopp. Båda räknar bara hopp, det är OSPF som räknar med hastigheten. Att skicka hela tabellen var 30:e sekund är just det som RIP v1 gör.",
  },
  {
    kind: "matching",
    id: "routingprotokoll-loopar",
    uses: ["routingloop", "split-horizon", "poison-reverse", "hold-down", "hop"],
    prompt: "Para ihop varje skydd mot routingloopar med vad det gör.",
    pairs: [
      { left: { id: "aldrig-tillbaka", text: "Berättar aldrig om en route för grannen som routen kom ifrån" }, right: { id: "split", text: "Split horizon" } },
      { left: { id: "trasig", text: "Berättar att en route har slutat fungera, åt det håll routen kom ifrån" }, right: { id: "poison", text: "Poison reverse" } },
      { left: { id: "vanta", text: "Väntar en stund efter att en länk gått ner innan nya besked om den gäller" }, right: { id: "hold-down", text: "Hold-down timer" } },
      { left: { id: "femton", text: "En väg med fler än 15 hopp räknas som omöjlig att nå" }, right: { id: "max-hopp", text: "Max antal hopp" } },
    ],
    explanation:
      "Split horizon och poison reverse handlar båda om riktningen som routen kom ifrån, men split horizon tiger och poison reverse varnar. Hold-down timern väntar ut en länk som slår av och på. Max antal hopp sätter ett tak, så att ett paket inte kan gå runt för alltid.",
  },
  {
    kind: "mcq",
    id: "routingprotokoll-area",
    uses: ["area", "ospf", "routingtabell"],
    prompt: "Varför delar man in ett stort OSPF-nät i areor?",
    options: [
      { id: "mindre-tabeller", text: "Routrar utanför en area får bara en sammanfattning, så tabellerna blir mindre" },
      { id: "snabbare-lankar", text: "Länkarna inom en area blir snabbare" },
      { id: "broadcast", text: "Varje area blir en egen broadcastdomän för datorerna" },
      { id: "rip", text: "Routrarna i olika areor kan då köra RIP i stället" },
    ],
    correct: "mindre-tabeller",
    explanation:
      "Inom en area vet routrarna allt, men utåt skickas bara en sammanfattning, och det håller routingtabellerna lagom stora. Areor gör inte länkarna snabbare. Broadcastdomänerna styrs redan av routrarna, inte av areorna. Areor är en del av OSPF och har inget med RIP att göra.",
  },
  {
    kind: "mcq",
    id: "routingprotokoll-bgp",
    uses: ["bgp", "autonomt-system", "ospf", "rip", "internet"],
    prompt: "Vilket routingprotokoll binder ihop internet, mellan olika internetleverantörer?",
    options: [
      { id: "bgp", text: "BGP" },
      { id: "ospf", text: "OSPF" },
      { id: "rip2", text: "RIP v2" },
      { id: "rip1", text: "RIP v1" },
    ],
    correct: "bgp",
    explanation:
      "BGP används mellan autonoma system, till exempel mellan internetleverantörer, och det är det som håller ihop internet. OSPF passar stora nät inom en organisation. RIP i båda versionerna klarar bara 15 hopp och passar små nät.",
  },
];
