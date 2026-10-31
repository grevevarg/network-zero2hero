import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "vlan",
    number: 13,
    title: "VLAN och STP",
    slug: "13-vlan",
    introduces: [
      "vlan", "access-port", "trunk-port", "dot1q", "vlan-id", "inter-vlan-routing",
      "loop", "broadcast-storm", "spanning-tree", "bridge-id", "root-bridge", "root-port", "stp-kostnad", "alternate-port", "stp-portlagen",
    ],
    requires: [
      "switch", "managed-switch", "broadcastdoman", "datalankslagret", "subnatting", "frame", "fiber", "byte", "bit",
      "router", "l3-switch", "natverksadress", "dokumentation", "fysisk-topologi", "logisk-topologi", "broadcast",
      "redundans", "stp", "flooding", "ttl", "natverkslagret", "mac-adress", "mac-tabell", "bithastighet",
    ],
    diagrams: {
      // Scenes live in diagrams/13-vlan/ (layouts in scripts/diagram-specs.ts).
      "text-portar": {
        scene: "13-vlan/text-portar",
        alt: "Sex portar på en switch, färgade efter VLAN. Port 1 och 2 hör till VLAN 10, port 3 och 4 till VLAN 20 och port 5 till VLAN 30. Port 6 är en trunk som bär alla VLAN.",
      },
      "text-stp": {
        scene: "13-vlan/text-stp",
        alt: "Tre switchar i en triangel. SW1 och SW2 sitter längst ner och har en direkt länk på 100 Mbit/s. SW3 sitter överst och har en länk på 1 Gbit/s till var och en av dem.",
      },
      "q-stp": {
        scene: "13-vlan/q-stp",
        alt: "Tre switchar i en triangel. SW1 och SW2 sitter längst ner och har en direkt länk på 10 Mbit/s. SW3 sitter överst och har en länk på 100 Mbit/s till var och en av dem.",
      },
    },
  },
  questions,
};

export default section;
