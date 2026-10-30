import { pathToFileURL } from "node:url";

export function inspectConfiguration(env = process.env, nodeVersion = process.versions.node) {
  return {
    nodeSupported: Number(nodeVersion.split(".")[0]) >= 22,
    anthropicConfigured: Boolean(env.ANTHROPIC_API_KEY?.trim()),
  };
}

export function healthUrl(input) {
  const url = new URL(input);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("Use only the app origin, without credentials, paths, query strings or fragments.");
  }
  return new URL("/api/health", url);
}

export async function inspectLiveHealth(input, fetchImpl = fetch) {
  const url = healthUrl(input);
  try {
    const response = await fetchImpl(url, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    // Keep remote bodies and error messages out of logs: either may contain secrets.
    const payload = await response.json();
    const recognized =
      payload?.service === "maya-with-sidebar" &&
      payload?.checks?.app === true &&
      typeof payload?.checks?.anthropicConfigured === "boolean";
    if (!recognized) return { state: "unrecognized" };
    const ready =
      response.status === 200 &&
      payload.status === "ready" &&
      payload.checks.anthropicConfigured;
    const degraded =
      response.status === 503 &&
      payload.status === "degraded";
    if (!ready && !degraded) return { state: "unrecognized" };
    return {
      state: ready ? "ready" : "degraded",
      anthropicConfigured: payload.checks.anthropicConfigured,
    };
  } catch {
    return { state: "unavailable" };
  }
}

export function formatReport(config, live) {
  const lines = [
    "MAYA maintenance check — read-only",
    `Node runtime: ${config.nodeSupported ? "SUPPORTED" : "UPGRADE REQUIRED (Node 22+)"}`,
    `Local ANTHROPIC_API_KEY: ${config.anthropicConfigured ? "PRESENT — NOT VALIDATED" : "MISSING"}`,
    "Local scope: current process environment only; no .env files or saved connectors are inspected.",
  ];
  if (!config.anthropicConfigured && !live) {
    lines.push("Local next step: configure ANTHROPIC_API_KEY in the runtime's secure secret store, not in Git or chat.");
  }
  if (!live) {
    lines.push("Live app: NOT CHECKED. Add --url https://your-app-host to query /api/health.");
  } else if (live.state === "ready" || live.state === "degraded") {
    lines.push(`Live app: ${live.state === "ready" ? "HEALTH RESPONDING" : "DEGRADED"}`);
    lines.push(`Live Anthropic configuration: ${live.anthropicConfigured ? "PRESENT — NOT VALIDATED" : "MISSING"}`);
    if (!live.anthropicConfigured) {
      lines.push("Live next step: configure the key in that app's secure runtime settings; do not duplicate it into unrelated services.");
    }
  } else {
    lines.push(`Live app: ${live.state === "unavailable" ? "UNAVAILABLE OR INVALID RESPONSE" : "UNRECOGNIZED HEALTH RESPONSE"}`);
    lines.push("Live next step: inspect the existing app's server/build logs; do not reset accounts or recreate the repository.");
  }
  lines.push(
    "No credentials were printed or changed; no model requests, deployments, or sign-ins were performed.",
    "Health reports configuration only. AI validity/billing, login, persistence, original-source parity and production approval remain unverified.",
    "Verification (no deployment): npm run verify",
    "Cloudflare packaging (no upload): npm run verify:cloudflare",
  );
  return lines.join("\n");
}

export async function runDoctor(args = [], env = process.env, fetchImpl = fetch) {
  if (args.includes("--help") && args.length === 1) {
    return { code: 0, output: "Usage: npm run doctor [-- --url https://your-app-host]\nRead-only configuration/health checks. No sign-ins, secret values, paid model calls or deployments." };
  }
  if (args.length && !(args.length === 2 && args[0] === "--url")) {
    return { code: 2, output: "Usage: npm run doctor [-- --url https://your-app-host]" };
  }
  const config = inspectConfiguration(env);
  let live;
  if (args.length) {
    try {
      live = await inspectLiveHealth(args[1], fetchImpl);
    } catch {
      return { code: 2, output: "Invalid app origin. Use http(s)://host[:port] without credentials, paths, query strings or fragments." };
    }
  }
  // When a remote app is requested, its configuration is independent of this shell.
  const configured = live ? live.state === "ready" : config.anthropicConfigured;
  return {
    code: config.nodeSupported && configured ? 0 : 1,
    output: formatReport(config, live),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runDoctor(process.argv.slice(2));
  console.log(result.output);
  process.exitCode = result.code;
}
