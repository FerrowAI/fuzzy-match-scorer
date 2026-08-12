/**
 * Iterative Levenshtein edit distance using two-row memory (O(min(m,n)) space).
 * Returns the raw edit distance (integer >= 0).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure `a` is the shorter string to minimize row width.
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;
  let prevRow = new Array<number>(m + 1);
  let currRow = new Array<number>(m + 1);

  for (let i = 0; i <= m; i++) prevRow[i] = i;

  for (let j = 1; j <= n; j++) {
    currRow[0] = j;
    const bChar = b.charCodeAt(j - 1);
    for (let i = 1; i <= m; i++) {
      const cost = a.charCodeAt(i - 1) === bChar ? 0 : 1;
      const deletion = prevRow[i] + 1;
      const insertion = currRow[i - 1] + 1;
      const substitution = prevRow[i - 1] + cost;
      currRow[i] = Math.min(deletion, insertion, substitution);
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[m];
}

/**
 * Damerau-Levenshtein edit distance (adds adjacent-transposition as a single edit),
 * using the "optimal string alignment" restricted variant with full O(m*n) matrix
 * (transpositions require lookback beyond one row, so two-row memory is not used here).
 */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d.push(new Array<number>(n + 1).fill(0));
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        val = Math.min(val, d[i - 2][j - 2] + cost); // transposition
      }
      d[i][j] = val;
    }
  }

  return d[m][n];
}

/** Normalizes a raw edit distance to a 0-1 similarity score (1 = identical). */
export function normalizedLevenshtein(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/** Normalizes a raw Damerau-Levenshtein distance to a 0-1 similarity score. */
export function normalizedDamerauLevenshtein(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - damerauLevenshtein(a, b) / maxLen;
}
