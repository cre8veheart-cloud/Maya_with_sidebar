import { NextRequest } from "next/server";
import type { ExecRole, RoleLens } from "@/lib/maya/types";
import { isResponseError, requireBetaSession } from "@/lib/server/auth";
import { getRoleLens, saveRoleLens } from "@/lib/storage/userVault";

export const dynamic = "force-dynamic";

const VALID_ROLES = new Set<ExecRole>([
  "ceo", "coo", "cmo", "cfo", "cto", "cio", "cro", "cd", "admin", "hr", "legal",
]);

function noStore(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function authorize(req: NextRequest): string | Response {
  try {
    return requireBetaSession(req).sessionId;
  } catch (error) {
    if (isResponseError(error)) return error;
    return noStore({ error: "Authorization failed", code: "AUTH_ERROR" }, 500);
  }
}

function parseRole(raw: unknown): ExecRole | null {
  return typeof raw === "string" && VALID_ROLES.has(raw as ExecRole)
    ? (raw as ExecRole)
    : null;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string"
    ? value.slice(0, max).replace(/[\x00-\x1f\x7f]/g, " ").trim()
    : "";
}

function parseLens(raw: unknown): RoleLens | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const role = parseRole(value.role);
  if (!role) return null;

  const overrides = Array.isArray(value.overrides)
    ? value.overrides
        .filter((item) => item && typeof item === "object")
        .slice(0, 50)
        .map((item) => {
          const override = item as Record<string, unknown>;
          return {
            key: clean(override.key, 100),
            value: clean(override.value, 500),
          };
        })
        .filter((item) => item.key && item.value)
    : [];

  return { role, overrides };
}

export async function GET(req: NextRequest) {
  const workspaceId = authorize(req);
  if (workspaceId instanceof Response) return workspaceId;

  const role = parseRole(req.nextUrl.searchParams.get("role"));
  if (!role) {
    return noStore({ error: "Valid role required", code: "INVALID_ROLE" }, 400);
  }

  try {
    return noStore({ lens: await getRoleLens(workspaceId, role) });
  } catch (error) {
    console.error("MAYA lens read failed", error);
    return noStore({ error: "Lens storage unavailable", code: "STORAGE_ERROR" }, 503);
  }
}

export async function POST(req: NextRequest) {
  const workspaceId = authorize(req);
  if (workspaceId instanceof Response) return workspaceId;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return noStore({ error: "Invalid request body", code: "INVALID_REQUEST" }, 400);
  }

  const lens = parseLens(body.lens);
  if (!lens) {
    return noStore({ error: "Valid lens required", code: "INVALID_LENS" }, 400);
  }

  try {
    await saveRoleLens(workspaceId, lens);
    return noStore({ lens });
  } catch (error) {
    console.error("MAYA lens write failed", error);
    return noStore({ error: "Lens storage unavailable", code: "STORAGE_ERROR" }, 503);
  }
}
