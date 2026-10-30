import type { IVaultStorage } from "./IVaultStorage";
import type { RoleLens, UserProfile } from "@/lib/maya/types";

const KEYS = {
  profile: "maya_profile",
  lens: (role: string) => `maya_lens_${role}`,
};

export class LocalStorageAdapter implements IVaultStorage {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const raw = localStorage.getItem(KEYS.profile);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch { return null; }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  }

  async getLens(role: string): Promise<RoleLens | null> {
    try {
      const raw = localStorage.getItem(KEYS.lens(role));
      return raw ? (JSON.parse(raw) as RoleLens) : null;
    } catch { return null; }
  }

  async saveLens(lens: RoleLens): Promise<void> {
    localStorage.setItem(KEYS.lens(lens.role), JSON.stringify(lens));
  }

  async clear(): Promise<void> {
    Object.values(KEYS).forEach((k) => {
      if (typeof k === "string") localStorage.removeItem(k);
    });
  }
}
