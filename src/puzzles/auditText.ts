import type { Problem } from "./audit.ts";

/** "A", "A och B", "A, B och C". */
export function joinNames(names: readonly string[]): string {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} och ${names[names.length - 1]}`;
}

/** One problem in plain Swedish. `label` turns an interface id into its name. */
export function describeProblem(p: Problem, label: (id: string) => string): string {
  const who = joinNames(p.interfaces.map(label));
  const alone = p.interfaces.length === 1;
  switch (p.kind) {
    case "invalid":
      return `${who}: det här är ingen adress med mask. Skriv den som 192.168.1.10/24.`;
    case "no-host-room":
      return `${who}: masken lämnar ingen plats för hosts.`;
    case "network-address":
      return `${who}: det här är nätets nätverksadress, och den ges inte till en host.`;
    case "broadcast-address":
      return `${who}: det här är nätets broadcastadress, och den ges inte till en host.`;
    case "duplicate":
      return `${who} har samma adress.`;
    case "different-nets":
      return alone ? `${who} ligger i ett annat nät än resten av broadcastdomänen.` : `${who} sitter i samma broadcastdomän men ligger i olika nät.`;
    case "different-masks":
      return alone ? `${who} har en annan mask än resten av broadcastdomänen.` : `${who} sitter i samma broadcastdomän men har olika mask.`;
    case "overlap":
      return `${who} ligger i olika broadcastdomäner, men deras nät delar adresser.`;
  }
}

/** The line above the list of problems. Planted faults still hidden are only counted. */
export function repairHint(shown: number, hidden: number): string {
  if (shown === 0) return `${hidden} fel kvar bland adresserna du inte har ändrat.`;
  if (hidden === 0) return "Det är fel kvar i det du har ändrat.";
  return `Det är fel kvar i det du har ändrat, och ${hidden} till bland adresserna du inte har rört.`;
}
