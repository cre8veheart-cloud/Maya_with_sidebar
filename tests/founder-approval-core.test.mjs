import assert from "node:assert/strict";
import test from "node:test";

import {
  hasExactFounderApproval,
  isApprovalWorkflowRelevantEvent,
} from "../lib/founder-approval-core.mjs";

const FOUNDER_LOGIN = "cre8veheart-ai";

test("pull_request events always evaluate founder exact-head approval", () => {
  assert.equal(
    isApprovalWorkflowRelevantEvent("pull_request", {}, FOUNDER_LOGIN),
    true,
  );
});

test("non-founder PR comments do not trigger founder exact-head approval", () => {
  assert.equal(
    isApprovalWorkflowRelevantEvent(
      "issue_comment",
      {
        issue: { pull_request: { url: "https://example.test/pr/1" } },
        comment: {
          user: { login: "vercel[bot]" },
          body: "Preview deployed",
        },
      },
      FOUNDER_LOGIN,
    ),
    false,
  );
});

test("founder PR comments without an APPROVE prefix do not trigger rechecks", () => {
  assert.equal(
    isApprovalWorkflowRelevantEvent(
      "issue_comment",
      {
        issue: { pull_request: { url: "https://example.test/pr/1" } },
        comment: {
          user: { login: FOUNDER_LOGIN },
          body: "Please tighten this workflow first",
        },
      },
      FOUNDER_LOGIN,
    ),
    false,
  );
});

test("founder APPROVE comments on PRs trigger exact-head rechecks", () => {
  assert.equal(
    isApprovalWorkflowRelevantEvent(
      "issue_comment",
      {
        issue: { pull_request: { url: "https://example.test/pr/1" } },
        comment: {
          user: { login: FOUNDER_LOGIN },
          body: " APPROVE abc123 ",
        },
      },
      FOUNDER_LOGIN,
    ),
    true,
  );
});

test("only exact founder approval comments satisfy the head SHA check", () => {
  assert.equal(
    hasExactFounderApproval(
      [
        {
          user: { login: "vercel[bot]" },
          author_association: "NONE",
          body: "APPROVE abc123",
        },
        {
          user: { login: FOUNDER_LOGIN },
          author_association: "OWNER",
          body: " APPROVE abc123 ",
        },
      ],
      FOUNDER_LOGIN,
      "abc123",
    ),
    true,
  );

  assert.equal(
    hasExactFounderApproval(
      [
        {
          user: { login: FOUNDER_LOGIN },
          author_association: "OWNER",
          body: "APPROVE stale-head",
        },
      ],
      FOUNDER_LOGIN,
      "abc123",
    ),
    false,
  );
});

test("the named founder can approve as a collaborator in the recovered repository", () => {
  assert.equal(
    hasExactFounderApproval(
      [{
        user: { login: FOUNDER_LOGIN },
        author_association: "COLLABORATOR",
        body: "APPROVE abc123",
      }],
      FOUNDER_LOGIN,
      "abc123",
    ),
    true,
  );
});

test("founder recognition does not allow other accounts or untrusted associations", () => {
  for (const login of [
    "cre8veheart-cloud",
    "cre8veheart-ai.",
    "claude[bot]",
    "untrusted-user",
  ]) {
    for (const association of ["OWNER", "COLLABORATOR"]) {
      assert.equal(
        hasExactFounderApproval(
          [{
            user: { login },
            author_association: association,
            body: "APPROVE abc123",
          }],
          FOUNDER_LOGIN,
          "abc123",
        ),
        false,
        `${login}: ${association}`,
      );
    }
  }
  for (const association of ["NONE", "CONTRIBUTOR", "MEMBER", undefined]) {
    assert.equal(
      hasExactFounderApproval(
        [{
          user: { login: FOUNDER_LOGIN },
          author_association: association,
          body: "APPROVE abc123",
        }],
        FOUNDER_LOGIN,
        "abc123",
      ),
      false,
      String(association),
    );
  }
});

test("a founder collaborator still needs the exact current head", () => {
  for (const body of ["APPROVE stale-head", "APPROVE", "please APPROVE abc123"]) {
    assert.equal(
      hasExactFounderApproval(
        [{
          user: { login: FOUNDER_LOGIN },
          author_association: "COLLABORATOR",
          body,
        }],
        FOUNDER_LOGIN,
        "abc123",
      ),
      false,
      body,
    );
  }
});
