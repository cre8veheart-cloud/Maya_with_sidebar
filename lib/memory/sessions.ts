import "server-only";
import { supabaseRest } from "@/lib/supabase/server";

async function insertOne(table: string, value: Record<string, unknown>) {
  const rows = await supabaseRest<Record<string, unknown>[]>(table, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(value) });
  return rows[0] ?? null;
}

export function createMayaSession(input: { workspaceId: string; title: string; clientId?: string | null; mode?: string }) {
  return insertOne("sessions", { workspace_id: input.workspaceId, client_id: input.clientId ?? null, title: input.title, mode: input.mode ?? "standard" });
}

export function appendMessage(input: { sessionId: string; authorType: "user" | "executive" | "system"; content: string; executiveId?: string | null; metadata?: Record<string, unknown> }) {
  return insertOne("messages", { session_id: input.sessionId, executive_id: input.executiveId ?? null, author_type: input.authorType, content: input.content, metadata: input.metadata ?? {} });
}

export function getSessionMessages(sessionId: string, limit = 500) {
  const params = new URLSearchParams({ select: "*", session_id: `eq.${sessionId}`, order: "created_at.asc", limit: String(Math.min(limit, 1000)) });
  return supabaseRest<Record<string, unknown>[]>(`messages?${params.toString()}`);
}
