import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "mcq",
    id: "vlan-broadcast",
    uses: ["vlan", "broadcast", "broadcastdoman", "access-port"],
    prompt: "En switch har portar i VLAN 10, VLAN 20 och VLAN 30. En dator i VLAN 10 skickar en broadcast. Vilka får den?",
    options: [
      { id: "vlan10", text: "Bara enheterna på portar i VLAN 10" },
      { id: "alla", text: "Alla enheter på switchen" },
      { id: "ingen", text: "Ingen, broadcast fungerar inte i ett VLAN" },
      { id: "grann-vlan", text: "Enheterna i VLAN 10 och närmaste VLAN, VLAN 20" },
    ],
    correct: "vlan10",
    explanation:
      "Varje VLAN är en egen broadcastdomän, så broadcasten når bara portar i VLAN 10. Det är just därför man delar upp en switch i VLAN. Broadcast fungerar precis som vanligt inom VLAN:et. Det finns ingen koppling mellan VLAN som ligger nära varandra i nummer.",
  },
  {
    kind: "mcq",
    id: "vlan-trunk",
    uses: ["trunk-port", "access-port", "vlan"],
    prompt: "Kabeln mellan två switchar ska bära trafik från VLAN 10, 20 och 30. Hur ställer du in portarna i båda ändar?",
    options: [
      { id: "trunk", text: "Som trunk-portar" },
      { id: "access", text: "Som access-portar i VLAN 10" },
      { id: "access-1", text: "Som access-portar i VLAN 1" },
      { id: "tre-kablar", text: "Det går inte, varje VLAN måste ha en egen kabel" },
    ],
    correct: "trunk",
    explanation:
      "En trunk-port bär alla VLAN i samma kabel och taggar varje frame med dess VLAN ID. En access-port hör till ett enda VLAN, så med VLAN 10 skulle 20 och 30 inte komma fram. VLAN 1 är standardinställningen och hjälper inte heller. Det går att ha en kabel per VLAN, men det är just det trunken gör onödigt.",
  },
  {
    kind: "fill",
    id: "vlan-tagg",
    uses: ["dot1q", "vlan-id", "bit", "byte"],
    prompt: "Svara med siffror.",
    fields: [
      { id: "storlek", label: "Hur många bytes är en 802.1Q-tagg?", answer: "4", format: "number" },
      { id: "varden", label: "Hur många olika värden ryms i ett VLAN ID på 12 bitar?", answer: String(2 ** 12), format: "number" },
    ],
    explanation:
      "802.1Q-taggen är 4 bytes. VLAN ID är 12 bitar, och varje bit dubblar antalet värden, så det blir 2 upphöjt till 12, alltså 4096. Värdena går från 0 till 4095, men den första och den sista är reserverade.",
  },
  {
    kind: "mcq",
    id: "vlan-routing",
    uses: ["inter-vlan-routing", "vlan", "router", "l3-switch"],
    prompt: "En dator i VLAN 10 ska nå en skrivare i VLAN 20. Båda sitter i samma switch. Vad behövs?",
    options: [
      { id: "lager3", text: "En router eller lager 3-switch som routar mellan VLAN:en" },
      { id: "inget", text: "Inget, de sitter ju i samma switch" },
      { id: "trunk", text: "En trunk-port mellan datorn och skrivaren" },
      { id: "broadcast", text: "Att datorn skickar sina utskrifter som broadcast" },
    ],
    correct: "lager3",
    explanation:
      "VLAN 10 och VLAN 20 är olika broadcastdomäner med olika nät, så trafiken måste routas på lager 3. Att de sitter i samma switch spelar ingen roll, VLAN:en är ändå åtskilda. En trunk bär VLAN mellan switchar men kopplar inte ihop dem. En broadcast stannar inom det egna VLAN:et.",
  },
  {
    kind: "matching",
    id: "vlan-begrepp",
    uses: ["access-port", "trunk-port", "dot1q", "vlan-id"],
    prompt: "Para ihop varje beskrivning med rätt begrepp.",
    pairs: [
      { left: { id: "ett", text: "Hör till ett enda VLAN och skickar vanliga frames utan tagg" }, right: { id: "access", text: "Access-port" } },
      { left: { id: "alla", text: "Bär trafik från flera VLAN i samma kabel" }, right: { id: "trunk", text: "Trunk-port" } },
      { left: { id: "standard", text: "Standarden för taggen som stoppas in i framen" }, right: { id: "dot1q", text: "802.1Q" } },
      { left: { id: "tal", text: "Talet i taggen som säger vilket VLAN framen hör till" }, right: { id: "id", text: "VLAN ID" } },
    ],
    explanation:
      "En access-port hör till ett VLAN och en trunk-port bär många. Taggen som används på trunken följer standarden 802.1Q. Inne i taggen är VLAN ID det tal som pekar ut VLAN:et.",
  },
  {
    kind: "mcq",
    id: "vlan-1",
    uses: ["vlan", "access-port"],
    prompt: "Varför ska du inte använda VLAN 1 till ett av dina egna VLAN?",
    options: [
      { id: "standard", text: "Alla portar hör ofta till VLAN 1 från början, så det blandas lätt ihop med ny utrustning" },
      { id: "reserverat", text: "VLAN 1 är reserverat för trunkar och kan inte ha access-portar" },
      { id: "langsamt", text: "VLAN 1 är långsammare än VLAN med högre nummer" },
      { id: "broadcast", text: "VLAN 1 skickar all trafik som broadcast" },
    ],
    correct: "standard",
    explanation:
      "På många switchar hör alla portar till VLAN 1 från början. Använder du det själv kan ny utrustning med standardinställningen hamna i ditt VLAN. VLAN 1 kan ha access-portar, och det är inte reserverat för trunkar. Numret påverkar inte hastigheten, och trafiken i VLAN 1 är vanlig unicast precis som i andra VLAN.",
  },
  {
    kind: "mcq",
    id: "vlan-domaner",
    uses: ["vlan", "broadcastdoman", "switch"],
    prompt: "En switch med 24 portar är uppdelad i tre VLAN. Hur många broadcastdomäner finns det i switchen?",
    options: [
      { id: "tre", text: "3" },
      { id: "en", text: "1" },
      { id: "fyra", text: "4" },
      { id: "tjugofyra", text: "24" },
    ],
    correct: "tre",
    explanation:
      "Varje VLAN är en egen broadcastdomän, så tre VLAN ger tre domäner. Utan VLAN hade hela switchen varit en enda broadcastdomän. Fyra skulle kräva ett VLAN till. 24 är antalet portar, men portar i samma VLAN delar broadcastdomän.",
  },
];
