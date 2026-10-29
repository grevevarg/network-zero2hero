import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "transport",
    number: 10,
    title: "TCP, UDP och portar",
    slug: "10-transport",
    introduces: ["tcp", "udp", "port", "kallport-malport", "portintervall", "ack", "three-way-handshake", "checksumma", "netstat", "ping", "telnet"],
    requires: ["transportlagret", "segment", "datagram", "tjanst", "bit", "sessionslagret", "trailer", "hop"],
    diagrams: {
      // Scenes live in diagrams/10-transport/ (layouts in scripts/diagram-specs.ts).
      "text-handskakning": {
        scene: "10-transport/text-handskakning",
        alt: "En dator till vänster och en server till höger, med en lodrät linje under var och en. Tre pilar uppifrån och ner: SYN från datorn till servern, SYN + ACK tillbaka och ACK från datorn till servern.",
      },
    },
  },
  questions,
};

export default section;
