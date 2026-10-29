import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "kablar",
    number: 3,
    title: "Kablar och kontakter",
    slug: "03-kablar",
    introduces: [
      "seriell-overforing", "parallell-overforing", "simplex", "halv-duplex", "full-duplex",
      "twisted-pair", "emi", "utp", "stp", "poe", "kategori", "bithastighet",
      "rj45", "t568b", "koax", "fiber", "dampning", "singlemode", "multimode",
    ],
    requires: ["fysiska-lagret", "bit", "byte"],
    diagrams: {
      // Scenes live in diagrams/03-kablar/ (layouts in scripts/diagram-specs.ts).
      "text-t568b": {
        scene: "03-kablar/text-t568b",
        alt: "Åtta färgade rader, en per ledare i T568B. Uppifrån: 1 vit/orange, 2 orange, 3 vit/grön, 4 blå, 5 vit/blå, 6 grön, 7 vit/brun, 8 brun.",
      },
    },
  },
  questions,
};

export default section;
