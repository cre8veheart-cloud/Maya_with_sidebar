import { NextRequest, NextResponse } from "next/server";
import { getRepoSummary, resolveRepoConfig } from "@/lib/github/api";
import { isRepoAllowed, sanitizeRepoConfig } from "@/lib/github/config";
import { getCurrentGitHubSession } from "@/lib/github/session";
import { logGitHubAudit, saveGitHubSession } from "@/lib/github/store";

export async function GET() {
  const session = await getCurrentGitHubSession();
  if (!session) {
    return NextResponse.json({ error: "GitHub is not connected" }, { status: 401 });
  }

  return NextResponse.json({ repoConfig: session.repoConfig });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentGitHubSession();
  if (!session) {
    return NextResponse.json({ error: "GitHub is not connected" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const repoConfig = sanitizeRepoConfig(body.repoConfig);
    if (!repoConfig) {
      throw new Error("Invalid repository configuration");
    }
    if (!isRepoAllowed(repoConfig)) {
      throw new Error("Selected repository is not allowed");
    }

    await getRepoSummary(session, resolveRepoConfig(session, repoConfig));
    await saveGitHubSession({ ...session, repoConfig });
    await logGitHubAudit(session.id, {
      kind: "auth",
      action: "repository.update",
      target: `${repoConfig.owner}/${repoConfig.repo}@${repoConfig.branch}`,
      status: "success",
      detail: "Active repository updated",
    });

    return NextResponse.json({ repoConfig });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Repository update failed" },
      { status: 400 }
    );
  }
}
