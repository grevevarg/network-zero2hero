/** Canonical string forms of answers. The client hashes these and compares with the shipped key. */
export function orderingAnswer(ids: readonly string[]): string {
  return ids.join(",");
}

/** One matching pair. Each left item has its own key, so the student sees which pairs are wrong. */
export function pairAnswer(leftId: string, rightId: string): string {
  return `${leftId}=${rightId}`;
}

/** One filled slot. Each slot has its own key, so the student sees which slots are wrong. */
export function slotAnswer(index: number, tileId: string): string {
  return `${index}=${tileId}`;
}

export type FillFormat = "text" | "number" | "ipv4" | "binary";

/**
 * The canonical form of a typed answer, so harmless differences don't count as wrong:
 * case and extra spaces always, and leading zeros in numbers, octets and binary.
 * Anything that doesn't parse for its format is compared as plain text.
 */
export function normalizeAnswer(value: string, format: FillFormat): string {
  const text = value.trim().toLowerCase().replace(/\s+/g, " ");
  const compact = text.replace(/ /g, "");
  const noLeadingZeros = (digits: string) => digits.replace(/^0+(?=.)/, "");
  switch (format) {
    case "text":
      return text;
    case "number":
      return /^\d+$/.test(compact) ? noLeadingZeros(compact) : text;
    case "binary":
      return /^[01]+$/.test(compact) ? noLeadingZeros(compact) : text;
    case "ipv4": {
      const parts = compact.split(".");
      return parts.length === 4 && parts.every((p) => /^\d+$/.test(p)) ? parts.map(noLeadingZeros).join(".") : text;
    }
  }
}

/** What the client hashes for one field: the field's opaque id and the normalised answer. */
export function fillAnswer(fieldId: string, value: string, format: FillFormat): string {
  return `${fieldId}=${normalizeAnswer(value, format)}`;
}
