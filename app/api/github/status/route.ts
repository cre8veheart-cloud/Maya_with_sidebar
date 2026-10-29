import { NextResponse } from "next/server";
import { fetchGitHubViewer, GitHubApiError } from "@/lib/github/api";
import {
  getAllowedRepos,
  getDefaultRepoConfig,
  getGitHubPermissions,
  getRequestedScopes,
} from "@/lib/github/config";
import { clearGitHubSessionCookie, getCurrentGitHubSession } from "@/lib/github/session";
import { deleteGitHubSession, listGitHubAudit, saveGitHubSession } from "@/lib/github/store";

export async function GET() {
  const session = await getCurrentGitHubSession();

  if (!session) {
    return NextResponse.json({
      configured: Boolean(
        process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim()
      ),
      connected: false,
      requestedScopes: getRequestedScopes(),
      allowedRepos: getAllowedRepos(),
      repoConfig: getDefaultRepoConfig(),
      permissions: getGitHubPermissions([]),
      audit: [],
    });
  }

  try {
    const user = await fetchGitHubViewer(session.accessToken);
    if (user.login !== session.user?.login) {
      await saveGitHubSession({ ...session, user });
    }

    return NextResponse.json({
      configured: true,
      connected: true,
      requestedScopes: getRequestedScopes(),
      allowedRepos: getAllowedRepos(),
      repoConfig: session.repoConfig,
      permissions: getGitHubPermissions(session.scope),
      user,
      audit: await listGitHubAudit(session.id),
      scopes: session.scope,
    });
  } catch (error) {
    const credentialRejected =
      error instanceof GitHubApiError && error.status === 401;

    if (credentialRejected) {
      await deleteGitHubSession(session.id);
    }

    const response = NextResponse.json({
      configured: true,
      connected: !credentialRejected,
      connectionDegraded: !credentialRejected,
      requestedScopes: getRequestedScopes(),
      allowedRepos: getAllowedRepos(),
      repoConfig: session.repoConfig ?? getDefaultRepoConfig(),
      permissions: credentialRejected
        ? getGitHubPermissions([])
        : getGitHubPermissions(session.scope),
      audit: await listGitHubAudit(session.id),
      connectionError:
        error instanceof Error ? error.message : "GitHub connection check failed",
    });

    if (credentialRejected) {
      clearGitHubSessionCookie(response);
    }
    return response;
  }
}
