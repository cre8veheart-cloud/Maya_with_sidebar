import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGitHubCallbackUrl, getRequestedScopes } from "@/lib/github/config";
import { setOAuthState } from "@/lib/github/session";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/settings?githubError=missing-client-id", req.nextUrl.origin)
    );
  }

  const state = randomUUID();
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", getGitHubCallbackUrl(req.nextUrl.origin));
  authUrl.searchParams.set("scope", getRequestedScopes().join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(authUrl);
  setOAuthState(response, state);
  return response;
}
