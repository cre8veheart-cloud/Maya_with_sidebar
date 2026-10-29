"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ProviderControls from "@/components/ProviderControls";
import { getRoleHref, getRoleLabel, isExecRole } from "@/lib/maya/execRouting";
import {
  loadSavedSessions,
  loadVaultClips,
  loadWorkItems,
  saveSessionRecord,
  saveVaultClip,
  saveWorkItem,
  type MayaSessionRecord,
  type MayaVaultClip,
  type MayaWorkItem,
} from "@/lib/maya/libraryData";
import { loadLens } from "@/lib/maya/lensStorage";
import {
  getProviderModel,
  loadProviderSettings,
  saveProviderSettings,
} from "@/lib/maya/providerStorage";
import type {
  ExecRole,
  MayaMessage,
  MayaProvider,
  ProviderSettings,
} from "@/lib/maya/types";

interface IntelSource {
  id: string;
  source: "decisions" | "knowledge" | "intel";
  title: string;
  summary: string;
  content: string;
  updatedAt: string;
  confidence: "high" | "medium";
  tags: string[];
}

type WorkspaceSection = "recommendations" | "clips" | "actions" | "report";

const QUICK_QUERIES = [
  "What does MAYA think I should focus on this week as CEO?",
  "Where is cross-functional drift most likely to hurt execution right now?",
  "What internal evidence should shape the next board narrative?",
];

const DECISION_CATEGORIES = [
  "Strategy",
  "Finance",
  "Execution",
  "Org",
  "Risk",
  "Board",
  "Other",
];

const VAULT_LINKS = [
  { href: "/library/intel", label: "Intel Vault" },
  { href: "/decisions", label: "Decision Vault" },
  { href: "/library/knowledge", label: "Knowledge Vault" },
  { href: "/library/sessions", label: "Sessions" },
  { href: "/tasks", label: "Action Items" },
];

const SECTION_MENU: Array<{ id: WorkspaceSection; label: string }> = [
  { id: "recommendations", label: "Recommendations" },
  { id: "clips", label: "Clips" },
  { id: "actions", label: "Action Items" },
  { id: "report", label: "Full Session Review" },
];

const DEEP_THINK_ROLES: ExecRole[] = [
  "ceo",
  "coo",
  "cmo",
  "cfo",
  "cto",
  "cio",
  "cro",
  "cd",
  "admin",
  "hr",
  "legal",
];

const SAFE_EXEC_LINKS: Record<ExecRole, { href: string; label: string }> = {
  ceo: { href: "/ceo", label: "CEO" },
  coo: { href: "/coo", label: "COO" },
  cmo: { href: "/cmo", label: "CMO" },
  cfo: { href: "/cfo", label: "CFO" },
  cto: { href: "/cto", label: "CTO" },
  cio: { href: "/cio", label: "CIO" },
  cro: { href: "/cro", label: "CRO" },
  cd: { href: "/cd", label: "CD" },
  admin: { href: "/office-admin", label: "Office Admin" },
  hr: { href: "/hr", label: "HR" },
  legal: { href: "/legal", label: "Legal" },
};

const SOURCE_META: Record<IntelSource["source"], { label: string; accent: string }> = {
  decisions: { label: "Decisions", accent: "text-[#a6e3a1]" },
  knowledge: { label: "Knowledge", accent: "text-[#89b4fa]" },
  intel: { label: "Intel", accent: "text-[#f9e2af]" },
};

const PROVIDER_RATES: Record<MayaProvider, { inputPerToken: number; outputPerToken: number }> = {
  anthropic: {
    inputPerToken: 3 / 1_000_000,
    outputPerToken: 15 / 1_000_000,
  },
  openclaw: {
    inputPerToken: 1 / 1_000_000,
    outputPerToken: 4 / 1_000_000,
  },
  openai: {
    inputPerToken: 0.15 / 1_000_000,
    outputPerToken: 0.6 / 1_000_000,
  },
};

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

function truncate(text: string, maxLength = 180) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function firstUsefulText(values: Array<string | undefined>) {
  return values.map((value) => value?.trim() || "").find((value) => value.length > 0) || "";
}

