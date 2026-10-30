import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ceo = await readFile(new URL("../lib/maya/executives/ceo.ts", import.meta.url), "utf8");
const lens = await readFile(new URL("../lib/maya/execLens.ts", import.meta.url), "utf8");

assert.match(ceo, /export const ceoChassis/);
assert.match(ceo, /role: "ceo"/);
assert.match(ceo, /approvalBoundaries/);
assert.match(ceo, /represent-human-approval/);
assert.match(ceo, /cross-functional-adjudication-input/);

assert.match(lens, /import \{ ceoChassis \} from "\.\/executives\/ceo"/);
assert.match(lens, /role === "ceo"/);
assert.match(lens, /ceoChassis\.systemContract/);
assert.match(lens, /ceoChassis\.responseContract/);
assert.doesNotMatch(lens, /getExecutiveIntelligenceContract/);

console.log("CEO standalone chassis verification passed");
