import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const BETA_SESSION_COOKIE = "maya_beta_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export function hasBetaSessionSecret() {
  return Boolean(process.env.BETA_SESSION_SECRET && process.env.BETA_SESSION_SECRET.length >= 32);
}

function secret() {
  const value = process.env.BETA_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("BETA_SESSION_SECRET is not configured");
  }
  return value;
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createBetaSession() {
  const payload = encode(
    JSON.stringify({
      sub: randomUUID(),
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyBetaSession(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof session?.sub === "string" &&
      typeof session?.exp === "number" &&
      session.exp > Date.now() / 1000
      ? session
      : null;
  } catch {
    return null;
  }
}

export const betaSessionMaxAge = SESSION_TTL_SECONDS;
