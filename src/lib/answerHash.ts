/**
 * Light obfuscation of answer data shipped to the browser.
 * This is deterrence against casual peeking, not security: anyone can run
 * the same hash over every option.
 */
const SALT = "fntn-v1";

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function answerKey(questionId: string, answer: string): Promise<string> {
  return sha256Hex(`${SALT}:${questionId}:${answer}`);
}

export async function matchesKey(questionId: string, answer: string, key: string): Promise<boolean> {
  return (await answerKey(questionId, answer)) === key;
}
