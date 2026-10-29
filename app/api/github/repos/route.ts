import { NextResponse } from "next/server";
import { listGitHubRepos } from "@/lib/github/api";
import { getCurrentGitHubSession } from "@/lib/github/session";

export async function GET() {
  const session = await getCurrentGitHubSession();
  if (!session) {
    return NextResponse.json({ error: "GitHub is not connected" }, { status: 401 });
  }

  try {
    const repos = await listGitHubRepos(session);
    return NextResponse.json({
      repos: repos.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        private: repo.private,
        defaultBranch: repo.default_branch,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list repositories" },
      { status: 400 }
    );
  }
}
