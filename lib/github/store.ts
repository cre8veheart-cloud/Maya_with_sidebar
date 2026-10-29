import { randomUUID } from "crypto";
import { kv } from "@vercel/kv";
import { getDefaultRepoConfig } from "./config";
import type { GitHubAuditEntry, GitHubSession, GitHubUser } from "./types";

const SESSION_PREFIX = "maya:github:session:";
const AUDIT_PREFIX = "maya:github:audit:";
const AUDIT_LIMIT = 50;
const HAS_KV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

type GitHubMemory = {
  sessions: Map<string, GitHubSession>;
  audit: Map<string, GitHubAuditEntry[]>;
};

const memoryStore = (() => {
  const globalStore = globalThis as typeof globalThis & {
    __mayaGitHubMemory__?: GitHubMemory;
  };

  if (!globalStore.__mayaGitHubMemory__) {
    globalStore.__mayaGitHubMemory__ = {
      sessions: new Map<string, GitHubSession>(),
      audit: new Map<string, GitHubAuditEntry[]>(),
    };
  }

  return globalStore.__mayaGitHubMemory__;
})();

function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

function auditKey(sessionId: string) {
  return `${AUDIT_PREFIX}${sessionId}`;
}

export async function createGitHubSession(input: {
  accessToken: string;
  scope: string[];
  user: GitHubUser | null;
}): Promise<GitHubSession> {
  const now = new Date().toISOString();
  const session: GitHubSession = {
    id: randomUUID(),
    accessToken: input.accessToken,
    scope: input.scope,
    user: input.user,
    repoConfig: getDefaultRepoConfig(),
    createdAt: now,
    updatedAt: now,
  };
  await saveGitHubSession(session);
  return session;
}

export async function getGitHubSession(
  sessionId: string
): Promise<GitHubSession | null> {
  if (!sessionId) return null;

  if (HAS_KV) {
    try {
      return (await kv.get<GitHubSession>(sessionKey(sessionId))) ?? null;
    } catch {
      return null;
    }
  }

  return memoryStore.sessions.get(sessionId) ?? null;
}

export async function saveGitHubSession(session: GitHubSession): Promise<void> {
  const next = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  if (HAS_KV) {
    await kv.set(sessionKey(next.id), next);
    return;
  }

  memoryStore.sessions.set(next.id, next);
}

export async function deleteGitHubSession(sessionId: string): Promise<void> {
  if (!sessionId) return;

  if (HAS_KV) {
    await kv.del(sessionKey(sessionId));
    await kv.del(auditKey(sessionId));
    return;
  }

  memoryStore.sessions.delete(sessionId);
  memoryStore.audit.delete(sessionId);
}

export async function logGitHubAudit(
  sessionId: string,
  entry: Omit<GitHubAuditEntry, "id" | "sessionId" | "createdAt">
): Promise<void> {
  if (!sessionId) return;

  const fullEntry: GitHubAuditEntry = {
    id: randomUUID(),
    sessionId,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  if (HAS_KV) {
    const existing = (await kv.get<GitHubAuditEntry[]>(auditKey(sessionId))) ?? [];
    await kv.set(auditKey(sessionId), [fullEntry, ...existing].slice(0, AUDIT_LIMIT));
    return;
  }

  const existing = memoryStore.audit.get(sessionId) ?? [];
  memoryStore.audit.set(sessionId, [fullEntry, ...existing].slice(0, AUDIT_LIMIT));
}

export async function listGitHubAudit(
  sessionId: string,
  limit = 20
): Promise<GitHubAuditEntry[]> {
  if (!sessionId) return [];

  if (HAS_KV) {
    const entries = (await kv.get<GitHubAuditEntry[]>(auditKey(sessionId))) ?? [];
    return entries.slice(0, limit);
  }

  return (memoryStore.audit.get(sessionId) ?? []).slice(0, limit);
}
