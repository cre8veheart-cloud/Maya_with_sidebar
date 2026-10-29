import type { GitHubPermissions, GitHubRepoConfig } from "./types";

export const GITHUB_SESSION_COOKIE = "maya_github_session";
export const GITHUB_OAUTH_STATE_COOKIE = "maya_github_oauth_state";

// Standard GitHub OAuth access for MAYA engineering work. Runtime operations
// remain limited to repositories in GITHUB_ALLOWED_REPOS.
export const DEFAULT_GITHUB_SCOPES = ["read:user", "user:email", "repo", "workflow"];

function clean(raw: unknown, maxLen: number, pattern: RegExp): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim().slice(0, maxLen);
  return pattern.test(value) ? value : "";
}

export function sanitizeOwner(raw: unknown): string {
  return clean(raw, 100, /^[A-Za-z0-9_.-]+$/);
}

export function sanitizeRepo(raw: unknown): string {
  return clean(raw, 100, /^[A-Za-z0-9_.-]+$/);
}

export function sanitizeBranch(raw: unknown): string {
  return clean(raw, 200, /^[A-Za-z0-9/_\-.]+$/);
}

export function sanitizeFilePath(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim().replace(/^\/+/, "").slice(0, 300);
  if (!value || value.includes("..") || value.includes("\\")) return "";
  return value;
}

export function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[\x00-\x08\x0b-\x1f\x7f]/g, " ").trim();
}

export function sanitizeRepoConfig(raw: unknown): GitHubRepoConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const owner = sanitizeOwner(input.owner);
  const repo = sanitizeRepo(input.repo);
  const branch = sanitizeBranch(input.branch) || "main";
  if (!owner || !repo) return null;
  return { owner, repo, branch };
}

export function getRequestedScopes(): string[] {
  const raw = process.env.GITHUB_OAUTH_SCOPES?.trim();
  if (!raw) return DEFAULT_GITHUB_SCOPES;
  return raw.split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean);
}

export function getGitHubPermissions(scopes: string[]): GitHubPermissions {
  const normalized = new Set(scopes.map((scope) => scope.trim()).filter(Boolean));
  const repositoryAccess = normalized.has("repo") || normalized.has("public_repo");
  return {
    read:
      repositoryAccess ||
      normalized.has("read:user") ||
      normalized.has("user:email") ||
      normalized.has("read:org"),
    write: repositoryAccess,
    workflow: normalized.has("workflow"),
  };
}

export function getAllowedRepos(): string[] {
  const configured = (process.env.GITHUB_ALLOWED_REPOS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (configured.length > 0) return configured;

  const owner = sanitizeOwner(process.env.GITHUB_DEFAULT_OWNER);
  const repo = sanitizeRepo(process.env.GITHUB_DEFAULT_REPO);
  if (owner && repo) return [`${owner}/${repo}`.toLowerCase()];

  // A missing optional environment override must not turn a valid MAYA
  // connection into zero repository access. Keep the fallback explicit and
  // limited to the canonical repository.
  return ["cre8veheart-ai/maya_with_sidebar"];
}

export function isRepoAllowed(repoConfig: GitHubRepoConfig): boolean {
  const allowed = getAllowedRepos();
  // Fail closed. An absent allowlist is not permission to roam across every
  // repository visible to a connected account.
  if (allowed.length === 0) return false;
  return allowed.includes(`${repoConfig.owner}/${repoConfig.repo}`.toLowerCase());
}

export function getDefaultRepoConfig(): GitHubRepoConfig | null {
  const owner = sanitizeOwner(process.env.GITHUB_DEFAULT_OWNER);
  const repo = sanitizeRepo(process.env.GITHUB_DEFAULT_REPO);
  const branch = sanitizeBranch(process.env.GITHUB_DEFAULT_BRANCH) || "main";
  if (!owner || !repo) return null;
  return { owner, repo, branch };
}

export function getBaseUrl(origin: string): string {
  const configured = process.env.NEXTAUTH_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return origin.replace(/\/+$/, "");
}

export function getGitHubCallbackUrl(origin: string): string {
  const configured = process.env.GITHUB_OAUTH_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${getBaseUrl(origin)}/api/github/callback`;
}

export function getCookieOptions(maxAgeSeconds?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  };
}
