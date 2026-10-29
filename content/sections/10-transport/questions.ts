import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "matching",
    id: "transport-portar",
    uses: ["port"],
    prompt: "Para ihop varje tjänst med dess port. En port blir över.",
    pairs: [
      { left: { id: "http", text: "HTTP" }, right: { id: "p80", text: "80" } },
      { left: { id: "https", text: "HTTPS" }, right: { id: "p443", text: "443" } },
      { left: { id: "dns", text: "DNS" }, right: { id: "p53", text: "53" } },
      { left: { id: "ssh", text: "SSH" }, right: { id: "p22", text: "22" } },
      { left: { id: "smtp", text: "SMTP" }, right: { id: "p25", text: "25" } },
    ],
    distractors: [{ id: "p23", text: "23" }],
    explanation:
      "HTTP är 80 och den krypterade varianten HTTPS är 443. DNS använder 53. SSH är 22, och 23 som blir över är telnet, den okrypterade föregångaren. SMTP, som skickar e-post, använder 25.",
  },
  {
    kind: "ordering",
    id: "transport-handskakning",
    uses: ["three-way-handshake", "ack", "tcp"],
    prompt: "En klient öppnar en TCP-anslutning till en server. Ordna stegen från första till sista.",
    items: [
      { id: "syn", text: "Klienten skickar SYN" },
      { id: "syn-ack", text: "Servern svarar med SYN + ACK" },
      { id: "ack", text: "Klienten svarar med ACK" },
      { id: "data", text: "Data börjar skickas" },
    ],
    explanation:
      "Klienten tar första steget med SYN. Servern bekräftar och skickar en egen SYN i samma meddelande. När klienten har bekräftat den med ACK är anslutningen uppe, och först då skickas data.",
  },
  {
    kind: "mcq",
    id: "transport-videomote",
    uses: ["udp", "tcp", "ack"],
    prompt: "Ett videomöte ska skicka ljud och bild i realtid. Vilket protokoll passar bäst och varför?",
    options: [
      { id: "udp", text: "UDP, eftersom det är bättre att tappa lite data än att vänta på omsändning" },
      { id: "tcp", text: "TCP, eftersom varje bit av ljudet måste komma fram" },
      { id: "udp-sakert", text: "UDP, eftersom det kontrollerar att allt kommer fram med ACK" },
      { id: "tcp-snabbt", text: "TCP, eftersom handskakningen gör det snabbare" },
    ],
    correct: "udp",
    explanation:
      "I ett videomöte är det värre att vänta än att tappa en bit ljud, och UDP väntar aldrig på omsändning. TCP skulle skicka om det som saknas, men då kommer ljudet för sent för att vara till nytta. UDP har inga ACK, det är TCP som har det. Handskakningen gör inte TCP snabbare, den är tvärtom extra jobb.",
  },
  {
    kind: "mcq",
    id: "transport-flikar",
    uses: ["kallport-malport", "port"],
    prompt: "Du har fem flikar öppna mot samma webbserver. Vad skiljer de fem anslutningarna åt?",
    options: [
      { id: "kallport", text: "Varje flik har en egen källport" },
      { id: "malport", text: "Varje flik har en egen destinationsport" },
      { id: "ip", text: "Varje flik får en egen IP-adress" },
      { id: "mac", text: "Varje flik har en egen MAC-adress" },
    ],
    correct: "kallport",
    explanation:
      "Datorn slumpar fram en källport för varje anslutning, och det är den som skiljer flikarna åt. Destinationsporten är samma för alla, eftersom alla går till samma tjänst. Datorn har bara en IP-adress och en MAC-adress på nätverkskortet, oavsett hur många flikar som är öppna.",
  },
  {
    kind: "mcq",
    id: "transport-intervall",
    uses: ["portintervall", "port", "kallport-malport"],
    prompt: "Din dator använder källport 51234 för en anslutning. Vilket intervall hör porten till?",
    options: [
      { id: "dynamisk", text: "Dynamiska portar" },
      { id: "registered", text: "Registered ports" },
      { id: "well-known", text: "Well-known ports" },
    ],
    correct: "dynamisk",
    explanation:
      "Dynamiska portar går från 49152 till 65535, och 51234 ligger där. Det är också där datorn slumpar fram sina källportar. Registered ports slutar på 49151, och well-known ports går bara upp till 1023.",
  },
  {
    kind: "mcq",
    id: "transport-telnet",
    uses: ["telnet", "port", "tcp"],
    prompt: "Du kan pinga en webbserver, men sidan visas inte. Hur tar du reda på om servern lyssnar på port 443?",
    options: [
      { id: "telnet", text: "Försöker ansluta med telnet till serverns port 443" },
      { id: "ping", text: "Pingar servern igen, flera gånger" },
      { id: "netstat", text: "Kör netstat -n -a på din egen dator" },
      { id: "arp", text: "Tittar i ARP-tabellen med arp -a" },
    ],
    correct: "telnet",
    explanation:
      "Telnet försöker öppna en TCP-anslutning till just den porten, så du ser om servern lyssnar där. Ping svarar bara på om datorn finns, inte på om en viss port är öppen. Med netstat -n -a ser du vilka portar din egen dator lyssnar på, inte serverns. ARP-tabellen visar bara MAC-adresser i ditt eget nät.",
  },
  {
    kind: "mcq",
    id: "transport-checksumma",
    uses: ["checksumma", "trailer", "hop", "tcp"],
    prompt: "Både lager 2 och TCP har en kontrollsumma. Vad är skillnaden?",
    options: [
      { id: "hela-vagen", text: "Lager 2 kontrolleras på varje sträcka, TCP:s bara av mottagaren längst bort" },
      { id: "omvant", text: "TCP:s kontrolleras på varje sträcka, lager 2:s bara av mottagaren längst bort" },
      { id: "samma", text: "De kontrollerar samma sak, TCP:s finns bara som reserv" },
      { id: "bara-udp", text: "Lager 2 kontrollerar bara TCP, och TCP kontrollerar bara UDP" },
    ],
    correct: "hela-vagen",
    explanation:
      "Lager 2:s kontrollsumma ligger i trailern och kontrolleras och byggs om på varje sträcka. TCP:s checksumma kontrolleras bara av mottagaren längst bort. Därför kan TCP hitta fel som uppstått inne i en router, som lager 2 inte märker. De är alltså inte samma kontroll, och ingen av dem kontrollerar ett annat protokoll.",
  },
];
