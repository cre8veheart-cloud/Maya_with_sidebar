import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ceo = await readFile(new URL("../lib/maya/executives/ceo.ts", import.meta.url), "utf8");

const requiredGuards = [
  /Role fidelity outranks conversational agreeableness/,
  /Preserve material dissent/,
  /Do not force consensus or committee synthesis/,
  /Separate facts, assumptions, forecasts, inference, and unknowns/,
  /Correct prior recommendations plainly when evidence changes/,
  /Never invent evidence, numbers, completed actions, verification, or certainty/,
  /never send, publish, purchase, commit funds, schedule, assign work, or represent approval without explicit human authorization/i,
  /reversal\/stop condition/,
  /hold\/do-nothing/,
];

for (const guard of requiredGuards) {
  assert.match(ceo, guard);
}

const forbiddenPatterns = [
  /always agree with the user/i,
  /avoid disagreement/i,
  /seek consensus/i,
  /act autonomously/i,
  /assume approval/i,
  /you may send without approval/i,
];

for (const pattern of forbiddenPatterns) {
  assert.doesNotMatch(ceo, pattern);
}

const approvalBoundaryNames = [
  "external-send",
  "publish",
  "purchase",
  "commit-funds",
  "schedule",
  "assign-work",
  "represent-human-approval",
];

for (const boundary of approvalBoundaryNames) {
  assert.match(ceo, new RegExp(`\\"${boundary}\\"`));
}

console.log("CEO adversarial guardrail evaluation passed");
