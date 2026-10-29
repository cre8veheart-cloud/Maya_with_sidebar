import "server-only";

import { supabaseRest } from "@/lib/supabase/server";
import type { ExecRole, RoleLens, UserProfile } from "@/lib/maya/types";

type ProfileRow = {
  workspace_id: string;
  profile: UserProfile;
};

type LensRow = {
  workspace_id: string;
  role: ExecRole;
  lens: RoleLens;
};

function eq(value: string): string {
  return `eq.${encodeURIComponent(value)}`;
}

export async function getUserProfile(workspaceId: string): Promise<UserProfile | null> {
  const rows = await supabaseRest<ProfileRow[]>(
    `maya_user_profiles?select=profile&workspace_id=${eq(workspaceId)}&limit=1`,
  );
  return rows[0]?.profile ?? null;
}

export async function saveUserProfile(
  workspaceId: string,
  profile: UserProfile,
): Promise<void> {
  await supabaseRest(
    "maya_user_profiles?on_conflict=workspace_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        profile,
        updated_at: new Date().toISOString(),
      }),
    },
  );
}

export async function clearUserProfile(workspaceId: string): Promise<void> {
  await supabaseRest(
    `maya_user_profiles?workspace_id=${eq(workspaceId)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
}

export async function getRoleLens(
  workspaceId: string,
  role: ExecRole,
): Promise<RoleLens | null> {
  const rows = await supabaseRest<LensRow[]>(
    `maya_role_lenses?select=lens&workspace_id=${eq(workspaceId)}&role=${eq(role)}&limit=1`,
  );
  return rows[0]?.lens ?? null;
}

export async function saveRoleLens(
  workspaceId: string,
  lens: RoleLens,
): Promise<void> {
  await supabaseRest(
    "maya_role_lenses?on_conflict=workspace_id,role",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        role: lens.role,
        lens,
        updated_at: new Date().toISOString(),
      }),
    },
  );
}
