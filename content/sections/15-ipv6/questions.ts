import type { QuestionInput } from "../../../src/build/schema.ts";
import { compressIPv6, eui64, expandIPv6 } from "../../../src/lib/net.ts";

const long = "2001:0db8:0000:0000:0000:ff00:0042:8329";
const mac = "00:1A:2B:3C:4D:5E";

export const questions: QuestionInput[] = [
  {
    kind: "fill",
    id: "ipv6-forkorta",
    uses: ["ipv6-forkortning"],
    prompt: `Skriv adressen så kort som reglerna tillåter.\n\n\`${long}\``,
    fields: [{ id: "kort", label: "Förkortad adress", answer: compressIPv6(long), format: "text" }],
    explanation:
      "Först stryks nollorna i början av varje grupp: 0db8 blir db8, 0042 blir 42 och 0000 blir 0. Sedan finns det en följd av tre grupper med bara nollor, och den byts mot ::. Resultatet blir 2001:db8::ff00:42:8329.",
  },
  {
    kind: "fill",
    id: "ipv6-skriv-ut",
    uses: ["ipv6-forkortning", "ipv6"],
    prompt: "Skriv ut hela adressen `2001:db8::1`, med alla åtta grupper och fyra siffror i varje.",
    fields: [{ id: "lang", label: "Hela adressen", answer: expandIPv6("2001:db8::1"), format: "text" }],
    explanation:
      "Adressen har tre grupper, 2001, db8 och 1, så :: står för fem grupper med nollor. Varje grupp fylls ut med nollor framifrån till fyra siffror. Då blir det 2001:0db8:0000:0000:0000:0000:0000:0001.",
  },
  {
    kind: "mcq",
    id: "ipv6-giltig",
    uses: ["ipv6-forkortning"],
    prompt: "Vilken av förkortningarna av 2001:0db8:0000:0000:0001:0000:0000:0001 följer reglerna?",
    options: [
      { id: "ratt", text: "2001:db8::1:0:0:1" },
      { id: "tva-kolon", text: "2001:db8::1::1" },
      { id: "for-fa", text: "2001:db8:1:1" },
      { id: "slutnollor", text: "21:db8::1:0:0:1" },
    ],
    correct: "ratt",
    explanation:
      "I 2001:db8::1:0:0:1 har den första nollföljden bytts mot :: och den andra skrivits som 0:0, vilket är tillåtet. Med :: på två ställen går det inte att veta hur många nollor varje :: står för. 2001:db8:1:1 har bara fyra grupper och inget ::, så nollgrupperna har försvunnit. I 21:db8 har nollor strukits i mitten och slutet av 2001, men bara nollor först i en grupp får strykas.",
  },
  {
    kind: "matching",
    id: "ipv6-sorter",
    uses: ["global-unicast", "link-local", "unique-local", "multicast", "loopback"],
    prompt: "Vilken sorts adress är det? Para ihop.",
    pairs: [
      { left: { id: "fe80", text: "fe80::1" }, right: { id: "link", text: "Link-local" } },
      { left: { id: "ff02", text: "ff02::1" }, right: { id: "multi", text: "Multicast" } },
      { left: { id: "fd12", text: "fd12:3456::1" }, right: { id: "ula", text: "Unique local" } },
      { left: { id: "2345", text: "2345:6789::1" }, right: { id: "global", text: "Global unicast" } },
      { left: { id: "lo", text: "::1" }, right: { id: "loopback", text: "Loopback" } },
    ],
    explanation:
      "fe80 är link-local och ff är multicast. fd är unique local, motsvarigheten till privata adresser. En adress som börjar med 2 eller 3 är global unicast. ::1 är loopback, precis som 127.0.0.1 i IPv4.",
  },
  {
    kind: "fill",
    id: "ipv6-eui64",
    uses: ["eui-64", "link-local", "mac-adress"],
    prompt: `Ett interface har MAC-adressen ${mac}. Vilken link-local-adress får det med EUI-64? Börja med fe80::`,
    fields: [{ id: "lla", label: "Link-local-adress", answer: compressIPv6(`fe80::${eui64(mac)}`), format: "ipv6" }],
    explanation:
      "Dela MAC-adressen i 00:1A:2B och 3C:4D:5E och lägg in FF:FE i mitten. Vänd sedan den sjunde biten i första byten, så att 00 blir 02. Interface-ID:t blir 021a:2bff:fe3c:4d5e, och med fe80:: framför blir adressen fe80::21a:2bff:fe3c:4d5e.",
  },
  {
    kind: "mcq",
    id: "ipv6-ingen-nat",
    uses: ["nat", "global-unicast", "ipv6"],
    prompt: "Varför behövs ingen NAT i IPv6?",
    options: [
      { id: "adresser", text: "Det finns så många adresser att varje enhet kan få en egen publik adress" },
      { id: "kryptering", text: "IPv6 krypterar all trafik, så adresserna behöver inte döljas" },
      { id: "link-local", text: "Link-local-adresser kan användas direkt ute på internet" },
      { id: "anycast", text: "Anycast skickar trafiken till rätt enhet utan att adressen behöver översättas" },
    ],
    correct: "adresser",
    explanation:
      "NAT behövdes för att publika IPv4-adresser tog slut, och med 128 bitar räcker IPv6-adresserna till alla. Varje enhet får en global unicast-adress och routas ut direkt. Kryptering har inget med NAT att göra. Link-local kommer aldrig förbi en router, och anycast handlar om att nå närmaste av flera enheter.",
  },
  {
    kind: "mcq",
    id: "ipv6-arp",
    uses: ["ndp", "arp", "aaaa", "broadcast"],
    prompt: "IPv6 har ingen ARP. Vad används i stället för att hitta grannarnas MAC-adresser?",
    options: [
      { id: "ndp", text: "Neighbor Discovery, som bygger på ICMPv6" },
      { id: "arp6", text: "ARP som förut, fast med längre adresser" },
      { id: "broadcast", text: "En broadcast till FF:FF:FF:FF:FF:FF med frågan" },
      { id: "aaaa", text: "En DNS-uppslagning efter grannens AAAA-post" },
    ],
    correct: "ndp",
    explanation:
      "I IPv6 sköter Neighbor Discovery det som ARP gjorde, med meddelanden i ICMPv6. ARP används inte alls i IPv6. Broadcast finns inte i IPv6, multicast används i stället. En AAAA-post ger en IPv6-adress till ett namn, inte en MAC-adress.",
  },
];