function parseActionLines(text: string | undefined) {
  if (!text) return [];
  const bulletLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line))
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, ""));

  if (bulletLines.length > 0) {
    return bulletLines;
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function clipMatchesRole(clip: MayaVaultClip, role: ExecRole) {
  return clip.sourceRole === role || clip.clippedBy === role || clip.assignedRoles?.includes(role) === true;
}

function itemMatchesRole(item: MayaWorkItem, role: ExecRole) {
  return item.sourceRole === role || item.targetRoles.includes(role);
}

function buildRoleRecommendation(
  role: ExecRole,
  session: MayaSessionRecord | null,
  clips: MayaVaultClip[],
  items: MayaWorkItem[]
) {
  if (!session) {
    return `Open ${getRoleLabel(role)} to run a standalone deep-think pass.`;
  }

  if (role === "ceo") {
    return session.answer;
  }

  const relevantClips = clips.filter((clip) => clipMatchesRole(clip, role));
  const relevantItems = items.filter((item) => itemMatchesRole(item, role));
  const derived = firstUsefulText([
    relevantItems[0]?.summary,
    relevantItems[0]?.clipComment,
    relevantClips[0]?.clipComment,
    relevantClips[0]?.actionableSteps,
    relevantClips[0]?.content,
  ]);

  return (
    derived ||
    `Send this CEO session into ${getRoleLabel(role)} for an autonomous deep-think pass without merging it into another executive view.`
  );
}

export default function CeoIntelConsole() {
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    provider: "anthropic",
    anthropicModel: "",
    openClawModel: "",
    openAiModel: "",
    ludicrousMode: false,
  });
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(
    "MAYA CEO hardened intel is ready. Ask for a recommendation, board view, risk readout, or execution synthesis."
  );
  const [sources, setSources] = useState<IntelSource[]>([]);
  const [mode, setMode] = useState<"provider-synthesis" | "fallback-synthesis" | null>(null);
  const [latestSessionId, setLatestSessionId] = useState("");
  const [clipDraft, setClipDraft] = useState("");
  const [decisionCategory, setDecisionCategory] = useState("Strategy");
  const [actionableSteps, setActionableSteps] = useState("");
  const [clipStatus, setClipStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<MayaSessionRecord[]>([]);
  const [savedClips, setSavedClips] = useState<MayaVaultClip[]>([]);
  const [savedItems, setSavedItems] = useState<MayaWorkItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedLenses, setSelectedLenses] = useState<ExecRole[]>(DEEP_THINK_ROLES);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("recommendations");
  const lens = useMemo(() => loadLens("ceo"), []);

  useEffect(() => {
    setProviderSettings(loadProviderSettings());
    refreshWorkspaceData();
  }, []);

  function refreshWorkspaceData(nextSelectedId?: string) {
    const nextSessions = loadSavedSessions().filter((session) => session.role === "ceo");
    const nextClips = loadVaultClips();
    const nextItems = loadWorkItems();

    setSavedSessions(nextSessions);
    setSavedClips(nextClips);
    setSavedItems(nextItems);
    setSelectedSessionId((current) => nextSelectedId || current || nextSessions[0]?.id || "");
  }

  function updateProviderSettings(next: ProviderSettings) {
    setProviderSettings(next);
    saveProviderSettings(next);
  }

  const selectedSession =
    savedSessions.find((session) => session.id === selectedSessionId) ??
    savedSessions.find((session) => session.id === latestSessionId) ??
    savedSessions[0] ??
    null;

  const sessionClips = useMemo(() => {
    if (!selectedSession) return [];
    return savedClips.filter((clip) => clip.sessionId === selectedSession.id);
  }, [savedClips, selectedSession]);

  const sessionItems = useMemo(() => {
    if (!selectedSession) return [];
    return savedItems.filter((item) => item.sessionId === selectedSession.id);
  }, [savedItems, selectedSession]);

  const derivedActionItems = useMemo(() => {
    const clippedSteps = sessionClips.flatMap((clip) => parseActionLines(clip.actionableSteps));
    const fallbackSteps = selectedSession ? parseActionLines(selectedSession.answer) : [];
    return Array.from(new Set([...clippedSteps, ...fallbackSteps])).slice(0, 8);
  }, [selectedSession, sessionClips]);

  const recommendationCards = useMemo(
    () =>
      selectedLenses.map((role) => ({
        role,
        recommendation: buildRoleRecommendation(role, selectedSession, sessionClips, sessionItems),
        clipCount: sessionClips.filter((clip) => clipMatchesRole(clip, role)).length,
        itemCount: sessionItems.filter((item) => itemMatchesRole(item, role)).length,
      })),
    [selectedLenses, selectedSession, sessionClips, sessionItems]
  );

  async function runQuery(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setQuery(trimmed);

    try {
      const res = await fetch("/api/ceo-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          lens,
          provider: providerSettings.provider,
          model: getProviderModel(providerSettings),
          ludicrousMode: providerSettings.ludicrousMode,
        }),
      });

      const payload = (await res.json()) as {
        answer?: string;
        error?: string;
        mode?: "provider-synthesis" | "fallback-synthesis";
        sources?: IntelSource[];
      };

      if (!res.ok) {
        throw new Error(payload.error || "CEO intel request failed");
      }

      const nextAnswer = payload.answer || "No MAYA synthesis returned.";
      const nextSources = Array.isArray(payload.sources) ? payload.sources : [];
      const sessionId = `${Date.now()}`;
      const transcript: MayaMessage[] = [
        { role: "user", content: trimmed },
        { role: "assistant", content: nextAnswer },
      ];
      const promptTokens = estimateTokens(transcript.map((message) => message.content).join("\n"));
      const completionTokens = estimateTokens(nextAnswer);
      const rate = PROVIDER_RATES[providerSettings.provider];
      const estimatedFeeUsd =
        promptTokens * rate.inputPerToken + completionTokens * rate.outputPerToken;

      setAnswer(nextAnswer);
      setSources(nextSources);
      setMode(payload.mode || null);
      setLatestSessionId(sessionId);
      setSelectedSessionId(sessionId);
      setClipDraft(nextAnswer);
      setActionableSteps(
        nextAnswer
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(-4)
          .join("\n")
      );
      setClipStatus("");

      saveSessionRecord({
        id: sessionId,
        role: "ceo",
        title: trimmed,
        query: trimmed,
        answer: nextAnswer,
        savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        sourceCount: nextSources.length,
        transcript,
        estimatedPromptTokens: promptTokens,
        estimatedCompletionTokens: completionTokens,
        estimatedFeeUsd: Number(estimatedFeeUsd.toFixed(4)),
      });

      refreshWorkspaceData(sessionId);
    } catch (error) {
      setAnswer(
        error instanceof Error
          ? error.message
          : "CEO intel request failed."
      );
      setSources([]);
      setMode("fallback-synthesis");
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void runQuery(query);
  }

  function toggleLens(role: ExecRole) {
    setSelectedLenses((current) => {
      if (current.includes(role)) {
        return current.length === 1 ? current : current.filter((item) => item !== role);
      }
      return [...current, role];
    });
  }

  function saveClip(vault: "knowledge" | "decisions") {
    const content = clipDraft.trim();
    if (!content) return;

    const clipId = `${Date.now()}-${vault}`;
    const createdAt = new Date().toISOString().slice(0, 16).replace("T", " ");

    saveVaultClip({
      id: clipId,
      vault,
      title:
        vault === "decisions"
          ? `CEO consultation · ${query.trim() || "untitled"}`
          : query.trim() || "CEO clipped note",
      content,
      createdAt,
      sessionId: latestSessionId || selectedSession?.id || undefined,
      query: query.trim() || selectedSession?.query || undefined,
      category: vault === "decisions" ? decisionCategory : undefined,
      actionableSteps:
        vault === "decisions" ? actionableSteps.trim() || undefined : undefined,
      status: vault === "decisions" ? "pending" : undefined,
      sourceRole: "ceo",
      assignedRoles: selectedLenses,
      clippedBy: "ceo",
      clipComment: `Deep-think lenses active: ${selectedLenses.map((role) => getRoleLabel(role)).join(", ")}`,
    });

    if (vault === "decisions") {
      const summary = actionableSteps.trim() || truncate(content, 220);
      selectedLenses.forEach((role, index) => {
        saveWorkItem({
          id: `${clipId}-${role}-${index}`,
          title: `CEO deep-think follow-up · ${getRoleLabel(role)}`,
          summary,
          type: "decision",
          sourceRole: "ceo",
          targetRoles: [role],
          createdAt,
          sessionId: latestSessionId || selectedSession?.id || undefined,
          clipId,
          status: "approved",
          clippedBy: "ceo",
          clipComment: `Generated from CEO consultation note for ${getRoleLabel(role)}.`,
        });
      });
    }

    setClipStatus(
      vault === "knowledge"
        ? "Saved clipped discussion to Knowledge Vault."
        : "Saved consultation and routed deep-think action items."
    );
    refreshWorkspaceData(latestSessionId || selectedSession?.id);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#313244] bg-[#1e1e2e] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#313244] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                MAYA · CEO agentic deep-think
              </span>
            </div>
            <p className="text-[13px] text-[#a6adc8] mt-2">
              One CEO landing page with one chat surface above autonomous executive deep-think tiles.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <span className="text-[11px] text-[#89b4fa] uppercase tracking-[0.07em]">
              Intel-first
            </span>
            <span className="text-[11px] text-[#a6adc8] uppercase tracking-[0.07em]">
              {providerSettings.provider === "anthropic" ? "Claude" : "OpenClaw"}
            </span>
            {mode && (
              <span className="text-[11px] text-[#f9e2af] uppercase tracking-[0.07em]">
                {mode === "provider-synthesis" ? "Synthesized" : "Fallback"}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-[#313244]">
          <ProviderControls
            settings={providerSettings}
            onChange={updateProviderSettings}
            compact
          />
        </div>

        <div className="px-5 py-4 border-b border-[#313244]">
          <form onSubmit={submit} className="space-y-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask MAYA to run a CEO deep-think pass..."
              rows={3}
              className="w-full bg-[#313244] border border-[#45475a] rounded-xl px-4 py-3 text-[13px] text-[#cdd6f4] placeholder-[#585b70] resize-none focus:outline-none focus:border-[#89b4fa] transition-colors"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_QUERIES.map((quickQuery) => (
                  <button
                    key={quickQuery}
                    type="button"
                    onClick={() => void runQuery(quickQuery)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-[#cdd6f4] transition-colors"
                  >
                    {quickQuery}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-4 py-2.5 bg-[#89b4fa] text-[#1e1e2e] rounded-xl text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b4d0fb] transition-colors"
              >
                {loading ? "Thinking…" : "Run CEO deep-think"}
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div className="space-y-5">
            <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                  CEO recommendation
                </p>
                {selectedSession && (
                  <Link
                    href={`/library/sessions?session=${encodeURIComponent(selectedSession.id)}`}
                    className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                  >
                    Open saved session
                  </Link>
                )}
              </div>
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap text-[#cdd6f4]">
                {loading ? "Pulling from MAYA hardened intel layer…" : answer}
              </div>
            </div>

            {!loading && answer && (
              <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                    Save consultation note
                  </p>
                  {clipStatus && <span className="text-[11px] text-[#a6e3a1]">{clipStatus}</span>}
                </div>

                <textarea
                  value={clipDraft}
                  onChange={(e) => setClipDraft(e.target.value)}
                  rows={5}
                  className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#89b4fa] transition-colors"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <label className="block">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
                      Consultation category
                    </span>
                    <select
                      value={decisionCategory}
                      onChange={(e) => setDecisionCategory(e.target.value)}
                      className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
                    >
                      {DECISION_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
                      Recommended next steps
                    </span>
                    <textarea
                      value={actionableSteps}
                      onChange={(e) => setActionableSteps(e.target.value)}
                      rows={4}
                      className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => saveClip("knowledge")}
                    className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#89b4fa] text-[11px] font-semibold hover:bg-[#45475a] transition-colors"
                  >
                    Save to Knowledge Vault
                  </button>
                  <button
                    type="button"
                    onClick={() => saveClip("decisions")}
                    className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#a6e3a1] text-[11px] font-semibold hover:bg-[#45475a] transition-colors"
                  >
                    Save and route deep-think actions
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                    Section menu
                  </p>
                  <p className="text-[12px] text-[#585b70] mt-1">
                    Jump straight to the CEO report layers.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_MENU.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={[
                      "rounded-lg border px-3 py-2 text-left transition-colors",
                      activeSection === section.id
                        ? "border-[#89b4fa]/50 bg-[#181825] text-[#89b4fa]"
                        : "border-[#313244] bg-[#181825] text-[#a6adc8] hover:text-[#cdd6f4]",
                    ].join(" ")}
                  >
                    <span className="block text-[11px] font-semibold">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                    Retrieved internal sources
                  </p>
                  <p className="text-[12px] text-[#585b70] mt-1">
                    MAYA grounds the CEO readout in internal evidence before synthesis.
                  </p>
                </div>
                <span className="text-[11px] text-[#89b4fa]">
                  {sources.length} source{sources.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {sources.length === 0 ? (
                  <p className="text-[12px] text-[#585b70]">
                    Run a CEO query to inspect the hardened evidence MAYA used.
                  </p>
                ) : (
                  sources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-lg border border-[#313244] bg-[#181825] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold text-[#cdd6f4]">
                            {source.title}
                          </p>
                          <p className="text-[11px] text-[#585b70] mt-1">
                            {source.summary}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.07em] ${SOURCE_META[source.source].accent}`}>
                            {SOURCE_META[source.source].label}
                          </p>
                          <p className="text-[10px] text-[#585b70] mt-1">
                            {source.confidence} · {source.updatedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {source.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#a6adc8]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Vault access
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {VAULT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#181825] border border-[#313244] text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
              Autonomous exec tiles
            </p>
            <p className="text-[13px] text-[#a6adc8] mt-2">
              Every executive stays standalone. Toggle any lens into the CEO review without merging identities.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#89b4fa] uppercase tracking-[0.07em]">
              All execs deep think
            </p>
            <p className="text-[11px] text-[#585b70] mt-1">
              {selectedLenses.length} lens{selectedLenses.length === 1 ? "" : "es"} active
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {DEEP_THINK_ROLES.map((role) => {
            const selected = selectedLenses.includes(role);
            const clipCount = sessionClips.filter((clip) => clipMatchesRole(clip, role)).length;
            const itemCount = sessionItems.filter((item) => itemMatchesRole(item, role)).length;

            return (
              <div
                key={role}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-[#89b4fa]/50 bg-[#181825]"
                    : "border-[#313244] bg-[#181825]",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => toggleLens(role)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#cdd6f4]">
                      {getRoleLabel(role)}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-[0.07em] ${
                        selected ? "text-[#89b4fa]" : "text-[#585b70]"
                      }`}
                    >
                      {selected ? "active" : "idle"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#585b70] mt-2">
                    Standalone deep-think workspace with its own executive voice.
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-[#a6adc8]">
                    <span>{clipCount} clip{clipCount === 1 ? "" : "s"}</span>
                    <span>{itemCount} action{itemCount === 1 ? "" : "s"}</span>
                  </div>
                </button>
                <Link
                  href={getRoleHref(role)}
                  className="inline-block mt-3 text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                >
                  Open standalone exec
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {savedSessions.length > 0 && (
        <div className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                CEO session stack
              </p>
              <p className="text-[12px] text-[#585b70] mt-1">
                Pick the saved CEO session you want to review in report form.
              </p>
            </div>
            <span className="text-[11px] text-[#89b4fa]">
              {savedSessions.length} saved session{savedSessions.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedSessions.slice(0, 8).map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={[
                  "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  selectedSession?.id === session.id
                    ? "border-[#89b4fa]/50 bg-[#89b4fa]/15 text-[#89b4fa]"
                    : "border-[#313244] bg-[#181825] text-[#a6adc8] hover:text-[#cdd6f4]",
                ].join(" ")}
              >
                {truncate(session.title, 42)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-5">
        {activeSection === "recommendations" && (
          <div className="space-y-4" id="ceo-recommendations">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Multi-lens recommendations
              </p>
              <p className="text-[13px] text-[#a6adc8] mt-2">
                Each card stays isolated to one exec lens while reviewing the same CEO session.
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {recommendationCards.map((card) => (
                <div
                  key={card.role}
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa]">
                        {getRoleLabel(card.role)} deep think
                      </p>
                      <p className="text-[13px] text-[#cdd6f4] mt-2 whitespace-pre-wrap">
                        {card.recommendation}
                      </p>
                    </div>
                    <Link
                      href={getRoleHref(card.role)}
                      className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb] shrink-0"
                    >
                      Open
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-[11px] text-[#585b70]">
                    <span>{card.clipCount} clip{card.clipCount === 1 ? "" : "s"}</span>
                    <span>{card.itemCount} routed item{card.itemCount === 1 ? "" : "s"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "clips" && (
          <div className="space-y-4" id="ceo-clips">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Saved clips
              </p>
              <p className="text-[13px] text-[#a6adc8] mt-2">
                CEO clips stay attached to the saved session and keep the deep-think lens assignments.
              </p>
            </div>

            {sessionClips.length === 0 ? (
              <p className="text-[12px] text-[#585b70]">
                No saved clips for this CEO session yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sessionClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#cdd6f4]">
                          {clip.title}
                        </p>
                        <p className="text-[11px] text-[#585b70] mt-1">
                          {clip.vault === "decisions" ? "Decision Vault" : "Knowledge Vault"} · {clip.createdAt}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.07em] text-[#89b4fa]">
                        {clip.status || "saved"}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#a6adc8] mt-3 whitespace-pre-wrap">
                      {clip.content}
                    </p>
                    {clip.actionableSteps && (
                      <div className="mt-3">
                        <p className="text-[10px] uppercase text-[#585b70]">
                          Recommended next steps
                        </p>
                        <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                          {clip.actionableSteps}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(clip.assignedRoles || []).map((role) => (
                        <span
                          key={`${clip.id}-${role}`}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa]"
                        >
                          {getRoleLabel(role)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "actions" && (
          <div className="space-y-4" id="ceo-actions">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Routed action items
              </p>
              <p className="text-[13px] text-[#a6adc8] mt-2">
                Deep-think tasks route to each standalone exec instead of collapsing them into one blended workflow.
              </p>
            </div>

            {sessionItems.length > 0 ? (
              <div className="space-y-3">
                {sessionItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#cdd6f4]">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-[#a6adc8] mt-2 whitespace-pre-wrap">
                          {item.summary}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase text-[#89b4fa]">{item.type}</p>
                        <p className="text-[10px] text-[#585b70] mt-1">{item.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.targetRoles
                        .filter(isExecRole)
                        .map((role) => {
                          const safeLink = SAFE_EXEC_LINKS[role];

                          return (
                            <span
                              key={`${item.id}-${role}`}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa]"
                            >
                              {safeLink.label}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : derivedActionItems.length > 0 ? (
              <ul className="space-y-2">
                {derivedActionItems.map((point, index) => (
                  <li
                    key={`${selectedSession?.id || "ceo"}-action-${index}`}
                    className="rounded-xl border border-[#313244] bg-[#181825] px-4 py-3 text-[12px] text-[#a6adc8]"
                  >
                    <span className="text-[#89b4fa] mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#585b70]">
                No action items saved for this CEO session yet.
              </p>
            )}
          </div>
        )}

        {activeSection === "report" && (
          <div className="space-y-5" id="ceo-report">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                  Full session review
                </p>
                <p className="text-[13px] text-[#a6adc8] mt-2">
                  Book-report style review with an index, recommendations, clips, action items, and transcript.
                </p>
              </div>
              {selectedSession && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-[#45475a] px-3 py-1.5 text-[11px] font-semibold text-[#89b4fa] hover:bg-[#313244] transition-colors"
                >
                  Print report
                </button>
              )}
            </div>

            {!selectedSession ? (
              <p className="text-[12px] text-[#585b70]">
                Run a CEO query to generate a report-ready saved session.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
                  <p className="text-[10px] uppercase text-[#585b70]">Index</p>
                  <ol className="mt-3 space-y-2 text-[12px] text-[#89b4fa]">
                    <li><a href="#ceo-report-summary">1. Session summary</a></li>
                    <li><a href="#ceo-report-recommendations">2. Executive recommendations</a></li>
                    <li><a href="#ceo-report-clips">3. Saved clips</a></li>
                    <li><a href="#ceo-report-actions">4. Action items</a></li>
                    <li><a href="#ceo-report-transcript">5. Full session review</a></li>
                  </ol>
                </div>

                <section
                  id="ceo-report-summary"
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <p className="text-[10px] uppercase text-[#585b70]">Session summary</p>
                  <p className="text-[15px] text-[#cdd6f4] font-semibold mt-2">
                    {selectedSession.title}
                  </p>
                  <p className="text-[12px] text-[#a6adc8] mt-2 whitespace-pre-wrap">
                    {selectedSession.query}
                  </p>
                  <p className="text-[11px] text-[#585b70] mt-3">
                    Saved {selectedSession.savedAt} · {selectedSession.sourceCount} source{selectedSession.sourceCount === 1 ? "" : "s"} ·{" "}
                    {selectedLenses.length} deep-think lens{selectedLenses.length === 1 ? "" : "es"}
                  </p>
                </section>

                <section
                  id="ceo-report-recommendations"
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <p className="text-[10px] uppercase text-[#585b70]">Executive recommendations</p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
                    {recommendationCards.map((card) => (
                      <div
                        key={`${selectedSession.id}-${card.role}`}
                        className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa]">
                          {getRoleLabel(card.role)}
                        </p>
                        <p className="text-[12px] text-[#a6adc8] mt-2 whitespace-pre-wrap">
                          {card.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  id="ceo-report-clips"
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <p className="text-[10px] uppercase text-[#585b70]">Saved clips</p>
                  {sessionClips.length === 0 ? (
                    <p className="text-[12px] text-[#585b70] mt-3">
                      No clips saved for this session.
                    </p>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {sessionClips.map((clip) => (
                        <div
                          key={`${selectedSession.id}-${clip.id}`}
                          className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-3"
                        >
                          <p className="text-[12px] font-semibold text-[#cdd6f4]">{clip.title}</p>
                          <p className="text-[12px] text-[#a6adc8] mt-2 whitespace-pre-wrap">
                            {clip.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  id="ceo-report-actions"
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <p className="text-[10px] uppercase text-[#585b70]">Action items</p>
                  {sessionItems.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {sessionItems.map((item) => (
                        <li
                          key={`${selectedSession.id}-${item.id}`}
                          className="text-[12px] text-[#a6adc8]"
                        >
                          <span className="text-[#89b4fa]">• </span>
                          <span className="font-medium text-[#cdd6f4]">{item.title}:</span>{" "}
                          {item.summary}
                        </li>
                      ))}
                    </ul>
                  ) : derivedActionItems.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {derivedActionItems.map((point, index) => (
                        <li
                          key={`${selectedSession.id}-derived-${index}`}
                          className="text-[12px] text-[#a6adc8]"
                        >
                          <span className="text-[#89b4fa]">• </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12px] text-[#585b70] mt-3">
                      No action items captured yet.
                    </p>
                  )}
                </section>

                <section
                  id="ceo-report-transcript"
                  className="rounded-xl border border-[#313244] bg-[#181825] p-4"
                >
                  <p className="text-[10px] uppercase text-[#585b70]">Full session review</p>
                  {selectedSession.transcript && selectedSession.transcript.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {selectedSession.transcript.map((message, index) => (
                        <div
                          key={`${selectedSession.id}-${index}`}
                          className="rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2"
                        >
                          <p className="text-[10px] uppercase text-[#89b4fa]">
                            {message.role}
                          </p>
                          <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#585b70] mt-3">
                      Transcript data is only available for newly saved CEO sessions.
                    </p>
                  )}

                  <p className="text-[12px] text-[#585b70] mt-4">
                    Estimated query fee ${selectedSession.estimatedFeeUsd?.toFixed(4) ?? "0.0000"} ·{" "}
                    {selectedSession.estimatedPromptTokens ?? 0} prompt tokens ·{" "}
                    {selectedSession.estimatedCompletionTokens ?? 0} completion tokens
                  </p>
                </section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
