import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "wlan",
    number: 14,
    title: "Trådlöst nätverk",
    slug: "14-wlan",
    introduces: ["wlan", "ieee-80211", "accesspunkt", "tradlos-brygga", "antenn", "ssid", "kanal", "csma-ca", "wpa", "eap"],
    requires: [
      "emi", "full-duplex", "halv-duplex", "bithastighet", "datalankslagret", "switch", "broadcastdoman", "frame",
      "csma-cd", "ack", "kollision", "mac-adress",
    ],
    diagrams: {
      // Scenes live in diagrams/14-wlan/ (layouts in scripts/diagram-specs.ts).
      "text-kanaler": {
        scene: "14-wlan/text-kanaler",
        alt: "Fyra accesspunkter på rad. AP 1 sänder på kanal 1, AP 2 på kanal 6, AP 3 på kanal 11 och AP 4 på kanal 1 igen.",
      },
      "q-kanaler": {
        scene: "14-wlan/q-kanaler",
        alt: "Tre accesspunkter på rad. AP 1 sänder på kanal 1 och AP 3 på kanal 11. Kanalen för AP 2 i mitten är ett frågetecken.",
      },
    },
  },
  questions,
};

export default section;
