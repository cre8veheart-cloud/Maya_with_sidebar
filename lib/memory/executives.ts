import "server-only";
import { supabaseRest } from "@/lib/supabase/server";
import { MAYA_AGENTS, type MayaAgentId } from "@/lib/executives/registry";

export async function ensureExecutiveProfiles(workspaceId: string) {
  const rows = MAYA_AGENTS.map((agent) => ({
    workspace_id: workspaceId,
    key: agent.id,
    display_name: agent.name,
    role: agent.title,
    config: {
      layer: agent.layer,
      mission: agent.mission,
      owns: agent.owns,
      routesTo: agent.routesTo,
      authority: agent.authority,
      status: agent.status,
    },
  }));

  return supabaseRest("executive_profiles?on_conflict=workspace_id,key", {
    method: "POST",
    body: JSON.stringify(rows),
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
  });
}

export async function getExecutiveProfile(workspaceId: string, key: MayaAgentId) {
  const rows = await supabaseRest<Array<Record<string, unknown>>>(
    `executive_profiles?workspace_id=eq.${encodeURIComponent(workspaceId)}&key=eq.${encodeURIComponent(key)}&limit=1`
  );
  return rows[0] ?? null;
}

export async function getExecutiveMemoryContext(workspaceId: string, executiveId: string, limit = 30) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return supabaseRest<Array<Record<string, unknown>>>(
    `memories?workspace_id=eq.${encodeURIComponent(workspaceId)}&executive_id=eq.${encodeURIComponent(executiveId)}&order=importance.desc,created_at.desc&limit=${safeLimit}`
  );
}
