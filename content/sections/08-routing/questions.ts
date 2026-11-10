import type { QuestionInput } from "../../../src/build/schema.ts";
import { inSubnet, parseIPv4 } from "../../../src/lib/net.ts";

// Facts the gateway question relies on, checked when the content is built.
const host = parseIPv4("10.0.68.49");
const inNet = (a: string) => inSubnet(parseIPv4(a), host, 18);
if (!inNet("10.0.127.254") || ["10.0.128.1", "10.0.63.254", "10.1.0.1"].some(inNet)) throw new Error("routing-gateway: options no longer fit /18");

export const questions: QuestionInput[] = [
  {
    kind: "mcq",
    id: "routing-annat-nat",
    uses: ["default-gateway", "natdel-vardel", "subnatmask", "arp"],
    prompt: "Datorn 192.168.1.10/24 ska skicka något till 192.168.2.5. Vart skickar den framen?",
    options: [
      { id: "gateway", text: "Till sin default gateway" },
      { id: "direkt", text: "Direkt till 192.168.2.5, efter en ARP-fråga om dess MAC-adress" },
      { id: "broadcast", text: "Som broadcast till alla i det egna nätet" },
      { id: "switch", text: "Till switchen, som letar upp 192.168.2.5 i sin MAC-tabell" },
    ],
    correct: "gateway",
    explanation:
      "Med /24 är nätdelen de tre första oktetterna, och 192.168.1 och 192.168.2 är olika nät. Därför skickar datorn till sin default gateway. ARP fungerar bara i det egna nätet, så den kan inte fråga efter 192.168.2.5. En broadcast stannar vid routern, och switchen känner bara till MAC-adresser i sitt eget nät.",
  },
  {
    kind: "mcq",
    id: "routing-gateway",
    uses: ["default-gateway", "natverksadress", "subnatmask", "prefix", "blockstorlek"],
    prompt: "En dator har adressen 10.0.68.49/18. Vilken av adresserna kan vara dess default gateway?",
    options: [
      { id: "g127", text: "10.0.127.254" },
      { id: "g128", text: "10.0.128.1" },
      { id: "g63", text: "10.0.63.254" },
      { id: "g1", text: "10.1.0.1" },
    ],
    correct: "g127",
    explanation:
      "Gatewayen måste ligga i samma nät som datorn. Med /18 är blockstorleken 64 i den tredje oktetten, och 68 hamnar i blocket 64 till 127. Nätet går alltså från 10.0.64.0 till 10.0.127.255, och 10.0.127.254 ligger där. 10.0.128.1 och 10.0.63.254 ligger i grannblocken, och 10.1.0.1 har en annan andra oktett.",
  },
  {
    kind: "fill",
    id: "routing-ttl",
    uses: ["ttl", "hop", "router"],
    prompt: "Ett paket skickas med TTL 64. Det passerar tre routrar på vägen till servern. Vad är TTL när paketet kommer fram?",
    fields: [{ id: "ttl", label: "TTL", answer: String(64 - 3), format: "number" }],
    explanation:
      "Varje router minskar TTL med ett. Tre routrar tar bort tre, så 64 blir 61. Servern själv är ingen router, så den räknar inte ner.",
  },
  {
    kind: "mcq",
    id: "routing-default-route",
    uses: ["default-route", "routingtabell"],
    prompt: "Vad betyder raden 0.0.0.0/0 i en routingtabell?",
    options: [
      { id: "allt-annat", text: "Den passar alla mottagare och används när ingen annan rad passar" },
      { id: "egen", text: "Den pekar på routerns egen adress" },
      { id: "ingen", text: "Den betyder att routern inte känner till något nät" },
      { id: "lokal-broadcast", text: "Den skickar paketet som broadcast till alla i det lokala nätet" },
    ],
    correct: "allt-annat",
    explanation:
      "0.0.0.0/0 har ett prefix på noll, så ingen bit behöver stämma och raden passar alla mottagare. Den heter default route och används bara när ingen annan rad passar. Den säger inget om routerns egen adress. Den skickar inte heller någon broadcast, utan pekar ut en riktning, ofta mot internet.",
  },
  {
    kind: "mcq",
    id: "routing-mac",
    uses: ["default-gateway", "mac-adress", "arp", "frame"],
    prompt: "Din dator skickar till en server i ett annat nät. Vilken MAC-adress står som mottagare i framen som lämnar din dator?",
    options: [
      { id: "gateway", text: "Default gatewayens MAC-adress" },
      { id: "server", text: "Serverns MAC-adress" },
      { id: "broadcast", text: "FF:FF:FF:FF:FF:FF" },
      { id: "egen", text: "Din egen dators MAC-adress" },
    ],
    correct: "gateway",
    explanation:
      "Framen ska bara till nästa hopp, och det är gatewayen. Därför står gatewayens MAC-adress som mottagare. Serverns MAC-adress kan din dator inte få fram, eftersom ARP bara fungerar i det egna nätet. Broadcast används bara när alla ska höra något, och din egen MAC-adress står som avsändare.",
  },
  {
    kind: "mcq",
    id: "routing-tabell",
    uses: ["routingtabell", "default-route", "interface"],
    prompt:
      "En router har de här raderna i sin routingtabell:\n\n| Nät | Skicka till |\n| --- | --- |\n| 192.168.1.0/24 | Direkt, interface 1 |\n| 192.168.2.0/24 | Direkt, interface 2 |\n| 10.0.0.0/8 | Router 192.168.2.254 |\n| 0.0.0.0/0 | Router 192.168.1.1 |\n\nEtt paket ska till 10.20.30.40. Vart skickar routern det?",
    options: [
      { id: "r254", text: "Till routern 192.168.2.254" },
      { id: "r1", text: "Till routern 192.168.1.1" },
      { id: "if1", text: "Direkt ut på interface 1" },
      { id: "slang", text: "Ingenstans, paketet slängs" },
    ],
    correct: "r254",
    explanation:
      "10.20.30.40 ligger i 10.0.0.0/8, eftersom den första oktetten är 10. Den raden säger att paketet ska till routern 192.168.2.254. Default route till 192.168.1.1 används bara när ingen annan rad passar, och här passar en. Paketet slängs inte, och mottagaren sitter inte direkt på interface 1.",
  },
  {
    kind: "mcq",
    id: "routing-default-fel-prefix",
    uses: ["default-route", "routingtabell", "statisk-route", "interface", "prefix"],
    prompt:
      "Datorerna sitter i 192.168.1.0/24 och vägen mot internet går via routern 192.168.2.1. Routern har de här raderna:\n\n| Nät | Skicka till |\n| --- | --- |\n| 192.168.1.0/24 | Direkt, interface 1 |\n| 192.168.2.0/24 | Direkt, interface 2 |\n| 0.0.0.0/24 | Router 192.168.2.1 |\n\nDatorerna når 192.168.2.0/24 men inte 8.8.8.8. Vad är felet?",
    options: [
      { id: "prefix", text: "Den sista raden passar bara adresserna 0.0.0.0 till 0.0.0.255" },
      { id: "nas-ej", text: "Routern 192.168.2.1 ligger inte i något av routerns egna nät" },
      { id: "fel-hall", text: "Den sista raden ska peka mot interface 1, där datorerna sitter" },
      { id: "egen-adress", text: "Den sista raden ska ha routerns egen adress i stället för 0.0.0.0" },
    ],
    correct: "prefix",
    explanation:
      "En default route ska vara 0.0.0.0/0. Med /24 måste de första 24 bitarna stämma, så raden passar bara 0.0.0.0 till 0.0.0.255, och där finns ingen riktig mottagare. Ingen rad passar 8.8.8.8, och då slänger routern paketet. Routern 192.168.2.1 går att nå, eftersom den ligger i 192.168.2.0/24 på interface 2. Raden ska peka mot internet, inte tillbaka mot datorerna, och det är 0.0.0.0 som står där, inte routerns egen adress.",
  },
  {
    kind: "ordering",
    id: "routing-steg",
    uses: ["default-gateway", "arp", "routingtabell", "subnatmask"],
    prompt: "En dator skickar till en server i ett annat nät. Ordna stegen från första till sista.",
    items: [
      { id: "jamfor", text: "Datorn jämför serverns adress med sin egen och sin mask" },
      { id: "arp", text: "Datorn tar reda på gatewayens MAC-adress med ARP" },
      { id: "skicka", text: "Datorn skickar framen till gatewayen" },
      { id: "tabell", text: "Routern letar i sin routingtabell och skickar paketet vidare" },
    ],
    explanation:
      "Först måste datorn veta att servern ligger i ett annat nät, annars skulle den skicka direkt. Sedan behöver den gatewayens MAC-adress för att kunna bygga en frame. När framen har kommit fram letar routern i routingtabellen efter nästa steg.",
  },
];
