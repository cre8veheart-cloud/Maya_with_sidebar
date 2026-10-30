export function evaluateHealth(env = process.env, now = new Date()) {
  const checks = {
    app: true,
    anthropicConfigured: Boolean(env.ANTHROPIC_API_KEY),
  };

  const ready = Object.values(checks).every(Boolean);

  return {
    statusCode: ready ? 200 : 503,
    payload: {
      service: "maya-with-sidebar",
      status: ready ? "ready" : "degraded",
      checks,
      timestamp: now.toISOString(),
    },
  };
}
