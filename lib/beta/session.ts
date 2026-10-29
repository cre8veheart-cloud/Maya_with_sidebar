import {
  BETA_SESSION_COOKIE,
  betaSessionMaxAge,
  createBetaSession as createBetaSessionCore,
  hasBetaSessionSecret as hasBetaSessionSecretCore,
  verifyBetaSession as verifyBetaSessionCore,
} from "./session-core.mjs";

export { BETA_SESSION_COOKIE, betaSessionMaxAge };

type BetaSession = { sub: string; exp: number };

export function hasBetaSessionSecret(): boolean {
  return hasBetaSessionSecretCore();
}

export function createBetaSession(): string {
  return createBetaSessionCore();
}

export function verifyBetaSession(token: string | undefined): BetaSession | null {
  return verifyBetaSessionCore(token) as BetaSession | null;
}
