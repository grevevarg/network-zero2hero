export type Route = { page: "home" } | { page: "section"; id: string };

const SECTION = /^#\/avsnitt\/([a-z0-9-]+)$/;

export function parseHash(hash: string): Route {
  const m = SECTION.exec(hash);
  return m ? { page: "section", id: m[1] } : { page: "home" };
}

export function sectionHref(id: string): string {
  return `#/avsnitt/${id}`;
}
