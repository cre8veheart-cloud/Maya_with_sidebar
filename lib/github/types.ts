export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatarUrl: string;
  name: string;
  email: string;
}

export interface GitHubSession {
  id: string;
  accessToken: string;
  scope: string[];
  user: GitHubUser | null;
  repoConfig: GitHubRepoConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubAuditEntry {
  id: string;
  sessionId: string;
  kind: "auth" | "read" | "write" | "workflow";
  action: string;
  target: string;
  status: "success" | "denied" | "error";
  detail: string;
  createdAt: string;
}

export interface GitHubPermissions {
  read: boolean;
  write: boolean;
  workflow: boolean;
}
