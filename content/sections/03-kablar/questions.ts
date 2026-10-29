import type { QuestionInput } from "../../../src/build/schema.ts";

export const questions: QuestionInput[] = [
  {
    kind: "ordering",
    id: "kablar-t568b",
    uses: ["t568b", "rj45"],
    prompt: "Du kopplar en RJ45-kontakt enligt T568B. Ordna ledarna från stift 1 överst till stift 8 underst.",
    items: [
      { id: "vit-orange", text: "Vit/orange" },
      { id: "orange", text: "Orange" },
      { id: "vit-gron", text: "Vit/grön" },
      { id: "bla", text: "Blå" },
      { id: "vit-bla", text: "Vit/blå" },
      { id: "gron", text: "Grön" },
      { id: "vit-brun", text: "Vit/brun" },
      { id: "brun", text: "Brun" },
    ],
    explanation:
      "T568B börjar med det orangea paret på stift 1 och 2. Sedan kommer vit/grön på 3, det blå paret på 4 och 5 och grön på 6. Det bruna paret ligger sist, på 7 och 8.",
  },
  {
    kind: "matching",
    id: "kablar-kategori",
    uses: ["kategori", "bithastighet"],
    prompt: "Para ihop varje kategori med den hastighet den klarar på 100 meter, eller på 30 meter för Cat8.",
    pairs: [
      { left: { id: "cat5", text: "Cat5" }, right: { id: "100m", text: "100 Mbit/s" } },
      { left: { id: "cat5e", text: "Cat5e" }, right: { id: "1g", text: "1 Gbit/s" } },
      { left: { id: "cat6a", text: "Cat6a" }, right: { id: "10g", text: "10 Gbit/s" } },
      { left: { id: "cat8", text: "Cat8" }, right: { id: "40g", text: "25 eller 40 Gbit/s" } },
    ],
    explanation:
      "Cat5 klarar 100 Mbit/s och Cat5e tar steget till 1 Gbit/s. Cat6a klarar 10 Gbit/s hela vägen till 100 meter. Cat8 är snabbast men räcker bara 30 meter.",
  },
  {
    kind: "mcq",
    id: "kablar-komradio",
    uses: ["halv-duplex", "full-duplex", "simplex", "seriell-overforing"],
    prompt: "Du pratar i en komradio. Du måste säga \"över\" och släppa knappen innan din kompis kan svara. Vilket läge är det?",
    options: [
      { id: "halv", text: "Halv duplex" },
      { id: "full", text: "Full duplex" },
      { id: "simplex", text: "Simplex" },
      { id: "seriell", text: "Seriell överföring" },
    ],
    correct: "halv",
    explanation:
      "Ni kan båda prata, men inte samtidigt, och det är just halv duplex. Full duplex skulle betyda att ni kunde prata i mun på varandra, som i ett telefonsamtal. Simplex är bara åt ett håll, men här kan din kompis svara. Seriell överföring handlar om att bitar skickas en i taget, inte om vem som får prata när.",
  },
  {
    kind: "mcq",
    id: "kablar-stp",
    uses: ["stp", "utp", "twisted-pair", "emi"],
    prompt: "Vad har STP som UTP saknar?",
    options: [
      { id: "skarm", text: "En skärm av metall runt paren" },
      { id: "tvinning", text: "Ledare som är tvinnade i par" },
      { id: "fler-par", text: "Fler par av kopparledare" },
      { id: "glas", text: "En kärna av glas i stället för koppar" },
    ],
    correct: "skarm",
    explanation:
      "S:et i STP står för shielded, alltså skärmad, och U:et i UTP för unshielded. STP har en metallskärm runt varje par, som UTP saknar. Båda har sina ledare tvinnade i par, det är därför båda heter twisted pair. Båda har också fyra par. En kärna av glas har bara fiber.",
  },
  {
    kind: "mcq",
    id: "kablar-10g",
    uses: ["kategori", "bithastighet"],
    prompt: "Du ska dra en kabel på 90 meter som ska klara 10 Gbit/s. Vilken är den lägsta kategorin som räcker?",
    options: [
      { id: "cat6a", text: "Cat6a" },
      { id: "cat6", text: "Cat6" },
      { id: "cat7", text: "Cat7" },
      { id: "cat8", text: "Cat8" },
    ],
    correct: "cat6a",
    explanation:
      "Cat6a klarar 10 Gbit/s på 100 meter, så 90 meter går bra. Cat6 klarar bara 1 Gbit/s. Cat7 klarar också 10 Gbit/s, men den är inte den lägsta kategorin som räcker. Cat8 är snabbare men räcker bara 30 meter.",
  },
  {
    kind: "mcq",
    id: "kablar-byggnader",
    uses: ["fiber", "singlemode", "multimode", "kategori", "emi", "dampning"],
    prompt: "Två byggnader ligger två kilometer från varandra. Längs vägen finns starka elektriska störningar. Vilken kabel passar?",
    options: [
      { id: "smf", text: "Singlemode-fiber" },
      { id: "mmf", text: "Multimode-fiber" },
      { id: "cat6a", text: "Cat6a med skärm" },
      { id: "cat8", text: "Cat8 med skärm" },
    ],
    correct: "smf",
    explanation:
      "Två kilometer är alldeles för långt för twisted pair, som räcker 100 meter för Cat6a och bara 30 meter för Cat8. Fiber påverkas inte av elektriska störningar, så fiber är rätt sorts kabel. Multimode räcker bara några hundra meter. Singlemode har ljus i en enda bana och räcker flera mil.",
  },
  {
    kind: "matching",
    id: "kablar-begrepp",
    uses: ["emi", "dampning", "poe", "full-duplex", "seriell-overforing"],
    prompt: "Para ihop varje beskrivning med rätt begrepp.",
    pairs: [
      { left: { id: "storning", text: "Störningar utifrån, till exempel från motorer" }, right: { id: "emi", text: "EMI" } },
      { left: { id: "svagare", text: "Signalen blir svagare ju längre den färdas" }, right: { id: "dampning", text: "Dämpning" } },
      { left: { id: "strom", text: "Ström och data i samma kabel" }, right: { id: "poe", text: "PoE" } },
      { left: { id: "samtidigt", text: "Sänder och tar emot samtidigt" }, right: { id: "full", text: "Full duplex" } },
      { left: { id: "en-i-taget", text: "Bitarna skickas en i taget, efter varandra" }, right: { id: "seriell", text: "Seriell överföring" } },
    ],
    explanation:
      "EMI är störningar utifrån och dämpning är att signalen tappar styrka på vägen. PoE ger ström i nätverkskabeln. Full duplex sänder åt båda hållen samtidigt, och seriell överföring skickar en bit i taget.",
  },
];
