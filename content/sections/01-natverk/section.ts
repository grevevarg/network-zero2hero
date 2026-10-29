import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "natverk",
    number: 1,
    title: "Vad är ett nätverk?",
    slug: "01-natverk",
    introduces: [
      "natverk", "tjanst", "server", "klient", "peer-to-peer", "redundans", "lan", "wan", "internet",
      "topologi", "fysisk-topologi", "logisk-topologi", "stjarna", "single-point-of-failure", "buss", "ring", "trad", "mesh",
    ],
    requires: [],
    diagrams: {
      // Scenes live in diagrams/01-natverk/ (layouts in scripts/diagram-specs.ts). Used in the text:
      "text-pair": { scene: "01-natverk/text-pair", alt: "Två datorer med en kabel emellan." },
      "text-client-server": {
        scene: "01-natverk/text-client-server",
        alt: "En dator till vänster och en server till höger. En pil från datorn till servern: Jag vill lyssna på hårdrock. En pil tillbaka: Okej, här har du hårdrock.",
      },
      "text-star": { scene: "01-natverk/text-star", alt: "Fyra datorer som var och en har en egen linje till en enhet i mitten." },
      "text-bus": { scene: "01-natverk/text-bus", alt: "En lång vågrät linje. Tre datorer är kopplade till den med var sin kort linje." },
      "text-ring": { scene: "01-natverk/text-ring", alt: "Fem datorer i en cirkel. Varje dator har en linje till sina två grannar." },
      "text-tree": { scene: "01-natverk/text-tree", alt: "En enhet överst med två enheter under sig. Var och en av dem har två datorer under sig." },
      "text-mesh": { scene: "01-natverk/text-mesh", alt: "Fyra datorer där varje dator har en linje till alla de andra tre." },
      // Used in the self-check. Different sizes than the text, so the student has to recognise the shape.
      "q-star": { scene: "01-natverk/q-star", alt: "Sex datorer som var och en har en egen linje till en enhet i mitten." },
      "q-bus": { scene: "01-natverk/q-bus", alt: "En lång vågrät linje. Fyra datorer är kopplade till den med var sin kort linje." },
      "q-ring": { scene: "01-natverk/q-ring", alt: "Sex datorer i en cirkel. Varje dator har en linje till sina två grannar." },
      "q-tree": { scene: "01-natverk/q-tree", alt: "En enhet överst med två enheter under sig. Var och en av dem har tre datorer under sig." },
      "q-mesh": { scene: "01-natverk/q-mesh", alt: "Fem datorer där varje dator har en linje till alla de andra fyra." },
    },
  },
  questions,
};

export default section;
