import type { ExecRole, MayaMessage } from "./types";
import type {
  MayaSessionCloseout,
  MayaSessionStatus,
} from "./sessionLifecycle";
import {
  type HardenedIntelRecord,
  listHardenedIntelRecords,
} from "./hardenedIntel";

export interface MayaSavedFile {
  id: string;
  name: string;
  category: "Briefs" | "Reports" | "Decks" | "SOPs" | "Other";
  updatedAt: string;
  sizeLabel: string;
  summary: string;
}

export interface MayaSessionRecord {
  id: string;
  role: ExecRole | "strategy-room";
  title: string;
  query: string;
  answer: string;
  savedAt: string;
  sourceCount: number;
  transcript?: MayaMessage[];
  estimatedPromptTokens?: number;
  estimatedCompletionTokens?: number;
  estimatedFeeUsd?: number;
  clientVaultId?: string;
  status?: MayaSessionStatus;
  closeout?: MayaSessionCloseout | null;
}

export interface MayaVaultClip {
  id: string;
  vault: "knowledge" | "decisions";
  title: string;
  content: string;
  createdAt: string;
  sessionId?: string;
  query?: string;
  category?: string;
  actionableSteps?: string;
  status?: "pending" | "kept" | "trashed";
  sourceRole?: ExecRole | "strategy-room";
  assignedRoles?: ExecRole[];
  vendorName?: string;
  vendorUrl?: string;
  clippedBy?: ExecRole | "strategy-room";
  clipComment?: string;
}

export interface MayaWorkItem {
  id: string;
  title: string;
  summary: string;
  type: "email" | "task" | "decision" | "meeting" | "clip";
  sourceRole: ExecRole | "strategy-room";
  targetRoles: ExecRole[];
  createdAt: string;
  sessionId?: string;
  clipId?: string;
  vendorName?: string;
  vendorUrl?: string;
  status: "pending" | "approved" | "dismissed";
  clippedBy?: ExecRole | "strategy-room";
  clipComment?: string;
}

const SESSION_STORAGE_KEY = "maya_saved_sessions_v1";
const CLIP_STORAGE_KEY = "maya_saved_clips_v1";
const WORK_ITEM_STORAGE_KEY = "maya_saved_work_items_v1";

const SEED_SAVED_FILES: MayaSavedFile[] = [
  {
    id: "file-board-brief",
    name: "Q3 Board Narrative Brief",
    category: "Briefs",
    updatedAt: "2026-08-14",
    sizeLabel: "248 KB",
    summary: "CEO board brief tying strategic bets, capital allocation, and risk posture into one review narrative.",
  },
  {
    id: "file-ops-review",
    name: "Executive Operating Cadence",
    category: "SOPs",
    updatedAt: "2026-08-12",
    sizeLabel: "91 KB",
    summary: "Defines weekly executive review cadence, owner expectations, and decision escalation rules.",
  },
  {
    id: "file-growth-model",
    name: "Growth Investment Payback Model",
    category: "Reports",
    updatedAt: "2026-08-11",
    sizeLabel: "512 KB",
    summary: "Working model for evaluating new spend against revenue leverage, retention protection, and capability unlocks.",
  },
];

const SEED_SESSIONS: MayaSessionRecord[] = [
  {
    id: "seed-session-ceo-1",
    role: "ceo",
    title: "Board narrative evidence pull",
    query: "What internal evidence should shape the next board narrative?",
    answer:
      "MAYA should anchor the board narrative in the weekly decision cadence, capital allocation rules, and cross-functional drift watchpoints.",
    savedAt: "2026-08-16 09:15",
    sourceCount: 3,
  },
  {
    id: "seed-session-strategy-1",
    role: "strategy-room",
    title: "Execution bottleneck review",
    query: "Where are handoffs most likely breaking momentum?",
    answer:
      "Handoffs between strategy, finance, and delivery are the first place MAYA expects drift when ownership or sequencing is unclear.",
    savedAt: "2026-08-15 18:40",
    sourceCount: 2,
  },
];

export function listHardenedKnowledgeRecords(): HardenedIntelRecord[] {
  return listHardenedIntelRecords().filter((record) => record.source === "knowledge");
}

export function listHardenedDecisionRecords(): HardenedIntelRecord[] {
  return listHardenedIntelRecords().filter((record) => record.source === "decisions");
}

export function listHardenedIntelVaultRecords(): HardenedIntelRecord[] {
  return listHardenedIntelRecords().filter((record) => record.source === "intel");
}

export function listSavedFiles(): MayaSavedFile[] {
  return SEED_SAVED_FILES;
}

export function loadSavedSessions(): MayaSessionRecord[] {
  if (typeof window === "undefined") return SEED_SESSIONS;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return SEED_SESSIONS;
    const parsed = JSON.parse(raw) as MayaSessionRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SESSIONS;
  } catch {
    return SEED_SESSIONS;
  }
}

export function saveSessionRecord(session: MayaSessionRecord): MayaSessionRecord[] {
  const existing = loadSavedSessions();
  const next = [session, ...existing.filter((item) => item.id !== session.id)].slice(0, 30);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadVaultClips(
  vault?: MayaVaultClip["vault"]
): MayaVaultClip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLIP_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as MayaVaultClip[]) : [];
    if (!Array.isArray(parsed)) return [];
    return vault ? parsed.filter((clip) => clip.vault === vault) : parsed;
  } catch {
    return [];
  }
}

export function saveVaultClip(clip: MayaVaultClip): MayaVaultClip[] {
  const existing = loadVaultClips();
  const next = [clip, ...existing.filter((item) => item.id !== clip.id)].slice(0, 50);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLIP_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function updateVaultClipStatus(
  id: string,
  status: NonNullable<MayaVaultClip["status"]>
): MayaVaultClip[] {
  const existing = loadVaultClips();
  const next = existing.map((clip) =>
    clip.id === id ? { ...clip, status } : clip
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLIP_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadWorkItems(): MayaWorkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WORK_ITEM_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as MayaWorkItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkItem(item: MayaWorkItem): MayaWorkItem[] {
  const existing = loadWorkItems();
  const next = [item, ...existing.filter((workItem) => workItem.id !== item.id)].slice(0, 100);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(WORK_ITEM_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}
