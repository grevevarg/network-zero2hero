import type { QuestionInput } from "../../../src/build/schema.ts";
import { domainCount, HEIGHT, interfaces, links, switches, WIDTH } from "./network.ts";

export const questions: QuestionInput[] = [
  {
    kind: "fill",
    id: "slutuppdrag-domaner",
    uses: ["broadcastdoman", "router", "switch", "interface"],
    prompt: "Hur många broadcastdomäner finns det i nätet på bilden?",
    diagram: "natet",
    fields: [{ id: "antal", label: "Antal broadcastdomäner", answer: String(domainCount), format: "number" }],
    explanation:
      "En broadcast stannar vid en router, så varje interface på en router hör till en egen broadcastdomän. Switchar delar inte upp något, så R1, SW1, SW2, PC1 och PC2 är en enda domän. R2, SW3 och PC3 är en till, och R3 och PC4 en tredje. Länkarna mellan routrarna räknas också, och de är två. Det blir fem.",
  },
  {
    kind: "repair",
    id: "slutuppdrag-reparera",
    uses: ["broadcastdoman", "router", "subnatmask", "prefix", "natverksadress", "broadcastadress", "host", "subnatting", "ip-plan"],
    prompt:
      "Samma nät, men nu med adresser. Något stämmer inte. Tryck på en adress och skriv om den tills hela nätet håller. Det finns flera sätt att göra det på.",
    diagram: "natet",
    width: WIDTH,
    height: HEIGHT,
    switches,
    interfaces: interfaces.map(({ id, label, x, y, address, repaired }) => ({ id, label, x, y, address, repaired })),
    links,
    planted: ["broadcast-address", "different-nets", "overlap"],
    explanation:
      "PC2 har 10.0.0.63/26, som är broadcastadressen i 10.0.0.0/26, så ge den till exempel 10.0.0.62/26. På länken mellan R1 och R2 ligger 10.0.0.198/30 i nätet 10.0.0.196/30 och inte i 10.0.0.192/30, så skriv 10.0.0.194/30. Nätet 10.0.0.112/28 ligger inuti 10.0.0.64/26, så R3 och PC4 behöver ett eget nät. Det kan vara 10.0.0.129/28 och 10.0.0.130/28. Andra adresser går också bra, så länge varje broadcastdomän har ett eget nät.",
  },
];
