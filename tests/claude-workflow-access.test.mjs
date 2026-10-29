import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const workflow = readFileSync(
  new URL("../.github/workflows/claude.yml", import.meta.url),
  "utf8",
);
const expression = workflow
  .match(/  claude:\n    if: \|\n([\s\S]*?)\n    runs-on:/)?.[1]
  .trim();
assert.ok(expression, "Claude job must have an explicit authorization condition");
const condition = new vm.Script(`(${expression})`);

function allowed(actor, eventName, mentioned = true) {
  const body = mentioned ? "@claude review the requested change" : "ordinary discussion";
  return condition.runInNewContext({
    github: {
      actor,
      event_name: eventName,
      event: {
        comment: { body, user: { login: "cre8veheart-ai" } },
        review: { body },
        issue: { title: "Review request", body },
      },
    },
    contains: (text, search) => String(text ?? "").includes(search),
  });
}

const events = [
  "issue_comment",
  "pull_request_review_comment",
  "pull_request_review",
  "issues",
];

test("both approved GitHub accounts can request Claude work", () => {
  for (const actor of ["cre8veheart-ai", "cre8veheart-cloud"]) {
    for (const event of events) {
      assert.equal(allowed(actor, event), true, `${actor}: ${event}`);
    }
  }
});

test("trusted accounts still need an explicit Claude mention", () => {
  for (const actor of ["cre8veheart-ai", "cre8veheart-cloud"]) {
    for (const event of events) {
      assert.equal(allowed(actor, event, false), false, `${actor}: ${event}`);
    }
  }
});

test("other accounts and bots cannot authorize Claude via event payloads", () => {
  for (const actor of [
    "untrusted-user",
    "claude[bot]",
    "github-actions[bot]",
    "vercel[bot]",
    "cre8veheart-ai.",
  ]) {
    for (const event of events) {
      assert.equal(allowed(actor, event), false, `${actor}: ${event}`);
    }
  }
});

test("manual smoke tests stay separate from the write-capable Claude job", () => {
  assert.equal(allowed("cre8veheart-ai", "workflow_dispatch"), false);
  assert.equal(allowed("cre8veheart-cloud", "workflow_dispatch"), false);
  assert.match(
    workflow,
    /claude-smoke:\n    if: github\.event_name == 'workflow_dispatch'/,
  );
});
