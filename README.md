# fuzzy-match-scorer
![CI](https://github.com/FerrowAI/fuzzy-match-scorer/actions/workflows/ci.yml/badge.svg)

Zero-dependency fuzzy string matching for TypeScript/JavaScript: Levenshtein,
Damerau-Levenshtein, Jaro-Winkler, and an order-insensitive token-set ratio,
plus `bestMatch`/`rankMatches` helpers to pick the closest string out of a
candidate list.

## Why

Agents and CLIs constantly need to resolve a slightly-wrong string — a typo'd
tool name, a fuzzy user query, a near-miss command — against a known list of
valid options. This package does that with no runtime dependencies, strict
TypeScript, and predictable 0-1 scores.

## Install

```bash
npm install fuzzy-match-scorer
```

## Quickstart

```ts
import { bestMatch, rankMatches } from "fuzzy-match-scorer";

const candidates = ["commit", "checkout", "cherry-pick", "commit-tree"];

rankMatches("commmit", candidates);
// [{ candidate: "commit", score: 0.971, index: 0 }, ...] sorted best-first

bestMatch("commmit", candidates, { threshold: 0.7 });
// { candidate: "commit", score: 0.971, index: 0 }
```

## API

### `levenshtein(a: string, b: string): number`
Iterative edit distance, two-row memory (O(min(m,n)) space).

### `damerauLevenshtein(a: string, b: string): number`
Edit distance including adjacent-transposition as a single edit
(optimal string alignment variant).

### `normalizedLevenshtein(a, b): number` / `normalizedDamerauLevenshtein(a, b): number`
Raw distance divided by `max(a.length, b.length)`, inverted to a 0-1
similarity score (1 = identical).

### `jaro(a: string, b: string): number`
Jaro similarity, 0-1.

### `jaroWinkler(a: string, b: string, prefixScale = 0.1, maxPrefix = 4): number`
Jaro similarity with a common-prefix boost.

### `tokenSetRatio(a: string, b: string): number`
Order-insensitive similarity for multi-word strings — splits both inputs
into token sets and scores the best of three intersection-anchored
comparisons. `"git commit"` and `"commit git --amend"` score 1.0.

### `rankMatches(query: string, candidates: readonly string[], options?: MatchOptions): RankedMatch[]`
Scores every candidate, filters by `options.threshold` (default 0), and
returns them sorted best-first.

### `bestMatch(query: string, candidates: readonly string[], options?: MatchOptions): RankedMatch | null`
Returns the top-ranked candidate, or `null` if none clears the threshold.

```ts
interface MatchOptions {
  algorithm?: "levenshtein" | "damerau" | "jaro-winkler" | "token-set"; // default "jaro-winkler"
  threshold?: number;    // default 0
  caseSensitive?: boolean; // default false
}
interface RankedMatch {
  candidate: string;
  score: number; // 0-1
  index: number; // original position in the candidates array
}
```

## Limits

- Distances are computed on UTF-16 code units, not grapheme clusters —
  combining characters/emoji may not match human intuition.
- `damerauLevenshtein` only counts *adjacent* transpositions (the common
  "optimal string alignment" restriction), not the full Damerau-Levenshtein
  metric with unrestricted transpositions.
- `tokenSetRatio` splits on whitespace only; it does not stem or strip
  punctuation.
- Not designed for very long documents — algorithms are O(m*n) or O(m+n)
  per comparison; batch-score against large candidate lists accordingly.

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
