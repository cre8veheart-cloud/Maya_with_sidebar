import { NextRequest } from "next/server";
import { BETA_SESSION_COOKIE } from "@/lib/beta/session";
import {
  authenticateBetaToken,
  isResponseError as isResponseErrorCore,
} from "./auth-core.mjs";

export type AuthenticatedSession = {
  sessionId: string;
};

export function requireBetaSession(req: NextRequest): AuthenticatedSession {
  const token = req.cookies.get(BETA_SESSION_COOKIE)?.value;
  return authenticateBetaToken(token) as AuthenticatedSession;
}

export function isResponseError(error: unknown): error is Response {
  return isResponseErrorCore(error);
}
