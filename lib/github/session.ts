import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  GITHUB_OAUTH_STATE_COOKIE,
  GITHUB_SESSION_COOKIE,
  getCookieOptions,
} from "./config";
import { getGitHubSession } from "./store";
import type { GitHubSession } from "./types";

export async function getCurrentGitHubSession(): Promise<GitHubSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GITHUB_SESSION_COOKIE)?.value ?? "";
  return getGitHubSession(sessionId);
}

export function setGitHubSessionCookie(
  response: NextResponse,
  sessionId: string
): void {
  response.cookies.set(GITHUB_SESSION_COOKIE, sessionId, getCookieOptions(60 * 60 * 24 * 30));
}

export function clearGitHubSessionCookie(response: NextResponse): void {
  response.cookies.set(GITHUB_SESSION_COOKIE, "", getCookieOptions(0));
}

export async function getOAuthState(): Promise<string> {
  return (await cookies()).get(GITHUB_OAUTH_STATE_COOKIE)?.value ?? "";
}

export function setOAuthState(response: NextResponse, state: string): void {
  response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, getCookieOptions(60 * 10));
}

export function clearOAuthState(response: NextResponse): void {
  response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", getCookieOptions(0));
}
