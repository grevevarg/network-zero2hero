export type Route = { page: "home" } | { page: "section"; id: string; card?: number };

const SECTION = /^#\/avsnitt\/([a-z0-9-]+)(?:\/(\d+))?$/;

export function parseHash(hash: string): Route {
  const m = SECTION.exec(hash);
  if (!m) return { page: "home" };
  return m[2] === undefined ? { page: "section", id: m[1] } : { page: "section", id: m[1], card: Number(m[2]) };
}

/** Link to a section, optionally at a 1-based card number. */
export function sectionHref(id: string, card?: number): string {
  return card === undefined ? `#/avsnitt/${id}` : `#/avsnitt/${id}/${card}`;
}
