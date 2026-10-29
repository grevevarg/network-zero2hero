import type { Concept } from "../src/build/schema.ts";

/** Every concept the site teaches, in the order the sections introduce them. */
export const concepts: Concept[] = [
  // 1. Vad är ett nätverk?
  { id: "natverk", section: "natverk", term: "Nätverk", explanation: "Två eller fler enheter som är kopplade så att de kan skicka data till varandra." },
  { id: "tjanst", section: "natverk", term: "Tjänst", explanation: "Något som en enhet erbjuder andra, till exempel en webbsida eller bilden från en kamera. Varje tjänst körs av ett eget program." },
  { id: "server", section: "natverk", term: "Server", explanation: "En enhet som erbjuder en tjänst. Den kan svara många klienter samtidigt. Det är rollen som räknas, inte storleken." },
  { id: "klient", section: "natverk", term: "Klient", explanation: "En enhet som använder en tjänst som en server erbjuder, till exempel din mobil eller dator." },
  { id: "peer-to-peer", section: "natverk", term: "Peer-to-peer (P2P)", explanation: "Ett nät utan central server. Alla är jämlikar (peers) och är både klient och server samtidigt." },
  { id: "redundans", section: "natverk", term: "Redundans", explanation: "Det finns reserver, till exempel extra vägar eller kopior, så att allt fungerar fast en del går sönder." },
  { id: "lan", section: "natverk", term: "LAN", explanation: "Local Area Network. Ett lokalt nätverk, till exempel hemma eller på ett kontor." },
  { id: "wan", section: "natverk", term: "WAN", explanation: "Wide Area Network. Binder ihop nätverk som ligger långt ifrån varandra." },
  { id: "internet", section: "natverk", term: "Internet", explanation: "Världens största nätverk. Massor av nätverk som är ihopkopplade, ett nätverk av nätverk." },
  { id: "topologi", section: "natverk", term: "Topologi", explanation: "Hur ett nätverk är uppbyggt, alltså vad som är kopplat till vad." },
  { id: "fysisk-topologi", section: "natverk", term: "Fysisk topologi", explanation: "Var allt faktiskt finns: enheter, kablar och uttag. Fungerar som ritning och dokumentation." },
  { id: "logisk-topologi", section: "natverk", term: "Logisk topologi", explanation: "Hur nätet är uppdelat och vem som kan prata med vem, sett från enheterna." },
  { id: "stjarna", section: "natverk", term: "Stjärna", explanation: "Alla enheter har en egen kabel till en gemensam enhet i mitten. Vanligast i dag." },
  { id: "single-point-of-failure", section: "natverk", term: "Single point of failure", explanation: "En enda del som får hela nätet att sluta fungera om den går sönder, till exempel enheten i mitten av en stjärna." },
  { id: "buss", section: "natverk", term: "Buss", explanation: "Alla enheter sitter på en och samma kabel." },
  { id: "ring", section: "natverk", term: "Ring", explanation: "Varje enhet är kopplad till två grannar, och trafiken går åt ett håll runt ringen." },
  { id: "trad", section: "natverk", term: "Träd", explanation: "Flera stjärnor som hänger under en gemensam punkt. Ett sätt att bygga ut ett stjärnnät." },
  { id: "mesh", section: "natverk", term: "Mesh och full mesh", explanation: "Mesh: enheterna har flera vägar till varandra. Full mesh: varje enhet har en direkt koppling till alla andra." },
];
