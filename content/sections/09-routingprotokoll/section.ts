import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "routingprotokoll",
    number: 9,
    title: "Routingprotokoll",
    slug: "09-routingprotokoll",
    introduces: [
      "dynamisk-routing", "metric", "rip", "distance-vector", "konvergens", "routingloop", "split-horizon",
      "poison-reverse", "hold-down", "ospf", "link-state", "ospf-cost", "area", "autonomt-system", "bgp",
    ],
    requires: ["statisk-route", "routingtabell", "router", "hop", "multicast", "broadcast", "prefix", "bithastighet", "internet"],
    diagrams: {
      // Scenes live in diagrams/09-routingprotokoll/ (layouts in scripts/diagram-specs.ts).
      "q-vag": {
        scene: "09-routingprotokoll/q-vag",
        alt: "Tre routrar i en triangel. R1 och R3 har en direkt länk på 10 Mbit/s. Den andra vägen går via R2 med två länkar på 1 Gbit/s vardera.",
      },
    },
  },
  questions,
};

export default section;
