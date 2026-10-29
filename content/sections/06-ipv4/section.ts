import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "ipv4",
    number: 6,
    title: "IPv4-adresser",
    slug: "06-ipv4",
    introduces: [
      "ipv4", "oktett", "binart", "natdel-vardel", "subnatmask", "prefix",
      "adressklass", "privat-adress", "publik-adress", "loopback", "apipa", "arp",
    ],
    requires: [
      "logisk-adress", "fysisk-adress", "mac-adress", "broadcastdoman", "broadcast", "unicast",
      "multicast", "bit", "byte", "internet",
    ],
    diagrams: {
      // Scenes live in diagrams/06-ipv4/ (layouts in scripts/diagram-specs.ts).
      "text-binar": {
        scene: "06-ipv4/text-binar",
        alt: "Åtta rutor med bitvärdena 128, 64, 32, 16, 8, 4, 2 och 1. Under dem står bitarna 1, 1, 0, 0, 0, 0, 0, 0. Rutorna 128 och 64 är markerade.",
      },
      "text-delar": {
        scene: "06-ipv4/text-delar",
        alt: "Adressen 192.168.1.10 delad i två lådor. 192.168.1 är märkt Nätdel och 10 är märkt Värddel.",
      },
    },
  },
  questions,
};

export default section;
