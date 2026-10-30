import assert from "node:assert/strict";
import test from "node:test";
import {
  healthUrl,
  inspectConfiguration,
  inspectLiveHealth,
  runDoctor,
} from "../scripts/maya-doctor.mjs";

const reply = (status, payload) => async () => ({ status, json: async () => payload });
const health = (configured) => ({
  service: "maya-with-sidebar",
  status: configured ? "ready" : "degraded",
  checks: { app: true, anthropicConfigured: configured },
});

test("configuration checks presence without returning secret values", () => {
  assert.deepEqual(inspectConfiguration({ ANTHROPIC_API_KEY: "fixture-value" }, "22.0.0"), {
    nodeSupported: true, anthropicConfigured: true,
  });
  assert.equal(inspectConfiguration({ ANTHROPIC_API_KEY: "  " }, "20.0.0").anthropicConfigured, false);
  assert.equal(inspectConfiguration({}, "20.0.0").nodeSupported, false);
});

test("default doctor does not use the network and explains missing configuration", async () => {
  const result = await runDoctor([], {}, () => { throw new Error("network must not run"); });
  assert.equal(result.code, 1);
  assert.match(result.output, /MISSING/);
  assert.match(result.output, /Live app: NOT CHECKED/);
});

test("a configured key is never described as validated", async () => {
  const result = await runDoctor([], { ANTHROPIC_API_KEY: "fixture-secret-never-print" });
  assert.equal(result.code, 0);
  assert.match(result.output, /PRESENT — NOT VALIDATED/);
  assert.ok(!result.output.includes("fixture-secret-never-print"));
  assert.match(result.output, /production approval remain unverified/);
});

test("health requests use only the health route, forbid redirects, and have a timeout", async () => {
  const result = await inspectLiveHealth("https://maya.example", async (url, options) => {
    assert.equal(url.href, "https://maya.example/api/health");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers.Authorization, undefined);
    return { status: 200, json: async () => health(true) };
  });
  assert.deepEqual(result, { state: "ready", anthropicConfigured: true });
});

test("a healthy remote is independent of missing local configuration", async () => {
  const result = await runDoctor(["--url", "https://maya.example"], {}, reply(200, health(true)));
  assert.equal(result.code, 0);
  assert.match(result.output, /Local ANTHROPIC_API_KEY: MISSING/);
  assert.match(result.output, /Live app: HEALTH RESPONDING/);
  assert.ok(!result.output.includes("Local next step:"));
});

test("configured local credentials cannot disguise a degraded remote", async () => {
  const result = await runDoctor(["--url", "https://maya.example"], {
    ANTHROPIC_API_KEY: "fixture-local-value",
  }, reply(503, health(false)));
  assert.equal(result.code, 1);
  assert.match(result.output, /Live app: DEGRADED/);
  assert.match(result.output, /Live Anthropic configuration: MISSING/);
  assert.ok(!result.output.includes("fixture-local-value"));
});

test("HTTP success without the expected health contract is not readiness", async () => {
  assert.deepEqual(await inspectLiveHealth("https://maya.example", reply(200, { status: "ready" })), { state: "unrecognized" });
  assert.deepEqual(await inspectLiveHealth("https://maya.example", reply(500, health(true))), { state: "unrecognized" });
});

test("errors and unexpected remote fields never expose values", async () => {
  const remote = { ...health(true), debug: "fixture-remote-secret" };
  const result = await runDoctor(["--url", "https://maya.example"], {}, reply(200, remote));
  assert.ok(!result.output.includes("fixture-remote-secret"));
  const failed = await runDoctor(["--url", "https://maya.example"], {}, async () => {
    throw new Error("fixture-error-secret");
  });
  assert.equal(failed.code, 1);
  assert.ok(!failed.output.includes("fixture-error-secret"));
});

test("secret-bearing or non-origin URLs fail before making a request", async () => {
  for (const url of [
    "https://user:fixture-password@maya.example", "https://maya.example?token=fixture-token",
    "https://maya.example/#fixture-fragment", "file:///tmp/config", "https://maya.example/settings",
  ]) {
    const result = await runDoctor(["--url", url], {}, () => assert.fail("must not fetch"));
    assert.equal(result.code, 2);
    assert.ok(!result.output.includes("fixture-"));
  }
  assert.equal(healthUrl("http://127.0.0.1:8787").href, "http://127.0.0.1:8787/api/health");
});

test("help and invalid arguments are safe and make no requests", async () => {
  const noFetch = () => assert.fail("must not fetch");
  assert.equal((await runDoctor(["--help"], {}, noFetch)).code, 0);
  assert.equal((await runDoctor(["--token", "fixture-secret"], {}, noFetch)).code, 2);
});
