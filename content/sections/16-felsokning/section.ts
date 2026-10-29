import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "felsokning",
    number: 16,
    title: "Felsökning",
    slug: "16-felsokning",
    introduces: ["felsokningsmetod", "ipconfig", "ping-svar", "tracert", "nslookup"],
    requires: [
      "osi-modellen", "fysiska-lagret", "switch", "default-gateway", "subnatmask", "apipa", "ping", "loopback",
      "router", "arp", "routingtabell", "ttl", "hop", "dns", "dns-cache", "netstat", "telnet", "port", "nat",
      "port-forwarding", "transportlagret", "applikationslagret", "datalankslagret", "natverkslagret", "dhcp",
    ],
    diagrams: {
      // Scenes live in diagrams/16-felsokning/ (layouts in scripts/diagram-specs.ts).
      "text-ping": {
        scene: "16-felsokning/text-ping",
        alt: "En dator, en switch, en router och en server på rad. Över datorn står Steg 1 och 2, över routern Steg 3 och över servern Steg 4.",
      },
    },
  },
  questions,
};

export default section;
