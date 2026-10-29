import { compressIPv6 } from "./net.ts";

/** Canonical string forms of answers. The client hashes these and compares with the shipped key. */
export function orderingAnswer(ids: readonly string[]): string {
  return ids.join(",");
}

export function matchingAnswer(leftIds: readonly string[], chosen: Readonly<Record<string, string>>): string {
  return leftIds.map((l) => `${l}=${chosen[l] ?? ""}`).join(",");
}

export type FillFormat = "text" | "number" | "ipv4" | "binary" | "ipv6";

/**
 * The canonical form of a typed answer, so harmless differences don't count as wrong:
 * case and extra spaces always, leading zeros in numbers, octets and binary, and for IPv6 any
 * valid way of writing the same address (it becomes the canonical short form).
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
    case "ipv6":
      try {
        return compressIPv6(compact);
      } catch {
        return text;
      }
  }
}

/** What the client hashes for one field: the field's opaque id and the normalised answer. */
export function fillAnswer(fieldId: string, value: string, format: FillFormat): string {
  return `${fieldId}=${normalizeAnswer(value, format)}`;
}
