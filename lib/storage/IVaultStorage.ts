import type { RoleLens, UserProfile } from "@/lib/maya/types";

export interface IVaultStorage {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  getLens(role: string): Promise<RoleLens | null>;
  saveLens(lens: RoleLens): Promise<void>;
  clear(): Promise<void>;
}
