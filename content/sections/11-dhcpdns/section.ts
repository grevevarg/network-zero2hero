import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "dhcpdns",
    number: 11,
    title: "DHCP och DNS",
    slug: "11-dhcpdns",
    introduces: ["dhcp", "scope", "dora", "lease", "dhcp-relay", "hostname", "fqdn", "dns", "dns-hierarki", "resource-record", "dns-cache"],
    requires: ["udp", "tjanst", "default-gateway", "subnatmask", "server", "klient", "broadcast", "mac-adress", "broadcastdoman", "router", "internet", "ipv4"],
    diagrams: {
      // Scenes live in diagrams/11-dhcpdns/ (layouts in scripts/diagram-specs.ts).
      "text-dora": {
        scene: "11-dhcpdns/text-dora",
        alt: "En dator till vänster och en server till höger, med en lodrät linje under var och en. Fyra pilar uppifrån och ner: DISCOVER från datorn, OFFER från servern, REQUEST från datorn och ACK från servern.",
      },
      "text-hierarki": {
        scene: "11-dhcpdns/text-hierarki",
        alt: "Fyra lådor uppifrån och ner: Rot med en punkt, Toppdomän se, coolabilar.se och www.coolabilar.se.",
      },
    },
  },
  questions,
};

export default section;
