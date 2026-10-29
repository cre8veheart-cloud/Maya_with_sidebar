import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contract = await readFile(new URL("../lib/maya/adjudication.ts", import.meta.url), "utf8");
const ceo = await readFile(new URL("../lib/maya/executives/ceo.ts", import.meta.url), "utf8");
const cto = await readFile(new URL("../lib/maya/executives/cto.ts", import.meta.url), "utf8");

const requiredAdjudicationGuards = [
  /Preserve each executive's materially distinct position/,
  /Do not rewrite disagreement into apparent consensus/,
  /Do not average recommendations/,
  /hybrid path is allowed only when evidence supports it/i,
  /Identify the winning path plainly/,
  /Identify materially rejected paths plainly/,
  /hold \/ evidence-needed decision/,
  /Keep role attribution intact/,
  /evidence that would reverse or stop it/i,
  /human authorizes any consequential external action/i,
  /preserved_positions/,
  /winning_path/,
  /rejected_paths/,
  /unresolved_unknowns/,
  /human_authorization_required/,
];

for (const guard of requiredAdjudicationGuards) {
  assert.match(contract, guard);
}

// Both executives must be able to remain in principled conflict before Maya judges.
assert.match(ceo, /Preserve material dissent/);
assert.match(cto, /Preserve material technical dissent/);
assert.match(ceo, /Do not force consensus/);
assert.match(cto, /speed, revenue, (?:excitement, or )?executive pressure favors another path/);

const forbiddenAdjudicationPatterns = [
  /always compromise/i,
  /split the difference/i,
  /make everyone agree/i,
  /prefer consensus/i,
  /choose the CEO because of rank/i,
  /choose the CTO because it is technical/i,
];

for (const pattern of forbiddenAdjudicationPatterns) {
  assert.doesNotMatch(contract, pattern);
}

console.log("CEO + CTO Maya adjudication verification passed");
