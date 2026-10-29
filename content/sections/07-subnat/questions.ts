import type { QuestionInput } from "../../../src/build/schema.ts";
import { broadcastAddress, formatIPv4, hostCount, hostRange, networkAddress, parseIPv4 } from "../../../src/lib/net.ts";

const a = parseIPv4("192.168.50.100");
const [first, last] = hostRange(a, 27);
const b = parseIPv4("172.16.45.200");
const lanA = parseIPv4("192.168.10.0");

export const questions: QuestionInput[] = [
  {
    kind: "fill",
    id: "subnat-27",
    uses: ["natverksadress", "broadcastadress", "host", "blockstorlek"],
    prompt: "En dator har adressen 192.168.50.100/27. Fyll i nätet den tillhör.",
    fields: [
      { id: "natverk", label: "Nätverksadress", answer: formatIPv4(networkAddress(a, 27)), format: "ipv4" },
      { id: "broadcast", label: "Broadcastadress", answer: formatIPv4(broadcastAddress(a, 27)), format: "ipv4" },
      { id: "forsta", label: "Första host-adressen", answer: formatIPv4(first), format: "ipv4" },
      { id: "sista", label: "Sista host-adressen", answer: formatIPv4(last), format: "ipv4" },
    ],
    explanation:
      "/27 slutar i den fjärde oktetten med masken 224, så blockstorleken är 256 − 224 = 32. Multiplerna av 32 är 0, 32, 64, 96 och 128, och 100 hamnar i blocket som börjar på 96. Nätverksadressen är alltså 192.168.50.96 och broadcastadressen 128 − 1 = 192.168.50.127. Hostarna är allt däremellan, från .97 till .126.",
  },
  {
    kind: "fill",
    id: "subnat-20",
    uses: ["natverksadress", "broadcastadress", "blockstorlek", "oktett"],
    prompt: "Vilket nät tillhör 172.16.45.200/20?",
    fields: [
      { id: "natverk", label: "Nätverksadress", answer: formatIPv4(networkAddress(b, 20)), format: "ipv4" },
      { id: "broadcast", label: "Broadcastadress", answer: formatIPv4(broadcastAddress(b, 20)), format: "ipv4" },
    ],
    explanation:
      "/20 slutar fyra bitar in i den tredje oktetten, där masken blir 240 och blockstorleken 16. 45 hamnar i blocket som börjar på 32, och nästa block börjar på 48. Den fjärde oktetten hör helt till värddelen. Därför är nätverksadressen 172.16.32.0 och broadcastadressen 172.16.47.255.",
  },
  {
    kind: "fill",
    id: "subnat-antal",
    uses: ["antal-hosts", "prefix"],
    prompt: "Hur många hosts får plats i ett nät med prefixet?",
    fields: [
      { id: "p26", label: "/26", answer: String(hostCount(26)), format: "number" },
      { id: "p29", label: "/29", answer: String(hostCount(29)), format: "number" },
    ],
    explanation:
      "Prefixet /26 lämnar 32 − 26 = 6 värdbitar. 2 upphöjt till 6 är 64 adresser, och minus nätverksadressen och broadcastadressen blir det 62 hosts. Prefixet /29 lämnar 3 värdbitar, alltså 8 adresser och 6 hosts.",
  },
  {
    kind: "mcq",
    id: "subnat-50",
    uses: ["antal-hosts", "blockstorlek", "prefix"],
    prompt: "Ett nät ska ha plats för 50 hosts och slösa så lite adresser som möjligt. Vilket prefix väljer du?",
    options: [
      { id: "p26", text: "/26" },
      { id: "p25", text: "/25" },
      { id: "p27", text: "/27" },
      { id: "p24", text: "/24" },
    ],
    correct: "p26",
    explanation:
      "50 hosts plus nätverksadressen och broadcastadressen blir 52 adresser. Ett /26 har 64 adresser och 62 hosts, så det räcker. Ett /27 har bara 30 hosts, vilket är för lite. Ett /25 eller /24 räcker också, men de slösar betydligt fler adresser.",
  },
  {
    kind: "mcq",
    id: "subnat-giltig",
    uses: ["natverksadress", "blockstorlek", "broadcastadress"],
    prompt: "Vilken av adresserna kan vara nätverksadressen till ett /27-nät?",
    options: [
      { id: "a96", text: "192.168.10.96" },
      { id: "a100", text: "192.168.10.100" },
      { id: "a48", text: "192.168.10.48" },
      { id: "a127", text: "192.168.10.127" },
    ],
    correct: "a96",
    explanation:
      "Ett /27 har blockstorleken 32, så nätverksadressen måste vara en multipel av 32 i den sista oktetten. 96 är 3 gånger 32. 100 är inte en multipel, det är en host i nätet som börjar på 96. 48 är en multipel av 16 men inte av 32, och 127 är broadcastadressen i nätet .96.",
  },
  {
    kind: "ordering",
    id: "subnat-metod",
    uses: ["blockstorlek", "natverksadress", "broadcastadress", "oktett"],
    prompt: "Du ska hitta nätet för en adress. Ordna stegen från första till sista.",
    items: [
      { id: "oktett", text: "Hitta oktetten där masken slutar" },
      { id: "block", text: "Räkna ut blockstorleken, 256 minus maskens värde" },
      { id: "multipel", text: "Ta den största multipeln av blockstorleken som inte är större än adressen" },
      { id: "broadcast", text: "Ta nästa multipel minus ett för att få broadcastadressen" },
    ],
    explanation:
      "Först måste du veta vilken oktett du räknar i, annars vet du inte vilket värde i masken som gäller. Blockstorleken räknas ut från masken. Multipeln ger nätverksadressen, och broadcastadressen ligger precis före nästa nät.",
  },
  {
    kind: "fill",
    id: "subnat-vlsm",
    uses: ["vlsm", "blockstorlek", "antal-hosts", "natverksadress", "prefix"],
    prompt:
      "Du delar 192.168.10.0/24 med VLSM. LAN A med 100 hosts har redan fått 192.168.10.0/25. Nästa nät är LAN B, som ska ha 50 hosts. Vilket nät får LAN B?",
    fields: [
      { id: "natverk", label: "Nätverksadress", answer: formatIPv4(lanA + 128), format: "ipv4" },
      { id: "prefix", label: "Prefix (bara siffrorna)", answer: "26", format: "number" },
    ],
    explanation:
      "LAN A tar adresserna .0 till .127, så nästa lediga adress är .128. 50 hosts behöver 52 adresser, och det minsta block som räcker är 64, alltså /26. 128 är en multipel av 64, så LAN B kan börja precis där. Det blir 192.168.10.128/26.",
  },
];
