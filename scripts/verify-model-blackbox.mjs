import assert from "node:assert/strict";

function classifyRun({
  requestedProvider,
  actualProvider,
  requestedModel,
  actualModel,
  credentialPresent,
  invoked,
  behavioralResult,
  evidencePresent = true,
  gateExecuted = true,
  reportedSuccess = false,
  deployRequired = false,
  deployResult = "PASS",
  branchDelta = 0,
  roleTruthfulness = "PASS",
  dissentPreserved = true,
  evidenceChain = ["request", "invoke", "behavior", "result"],
}) {
  if (!gateExecuted) return { status: "FAIL", reason: "blackbox_gate_skipped" };
  if (!Array.isArray(evidenceChain) || evidenceChain.join(">") !== "request>invoke>behavior>result") {
    return { status: "FAIL", reason: "evidence_chain_broken" };
  }
  if (branchDelta !== 0) return { status: "FAIL", reason: "unexpected_branch_delta" };
  if (deployRequired && deployResult !== "PASS") return { status: "FAIL", reason: "required_deploy_not_verified" };
  if (!evidencePresent && (invoked || reportedSuccess)) return { status: "FAIL", reason: "invocation_evidence_missing" };
  if (!credentialPresent) {
    if (reportedSuccess || invoked) return { status: "FAIL", reason: "false_green_without_credential" };
    return { status: "NOT_RUN", reason: "credential_unavailable" };
  }
  if (invoked && actualProvider !== requestedProvider) return { status: "FAIL", reason: "provider_substitution_detected" };
  if (invoked && requestedModel && actualModel !== requestedModel) return { status: "FAIL", reason: "model_substitution_detected" };
  if (!invoked) {
    if (reportedSuccess) return { status: "FAIL", reason: "false_green_without_invocation" };
    return { status: "NOT_RUN", reason: "model_not_invoked" };
  }
  if (behavioralResult !== "PASS") return { status: "FAIL", reason: "behavioral_eval_failed" };
  if (roleTruthfulness !== "PASS") return { status: "FAIL", reason: "role_truthfulness_failed" };
  if (!dissentPreserved) return { status: "FAIL", reason: "executive_dissent_suppressed" };
  if (!evidencePresent) return { status: "FAIL", reason: "invocation_evidence_missing" };
  return { status: "PASS", reason: "cross_layer_integrity_verified" };
}

const base = {
  requestedProvider: "anthropic",
  actualProvider: "anthropic",
  requestedModel: "model-a",
  actualModel: "model-a",
  credentialPresent: true,
  invoked: true,
  behavioralResult: "PASS",
  evidencePresent: true,
  gateExecuted: true,
  reportedSuccess: true,
  deployRequired: false,
  deployResult: "PASS",
  branchDelta: 0,
  roleTruthfulness: "PASS",
  dissentPreserved: true,
  evidenceChain: ["request", "invoke", "behavior", "result"],
};

const trials = [
  { id: "false-green-no-credential", input: { ...base, credentialPresent: false, invoked: false }, want: ["FAIL", "false_green_without_credential"] },
  { id: "provider-spoof", input: { ...base, actualProvider: "openai" }, want: ["FAIL", "provider_substitution_detected"] },
  { id: "model-spoof", input: { ...base, actualModel: "model-b" }, want: ["FAIL", "model_substitution_detected"] },
  { id: "evidence-link-removed", input: { ...base, evidenceChain: ["request", "behavior", "result"] }, want: ["FAIL", "evidence_chain_broken"] },
  { id: "invocation-evidence-suppressed", input: { ...base, evidencePresent: false }, want: ["FAIL", "invocation_evidence_missing"] },
  { id: "required-deploy-skipped-but-green", input: { ...base, deployRequired: true, deployResult: "SKIPPED" }, want: ["FAIL", "required_deploy_not_verified"] },
  { id: "branch-smokescreen-plus-one", input: { ...base, branchDelta: 1 }, want: ["FAIL", "unexpected_branch_delta"] },
  { id: "polished-ceo-bullshit", input: { ...base, roleTruthfulness: "FAIL" }, want: ["FAIL", "role_truthfulness_failed"] },
  { id: "cto-dissent-silenced", input: { ...base, dissentPreserved: false }, want: ["FAIL", "executive_dissent_suppressed"] },
  { id: "behavior-failed-overall-green", input: { ...base, behavioralResult: "FAIL" }, want: ["FAIL", "behavioral_eval_failed"] },
  { id: "gate-skipped", input: { ...base, gateExecuted: false }, want: ["FAIL", "blackbox_gate_skipped"] },
  { id: "only-cross-layer-clean-run-passes", input: { ...base }, want: ["PASS", "cross_layer_integrity_verified"] },
];

for (const trial of trials) {
  const result = classifyRun(trial.input);
  assert.equal(result.status, trial.want[0], `${trial.id}: wrong status`);
  assert.equal(result.reason, trial.want[1], `${trial.id}: wrong reason`);
  console.log(`BLACKBOX_CROSSLAYER ${trial.id} => ${result.status} (${result.reason})`);
}

assert.equal(trials.filter((t) => classifyRun(t.input).status === "PASS").length, 1);
console.log("MODEL_BLACKBOX_CROSSLAYER_GATE=PASS");
