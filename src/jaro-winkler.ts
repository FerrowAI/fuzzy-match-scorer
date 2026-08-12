/**
 * Jaro similarity: a 0-1 score based on matching characters within a window
 * and transposition count. Well suited to short strings (names, identifiers).
 */
export function jaro(a: string, b: string): number {
  if (a === b) return 1;
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0 || bLen === 0) return 0;

  const matchWindow = Math.max(0, Math.floor(Math.max(aLen, bLen) / 2) - 1);

  const aMatches = new Array<boolean>(aLen).fill(false);
  const bMatches = new Array<boolean>(bLen).fill(false);

  let matches = 0;
  for (let i = 0; i < aLen; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, bLen);
    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < aLen; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions = Math.floor(transpositions / 2);

  return (
    (matches / aLen + matches / bLen + (matches - transpositions) / matches) /
    3
  );
}

/**
 * Jaro-Winkler similarity: boosts the Jaro score for strings that share a
 * common prefix (up to `maxPrefix` characters, default 4), weighted by `prefixScale`
 * (default 0.1, the standard Winkler constant).
 */
export function jaroWinkler(
  a: string,
  b: string,
  prefixScale = 0.1,
  maxPrefix = 4
): number {
  const jaroScore = jaro(a, b);
  if (jaroScore === 0) return 0;

  let prefixLen = 0;
  const limit = Math.min(maxPrefix, a.length, b.length);
  for (let i = 0; i < limit; i++) {
    if (a[i] === b[i]) prefixLen++;
    else break;
  }

  return jaroScore + prefixLen * prefixScale * (1 - jaroScore);
}
