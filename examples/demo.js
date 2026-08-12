const { rankMatches, bestMatch } = require("../dist/index.js");

// Simulate an agent that fat-fingered a CLI subcommand name.
const query = "commmit";
const candidates = ["commit", "checkout", "cherry-pick", "commit-tree", "config"];

console.log(`query: "${query}"`);
console.log("ranked (jaro-winkler, default):");
for (const r of rankMatches(query, candidates)) {
  console.log(`  ${r.candidate.padEnd(14)} score=${r.score.toFixed(3)}`);
}

const top = bestMatch(query, candidates, { threshold: 0.7 });
console.log("bestMatch (threshold 0.7):", top);

console.log("\nrankMatches with algorithm='damerau' (transposition-aware):");
for (const r of rankMatches("comimt", candidates, { algorithm: "damerau" })) {
  console.log(`  ${r.candidate.padEnd(14)} score=${r.score.toFixed(3)}`);
}

const { tokenSetRatio } = require("../dist/index.js");
console.log(
  "\ntokenSetRatio('git commit', 'commit git --amend') =",
  tokenSetRatio("git commit", "commit git --amend").toFixed(3)
);
