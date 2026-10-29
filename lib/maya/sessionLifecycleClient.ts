"use client";

import {
  MAYA_SESSION_INACTIVITY_MS,
  type MayaPocketOfficeSession,
} from "./sessionLifecycle";

type SessionInput = Omit<
  MayaPocketOfficeSession,
  "status" | "lastActivityAt" | "closedAt" | "closeout"
>;

type TimerRecord = {
  timer: ReturnType<typeof setTimeout>;
  snapshot: SessionInput;
};

const timers = new Map<string, TimerRecord>();

async function send(
  snapshot: SessionInput,
  action: "checkpoint" | "close",
): Promise<MayaPocketOfficeSession | null> {
  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      keepalive: action === "close",
      body: JSON.stringify({ action, session: snapshot }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      session?: MayaPocketOfficeSession;
    };
    return payload.session ?? null;
  } catch {
    return null;
  }
}

export function checkpointPocketOfficeSession(snapshot: SessionInput): void {
  const existing = timers.get(snapshot.id);
  if (existing) clearTimeout(existing.timer);

  void send(snapshot, "checkpoint");

  const timer = setTimeout(() => {
    timers.delete(snapshot.id);
    void send(snapshot, "close");
  }, MAYA_SESSION_INACTIVITY_MS);

  timers.set(snapshot.id, { timer, snapshot });
}

export function closePocketOfficeSession(sessionId: string): void {
  const existing = timers.get(sessionId);
  if (!existing) return;
  clearTimeout(existing.timer);
  timers.delete(sessionId);
  void send(existing.snapshot, "close");
}

export async function recoverPocketOfficeSession(
  clientVaultId: string,
  role: MayaPocketOfficeSession["role"],
): Promise<MayaPocketOfficeSession | null> {
  try {
    const params = new URLSearchParams({ clientVaultId, role, limit: "1" });
    const response = await fetch(`/api/sessions?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      sessions?: MayaPocketOfficeSession[];
    };
    return payload.sessions?.[0] ?? null;
  } catch {
    return null;
  }
}
