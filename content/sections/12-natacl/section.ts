import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "natacl",
    number: 12,
    title: "NAT och ACL",
    slug: "12-natacl",
    introduces: ["nat", "pat", "port-forwarding", "acl", "implicit-deny", "standard-extended-acl", "wildcard-mask"],
    requires: [
      "privat-adress", "publik-adress", "router", "internet", "port", "kallport-malport", "server",
      "interface", "tcp", "udp", "subnatmask", "prefix",
    ],
    diagrams: {
      // Scenes live in diagrams/12-natacl/ (layouts in scripts/diagram-specs.ts).
      "text-nat": {
        scene: "12-natacl/text-nat",
        alt: "En dator med adressen 192.168.1.10, en router med den publika adressen 203.0.113.5 och en server med adressen 198.51.100.7, på rad och ihopkopplade.",
      },
    },
  },
  questions,
};

export default section;
