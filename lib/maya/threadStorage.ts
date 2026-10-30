import type { ExecRole, MayaMessage } from "./types";

const STORAGE_PREFIX = "maya_exec_thread_v1";
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 8000;

function storageKey(role: ExecRole): string {
  return `${STORAGE_PREFIX}:${role}`;
}

function isMayaMessage(value: unknown): value is MayaMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function normalizeMessages(value: unknown): MayaMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isMayaMessage)
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_MESSAGE_LENGTH),
    }));
}

/**
 * Restores the most recent executive thread for this browser.
 *
 * This is intentionally device-local until MAYA has authenticated tenant
 * identity. Cloud persistence without tenant isolation could mix beta-user
 * executive data and is therefore not permitted.
 */
export function loadRoleThread(role: ExecRole): MayaMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(role));
    return raw ? normalizeMessages(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

/** Persist a bounded, role-isolated executive thread on this device. */
export function saveRoleThread(
  role: ExecRole,
  messages: MayaMessage[]
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(role),
      JSON.stringify(normalizeMessages(messages))
    );
  } catch {
    // Storage may be unavailable in private browsing or constrained devices.
  }
}

/** Remove only the selected role's thread; other executive memory is retained. */
export function clearRoleThread(role: ExecRole): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(role));
  } catch {
    // Storage unavailable — the in-memory thread is still cleared by caller.
  }
}
