import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "ordering",
    id: "dhcpdns-dora",
    uses: ["dora", "dhcp"],
    prompt: "En dator startar och vill ha en adress via DHCP. Ordna meddelandena från första till sista.",
    items: [
      { id: "discover", text: "Discover" },
      { id: "offer", text: "Offer" },
      { id: "request", text: "Request" },
      { id: "ack", text: "Ack" },
    ],
    explanation:
      "Klienten börjar med att leta efter en server med Discover. Servern svarar med ett Offer. Klienten ber om den erbjudna adressen med Request, och servern bekräftar med Ack.",
  },
  {
    kind: "mcq",
    id: "dhcpdns-discover",
    uses: ["dora", "broadcast", "dhcp"],
    prompt: "Varför skickas Discover som en broadcast?",
    options: [
      { id: "ingen-adress", text: "Klienten har ingen IP-adress än och vet inte var servern finns" },
      { id: "alla-servrar", text: "Alla DHCP-servrar i hela företaget ska få chansen att svara" },
      { id: "snabbare", text: "Broadcast är snabbare än unicast" },
      { id: "routrar", text: "Routrarna ska kunna skicka frågan vidare till internet" },
    ],
    correct: "ingen-adress",
    explanation:
      "Klienten har ingen adress och vet inte vilken server den ska fråga, så den ropar till alla. En broadcast når bara den egna broadcastdomänen, inte servrar i andra nät. Den är inte snabbare än unicast. Routrar skickar inte broadcast vidare, och frågan ska inte ut på internet.",
  },
  {
    kind: "mcq",
    id: "dhcpdns-relay",
    uses: ["dhcp-relay", "dhcp", "router", "broadcastdoman"],
    prompt: "Företagets enda DHCP-server står på huvudkontoret. Datorerna på ett mindre kontor i ett annat nät ska också få adresser. Vad behövs på det lilla kontorets router?",
    options: [
      { id: "relay", text: "DHCP relay, som skickar frågorna vidare till servern" },
      { id: "andra-server", text: "En andra DHCP-server i samma nät som den första" },
      { id: "broadcast", text: "Inget, broadcast går fram till huvudkontoret ändå" },
      { id: "statiska", text: "Statiska routes till varje dator på det lilla kontoret" },
    ],
    correct: "relay",
    explanation:
      "En broadcast stannar vid routern, så frågan når aldrig servern av sig själv. En DHCP relay fångar upp den och skickar den vidare till servern. Två servrar i samma nät kan dela ut samma adress och skapa krockar. Statiska routes hjälper inte, eftersom datorerna inte ens har någon adress än.",
  },
  {
    kind: "mcq",
    id: "dhcpdns-lease",
    uses: ["lease", "scope"],
    prompt: "Varför har ett hotell ofta kortare lease-tid än ett litet kontor?",
    options: [
      { id: "gaster", text: "Gästerna kommer och går, så adresserna måste snabbt gå tillbaka till poolen" },
      { id: "sakerhet", text: "En kort lease gör att gästerna inte kan se varandras datorer" },
      { id: "snabbare", text: "En kort lease gör att nätet går snabbare för alla" },
      { id: "dns", text: "En kort lease behövs för att gästerna ska kunna använda DNS" },
    ],
    correct: "gaster",
    explanation:
      "På ett hotell kommer det hela tiden nya enheter, och då måste adresserna från de som har åkt gå tillbaka till poolen. Annars tar scopet slut. Lånetiden påverkar inte vad gästerna kan se av varandra. Den gör inte heller nätet snabbare, och DNS fungerar lika bra med en lång lease.",
  },
  {
    kind: "ordering",
    id: "dhcpdns-uppslagning",
    uses: ["dns-hierarki", "dns"],
    prompt: "Ingen har frågat efter www.coolabilar.se på länge. Ordna stegen i uppslagningen från första till sista.",
    items: [
      { id: "egen", text: "Datorn frågar sin egen DNS-server" },
      { id: "rot", text: "DNS-servern frågar en rotserver" },
      { id: "tld", text: "DNS-servern frågar servern för .se" },
      { id: "doman", text: "DNS-servern frågar servern för coolabilar.se" },
      { id: "svar", text: "Svaret skickas tillbaka till datorn" },
    ],
    explanation:
      "Datorn frågar alltid sin egen DNS-server först. Den börjar uppifrån i trädet, hos en rotserver, som pekar vidare till servern för .se. Den servern pekar vidare till coolabilar.se, som har svaret. Till sist får datorn svaret.",
  },
  {
    kind: "matching",
    id: "dhcpdns-poster",
    uses: ["resource-record", "dns"],
    prompt: "Para ihop varje sorts DNS-post med vad den innehåller.",
    pairs: [
      { left: { id: "ipv4", text: "Ett namn och dess IPv4-adress" }, right: { id: "a", text: "A" } },
      { left: { id: "alias", text: "Ett namn som pekar på ett annat namn" }, right: { id: "cname", text: "CNAME" } },
      { left: { id: "mail", text: "Vilken server som tar emot e-post för domänen" }, right: { id: "mx", text: "MX" } },
    ],
    explanation:
      "En A-post kopplar ett namn till en IPv4-adress. CNAME är ett alias som pekar på ett annat namn. MX pekar ut servern som tar emot domänens e-post.",
  },
  {
    kind: "fill",
    id: "dhcpdns-fqdn",
    uses: ["fqdn", "hostname"],
    prompt: "En server heter fil2 och hör till domänen kontoret.local. Vad är dess FQDN?",
    fields: [{ id: "fqdn", label: "FQDN", answer: "fil2.kontoret.local", format: "text" }],
    explanation:
      "Ett FQDN är datorns namn plus hela domänen, med punkter emellan. Först kommer namnet fil2, sedan domänen kontoret.local. Tillsammans blir det fil2.kontoret.local.",
  },
];
