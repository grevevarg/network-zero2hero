import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "slutuppdrag",
    number: 17,
    title: "Slutuppdrag",
    slug: "17-slutuppdrag",
    bonus: true,
    introduces: [],
    requires: ["broadcastdoman", "router", "switch", "interface", "subnatmask", "prefix", "natverksadress", "broadcastadress", "host", "subnatting", "ip-plan"],
    diagrams: {
      // Layout from network.ts, see scripts/diagram-specs.ts.
      natet: {
        scene: "17-slutuppdrag/natet",
        alt: "Ett nät med tre routrar i en rad, R1, R2 och R3. R1 är kopplad till SW1, som är kopplad till SW2. PC1 sitter i SW1 och PC2 i SW2. R2 är kopplad till SW3, där PC3 sitter. R3 är kopplad direkt till PC4.",
      },
    },
  },
  questions,
};

export default section;
