import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "switchar",
    number: 5,
    title: "Switchar och MAC-adresser",
    slug: "05-switchar",
    introduces: [
      "repeater", "mediakonverter", "hub", "kollision", "kollisionsdoman", "csma-cd", "switch",
      "hex", "mac-adress", "oui", "mac-tabell", "flooding", "ethernet",
      "unicast", "broadcast", "multicast", "broadcastdoman", "managed-switch", "l3-switch",
    ],
    requires: [
      "stjarna", "datalankslagret", "fysiska-lagret", "natverkslagret", "frame", "trailer", "fysisk-adress",
      "bit", "byte", "dampning", "fiber", "halv-duplex", "poe",
    ],
    diagrams: {
      // Scenes live in diagrams/05-switchar/ (layouts in scripts/diagram-specs.ts).
      "text-mac": {
        scene: "05-switchar/text-mac",
        alt: "MAC-adressen 00:1A:2B:3C:4D:5E delad i två lådor. Den vänstra, 00:1A:2B, är märkt Tillverkare. Den högra, 3C:4D:5E, är märkt Unik del.",
      },
      "text-ram": {
        scene: "05-switchar/text-ram",
        alt: "En Ethernet-frame som sex lådor uppifrån och ner: Preamble och SFD, Mottagarens MAC, Avsändarens MAC, Typ, Data och FCS.",
      },
    },
  },
  questions,
};

export default section;
