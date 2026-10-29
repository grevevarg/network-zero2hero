const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };

/** Plain text from build-time HTML, for places that cannot hold markup (aria-labels, <option>). */
export function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => ENTITIES[e]);
}
