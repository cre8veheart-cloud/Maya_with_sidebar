import type { ExecRole, RoleLens, RoleOverride } from "./types";
import { createFreshLens } from "./execLens";

const STORAGE_KEY = "maya_lens_overrides";

type StoredOverrides = Partial<Record<ExecRole, RoleOverride[]>>;

function getStoredOverrides(): StoredOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOverrides) : {};
  } catch {
    return {};
  }
}

/**
 * Loads the persistent lens for a role from localStorage.
 * Returns a fresh lens (no overrides) if nothing has been stored yet.
 */
export function loadLens(role: ExecRole): RoleLens {
  const stored = getStoredOverrides();
  return { role, overrides: stored[role] ?? [] };
}

/**
 * Persists the full lens (overrides) for a role to localStorage.
 */
export function saveLens(lens: RoleLens): void {
  if (typeof window === "undefined") return;
  try {
    const stored = getStoredOverrides();
    stored[lens.role] = lens.overrides;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // storage unavailable — silent fail
  }
}

/**
 * Adds or updates a single override entry for a role, then persists.
 * Returns the updated lens.
 */
export function addOverride(
  role: ExecRole,
  key: string,
  value: string
): RoleLens {
  const lens = loadLens(role);
  const existing = lens.overrides.findIndex((o) => o.key === key);
  if (existing >= 0) {
    lens.overrides[existing] = { key, value };
  } else {
    lens.overrides.push({ key, value });
  }
  saveLens(lens);
  return lens;
}

/**
 * Clears all trained overrides for a role, restoring it to baseline.
 */
export function clearLens(role: ExecRole): RoleLens {
  const fresh = createFreshLens(role);
  saveLens(fresh);
  return fresh;
}
