import { normalizedLevenshtein } from "./levenshtein";

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Order-insensitive similarity for multi-word strings (classic "token set
 * ratio" approach). Splits both inputs into token sets, finds the shared
 * intersection, and compares three canonical strings — intersection alone,
 * intersection+A's-only-tokens, intersection+B's-only-tokens — taking the
 * best normalized-Levenshtein score among the three pairings. This makes
 * "git commit" and "commit git --amend" score higher than a naive whole-
 * string comparison would.
 */
export function tokenSetRatio(a: string, b: string): number {
  const aTokens = Array.from(new Set(tokenize(a))).sort();
  const bTokens = Array.from(new Set(tokenize(b))).sort();

  if (aTokens.length === 0 && bTokens.length === 0) return 1;
  if (aTokens.length === 0 || bTokens.length === 0) return 0;

  const bSet = new Set(bTokens);
  const aSet = new Set(aTokens);
  const intersection = aTokens.filter((t) => bSet.has(t)).sort();
  const aOnly = aTokens.filter((t) => !bSet.has(t)).sort();
  const bOnly = bTokens.filter((t) => !aSet.has(t)).sort();

  const t0 = intersection.join(" ");
  const t1 = [t0, aOnly.join(" ")].filter(Boolean).join(" ").trim();
  const t2 = [t0, bOnly.join(" ")].filter(Boolean).join(" ").trim();

  return Math.max(
    normalizedLevenshtein(t0, t1),
    normalizedLevenshtein(t0, t2),
    normalizedLevenshtein(t1, t2)
  );
}
