import type { SectionInput } from "../../../src/build/schema.ts";
import { bus, fullMesh, ring, star, tree } from "../../../src/build/shapes.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "natverk",
    number: 1,
    title: "Vad är ett nätverk?",
    slug: "01-natverk",
    introduces: [
      "natverk", "tjanst", "server", "klient", "peer-to-peer", "redundans", "lan", "wan", "internet",
      "topologi", "fysisk-topologi", "logisk-topologi", "stjarna", "buss", "ring", "trad", "mesh",
    ],
    requires: [],
    diagrams: {
      // Used in the text.
      "text-star": star(4, "Fyra enheter som var och en har en egen linje till en ruta i mitten."),
      "text-bus": bus(3, "En lång vågrät linje. Tre enheter är kopplade till den med var sin kort linje."),
      "text-ring": ring(5, "Fem enheter i en cirkel. Varje enhet har en linje till sina två grannar."),
      "text-tree": tree(2, 2, "En ruta överst med två rutor under sig. Varje sådan ruta har två enheter under sig."),
      "text-mesh": fullMesh(4, "Fyra enheter där varje enhet har en linje till alla de andra tre."),
      // Used in the self-check. Different sizes than the text, so the student has to recognise the shape.
      "q-star": star(6, "Sex enheter som var och en har en egen linje till en ruta i mitten."),
      "q-bus": bus(4, "En lång vågrät linje. Fyra enheter är kopplade till den med var sin kort linje."),
      "q-ring": ring(6, "Sex enheter i en cirkel. Varje enhet har en linje till sina två grannar."),
      "q-tree": tree(2, 3, "En ruta överst med två rutor under sig. Varje sådan ruta har tre enheter under sig."),
      "q-mesh": fullMesh(5, "Fem enheter där varje enhet har en linje till alla de andra fyra."),
    },
  },
  questions,
};

export default section;
