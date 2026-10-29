import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "ordering",
    id: "felsokning-ping-ordning",
    uses: ["ping", "loopback", "default-gateway", "felsokningsmetod"],
    prompt: "Du felsöker med ping, från dig själv och utåt. Ordna stegen från första till sista.",
    items: [
      { id: "loopback", text: "Pinga 127.0.0.1" },
      { id: "egen", text: "Pinga din egen IP-adress" },
      { id: "gateway", text: "Pinga din default gateway" },
      { id: "utanfor", text: "Pinga en adress utanför ditt nät" },
    ],
    explanation:
      "Loopback testar IP i själva datorn, och din egen adress testar nätverkskortet. Gatewayen visar att det lokala nätet fungerar ända fram till routern. Först när allt det fungerar är det meningsfullt att testa något längre bort.",
  },
  {
    kind: "mcq",
    id: "felsokning-lampa",
    uses: ["felsokningsmetod", "fysiska-lagret", "datalankslagret", "natverkslagret", "applikationslagret"],
    prompt: "Lampan vid datorns nätverksport lyser inte alls. I vilket lager börjar du leta?",
    options: [
      { id: "fysiska-lagret-forst", text: "Lager 1, det fysiska" },
      { id: "l2", text: "Lager 2, datalänk" },
      { id: "l3", text: "Lager 3, nätverk" },
      { id: "l7", text: "Lager 7, applikation" },
    ],
    correct: "fysiska-lagret-forst",
    explanation:
      "En släckt lampa betyder att det inte finns någon signal, och signaler hör till lager 1. Kolla kabeln och att switchen är påslagen. Utan signal kan inget av lagren ovanför fungera. Därför är det ingen idé att börja med adresser eller program.",
  },
  {
    kind: "matching",
    id: "felsokning-verktyg",
    uses: ["ipconfig", "tracert", "nslookup", "netstat", "telnet"],
    prompt: "Vilket verktyg använder du? Para ihop varje uppgift med rätt kommando.",
    pairs: [
      { left: { id: "installningar", text: "Kontrollera IP-adress, mask och default gateway" }, right: { id: "ipconfig", text: "ipconfig" } },
      { left: { id: "vagen", text: "Se varje router på vägen till en adress" }, right: { id: "tracert", text: "tracert" } },
      { left: { id: "namn", text: "Testa vilken adress ett namn blir" }, right: { id: "nslookup", text: "nslookup" } },
      { left: { id: "anslutningar", text: "Se vilka anslutningar din dator har just nu" }, right: { id: "netstat", text: "netstat" } },
      { left: { id: "porttest", text: "Testa om en server lyssnar på en viss TCP-port" }, right: { id: "telnet", text: "telnet" } },
    ],
    explanation:
      "ipconfig visar datorns egna inställningar och tracert routrarna på vägen. nslookup frågar DNS om ett namn. netstat visar dina anslutningar, och telnet testar om en TCP-port är öppen hos en server.",
  },
  {
    kind: "mcq",
    id: "felsokning-169",
    uses: ["ipconfig", "apipa", "dhcp"],
    prompt: "ipconfig visar att datorn har adressen 169.254.20.11. Vad är det troliga felet?",
    options: [
      { id: "ingen-dhcp", text: "Datorn har inte fått någon adress från DHCP" },
      { id: "dns", text: "DNS-servern svarar inte på namnuppslagningar" },
      { id: "gateway", text: "Default gateway är fel inställd, men adressen är rätt" },
      { id: "loopback", text: "Datorn testar sig själv med loopback" },
    ],
    correct: "ingen-dhcp",
    explanation:
      "En adress på 169.254 är APIPA, som datorn tar när ingen DHCP-server svarade. Kolla kabeln och att DHCP-servern går att nå. DNS har inget med datorns egen adress att göra. Adressen är inte rätt i det här fallet, och loopback är 127.0.0.1.",
  },
  {
    kind: "mcq",
    id: "felsokning-dns",
    uses: ["ping", "dns", "nslookup"],
    prompt: "Du kan pinga 8.8.8.8 utan problem, men inga webbsidor går att nå via namn. Vad misstänker du först?",
    options: [
      { id: "namnuppslagning", text: "DNS" },
      { id: "kabel", text: "Kabeln" },
      { id: "gateway", text: "Default gateway" },
      { id: "arp", text: "ARP" },
    ],
    correct: "namnuppslagning",
    explanation:
      "Att pinga en adress långt bort fungerar, så kabeln, gatewayen och vägen ut till internet är i ordning. Det som inte fungerar är att göra namn till adresser, och det är DNS jobb. Testa med nslookup. ARP behövs bara i det lokala nätet, och det fungerar ju redan.",
  },
  {
    kind: "mcq",
    id: "felsokning-loopback",
    uses: ["ping", "loopback", "felsokningsmetod"],
    prompt: "Redan ping till 127.0.0.1 misslyckas. Var sitter felet?",
    options: [
      { id: "ip-i-datorn", text: "I IP på själva datorn" },
      { id: "kabel", text: "I kabeln mellan datorn och switchen" },
      { id: "gateway", text: "I routern som är default gateway" },
      { id: "internet", text: "Någonstans ute på internet" },
    ],
    correct: "ip-i-datorn",
    explanation:
      "Loopback lämnar aldrig datorn, så ett fel där betyder att IP i själva datorn inte fungerar. Kabeln används inte ens, eftersom paketet vänder inne i datorn. Gatewayen och internet nås aldrig av ett loopback-paket.",
  },
  {
    kind: "mcq",
    id: "felsokning-tracert",
    uses: ["tracert", "ttl", "hop", "router"],
    prompt: "Hur tar tracert reda på vilka routrar som finns på vägen?",
    options: [
      { id: "stegvis-ttl", text: "Den skickar paket med TTL 1, 2, 3 och så vidare, och varje router som slänger ett paket svarar" },
      { id: "tabell", text: "Den läser routingtabellen i din default gateway" },
      { id: "dns", text: "Den frågar DNS efter namnen på alla routrar mellan dig och målet" },
      { id: "broadcast", text: "Den skickar en broadcast som alla routrar på vägen svarar på" },
    ],
    correct: "stegvis-ttl",
    explanation:
      "tracert använder TTL. Ett paket med TTL 1 slängs av första routern, som då svarar, och med TTL 2 svarar den andra. Den läser inte någon routingtabell och frågar inte DNS om vägen. En broadcast kommer aldrig förbi den första routern.",
  },
];
