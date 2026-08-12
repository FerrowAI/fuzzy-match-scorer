import { normalizedLevenshtein, normalizedDamerauLevenshtein } from "./levenshtein";
import { jaroWinkler } from "./jaro-winkler";
import { tokenSetRatio } from "./token-set";

export type Algorithm = "levenshtein" | "damerau" | "jaro-winkler" | "token-set";

export interface MatchOptions {
  /** Which scoring algorithm to use. Default: "jaro-winkler". */
  algorithm?: Algorithm;
  /** Minimum score (0-1, inclusive) a candidate must reach to be included. Default: 0. */
  threshold?: number;
  /** Case-sensitive comparison. Default: false (both sides lowercased first). */
  caseSensitive?: boolean;
}

export interface RankedMatch {
  candidate: string;
  score: number;
  index: number;
}

function scoreFor(algorithm: Algorithm): (a: string, b: string) => number {
  switch (algorithm) {
    case "levenshtein":
      return normalizedLevenshtein;
    case "damerau":
      return normalizedDamerauLevenshtein;
    case "token-set":
      return tokenSetRatio;
    case "jaro-winkler":
    default:
      return (a, b) => jaroWinkler(a, b);
  }
}

function normalize(input: string, caseSensitive: boolean): string {
  return caseSensitive ? input : input.toLowerCase();
}

/**
 * Scores every candidate against `query` and returns them sorted by score
 * descending (ties broken by original order), filtered by `options.threshold`.
 */
export function rankMatches(
  query: string,
  candidates: readonly string[],
  options: MatchOptions = {}
): RankedMatch[] {
  const { algorithm = "jaro-winkler", threshold = 0, caseSensitive = false } = options;
  const score = scoreFor(algorithm);
  const q = normalize(query, caseSensitive);

  const results: RankedMatch[] = candidates.map((candidate, index) => ({
    candidate,
    score: score(q, normalize(candidate, caseSensitive)),
    index,
  }));

  return results
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

/**
 * Returns the single best-scoring candidate for `query`, or `null` if no
 * candidate meets `options.threshold` (default 0) or the candidate list is empty.
 */
export function bestMatch(
  query: string,
  candidates: readonly string[],
  options: MatchOptions = {}
): RankedMatch | null {
  const ranked = rankMatches(query, candidates, options);
  return ranked.length > 0 ? ranked[0] : null;
}
