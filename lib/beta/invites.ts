import { createHash, timingSafeEqual } from "crypto";
import { kv } from "@vercel/kv";

function normalizedCodes(): string[] {
  return (process.env.BETA_INVITE_CODES ?? "").split(",").map((code) => code.trim().toLowerCase()).filter(Boolean);
}

function configuredStore(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function matchesConfiguredCode(code: string): boolean {
  const candidate = Buffer.from(code);
  return normalizedCodes().some((configured) => {
    const expected = Buffer.from(configured);
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

export async function redeemInvite(code: string): Promise<boolean> {
  if (!code || !matchesConfiguredCode(code) || !configuredStore()) return false;
  const key = `maya:redeemed-invite:${createHash("sha256").update(code).digest("hex")}`;
  const result = await kv.set(key, "1", { nx: true });
  return result === "OK";
}
