import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const prompt = readFileSync(new URL("../lib/maya/execLens.ts", import.meta.url), "utf8");

test("the shared executive standard requests brief consultations and actionable options", () => {
  assert.match(prompt, /Default to a brief consultation/);
  assert.match(prompt, /up to three concrete action options/);
  assert.match(prompt, /expand only when the user requests detail or safety requires it/);
  assert.match(prompt, /do not invent extra options/);
});

test("action options preserve explicit approval and evidence requirements", () => {
  assert.match(prompt, /Distinguish prepare\/draft\/save from send\/publish\/pay\/change access/);
  assert.match(prompt, /explicit human approval and verified tool results/);
  assert.match(prompt, /No forced consensus/);
  assert.match(prompt, /UNTRUSTED EXECUTIVE REFERENCE DATA/);
});
