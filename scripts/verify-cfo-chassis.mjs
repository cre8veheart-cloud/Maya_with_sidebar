import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cfo = await readFile(new URL("../lib/maya/executives/cfo.ts", import.meta.url), "utf8");
const lens = await readFile(new URL("../lib/maya/execLens.ts", import.meta.url), "utf8");
const registry = await readFile(new URL("../lib/executives/registry.ts", import.meta.url), "utf8");
const sidebar = await readFile(new URL("../components/Sidebar.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/cfo/page.tsx", import.meta.url), "utf8");

const requiredCfoMarkers = [
  'role: "cfo"',
  'version: "3.0.0-dana"',
  "You are Dana, MAYA's CFO",
  "DANA — CFO EXECUTIVE INTELLIGENCE",
  "Forensic financial review",
  "Budget architecture",
  "Portfolio economics",
  "Board-ready accountability",
  '"represent-human-approval"',
];

for (const marker of requiredCfoMarkers) {
  assert.ok(cfo.includes(marker), `CFO chassis missing: ${marker}`);
}

assert.match(lens, /import \{ cfoChassis \} from "\.\/executives\/cfo"/);
assert.match(lens, /role === "cfo"/);
assert.match(registry, /id: "dana",[\s\S]*name: "Dana"[\s\S]*title: "CFO"/);
assert.match(sidebar, /Dana · CFO/);
assert.match(page, /title="Dana · CFO"/);

console.log("Dana CFO standalone chassis verification passed.");
