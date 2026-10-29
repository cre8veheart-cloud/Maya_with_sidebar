// Cloud storage adapter — reads/writes via MAYA API routes backed by Vercel KV.
import type { IVaultStorage } from "./IVaultStorage";
import type { RoleLens, UserProfile } from "@/lib/maya/types";

async function api<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: body !== undefined ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

export class CloudStorageAdapter implements IVaultStorage {
  async getProfile(): Promise<UserProfile | null> {
    const data = await api<{ profile: UserProfile | null }>("/api/user/profile");
    return data?.profile ?? null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await api("/api/user/profile", { profile });
  }

  async getLens(role: string): Promise<RoleLens | null> {
    const data = await api<{ lens: RoleLens | null }>(`/api/user/lens?role=${role}`);
    return data?.lens ?? null;
  }

  async saveLens(lens: RoleLens): Promise<void> {
    await api("/api/user/lens", { lens });
  }

  async clear(): Promise<void> {
    await api("/api/user/profile", { clear: true });
  }
}
