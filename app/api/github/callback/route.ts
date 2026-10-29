import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubViewer } from "@/lib/github/api";
import { getGitHubCallbackUrl } from "@/lib/github/config";
import {
  clearOAuthState,
  getOAuthState,
  setGitHubSessionCookie,
} from "@/lib/github/session";
import { createGitHubSession, logGitHubAudit } from "@/lib/github/store";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const state = req.nextUrl.searchParams.get("state") ?? "";
  const expectedState = await getOAuthState();

  if (!code || !state || !expectedState || state !== expectedState) {
    const response = NextResponse.redirect(
      new URL("/settings?githubError=invalid-state", req.nextUrl.origin)
    );
    clearOAuthState(response);
    return response;
  }

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    const response = NextResponse.redirect(
      new URL("/settings?githubError=missing-oauth-config", req.nextUrl.origin)
    );
    clearOAuthState(response);
    return response;
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getGitHubCallbackUrl(req.nextUrl.origin),
      }),
      cache: "no-store",
    });

    const payload = (await tokenResponse.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !payload.access_token) {
      throw new Error(payload.error_description || payload.error || "Token exchange failed");
    }

    const scopes = (payload.scope ?? "")
      .split(/[,\s]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
    const user = await fetchGitHubViewer(payload.access_token);
    const session = await createGitHubSession({
      accessToken: payload.access_token,
      scope: scopes,
      user,
    });
    await logGitHubAudit(session.id, {
      kind: "auth",
      action: "connect",
      target: user.login,
      status: "success",
      detail: "GitHub account connected",
    });

    const response = NextResponse.redirect(
      new URL("/settings?github=connected", req.nextUrl.origin)
    );
    clearOAuthState(response);
    setGitHubSessionCookie(response, session.id);
    return response;
  } catch (error) {
    const response = NextResponse.redirect(
      new URL(
        `/settings?githubError=${encodeURIComponent(
          error instanceof Error ? error.message : "callback-failed"
        )}`,
        req.nextUrl.origin
      )
    );
    clearOAuthState(response);
    return response;
  }
}
