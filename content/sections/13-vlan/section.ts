import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "vlan",
    number: 13,
    title: "VLAN",
    slug: "13-vlan",
    introduces: ["vlan", "access-port", "trunk-port", "dot1q", "vlan-id", "inter-vlan-routing"],
    requires: [
      "switch", "managed-switch", "broadcastdoman", "datalankslagret", "subnatting", "frame", "fiber", "byte", "bit",
      "router", "l3-switch", "natverksadress", "dokumentation", "fysisk-topologi", "logisk-topologi", "broadcast",
    ],
    diagrams: {
      // Scenes live in diagrams/13-vlan/ (layouts in scripts/diagram-specs.ts).
      "text-portar": {
        scene: "13-vlan/text-portar",
        alt: "Sex portar på en switch, färgade efter VLAN. Port 1 och 2 hör till VLAN 10, port 3 och 4 till VLAN 20 och port 5 till VLAN 30. Port 6 är en trunk som bär alla VLAN.",
      },
    },
  },
  questions,
};

export default section;
