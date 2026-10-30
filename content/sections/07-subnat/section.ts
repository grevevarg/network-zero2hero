import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "subnat",
    number: 7,
    title: "Subnetting",
    slug: "07-subnat",
    introduces: ["host", "natverksadress", "broadcastadress", "antal-hosts", "subnatting", "blockstorlek", "vlsm", "ip-plan"],
    requires: ["broadcastdoman", "broadcast", "privat-adress", "prefix", "subnatmask", "natdel-vardel", "bit", "oktett"],
    diagrams: {
      // Scenes live in diagrams/07-subnat/ (layouts in scripts/diagram-specs.ts).
      "text-block": {
        scene: "07-subnat/text-block",
        alt: "Fyra lika stora lådor i rad: 0–63 märkt Nät 1, 64–127 märkt Nät 2, 128–191 märkt Nät 3 och 192–255 märkt Nät 4.",
      },
    },
  },
  questions,
};

export default section;
