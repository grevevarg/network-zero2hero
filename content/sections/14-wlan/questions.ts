import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "mcq",
    id: "wlan-kanal",
    uses: ["kanal", "accesspunkt"],
    diagram: "q-kanaler",
    prompt: "Tre accesspunkter sitter i rad i en korridor på 2,4 GHz. Vilken kanal ska AP 2 i mitten ha?",
    options: [
      { id: "k6", text: "Kanal 6" },
      { id: "k1", text: "Kanal 1" },
      { id: "k11", text: "Kanal 11" },
      { id: "k3", text: "Kanal 3" },
    ],
    correct: "k6",
    explanation:
      "På 2,4 GHz är bara 1, 6 och 11 fria från varandra, och grannarna har redan 1 och 11. Då blir 6 kvar. Med kanal 1 eller 11 skulle AP 2 dela bandbredd med en granne. Kanal 3 överlappar både kanal 1 och kanal 6 och stör därför ändå.",
  },
  {
    kind: "mcq",
    id: "wlan-sakerhet",
    uses: ["wpa", "ssid", "mac-adress"],
    prompt: "Vilket av alternativen skyddar ett trådlöst nät bäst?",
    options: [
      { id: "wpa3", text: "Kryptering med WPA3" },
      { id: "wep", text: "Kryptering med WEP" },
      { id: "dolt", text: "Ett dolt SSID" },
      { id: "mac-filter", text: "Ett MAC-filter som bara släpper in kända enheter" },
    ],
    correct: "wpa3",
    explanation:
      "WPA3 är den nyaste och säkraste krypteringen. WEP är helt knäckt och skyddar i praktiken inte alls. Ett dolt SSID är lätt att få fram ändå. Ett MAC-filter går runt genom att förfalska en MAC-adress som redan är godkänd.",
  },
  {
    kind: "matching",
    id: "wlan-standarder",
    uses: ["ieee-80211"],
    prompt: "Para ihop varje standard med dess enklare namn.",
    pairs: [
      { left: { id: "n", text: "802.11n" }, right: { id: "wifi4", text: "Wi-Fi 4" } },
      { left: { id: "ac", text: "802.11ac" }, right: { id: "wifi5", text: "Wi-Fi 5" } },
      { left: { id: "ax", text: "802.11ax" }, right: { id: "wifi6", text: "Wi-Fi 6" } },
      { left: { id: "be", text: "802.11be" }, right: { id: "wifi7", text: "Wi-Fi 7" } },
    ],
    explanation:
      "Namnen började med 802.11n, som blev Wi-Fi 4. Sedan följer de i ordning: 802.11ac är Wi-Fi 5 och 802.11ax är Wi-Fi 6. Den senaste, 802.11be, är Wi-Fi 7.",
  },
  {
    kind: "mcq",
    id: "wlan-lager",
    uses: ["accesspunkt", "datalankslagret", "switch"],
    prompt: "På vilket lager i OSI-modellen jobbar en accesspunkt?",
    options: [
      { id: "l2", text: "Lager 2, datalänk" },
      { id: "l1", text: "Lager 1, fysiskt" },
      { id: "l3", text: "Lager 3, nätverk" },
      { id: "l4", text: "Lager 4, transport" },
    ],
    correct: "l2",
    explanation:
      "En accesspunkt jobbar på lager 2, ungefär som en trådlös switch. Den gör mer än att bara skicka signaler, så den är inte bara lager 1. Den routar inte mellan nät, så den är inte lager 3. Portar och segment på lager 4 bryr den sig inte om.",
  },
  {
    kind: "mcq",
    id: "wlan-kapacitet",
    uses: ["accesspunkt", "kanal", "ssid"],
    prompt: "I en konferenssal strömmar alla video samtidigt, och wifi går väldigt segt. Vad hjälper bäst?",
    options: [
      { id: "fler-olika", text: "Fler accesspunkter med samma SSID, på olika kanaler" },
      { id: "fler-samma", text: "Fler accesspunkter med samma SSID, på samma kanal" },
      { id: "starkare", text: "En starkare antenn på den accesspunkt som redan finns" },
      { id: "dolt", text: "Att dölja SSID så att färre ansluter" },
    ],
    correct: "fler-olika",
    explanation:
      "Det enda sättet att få plats med fler är fler accesspunkter, och de måste ha olika kanaler för att inte dela bandbredd. På samma kanal stör de varandra och delar ändå på kapaciteten. En starkare antenn ger längre räckvidd men inte mer bandbredd att dela på. Ett dolt SSID stoppar ingen som redan vet namnet.",
  },
  {
    kind: "mcq",
    id: "wlan-brygga",
    uses: ["tradlos-brygga", "antenn"],
    prompt: "Du ska koppla ihop två byggnader med en trådlös brygga. Vilken sorts antenn passar?",
    options: [
      { id: "riktad", text: "Riktad antenn" },
      { id: "rund", text: "Rundstrålande antenn" },
      { id: "inbyggd", text: "Den inbyggda antennen i en vanlig accesspunkt" },
    ],
    correct: "riktad",
    explanation:
      "En riktad antenn samlar signalen åt ett håll och når därför längre, och det är vad en brygga mellan två fasta punkter behöver. En rundstrålande antenn sprider signalen åt alla håll, mest i onödan. En inbyggd antenn i en accesspunkt är oftast rundstrålande och gjord för korta avstånd.",
  },
  {
    kind: "mcq",
    id: "wlan-vaggar",
    uses: ["accesspunkt", "wlan"],
    prompt: "Vilken sorts vägg dämpar en wifi-signal mest?",
    options: [
      { id: "betong", text: "Betong med armeringsjärn" },
      { id: "gips", text: "Gips" },
      { id: "tra", text: "Trä" },
      { id: "glas", text: "Glas" },
    ],
    correct: "betong",
    explanation:
      "Betong dämpar mycket, och armeringsjärnet gör det ännu värre eftersom metall stoppar mest. Gips och trä släpper igenom signalen ganska bra. Glas går också bra att sända igenom.",
  },
];
