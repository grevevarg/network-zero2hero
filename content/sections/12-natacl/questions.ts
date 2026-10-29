import type { QuestionInput } from "../../../src/build/schema.ts";
import { formatIPv4, wildcardMask } from "../../../src/lib/net.ts";

const aclTable = (rows: string[]) =>
  `| Rad | Regel |\n| --- | --- |\n${rows.map((r, i) => `| ${i + 1} | ${r} |`).join("\n")}`;

export const questions: QuestionInput[] = [
  {
    kind: "fill",
    id: "natacl-wildcard",
    uses: ["wildcard-mask", "subnatmask", "prefix"],
    prompt: "Skriv wildcard-masken för näten.",
    fields: [
      { id: "p24", label: "192.168.1.0/24", answer: formatIPv4(wildcardMask(24)), format: "ipv4" },
      { id: "p26", label: "10.0.0.64/26", answer: formatIPv4(wildcardMask(26)), format: "ipv4" },
    ],
    explanation:
      "Wildcard-masken är 255 minus masken i varje oktett. Masken för /24 är 255.255.255.0, och då blir wildcard-masken 0.0.0.255. Masken för /26 är 255.255.255.192, och 255 − 192 = 63, så wildcard-masken blir 0.0.0.63.",
  },
  {
    kind: "mcq",
    id: "natacl-pat",
    uses: ["pat", "kallport-malport", "publik-adress"],
    prompt: "Tio datorer hemma surfar samtidigt, men nätet har bara en publik adress. Hur vet routern vilken dator ett svar från internet ska till?",
    options: [
      { id: "port", text: "Den har bytt källporten för varje anslutning och skrivit upp bytet i en tabell" },
      { id: "mac", text: "Den läser datorns MAC-adress, som följer med paketet över internet" },
      { id: "broadcast", text: "Den skickar svaret som broadcast, och rätt dator tar emot det" },
      { id: "publika", text: "Den ger varje dator en egen publik adress medan anslutningen pågår" },
    ],
    correct: "port",
    explanation:
      "Med PAT byter routern källporten för varje anslutning och sparar bytet i sin tabell, så svaret på en viss port kan skickas till rätt dator. MAC-adresser följer aldrig med längre än till nästa router. En broadcast skulle nå alla datorer, och det är inte så det fungerar. Egna publika adresser per dator är en-till-en-NAT, och det kräver tio publika adresser.",
  },
  {
    kind: "mcq",
    id: "natacl-forwarding",
    uses: ["port-forwarding", "pat", "server", "port"],
    prompt: "Du kör en webbserver hemma på 192.168.1.50. Vad behöver du ställa in på routern för att andra ska nå den från internet?",
    options: [
      { id: "forward", text: "Port forwarding av port 443 till 192.168.1.50" },
      { id: "pat", text: "Ingenting, PAT släpper in trafiken automatiskt" },
      { id: "acl", text: "En ACL som nekar all trafik till 192.168.1.50" },
      { id: "publik", text: "Byta serverns adress till routerns publika adress" },
    ],
    correct: "forward",
    explanation:
      "Med port forwarding skickar routern allt som kommer in på port 443 vidare till servern. PAT släpper bara in svar på anslutningar som någon innanför har startat. En ACL som nekar trafiken skulle göra precis tvärtom. Två enheter kan inte ha samma adress, och den publika adressen sitter redan på routern.",
  },
  {
    kind: "mcq",
    id: "natacl-forsta-regel",
    uses: ["acl", "implicit-deny", "prefix"],
    prompt: `En ACL har de här reglerna:\n\n${aclTable(["Tillåt avsändare 192.168.1.0/24", "Neka avsändare 192.168.1.20"])}\n\nVad händer med trafik från 192.168.1.20?`,
    options: [
      { id: "slapps", text: "Den släpps igenom, eftersom rad 1 passar först" },
      { id: "nekas-rad2", text: "Den stoppas, eftersom rad 2 gäller just den adressen" },
      { id: "nekas-implicit", text: "Den stoppas av implicit deny i slutet av listan" },
      { id: "bada", text: "Den stoppas, eftersom neka alltid går före tillåt" },
    ],
    correct: "slapps",
    explanation:
      "Routern läser uppifrån och använder den första regeln som passar. 192.168.1.20 ligger i 192.168.1.0/24, så rad 1 passar och trafiken släpps igenom. Rad 2 läses aldrig, trots att den är mer exakt. Implicit deny gäller bara trafik som inte passar någon regel, och neka går inte automatiskt före tillåt.",
  },
  {
    kind: "mcq",
    id: "natacl-implicit",
    uses: ["acl", "implicit-deny", "prefix"],
    prompt: `En ACL har bara en regel:\n\n${aclTable(["Tillåt avsändare 10.0.0.0/8"])}\n\nVad händer med trafik från 172.16.5.5?`,
    options: [
      { id: "stoppas", text: "Den stoppas av implicit deny" },
      { id: "slapps", text: "Den släpps igenom, eftersom ingen regel nekar den" },
      { id: "regel1", text: "Den släpps igenom av rad 1, eftersom båda är privata adresser" },
      { id: "fel", text: "Routern tar bort ACL:en, eftersom den inte passar trafiken" },
    ],
    correct: "stoppas",
    explanation:
      "172.16.5.5 ligger inte i 10.0.0.0/8, så rad 1 passar inte. Då gäller den osynliga regeln sist i listan, implicit deny, och trafiken stoppas. Att ingen regel uttryckligen nekar räcker inte. Att båda adresserna är privata spelar ingen roll, det är bara näten som jämförs.",
  },
  {
    kind: "mcq",
    id: "natacl-extended",
    uses: ["standard-extended-acl", "port", "acl"],
    prompt: "Du vill stoppa webbtrafik på port 80 från ett visst nät men släppa all annan trafik därifrån. Vad behövs?",
    options: [
      { id: "extended", text: "En extended-ACL" },
      { id: "standard", text: "En standard-ACL" },
      { id: "forwarding", text: "Port forwarding av port 80" },
      { id: "pat", text: "PAT på routern" },
    ],
    correct: "extended",
    explanation:
      "Bara en extended-ACL kan titta på portar, och här måste regeln gälla just port 80. En standard-ACL tittar bara på avsändaren, så den skulle stoppa all trafik från nätet. Port forwarding skickar trafik vidare i stället för att stoppa den. PAT handlar om att dela en publik adress, inte om att filtrera.",
  },
  {
    kind: "matching",
    id: "natacl-begrepp",
    uses: ["nat", "pat", "port-forwarding", "implicit-deny"],
    prompt: "Para ihop varje beskrivning med rätt begrepp.",
    pairs: [
      { left: { id: "dela", text: "Många enheter delar en publik adress med hjälp av portar" }, right: { id: "pat", text: "PAT" } },
      { left: { id: "in", text: "Trafik som kommer in på en viss port skickas till en viss dator innanför" }, right: { id: "forward", text: "Port forwarding" } },
      { left: { id: "egen", text: "Varje privat adress får en egen publik adress" }, right: { id: "en-till-en", text: "En-till-en-NAT" } },
      { left: { id: "sist", text: "Trafik som inte passar någon regel i listan stoppas" }, right: { id: "implicit", text: "Implicit deny" } },
    ],
    explanation:
      "PAT delar en adress med hjälp av portar, medan en-till-en-NAT ger varje dator en egen. Port forwarding släpper in trafik till en dator innanför. Implicit deny är den osynliga sista regeln i varje ACL.",
  },
];
