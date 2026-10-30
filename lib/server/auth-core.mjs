import { verifyBetaSession } from "../beta/session-core.mjs";

export function authenticateBetaToken(token) {
  const session = verifyBetaSession(token);

  if (!session) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized", code: "AUTH_REQUIRED" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return { sessionId: session.sub };
}

export function isResponseError(error) {
  return error instanceof Response;
}
