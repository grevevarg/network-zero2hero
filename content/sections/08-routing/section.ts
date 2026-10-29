import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "routing",
    number: 8,
    title: "Routing och default gateway",
    slug: "08-routing",
    introduces: ["router", "interface", "default-gateway", "routingtabell", "statisk-route", "default-route", "hop", "ttl"],
    requires: [
      "natverkslagret", "broadcastdoman", "switch", "mac-adress", "natverksadress", "ip-plan", "natdel-vardel",
      "subnatmask", "arp", "host", "logisk-adress", "fysisk-adress", "frame", "paket", "prefix", "internet", "blockstorlek",
    ],
    diagrams: {
      // Scenes live in diagrams/08-routing/ (layouts in scripts/diagram-specs.ts).
      "text-tva-nat": {
        scene: "08-routing/text-tva-nat",
        alt: "Två nät som binds ihop av en router i mitten. Till vänster två datorer på en switch, märkt 192.168.1.0/24. Till höger två datorer på en annan switch, märkt 192.168.2.0/24. Båda switcharna har en kabel till routern.",
      },
      "text-ttl": {
        scene: "08-routing/text-ttl",
        alt: "En dator, tre routrar och en server på rad. Över datorn står TTL 64, och över routrarna står 63, 62 och 61.",
      },
    },
  },
  questions,
};

export default section;
