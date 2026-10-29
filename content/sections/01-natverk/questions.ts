import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "matching",
    id: "natverk-former",
    uses: ["stjarna", "buss", "ring", "trad", "mesh"],
    prompt: "Vilken form har nätet på varje bild? Välj ett namn för varje bild.",
    pairs: [
      { left: { id: "bild-stjarna", diagram: "q-star" }, right: { id: "stjarna", text: "Stjärna" } },
      { left: { id: "bild-buss", diagram: "q-bus" }, right: { id: "buss", text: "Buss" } },
      { left: { id: "bild-ring", diagram: "q-ring" }, right: { id: "ring", text: "Ring" } },
      { left: { id: "bild-trad", diagram: "q-tree" }, right: { id: "trad", text: "Träd" } },
      { left: { id: "bild-mesh", diagram: "q-mesh" }, right: { id: "mesh", text: "Full mesh" } },
    ],
    explanation:
      "Stjärnan känns igen på att alla linjer går till samma punkt i mitten. I trädet hänger flera sådana stjärnor under en gemensam punkt. Bussen har en enda lång kabel som alla sitter på. I ringen har varje enhet exakt två grannar, och i full mesh har varje enhet en egen linje till alla andra.",
  },
  {
    kind: "mcq",
    id: "natverk-kamera-server",
    uses: ["server", "klient", "tjanst"],
    prompt: "En kamera i hallen skickar bild till din mobil när du vill kolla läget hemma. Vilken enhet är servern?",
    options: [
      { id: "kameran", text: "Kameran, eftersom den erbjuder bilden som en tjänst" },
      { id: "mobilen", text: "Mobilen, eftersom den bestämmer när bilden ska visas" },
      { id: "bada", text: "Båda, eftersom data skickas åt båda hållen" },
      { id: "ingen", text: "Ingen av dem, eftersom en server måste vara en egen dator" },
    ],
    correct: "kameran",
    explanation:
      "Kameran är servern eftersom den erbjuder en tjänst, nämligen bilden. Mobilen ber om bilden, och det gör den till klient även om det är du som bestämmer när du tittar. Att data går åt båda hållen ändrar inte rollerna. En server behöver inte heller vara en stor dator, det är rollen som räknas.",
  },
  {
    kind: "mcq",
    id: "natverk-p2p",
    uses: ["peer-to-peer", "klient", "server"],
    prompt: "Vad stämmer om ett peer-to-peer-nät?",
    options: [
      { id: "bade-och", text: "Varje dator både hämtar data från andra och delar ut data till andra" },
      { id: "central", text: "En central server delar ut data till alla datorer i nätet" },
      { id: "bara-hamtar", text: "Varje dator hämtar data från andra men delar aldrig ut något själv" },
      { id: "startaren", text: "Bara den dator som startade nätet får dela ut data till de andra" },
    ],
    correct: "bade-och",
    explanation:
      "I peer-to-peer är alla jämlikar, så varje dator är både klient och server. Den hämtar data och delar samtidigt ut det den redan har. En central server som delar ut allt är precis det som saknas i peer-to-peer. Om ingen delade ut något, eller bara en dator fick göra det, skulle det inte vara jämlikt längre.",
  },
  {
    kind: "mcq",
    id: "natverk-ritning",
    uses: ["fysisk-topologi", "logisk-topologi"],
    prompt: "Du ritar en karta som visar var varje dator, kabel och uttag sitter i huset. Vad är det du ritar?",
    options: [
      { id: "fysisk", text: "Den fysiska topologin" },
      { id: "logisk", text: "Den logiska topologin" },
      { id: "bada", text: "Både den fysiska och den logiska topologin" },
    ],
    correct: "fysisk",
    explanation:
      "En karta över var saker faktiskt sitter är den fysiska topologin. Den logiska topologin visar i stället hur nätet är uppdelat och vem som kan prata med vem. Det syns inte på en karta över kablar och uttag, så kartan visar inte båda.",
  },
  {
    kind: "mcq",
    id: "natverk-stjarna-nackdel",
    uses: ["stjarna", "single-point-of-failure", "buss", "ring", "mesh"],
    prompt: "Stjärna är den vanligaste formen i dag. Vilken nackdel har den?",
    options: [
      { id: "kabel", text: "Det går åt väldigt mycket kabel" },
      { id: "ett-hall", text: "Trafiken kan bara gå åt ett håll" },
      { id: "en-kabel", text: "Alla enheter delar på samma kabel" },
      { id: "alla-till-alla", text: "Varje enhet behöver kabel till alla andra" },
    ],
    correct: "kabel",
    explanation:
      "I en stjärna har varje enhet en egen kabel till mitten, så det går åt mycket kabel. Stjärnans andra nackdel, att enheten i mitten är en single point of failure, finns inte bland svaren. Att trafiken bara går åt ett håll gäller ringen. En gemensam kabel för alla är bussen. Kabel från varje enhet till alla andra är full mesh, inte stjärna.",
  },
  {
    kind: "matching",
    id: "natverk-begrepp",
    uses: ["peer-to-peer", "server", "klient", "lan", "wan"],
    prompt: "Para ihop varje beskrivning med rätt begrepp.",
    pairs: [
      {
        left: { id: "jamlike", text: "Både hämtar och delar ut data, som jämlike med alla andra i nätet" },
        right: { id: "peer", text: "Peer" },
      },
      {
        left: { id: "erbjuder", text: "Erbjuder en tjänst och kan svara många samtidigt" },
        right: { id: "server", text: "Server" },
      },
      {
        left: { id: "anvander", text: "Använder en tjänst som en annan enhet erbjuder" },
        right: { id: "klient", text: "Klient" },
      },
      {
        left: { id: "lokalt", text: "Ett nät hemma eller på ett kontor, där allt finns nära och har samma ägare" },
        right: { id: "lan", text: "LAN" },
      },
      {
        left: { id: "langt", text: "Binder ihop nätverk som ligger långt ifrån varandra, till exempel i olika länder" },
        right: { id: "wan", text: "WAN" },
      },
    ],
    explanation:
      "En peer är både klient och server. En server erbjuder tjänster, en klient använder dem. LAN är det lokala nätet och WAN binder ihop nät på långt avstånd.",
  },
];
