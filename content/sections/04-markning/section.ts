import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "markning",
    number: 4,
    title: "Märkning av uttag",
    slug: "04-markning",
    introduces: [
      "dokumentation", "rack", "patchpanel", "patchkabel", "uttag",
      "stall", "falt", "panel", "faltuppdelning",
      "stallforteckning", "monteringsritning", "panelkort",
    ],
    requires: ["fysisk-topologi", "twisted-pair"],
    diagrams: {
      // Scenes live in diagrams/04-markning/ (layouts in scripts/diagram-specs.ts).
      "text-rack": {
        scene: "04-markning/text-rack",
        alt: "Ett rack framifrån som ett rutnät med tio gånger tio rutor. Första rutan i varje rad är numrerad: 01, 11, 31 och så vidare. På tredje raden sitter en panel över hela bredden, märkt Panel 21. På sjätte raden sitter två tunna paneler på varandra, märkta 51A och 51B.",
      },
      "q-rack-rad": {
        scene: "04-markning/q-rack-rad",
        alt: "Ett rack framifrån som ett rutnät med tio gånger tio rutor. Rutan längst upp till vänster är märkt 01. En panel täcker hela fjärde raden uppifrån.",
      },
      "q-rack-mitt": {
        scene: "04-markning/q-rack-mitt",
        alt: "Ett rack framifrån som ett rutnät med tio gånger tio rutor. Rutan längst upp till vänster är märkt 01. En panel sitter på sjunde raden uppifrån och täcker de fem högra rutorna, från sjätte rutan och ut till kanten.",
      },
    },
  },
  questions,
};

export default section;
