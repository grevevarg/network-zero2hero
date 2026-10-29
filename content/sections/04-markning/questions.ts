import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "matching",
    id: "markning-delar",
    uses: ["stall", "falt", "panel", "uttag"],
    prompt: "Uttaget i väggen är märkt AC0311A10. Vad betyder varje del?",
    pairs: [
      { left: { id: "ac", text: "AC" }, right: { id: "stall", text: "Ställ" } },
      { left: { id: "03", text: "03" }, right: { id: "falt", text: "Fält" } },
      { left: { id: "11a", text: "11A" }, right: { id: "panel", text: "Panel" } },
      { left: { id: "10", text: "10" }, right: { id: "uttag", text: "Uttag" } },
    ],
    explanation:
      "Beteckningen läses från störst till minst. AC är stället, alltså rummet. 03 är fältet, alltså racket. 11A är panelen, och 10 är uttagets nummer i panelen.",
  },
  {
    kind: "mcq",
    id: "markning-ruta-rad",
    uses: ["faltuppdelning", "panel"],
    diagram: "q-rack-rad",
    prompt: "Rutan längst upp till vänster är 01. Vilket nummer får panelen på bilden?",
    options: [
      { id: "ruta-31", text: "31" },
      { id: "ruta-41", text: "41" },
      { id: "ruta-30", text: "30" },
      { id: "ruta-04", text: "04" },
    ],
    correct: "ruta-31",
    explanation:
      "Panelen sitter på fjärde raden, och dess övre vänstra hörn är i första rutan på raden. Raderna börjar på 01, 11, 21 och 31, så fjärde raden börjar på 31. 41 är början på femte raden, och 30 är sista rutan på tredje raden. 04 vore fjärde rutan på första raden, men panelen sitter längre ner.",
  },
  {
    kind: "mcq",
    id: "markning-ruta-mitt",
    uses: ["faltuppdelning", "panel"],
    diagram: "q-rack-mitt",
    prompt: "Rutan längst upp till vänster är 01. Panelen täcker bara en del av raden. Vilket nummer får den?",
    options: [
      { id: "ruta-66", text: "66" },
      { id: "ruta-61", text: "61" },
      { id: "ruta-76", text: "76" },
      { id: "ruta-56", text: "56" },
    ],
    correct: "ruta-66",
    explanation:
      "Panelen sitter på sjunde raden, som börjar på 61. Dess övre vänstra hörn är i sjätte rutan på raden, alltså 66. 61 är början på raden, men där sitter inte panelens vänstra hörn. 76 och 56 ligger en rad för lågt och en rad för högt.",
  },
  {
    kind: "mcq",
    id: "markning-stall",
    uses: ["stall"],
    prompt: "Ett ställ har beteckningen BA. Var finns det?",
    options: [
      { id: "plan2-forsta", text: "Första utrymmet på våning 2" },
      { id: "plan1-andra", text: "Andra utrymmet på våning 1" },
      { id: "plan1-forsta", text: "Första utrymmet på våning 1" },
      { id: "plan2-andra", text: "Andra utrymmet på våning 2" },
    ],
    correct: "plan2-forsta",
    explanation:
      "Första bokstaven anger våningen och andra bokstaven utrymmet på våningen. B är den andra bokstaven i alfabetet, så det är våning 2. A betyder första utrymmet. Andra utrymmet på våning 1 skulle i stället heta AB.",
  },
  {
    kind: "mcq",
    id: "markning-samma-ruta",
    uses: ["faltuppdelning", "panel", "stall", "falt"],
    prompt: "I ställ AA, fält 01, sitter två paneler i samma ruta, 51. Vilka beteckningar får de?",
    options: [
      { id: "bokstav-ab", text: "AA0151A och AA0151B" },
      { id: "5152", text: "AA0151 och AA0152" },
      { id: "falt", text: "AA0151 och AA0251" },
      { id: "nummer", text: "AA0151-1 och AA0151-2" },
    ],
    correct: "bokstav-ab",
    explanation:
      "När flera paneler sitter i samma ruta skiljs de åt med en bokstav efter rutans nummer, alltså 51A och 51B. 52 är en annan ruta, och den får en panel bara om panelens övre vänstra hörn sitter där. AA0251 är samma ruta men i ett annat rack. Siffror med bindestreck finns inte i beteckningarna.",
  },
  {
    kind: "mcq",
    id: "markning-dokument",
    uses: ["panelkort", "monteringsritning", "stallforteckning", "uttag", "panel"],
    prompt: "Du vill veta vart uttag 07 i en viss panel går och hur lång kabeln är. Vilket dokument tittar du i?",
    options: [
      { id: "kort-per-panel", text: "Panelkortet" },
      { id: "montering", text: "Monteringsritningen" },
      { id: "stallforteckning", text: "Ställförteckningen" },
    ],
    correct: "kort-per-panel",
    explanation:
      "Panelkortet visar varje uttag i en panel, med kabelns längd och vart den går. Monteringsritningen visar var utrustningen sitter i racket, men kablarna ritas inte där. Ställförteckningen är bara en lista över alla ställ.",
  },
  {
    kind: "mcq",
    id: "markning-bada-andar",
    uses: ["uttag", "panel", "patchpanel"],
    prompt: "Kabeln från uttag 10 i rum 308 slutar på panel AC0311A. Vad står det på uttaget i rummet?",
    options: [
      { id: "hela-beteckningen", text: "AC0311A10" },
      { id: "rum", text: "308-10" },
      { id: "panel", text: "AC0311A" },
      { id: "rum-panel", text: "AC0311A308" },
    ],
    correct: "hela-beteckningen",
    explanation:
      "Uttaget får panelens beteckning plus sitt eget nummer, och samma beteckning står i båda ändarna av kabeln. Därför står det AC0311A10 även i rummet. Rummets nummer ingår inte i beteckningen. Bara panelens beteckning säger inte vilket av panelens uttag det gäller.",
  },
];
