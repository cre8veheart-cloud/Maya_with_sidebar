import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cmo = await readFile(new URL("../lib/maya/executives/cmo.ts", import.meta.url), "utf8");
const lens = await readFile(new URL("../lib/maya/execLens.ts", import.meta.url), "utf8");
const registry = await readFile(new URL("../lib/executives/registry.ts", import.meta.url), "utf8");
const sidebar = await readFile(new URL("../components/Sidebar.tsx", import.meta.url), "utf8");

const requiredCmoMarkers = [
  'role: "cmo"',
  'version: "3.0.0-erica"',
  "You are Erica, MAYA's CMO",
  "ERICA — CMO EXECUTIVE INTELLIGENCE",
  "Global-to-U.S. market translation",
  "Integrated communications leadership",
  "Prestige and influence partnerships",
  "Board-ready accountability",
  '"represent-human-approval"',
];

for (const marker of requiredCmoMarkers) {
  assert.ok(cmo.includes(marker), `CMO chassis missing: ${marker}`);
}

assert.doesNotMatch(cmo, /You are Max|MAX — CMO|MAX RESPONSE/);
assert.match(lens, /import \{ cmoChassis \} from "\.\/executives\/cmo"/);
assert.match(lens, /role === "cmo"/);
assert.match(registry, /id: "cmo",[\s\S]*name: "Erica"/);
assert.match(sidebar, /Erica · CMO/);

console.log("Erica CMO standalone chassis verification passed.");
