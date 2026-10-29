import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "matching",
    id: "switchar-enheter",
    uses: ["repeater", "mediakonverter", "hub", "switch", "mac-tabell"],
    prompt: "Para ihop varje beskrivning med rätt enhet.",
    pairs: [
      { left: { id: "forstarker", text: "Tar emot en signal, förstärker den och skickar den vidare" }, right: { id: "repeater", text: "Repeater" } },
      { left: { id: "koppar-fiber", text: "Kopplar ihop två olika sorters kablar, till exempel koppar och fiber" }, right: { id: "mediakonverter", text: "Mediakonverter" } },
      { left: { id: "alla-portar", text: "Skickar allt den tar emot ut på alla andra portar" }, right: { id: "hubb", text: "Hubb" } },
      { left: { id: "lar-sig", text: "Lär sig vilken MAC-adress som sitter på vilken port" }, right: { id: "switch", text: "Switch" } },
    ],
    explanation:
      "Repeatern förstärker bara signalen, och mediakonvertern gör om den mellan två sorters kablar. Hubben skickar allt till alla, eftersom den inte förstår vem datan är till. Bara switchen läser MAC-adresser och bygger en MAC-tabell.",
  },
  {
    kind: "mcq",
    id: "switchar-okand-mottagare",
    uses: ["switch", "mac-tabell", "flooding", "mac-adress", "frame"],
    prompt: "En switch tar emot en frame till en MAC-adress som inte finns i dess MAC-tabell. Vad gör switchen?",
    options: [
      { id: "flood", text: "Skickar ut framen på alla portar utom den den kom in på" },
      { id: "kasta", text: "Kastar framen eftersom mottagaren är okänd" },
      { id: "tillbaka", text: "Skickar tillbaka framen till porten den kom in på" },
      { id: "alla", text: "Skickar ut framen på alla portar, även den den kom in på" },
    ],
    correct: "flood",
    explanation:
      "När mottagaren är okänd gör switchen flooding: framen går ut på alla portar utom den den kom in på. Den kastar inte framen, för då skulle ingen ny enhet någonsin nås. Att skicka tillbaka framen till avsändaren hjälper ingen. Porten den kom in på hoppas över, eftersom avsändaren redan sitter där.",
  },
  {
    kind: "mcq",
    id: "switchar-oui",
    uses: ["mac-adress", "oui"],
    prompt: "Vad berättar den första halvan av en MAC-adress?",
    options: [
      { id: "tillverkare", text: "Vem som har tillverkat nätverkskortet" },
      { id: "unik", text: "Vilket exemplar av kortet det är i serien" },
      { id: "port", text: "Vilken port på switchen kortet sitter i" },
      { id: "nat", text: "Vilket nät enheten befinner sig i" },
    ],
    correct: "tillverkare",
    explanation:
      "Den första halvan, OUI, är tillverkarens nummer. Det är den andra halvan som skiljer korten åt inom tillverkarens serie. MAC-adressen bränns in i kortet, så den säger inget om vilken port eller vilket nät enheten råkar sitta i.",
  },
  {
    kind: "mcq",
    id: "switchar-hexsiffror",
    uses: ["mac-adress", "hex", "bit"],
    prompt: "En MAC-adress är 48 bitar lång. Hur många hexsiffror skrivs den med?",
    options: [
      { id: "tolv", text: "12" },
      { id: "sex", text: "6" },
      { id: "tjugofyra", text: "24" },
      { id: "fyrtioatta", text: "48" },
    ],
    correct: "tolv",
    explanation:
      "En hexsiffra motsvarar fyra bitar, och 48 delat med 4 är 12. Sex är antalet par, alltså antalet bytes. 24 är antalet bitar i varje halva av adressen. 48 är antalet bitar, inte hexsiffror.",
  },
  {
    kind: "mcq",
    id: "switchar-broadcastadress",
    uses: ["broadcast", "mac-adress", "hex"],
    prompt: "Vilken mottagaradress har en broadcast på lager 2?",
    options: [
      { id: "ff", text: "FF:FF:FF:FF:FF:FF" },
      { id: "noll", text: "00:00:00:00:00:00" },
      { id: "01", text: "01:00:00:00:00:00" },
      { id: "ff-halva", text: "FF:FF:FF:00:00:00" },
    ],
    correct: "ff",
    explanation:
      "En broadcast går till FF:FF:FF:FF:FF:FF, där alla 48 bitar är satta till ett. En adress med bara nollor är inte en broadcast. Adresser som börjar med 01 hör till multicast. Att bara första halvan är FF räcker inte, det är hela adressen som ska vara FF.",
  },
  {
    kind: "matching",
    id: "switchar-cast",
    uses: ["unicast", "broadcast", "multicast"],
    prompt: "Para ihop varje sätt att skicka med rätt beskrivning.",
    pairs: [
      { left: { id: "en", text: "Från en enhet till en enda annan enhet" }, right: { id: "unicast", text: "Unicast" } },
      { left: { id: "alla", text: "Till alla i nätet, och alla måste lyssna" }, right: { id: "broadcast", text: "Broadcast" } },
      { left: { id: "valt", text: "Till alla som har valt att lyssna, som en tv-sändning" }, right: { id: "multicast", text: "Multicast" } },
    ],
    explanation:
      "Unicast är en till en, och det är så nästan all trafik går. Broadcast når alla i broadcastdomänen vare sig de vill eller inte. Multicast når bara dem som valt att lyssna.",
  },
  {
    kind: "mcq",
    id: "switchar-domaner",
    uses: ["broadcastdoman", "switch"],
    prompt: "Två switchar är kopplade till varandra. Varje switch har tre datorer. Hur många broadcastdomäner finns det?",
    options: [
      { id: "en", text: "1" },
      { id: "tva", text: "2" },
      { id: "sex", text: "6" },
      { id: "atta", text: "8" },
    ],
    correct: "en",
    explanation:
      "Allt som hänger ihop på lager 2 är en och samma broadcastdomän, hur många switchar det än är. Två domäner skulle kräva en enhet på lager 3 mellan switcharna. Sex är antalet datorer, och åtta är alla enheter, men ingen av dem delar nätet.",
  },
];
