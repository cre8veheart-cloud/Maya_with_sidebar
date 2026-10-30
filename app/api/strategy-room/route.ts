import { NextRequest } from "next/server";
import { requireBetaSession, isResponseError } from "@/lib/server/auth";
import { runStrategyRoom } from "@/lib/maya/strategyRoom";
import type { ExecRole, MayaProvider } from "@/lib/maya/types";

const VALID_ROLES = new Set<ExecRole>([
  "ceo", "coo", "cmo", "cfo", "cto", "cio", "cro", "cd", "admin", "hr", "legal",
]);
const VALID_PROVIDERS = new Set<MayaProvider>(["anthropic", "openclaw", "openai"]);

function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[\x00-\x1f\x7f]/g, " ").trim();
}

function isExecRole(value: unknown): value is ExecRole {
  return typeof value === "string" && VALID_ROLES.has(value as ExecRole);
}

export async function POST(req: NextRequest) {
  try {
    requireBetaSession(req);
  } catch (error) {
    if (isResponseError(error)) return error;
    return Response.json({ error: "Authentication failed", code: "AUTH_ERROR" }, { status: 500 });
  }

  let roles: ExecRole[] = [];
  let prompt = "";
  let provider: MayaProvider = "anthropic";
  let model = "";
  let ludicrousMode = false;

  try {
    const body: unknown = await req.json();
    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const rawRoles: unknown[] = Array.isArray(payload.roles) ? payload.roles : [];
    const validatedRoles: ExecRole[] = rawRoles.filter(isExecRole);
    roles = Array.from(new Set<ExecRole>(validatedRoles)).slice(0, 8);
    prompt = sanitizeText(payload.prompt, 8000);
    provider = typeof payload.provider === "string" && VALID_PROVIDERS.has(payload.provider as MayaProvider)
      ? (payload.provider as MayaProvider)
      : ((process.env.MAYA_PROVIDER as MayaProvider) || "anthropic");
    model = sanitizeText(payload.model, 100);
    ludicrousMode = payload.ludicrousMode === true;
  } catch {
    return Response.json({ error: "Invalid request body", code: "INVALID_REQUEST" }, { status: 400 });
  }

  if (roles.length < 2) {
    return Response.json({ error: "Select at least two executive roles", code: "ROLES_REQUIRED" }, { status: 400 });
  }
  if (!prompt) {
    return Response.json({ error: "A strategy prompt is required", code: "PROMPT_REQUIRED" }, { status: 400 });
  }


  try {
    const result = await runStrategyRoom({
      roles,
      prompt,
      provider,
      model: model || undefined,
      ludicrousMode,
    });

    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    const errorType = error instanceof Error ? error.name : typeof error;
    console.error("Strategy Room request failed", { incidentId, errorType });
    return Response.json(
      {
        error: "Strategy Room is temporarily unavailable",
        code: "STRATEGY_ROOM_ERROR",
        incidentId,
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
