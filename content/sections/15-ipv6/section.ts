import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "ipv6",
    number: 15,
    title: "IPv6",
    slug: "15-ipv6",
    introduces: [
      "ipv6", "ipv6-forkortning", "ipv6-prefix", "anycast", "global-unicast", "link-local", "unique-local",
      "slaac", "ndp", "eui-64", "aaaa",
    ],
    requires: [
      "ipv4", "publik-adress", "privat-adress", "nat", "internet", "hex", "bit", "byte", "prefix", "natdel-vardel",
      "unicast", "multicast", "broadcast", "loopback", "interface", "arp", "router", "apipa", "mac-adress", "dns",
      "resource-record",
    ],
    diagrams: {
      // Scenes live in diagrams/15-ipv6/ (layouts in scripts/diagram-specs.ts).
      "text-64": {
        scene: "15-ipv6/text-64",
        alt: "Adressen 2001:db8:0:1:21a:2bff:fe3c:4d5e delad i två lådor. 2001:db8:0:1 är märkt Nätdel, /64. 21a:2bff:fe3c:4d5e är märkt Interface-ID.",
      },
      "text-eui64": {
        scene: "15-ipv6/text-eui64",
        alt: "Tre lådor i rad: 02:1A:2B märkt Första halvan, FF:FE märkt Inlagt och 3C:4D:5E märkt Andra halvan.",
      },
    },
  },
  questions,
};

export default section;
