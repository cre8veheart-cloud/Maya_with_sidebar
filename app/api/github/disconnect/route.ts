import { NextResponse } from "next/server";
import { clearGitHubSessionCookie, getCurrentGitHubSession } from "@/lib/github/session";
import { deleteGitHubSession, logGitHubAudit } from "@/lib/github/store";

export async function POST() {
  const session = await getCurrentGitHubSession();
  if (session) {
    await logGitHubAudit(session.id, {
      kind: "auth",
      action: "disconnect",
      target: session.user?.login ?? "unknown",
      status: "success",
      detail: "GitHub account disconnected",
    });
    await deleteGitHubSession(session.id);
  }

  const response = NextResponse.json({ ok: true });
  clearGitHubSessionCookie(response);
  return response;
}
