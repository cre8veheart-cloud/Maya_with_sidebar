import "server-only";

import { supabaseRest } from "@/lib/supabase/server";
import type {
  MayaPocketOfficeSession,
  MayaSessionCloseout,
  MayaSessionStatus,
} from "@/lib/maya/sessionLifecycle";
import type { MayaMessage } from "@/lib/maya/types";

type SessionRow = {
  id: string;
  workspace_id: string;
  client_vault_id: string;
  role: MayaPocketOfficeSession["role"];
  title: string;
  transcript: MayaMessage[];
  status: MayaSessionStatus;
  last_activity_at: string;
  closed_at: string | null;
  closeout: MayaSessionCloseout | null;
};

function eq(value: string): string {
  return `eq.${encodeURIComponent(value)}`;
}

function toSession(row: SessionRow): MayaPocketOfficeSession {
  return {
    id: row.id,
    clientVaultId: row.client_vault_id,
    role: row.role,
    title: row.title,
    transcript: row.transcript,
    status: row.status,
    lastActivityAt: row.last_activity_at,
    closedAt: row.closed_at,
    closeout: row.closeout,
  };
}

export async function savePocketOfficeSession(
  workspaceId: string,
  session: MayaPocketOfficeSession,
): Promise<MayaPocketOfficeSession> {
  const rows = await supabaseRest<SessionRow[]>(
    "maya_pocket_office_sessions?on_conflict=workspace_id,client_vault_id,id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: session.id,
        workspace_id: workspaceId,
        client_vault_id: session.clientVaultId,
        role: session.role,
        title: session.title,
        transcript: session.transcript,
        status: session.status,
        last_activity_at: session.lastActivityAt,
        closed_at: session.closedAt ?? null,
        closeout: session.closeout ?? null,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!rows[0]) throw new Error("Session storage returned no row");
  return toSession(rows[0]);
}

export async function listPocketOfficeSessions(
  workspaceId: string,
  clientVaultId: string,
  role?: MayaPocketOfficeSession["role"],
  limit = 30,
): Promise<MayaPocketOfficeSession[]> {
  const params = new URLSearchParams({
    select:
      "id,workspace_id,client_vault_id,role,title,transcript,status,last_activity_at,closed_at,closeout",
    workspace_id: eq(workspaceId),
    client_vault_id: eq(clientVaultId),
    order: "last_activity_at.desc",
    limit: String(Math.min(Math.max(limit, 1), 100)),
  });
  if (role) params.set("role", eq(role));

  const rows = await supabaseRest<SessionRow[]>(
    `maya_pocket_office_sessions?${params.toString()}`,
  );
  return rows.map(toSession);
}
