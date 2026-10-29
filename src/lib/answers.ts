/** Canonical string forms of answers. The client hashes these and compares with the shipped key. */
export function orderingAnswer(ids: readonly string[]): string {
  return ids.join(",");
}

export function matchingAnswer(leftIds: readonly string[], chosen: Readonly<Record<string, string>>): string {
  return leftIds.map((l) => `${l}=${chosen[l] ?? ""}`).join(",");
}
