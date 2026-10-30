import type { GitHubRepoConfig, GitHubSession, GitHubUser } from "./types";
import {
  isRepoAllowed,
  sanitizeBranch,
  sanitizeFilePath,
  sanitizeOwner,
  sanitizeRepo,
  sanitizeText,
} from "./config";

const GITHUB_API_ROOT = "https://api.github.com";

export class GitHubApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function parseGitHubError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { message?: string };
    return payload.message || `GitHub request failed with status ${response.status}`;
  }
  return (await response.text()) || `GitHub request failed with status ${response.status}`;
}

export async function githubRequest<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${GITHUB_API_ROOT}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: ["Bearer", accessToken].join(" "),
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GitHubApiError(response.status, await parseGitHubError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function fetchGitHubViewer(accessToken: string): Promise<GitHubUser> {
  const viewer = await githubRequest<{
    login: string;
    id: number;
    avatar_url?: string;
    name?: string;
    email?: string;
  }>(accessToken, "/user");

  return {
    login: viewer.login,
    id: viewer.id,
    avatarUrl: viewer.avatar_url ?? "",
    name: viewer.name ?? "",
    email: viewer.email ?? "",
  };
}

export function resolveRepoConfig(
  session: GitHubSession,
  raw?: Partial<GitHubRepoConfig> | null
): GitHubRepoConfig {
  const owner = sanitizeOwner(raw?.owner) || session.repoConfig?.owner || "";
  const repo = sanitizeRepo(raw?.repo) || session.repoConfig?.repo || "";
  const branch =
    sanitizeBranch(raw?.branch) || session.repoConfig?.branch || "main";

  const config = { owner, repo, branch };
  if (!config.owner || !config.repo) {
    throw new Error("Repository is not configured");
  }
  if (!isRepoAllowed(config)) {
    throw new Error("Selected repository is not allowed");
  }
  return config;
}

export async function listGitHubRepos(session: GitHubSession) {
  return githubRequest<
    Array<{
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      default_branch: string;
    }>
  >(
    session.accessToken,
    "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member"
  );
}

export async function getRepoSummary(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig
) {
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}`
  );
}

export async function listBranches(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig
) {
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/branches?per_page=100`
  );
}

export async function getRepoContents(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  path: string
) {
  const safePath = sanitizeFilePath(path);
  const suffix = safePath ? `/${encodePath(safePath)}` : "";
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/contents${suffix}?ref=${encodeURIComponent(repoConfig.branch)}`
  );
}

export async function listPullRequests(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  state: string
) {
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/pulls?state=${encodeURIComponent(state)}&per_page=50`
  );
}

export async function listIssues(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  state: string
) {
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/issues?state=${encodeURIComponent(state)}&per_page=50`
  );
}

export async function listWorkflows(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig
) {
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/actions/workflows?per_page=100`
  );
}

export async function listWorkflowRuns(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  workflowId?: string
) {
  const workflowSuffix = workflowId
    ? `/workflows/${encodeURIComponent(workflowId)}/runs`
    : "/runs";
  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/actions${workflowSuffix}?per_page=50`
  );
}

export async function createBranch(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  sourceBranch: string,
  newBranch: string
) {
  const baseBranch = sanitizeBranch(sourceBranch) || repoConfig.branch;
  const targetBranch = sanitizeBranch(newBranch);
  if (!targetBranch) {
    throw new Error("Invalid new branch name");
  }

  const ref = await githubRequest<{ object?: { sha?: string } }>(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/git/ref/heads/${encodeURIComponent(baseBranch)}`
  );

  const sha = ref.object?.sha;
  if (!sha) {
    throw new Error("Unable to resolve source branch");
  }

  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/git/refs`,
    {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${targetBranch}`,
        sha,
      }),
    }
  );
}

export async function upsertFile(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  input: {
    branch?: string;
    path: string;
    content: string;
    message: string;
    sha?: string;
  }
) {
  const path = sanitizeFilePath(input.path);
  const message = sanitizeText(input.message, 200);
  const branch = sanitizeBranch(input.branch) || repoConfig.branch;

  if (!path) throw new Error("Invalid file path");
  if (!message) throw new Error("Commit message is required");
  if (input.content.length > 200_000) {
    throw new Error("File content is too large");
  }

  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/contents/${encodePath(path)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: Buffer.from(input.content, "utf8").toString("base64"),
        branch,
        ...(input.sha ? { sha: sanitizeText(input.sha, 200) } : {}),
      }),
    }
  );
}

export async function createPullRequest(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  input: {
    title: string;
    body: string;
    head: string;
    base?: string;
  }
) {
  const title = sanitizeText(input.title, 200);
  const body = input.body.slice(0, 20_000);
  const head = sanitizeBranch(input.head);
  const base = sanitizeBranch(input.base) || repoConfig.branch;

  if (!title || !head) {
    throw new Error("Pull request title and head branch are required");
  }

  return githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/pulls`,
    {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    }
  );
}

export async function dispatchWorkflow(
  session: GitHubSession,
  repoConfig: GitHubRepoConfig,
  input: {
    workflowId: string;
    ref?: string;
    inputs?: Record<string, string>;
  }
) {
  const workflowId = sanitizeText(input.workflowId, 200);
  const ref = sanitizeBranch(input.ref) || repoConfig.branch;
  if (!workflowId) {
    throw new Error("Workflow ID or file name is required");
  }

  await githubRequest(
    session.accessToken,
    `/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({
        ref,
        inputs: input.inputs ?? {},
      }),
    }
  );

  return { dispatched: true, workflowId, ref };
}
