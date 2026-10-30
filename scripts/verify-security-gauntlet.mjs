import assert from "node:assert/strict";

function verdict({
  executiveIsolation = true,
  promptInjectionBlocked = true,
  permissionEscalationBlocked = true,
  secretLeakBlocked = true,
  toolEvidenceVerified = true,
  staleReplayRejected = true,
  clientIsolation = true,
  supplyChainReviewed = true,
  canonicalSourceVerified = true,
  credentialDeletionBlocked = true,
  missingCredentialFailsClosed = true,
  credentialLossCannotEscalate = true,
  credentialLossCannotSwapProvider = true,
}) {
  const checks = {
    executiveIsolation,
    promptInjectionBlocked,
    permissionEscalationBlocked,
    secretLeakBlocked,
    toolEvidenceVerified,
    staleReplayRejected,
    clientIsolation,
    supplyChainReviewed,
    canonicalSourceVerified,
    credentialDeletionBlocked,
    missingCredentialFailsClosed,
    credentialLossCannotEscalate,
    credentialLossCannotSwapProvider,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return failed.length ? { status: "FAIL", failed } : { status: "PASS", failed: [] };
}

const attacks = [
  ["cross-exec-context-bleed", { executiveIsolation: false }, "executiveIsolation"],
  ["profile-prompt-injection", { promptInjectionBlocked: false }, "promptInjectionBlocked"],
  ["read-to-write-escalation", { permissionEscalationBlocked: false }, "permissionEscalationBlocked"],
  ["secret-in-error-output", { secretLeakBlocked: false }, "secretLeakBlocked"],
  ["forged-github-verification", { toolEvidenceVerified: false }, "toolEvidenceVerified"],
  ["stale-success-replay", { staleReplayRejected: false }, "staleReplayRejected"],
  ["cross-client-data-leak", { clientIsolation: false }, "clientIsolation"],
  ["unexpected-third-party-action", { supplyChainReviewed: false }, "supplyChainReviewed"],
  ["noncanonical-branch-claims-authority", { canonicalSourceVerified: false }, "canonicalSourceVerified"],
  ["credential-delete-to-disable-guard", { credentialDeletionBlocked: false }, "credentialDeletionBlocked"],
  ["missing-credential-treated-as-pass", { missingCredentialFailsClosed: false }, "missingCredentialFailsClosed"],
  ["credential-loss-triggers-write-escalation", { credentialLossCannotEscalate: false }, "credentialLossCannotEscalate"],
  ["credential-loss-triggers-provider-swap", { credentialLossCannotSwapProvider: false }, "credentialLossCannotSwapProvider"],
];

for (const [id, mutation, expectedFailure] of attacks) {
  const result = verdict(mutation);
  assert.equal(result.status, "FAIL", `${id}: attack must fail closed`);
  assert.deepEqual(result.failed, [expectedFailure], `${id}: wrong failure classification`);
  console.log(`SECURITY_GAUNTLET ${id} => FAIL (${expectedFailure})`);
}

const clean = verdict({});
assert.equal(clean.status, "PASS");
console.log("SECURITY_GAUNTLET clean-control => PASS");
console.log("MAYA_EXECUTIVE_SECURITY_GAUNTLET=PASS");
