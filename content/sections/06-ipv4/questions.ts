import type { QuestionInput } from "../../../src/build/schema.ts";
import { formatIPv4, fromBinary, prefixToMask, toBinary } from "../../../src/lib/net.ts";

export const questions: QuestionInput[] = [
  {
    kind: "fill",
    id: "ipv4-binart",
    uses: ["binart", "oktett", "bit"],
    prompt: "Räkna om mellan vanliga tal och binärt. Skriv binära svar med åtta bitar.",
    fields: [
      { id: "till-binart", label: "172 binärt", answer: toBinary(172), format: "binary" },
      { id: "till-decimalt", label: "00101101 som vanligt tal", answer: String(fromBinary("00101101")), format: "number" },
    ],
    explanation:
      "172 = 128 + 32 + 8 + 4, så ettorna hamnar på 128, 32, 8 och 4: 10101100. I 00101101 står ettorna på 32, 8, 4 och 1. 32 + 8 + 4 + 1 = 45.",
  },
  {
    kind: "fill",
    id: "ipv4-mask-prefix",
    uses: ["subnatmask", "prefix"],
    prompt: "Skriv masken som adress och prefixet som tal.",
    fields: [
      { id: "mask16", label: "Masken för /16", answer: formatIPv4(prefixToMask(16)), format: "ipv4" },
      { id: "prefix24", label: "Prefixet för 255.255.255.0 (bara siffrorna)", answer: "24", format: "number" },
    ],
    explanation:
      "/16 betyder 16 ettor, alltså två hela oktetter med ettor: 255.255.0.0. 255.255.255.0 har tre oktetter med ettor. Tre gånger åtta är 24, så prefixet är /24.",
  },
  {
    kind: "mcq",
    id: "ipv4-klass",
    uses: ["adressklass", "oktett"],
    prompt: "Vilken klass hör adressen 150.20.3.4 till?",
    options: [
      { id: "klass-b", text: "Klass B" },
      { id: "klass-a", text: "Klass A" },
      { id: "klass-c", text: "Klass C" },
      { id: "klass-d", text: "Klass D" },
    ],
    correct: "klass-b",
    explanation:
      "Klassen syns på den första oktetten, här 150. Klass B går från 128 till 191, och 150 ligger där. Klass A slutar på 126 och klass C börjar på 192. Klass D börjar först på 224 och används för multicast.",
  },
  {
    kind: "matching",
    id: "ipv4-sorter",
    uses: ["privat-adress", "publik-adress", "loopback", "apipa"],
    prompt: "Vilken sorts adress är det? Para ihop.",
    pairs: [
      { left: { id: "a10", text: "10.4.4.4" }, right: { id: "privat", text: "Privat" } },
      { left: { id: "a127", text: "127.0.0.1" }, right: { id: "loopback", text: "Loopback" } },
      { left: { id: "a169", text: "169.254.7.1" }, right: { id: "apipa", text: "APIPA" } },
      { left: { id: "a88", text: "88.12.34.56" }, right: { id: "publik", text: "Publik" } },
    ],
    explanation:
      "10.4.4.4 ligger i det privata intervallet 10.x.x.x. 127.0.0.1 är loopback, datorn själv. 169.254 är APIPA, en adress datorn har hittat på. 88.12.34.56 ligger inte i något av de speciella intervallen, så den är publik.",
  },
  {
    kind: "mcq",
    id: "ipv4-privat",
    uses: ["privat-adress"],
    prompt: "Vilken av adresserna är privat?",
    options: [
      { id: "a172-20", text: "172.20.1.1" },
      { id: "a172-32", text: "172.32.1.1" },
      { id: "a192-169", text: "192.169.1.1" },
      { id: "a11", text: "11.0.0.1" },
    ],
    correct: "a172-20",
    explanation:
      "Det privata intervallet i mitten går från 172.16 till 172.31, och 172.20 ligger där. 172.32 ligger precis utanför. Det privata intervallet som börjar på 192 kräver 192.168, så 192.169 är publik. 11.0.0.1 är också publik, eftersom bara 10.x.x.x är privat bland adresserna med en så låg första oktett.",
  },
  {
    kind: "mcq",
    id: "ipv4-arp",
    uses: ["arp", "broadcast", "unicast", "mac-adress"],
    prompt: "Din dator vet IP-adressen till en annan dator i samma nät, men inte dess MAC-adress. Vad gör den?",
    options: [
      { id: "arp-broadcast", text: "Skickar en ARP-fråga som broadcast till alla i nätet" },
      { id: "arp-unicast", text: "Skickar en ARP-fråga som unicast direkt till den andra datorn" },
      { id: "switch", text: "Läser MAC-adressen ur switchens MAC-tabell" },
      { id: "ip-som-mac", text: "Använder IP-adressen som mottagaradress i framen" },
    ],
    correct: "arp-broadcast",
    explanation:
      "Datorn skickar en ARP-fråga som broadcast, eftersom den inte vet vem den ska fråga. Unicast går inte, för då skulle den redan behöva MAC-adressen. Switchens MAC-tabell är switchens egen, datorn kan inte läsa den. En frame kräver en MAC-adress som mottagare, så IP-adressen fungerar inte där.",
  },
  {
    kind: "mcq",
    id: "ipv4-apipa",
    uses: ["apipa", "loopback", "privat-adress", "publik-adress"],
    prompt: "Din dator har adressen 169.254.33.8. Vad säger det?",
    options: [
      { id: "ingen-svarade", text: "Den fick ingen adress automatiskt och hittade på en egen" },
      { id: "loopback", text: "Den testar IP mot sig själv" },
      { id: "privat", text: "Den har fått en vanlig privat adress från nätet" },
      { id: "publik", text: "Den har fått en publik adress och syns på internet" },
    ],
    correct: "ingen-svarade",
    explanation:
      "Adresser som börjar på 169.254 är APIPA. Datorn tar en sådan när den skulle få en adress automatiskt men ingen svarade. Loopback är 127.x.x.x. 169.254 hör inte till de privata intervallen, och det är inte heller en publik adress som går att nå från internet.",
  },
];
