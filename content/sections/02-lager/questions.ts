import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "ordering",
    id: "lager-osi-ordning",
    uses: [
      "osi-modellen", "applikationslagret", "presentationslagret", "sessionslagret",
      "transportlagret", "natverkslagret", "datalankslagret", "fysiska-lagret",
    ],
    prompt: "Ordna OSI-modellens lager. Lager 7 ska stå överst och lager 1 underst.",
    items: [
      { id: "applikation", text: "Applikation" },
      { id: "presentation", text: "Presentation" },
      { id: "session", text: "Session" },
      { id: "transport", text: "Transport" },
      { id: "natverk", text: "Nätverk" },
      { id: "datalank", text: "Datalänk" },
      { id: "fysiskt", text: "Fysiskt" },
    ],
    explanation:
      "Överst ligger applikation, där programmen lämnar över sin data. Sedan kommer presentation och session. Transport delar upp datan, nätverk sköter den logiska adressen och datalänk skickar till grannen. Underst ligger det fysiska lagret, som skickar själva signalerna.",
  },
  {
    kind: "ordering",
    id: "lager-pdu-kedja",
    uses: ["pdu", "inkapsling", "segment", "paket", "frame", "bit"],
    prompt: "Du skickar ett meddelande. Ordna namnen på datan i den ordning de dyker upp, från programmet ner till kabeln.",
    items: [
      { id: "data", text: "Data" },
      { id: "segment", text: "Segment" },
      { id: "paket", text: "Paket" },
      { id: "frame", text: "Frame" },
      { id: "bitar", text: "Bitar" },
    ],
    explanation:
      "Programmet börjar med data. Lager 4 delar upp den i segment, lager 3 gör segmenten till paket och lager 2 gör paketen till frames. Till sist skickar lager 1 ut allt som bitar.",
  },
  {
    kind: "matching",
    id: "lager-jobb",
    uses: [
      "presentationslagret", "sessionslagret", "transportlagret", "natverkslagret", "datalankslagret",
      "fysiska-lagret", "applikationslagret", "logisk-adress", "fysisk-adress", "trailer", "segment",
    ],
    prompt: "Vilket lager gör vad? Para ihop varje uppgift med rätt lager. Ett av lagren blir över.",
    pairs: [
      {
        left: { id: "signaler", text: "Gör om bitar till el, ljus eller radiovågor" },
        right: { id: "fysiskt", text: "Fysiska lagret" },
      },
      {
        left: { id: "granne", text: "Skickar till grannen med en fysisk adress och lägger till en trailer" },
        right: { id: "datalank", text: "Datalänkslagret" },
      },
      {
        left: { id: "vag", text: "Väljer väg med en logisk adress som gäller hela vägen" },
        right: { id: "natverk", text: "Nätverkslagret" },
      },
      {
        left: { id: "dela", text: "Delar upp datan i segment och numrerar dem" },
        right: { id: "transport", text: "Transportlagret" },
      },
      {
        left: { id: "samtal", text: "Öppnar, håller vid liv och stänger samtalet mellan två program" },
        right: { id: "session", text: "Sessionslagret" },
      },
      {
        left: { id: "kryptera", text: "Krypterar och ser till att båda sidor läser tecknen likadant" },
        right: { id: "presentation", text: "Presentationslagret" },
      },
    ],
    distractors: [{ id: "applikation", text: "Applikationslagret" }],
    explanation:
      "Signaler hör till det fysiska lagret och grannen med den fysiska adressen till datalänkslagret. Den logiska adressen hela vägen är nätverkslagret, och segmenten är transportlagret. Samtalet sköts av sessionslagret och kryptering och teckenkodning av presentationslagret. Applikationslagret blir över: där lämnar programmen bara över sin data.",
  },
  {
    kind: "mcq",
    id: "lager-kabel",
    uses: ["fysiska-lagret", "datalankslagret", "natverkslagret", "transportlagret", "frame", "segment"],
    prompt: "Kabeln har glidit ur datorn, så inga signaler kommer fram. I vilket lager sitter felet?",
    options: [
      { id: "l1", text: "Fysiska lagret" },
      { id: "l2", text: "Datalänkslagret" },
      { id: "l3", text: "Nätverkslagret" },
      { id: "l4", text: "Transportlagret" },
    ],
    correct: "l1",
    explanation:
      "Kabeln och signalerna i den hör till det fysiska lagret, lager 1. Utan signaler finns det inga bitar för de andra lagren att jobba med. Datalänkslagret skickar frames till grannen, men det behöver en fungerande kabel under sig. Nätverkslagret och transportlagret jobbar ännu högre upp, med adresser och segment.",
  },
  {
    kind: "mcq",
    id: "lager-adress-hela-vagen",
    uses: ["natverkslagret", "datalankslagret", "transportlagret", "fysiska-lagret", "logisk-adress", "fysisk-adress"],
    prompt: "Du skickar något till en server i ett annat land, och datan passerar många nät på vägen. Vilket lager har adressen som gäller hela vägen fram?",
    options: [
      { id: "l3", text: "Nätverkslagret" },
      { id: "l2", text: "Datalänkslagret" },
      { id: "l4", text: "Transportlagret" },
      { id: "l1", text: "Fysiska lagret" },
    ],
    correct: "l3",
    explanation:
      "Nätverkslagret har den logiska adressen, som pekar ut slutmålet och gäller genom alla nät. Datalänkslagret har också en adress, men den fysiska adressen pekar bara ut grannen och byts ut på varje sträcka. Transportlagret delar upp och numrerar datan men pekar inte ut något mål. Det fysiska lagret har inga adresser alls, det skickar bara signaler.",
  },
  {
    kind: "mcq",
    id: "lager-uppackning",
    uses: ["inkapsling", "header", "trailer", "datalankslagret", "natverkslagret", "transportlagret", "applikationslagret"],
    prompt: "Mottagaren har tagit emot bitarna och börjar packa upp. Vilket lagers header läses och tas bort först?",
    options: [
      { id: "lager2", text: "Datalänkslagrets (lager 2)" },
      { id: "lager3", text: "Nätverkslagrets (lager 3)" },
      { id: "lager4", text: "Transportlagrets (lager 4)" },
      { id: "lager7", text: "Applikationslagrets (lager 7)" },
    ],
    correct: "lager2",
    explanation:
      "Uppackningen går i omvänd ordning mot inkapslingen. Datalänkslagret satte sin header och trailer ytterst, så det är den mottagaren stöter på först. Sedan tas nätverkslagrets header bort och därefter transportlagrets. Applikationslagret ligger överst och får datan sist av alla.",
  },
  {
    kind: "mcq",
    id: "lager-tcpip",
    uses: ["tcp-ip-modellen", "osi-modellen", "applikationslagret", "presentationslagret", "sessionslagret"],
    prompt: "TCP/IP-modellen har färre lager än OSI. Vilket TCP/IP-lager motsvarar OSI-lagren applikation, presentation och session?",
    options: [
      { id: "applikation", text: "Applikation" },
      { id: "transport", text: "Transport" },
      { id: "internet", text: "Internet" },
      { id: "network-access", text: "Network Access" },
    ],
    correct: "applikation",
    explanation:
      "TCP/IP-modellen slår ihop de tre översta OSI-lagren till ett enda lager, Applikation. Transport motsvarar bara transportlagret, lager 4. Internet motsvarar nätverkslagret, lager 3. Network Access är de två understa OSI-lagren, datalänk och fysiskt.",
  },
];
