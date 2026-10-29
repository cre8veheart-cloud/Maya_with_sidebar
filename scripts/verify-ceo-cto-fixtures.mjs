import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtures = await readFile(new URL("../lib/maya/adjudicationFixtures.ts", import.meta.url), "utf8");
const adjudication = await readFile(new URL("../lib/maya/adjudication.ts", import.meta.url), "utf8");

const scenarioIds = [
  "launch-speed-vs-reliability",
  "custom-build-vs-buy",
  "feature-promise-vs-technical-evidence",
];

for (const id of scenarioIds) assert.match(fixtures, new RegExp(id));

assert.match(fixtures, /role: "ceo"/);
assert.match(fixtures, /role: "cto"/);
assert.match(fixtures, /mustPreserveConflict: true/);
assert.match(fixtures, /mustChooseOrHold: true/);
assert.match(fixtures, /mustStateReversalCondition: true/);

// Fixtures must exercise genuine executive tension rather than two copies of the same answer.
assert.match(fixtures, /Keep the Friday beta date/);
assert.match(fixtures, /Do not open the beta until/);
assert.match(fixtures, /Use the vendor for beta/);
assert.match(fixtures, /Use the vendor only behind a replaceable interface/);
assert.match(fixtures, /conditional discovery commitment/);
assert.match(fixtures, /No delivery commitment until/);

// Maya's governing contract must remain non-consensus and evidence-driven.
assert.match(adjudication, /Do not average recommendations/);
assert.match(adjudication, /hybrid path is allowed only when evidence supports it/i);
assert.match(adjudication, /hold \/ evidence-needed decision/);
assert.match(adjudication, /winning_path/);
assert.match(adjudication, /rejected_paths/);
assert.match(adjudication, /reversal_or_stop_condition/);

console.log("CEO + CTO conflict fixtures verification passed");
