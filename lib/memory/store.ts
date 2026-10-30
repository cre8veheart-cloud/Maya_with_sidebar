import "server-only";
import { supabaseRest } from "@/lib/supabase/server";

export type MemoryScope = "workspace" | "client" | "executive" | "session";

export async function saveMemory(input: { workspaceId: string; content: string; memoryType: string; scope: MemoryScope; clientId?: string | null; executiveId?: string | null; sessionId?: string | null; importance?: number; metadata?: Record<string, unknown> }) {
  const rows = await supabaseRest<Record<string, unknown>[]>("memories", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ workspace_id: input.workspaceId, client_id: input.clientId ?? null, executive_id: input.executiveId ?? null, session_id: input.sessionId ?? null, scope: input.scope, memory_type: input.memoryType, content: input.content, importance: input.importance ?? 5, metadata: input.metadata ?? {} }),
  });
  return rows[0] ?? null;
}

export async function recentMemories(input: { workspaceId: string; clientId?: string; executiveId?: string; limit?: number }) {
  const params = new URLSearchParams({ select: "*", workspace_id: `eq.${input.workspaceId}`, order: "importance.desc,created_at.desc", limit: String(Math.min(input.limit ?? 25, 100)) });
  if (input.clientId) params.set("client_id", `eq.${input.clientId}`);
  if (input.executiveId) params.set("executive_id", `eq.${input.executiveId}`);
  return supabaseRest<Record<string, unknown>[]>(`memories?${params.toString()}`);
}
