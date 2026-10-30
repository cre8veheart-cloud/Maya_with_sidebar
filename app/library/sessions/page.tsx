"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { getRoleHref, getRoleLabel } from "@/lib/maya/execRouting";
import {
  loadSavedSessions,
  loadVaultClips,
  loadWorkItems,
  type MayaSessionRecord,
  type MayaVaultClip,
  type MayaWorkItem,
} from "@/lib/maya/libraryData";
import type { ExecRole, MayaMessage } from "@/lib/maya/types";

const ROLES = ["All", "CEO", "COO", "CMO", "CFO", "CTO", "CIO", "CRO", "CD", "Strategy Room"];
const EXEC_ROLE_ORDER: ExecRole[] = [
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

interface ExecReportSection {
  role: ExecRole;
  recommendation: string;
  clippedItems: MayaVaultClip[];
  actionItems: MayaWorkItem[];
  fallbackActionItems: string[];
}

function downloadSessionFile(session: MayaSessionRecord) {
  const role = session.role.toUpperCase();
  const transcript = session.transcript?.length
    ? session.transcript
        .map((message) => `${message.role.toUpperCase()}\n${message.content}`)
        .join("\n\n")
    : `USER\n${session.query}\n\n${role}\n${session.answer}`;
  const contents = [
    `MAYA ${role} SESSION FILE`,
    `Title: ${session.title}`,
    `Saved: ${session.savedAt}`,
    "",
    transcript,
  ].join("\n");
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeDate = session.savedAt.replace(/[^0-9]+/g, "-").replace(/-+$/, "");
  link.href = url;
  link.download = `MAYA-${role}-session-${safeDate}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-3xl">🗂️</span>
      <p className="text-[13px] text-[#585b70] text-center max-w-xs">
        Sessions save automatically as you work. Pick up exactly where you left off — every time.
      </p>
    </div>
  );
}

function isExecRole(role: MayaSessionRecord["role"] | string): role is ExecRole {
  return role !== "strategy-room";
}

function truncate(text: string, maxLength = 220): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function firstUsefulText(values: Array<string | undefined>): string {
  return values.map((value) => value?.trim() || "").find((value) => value.length > 0) || "";
}

function extractActionBullets(session: MayaSessionRecord, role: ExecRole): string[] {
  const bulletLines = session.answer
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line))
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, ""));

  if (bulletLines.length > 0) {
    return bulletLines.slice(0, 5);
  }

  if (session.role === role) {
    return [truncate(session.answer, 160)];
  }

  return [];
}

function buildRecommendation(
  session: MayaSessionRecord,
  role: ExecRole,
  clippedItems: MayaVaultClip[],
  actionItems: MayaWorkItem[]
): string {
  if (session.role === role) {
    return session.answer;
  }

  const derived = firstUsefulText([
    clippedItems.find((clip) => clip.assignedRoles?.includes(role))?.clipComment,
    actionItems[0]?.clipComment,
    actionItems[0]?.summary,
    clippedItems[0]?.clipComment,
    clippedItems[0]?.content,
  ]);

  return derived || "No direct role-specific recommendation was saved for this exec yet. Review the clipped items and routed action items below.";
}

function matchesClipForRole(clip: MayaVaultClip, role: ExecRole, sessionId: string): boolean {
  if (clip.sessionId !== sessionId) return false;
  return clip.sourceRole === role || clip.clippedBy === role || clip.assignedRoles?.includes(role) === true;
}

function matchesWorkItemForRole(item: MayaWorkItem, role: ExecRole, sessionId: string): boolean {
  if (item.sessionId !== sessionId) return false;
  return item.sourceRole === role || item.targetRoles.includes(role);
}

function buildExecReportSections(
  session: MayaSessionRecord,
  clips: MayaVaultClip[],
  items: MayaWorkItem[]
): ExecReportSection[] {
  const consultedRoles = new Set<ExecRole>();

  if (isExecRole(session.role)) {
    consultedRoles.add(session.role);
  }

  clips
    .filter((clip) => clip.sessionId === session.id)
    .forEach((clip) => {
      if (clip.sourceRole && isExecRole(clip.sourceRole)) {
        consultedRoles.add(clip.sourceRole);
      }
      clip.assignedRoles?.forEach((role) => consultedRoles.add(role));
      if (clip.clippedBy && isExecRole(clip.clippedBy)) consultedRoles.add(clip.clippedBy);
    });

  items
    .filter((item) => item.sessionId === session.id)
    .forEach((item) => {
      if (isExecRole(item.sourceRole)) {
        consultedRoles.add(item.sourceRole);
      }
      item.targetRoles.forEach((role) => consultedRoles.add(role));
      if (item.clippedBy && isExecRole(item.clippedBy)) consultedRoles.add(item.clippedBy);
    });

  return EXEC_ROLE_ORDER.filter((role) => consultedRoles.has(role)).map((role) => {
    const clippedItems = clips.filter((clip) => matchesClipForRole(clip, role, session.id));
    const actionItems = items.filter((item) => matchesWorkItemForRole(item, role, session.id));
    return {
      role,
      recommendation: buildRecommendation(session, role, clippedItems, actionItems),
      clippedItems,
      actionItems,
      fallbackActionItems: extractActionBullets(session, role),
    };
  });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<MayaSessionRecord[]>(loadSavedSessions());
  const [clips, setClips] = useState<MayaVaultClip[]>([]);
  const [items, setItems] = useState<MayaWorkItem[]>([]);
  const [activeRole, setActiveRole] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    setSessions(loadSavedSessions());
    setClips(loadVaultClips());
    setItems(loadWorkItems());

    void fetch("/api/sessions?clientVaultId=personal&limit=30", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return [];
        const payload = (await response.json()) as {
          sessions?: Array<{
            id: string;
            clientVaultId: string;
            role: MayaSessionRecord["role"];
            title: string;
            transcript: MayaMessage[];
            status: MayaSessionRecord["status"];
            lastActivityAt: string;
            closeout?: MayaSessionRecord["closeout"];
          }>;
        };
        return payload.sessions ?? [];
      })
      .then((durable) => {
        if (cancelled || durable.length === 0) return;
        const mapped: MayaSessionRecord[] = durable.map((session) => {
          const lastUser = [...session.transcript]
            .reverse()
            .find((message) => message.role === "user");
          const lastAssistant = [...session.transcript]
            .reverse()
            .find((message) => message.role === "assistant");
          return {
            id: session.id,
            role: session.role,
            title: session.title,
            query: lastUser?.content ?? "",
            answer: lastAssistant?.content ?? "",
            savedAt: new Date(session.lastActivityAt)
              .toISOString()
              .slice(0, 16)
              .replace("T", " "),
            sourceCount: 0,
            transcript: session.transcript,
            clientVaultId: session.clientVaultId,
            status: session.status,
            closeout: session.closeout,
          };
        });
        setSessions((current) => [
          ...mapped,
          ...current.filter(
            (item) => !mapped.some((durableItem) => durableItem.id === item.id),
          ),
        ]);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session");
    if (sessionId) setSelectedId(sessionId);
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesRole =
        activeRole === "All" ||
        session.role.toUpperCase() === activeRole ||
        (activeRole === "Strategy Room" && session.role === "strategy-room");
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [
          session.title,
          session.query,
          session.answer,
          session.closeout?.whatChanged.join(" "),
          session.closeout?.keyDecisions.join(" "),
          session.closeout?.unresolvedBlockers.join(" "),
          session.closeout?.securityOrDeploymentIssues.join(" "),
          session.closeout?.nextAction,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesRole && matchesSearch;
    });
  }, [activeRole, search, sessions]);

  const selectedSession =
    filteredSessions.find((session) => session.id === selectedId) ??
    filteredSessions[0] ??
    null;

  const reportSections = useMemo(
    () => (selectedSession ? buildExecReportSections(selectedSession, clips, items) : []),
    [clips, items, selectedSession]
  );

  return (
    <PageShell
      title="Sessions"
      subtitle="Your full conversation history with Maya — plus separate exec reports, clips, and action items"
    >
      <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-5 md:grid-cols-3">
        <div className="min-w-0 space-y-4 print:hidden md:col-span-2">
          <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[#313244] bg-[#1e1e2e] px-4 py-3">
            <span className="text-[#585b70]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={[
                  "text-[11px] font-semibold px-3 py-1 rounded-full transition-colors",
                  activeRole === r
                    ? "bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/40"
                    : "bg-[#1e1e2e] border border-[#313244] text-[#585b70] hover:text-[#cdd6f4]",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              Recent Sessions
            </h2>
            {filteredSessions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedId(session.id)}
                    className={[
                      "w-full min-w-0 overflow-hidden text-left rounded-lg border p-4 transition-colors",
                      selectedSession?.id === session.id
                        ? "border-[#89b4fa]/40 bg-[#181825]"
                        : "border-[#313244] bg-[#181825] hover:border-[#585b70]",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
                      <div className="min-w-0 max-w-full">
                        <p className="break-words text-[13px] font-medium text-[#cdd6f4]">{session.title}</p>
                        <p className="mt-1 line-clamp-2 break-words text-[12px] text-[#a6adc8]">{session.answer}</p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-[10px] text-[#585b70] uppercase">{session.role}</p>
                        <p className="text-[10px] text-[#585b70] mt-1">{session.savedAt}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4 md:col-span-1 print:col-span-3">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 print:hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
                  Summary
                </h2>
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
            <div className="space-y-3">
              {[
                { label: "Total sessions", value: `${sessions.length}` },
                { label: "Roles active", value: `${new Set(sessions.map((session) => session.role)).size}` },
                { label: "Last session", value: sessions[0]?.savedAt ?? "—" },
                { label: "Insights captured", value: `${sessions.reduce((total, session) => total + session.sourceCount, 0)}` },
                { label: "Strategy Room sessions", value: `${sessions.filter((session) => session.role === "strategy-room").length}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-[#313244] pb-2 last:border-0"
                >
                  <span className="text-[13px] text-[#cdd6f4]">{label}</span>
                  <span className="text-[13px] text-[#585b70]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 print:bg-white print:text-black print:border-slate-300">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-3 print:text-slate-500">
              Exec Session Report
            </h2>
            {selectedSession ? (
              <div className="space-y-5">
                <div className="border-b border-[#313244] pb-4 print:border-slate-300">
                  <p className="text-[12px] text-[#585b70] print:text-slate-500">Selected session</p>
                  <p className="text-[15px] text-[#cdd6f4] font-semibold mt-1 print:text-black">
                    {selectedSession.title}
                  </p>
                  <p className="text-[12px] text-[#a6adc8] mt-2 print:text-slate-700">
                    Saved {selectedSession.savedAt} · {selectedSession.role.toUpperCase()} · {reportSections.length} exec section{reportSections.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={() => downloadSessionFile(selectedSession)}
                      className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                    >
                      Download session file
                    </button>
                    <Link
                      href="/library/knowledge"
                      className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                    >
                      Open clippings folder
                    </Link>
                    <Link href="/tasks" className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]">
                      Open action items folder
                    </Link>
                  </div>
                </div>

                {reportSections.length === 0 ? (
                  <p className="text-[12px] text-[#585b70] print:text-slate-600">
                    No exec-specific report sections are available for this saved session yet.
                  </p>
                ) : (
                  reportSections.map((section) => (
                    <section
                      key={`${selectedSession.id}-${section.role}`}
                      className="min-w-0 space-y-4 overflow-hidden rounded-xl border border-[#313244] bg-[#181825] p-4 print:bg-white print:border-slate-300"
                    >
                      <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between">
                        <div className="min-w-0 max-w-full">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa] print:text-slate-600">
                            {getRoleLabel(section.role)} Recommendation
                          </p>
                          <p className="mt-2 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[13px] text-[#cdd6f4] print:text-black">
                            {section.recommendation}
                          </p>
                        </div>
                        <Link
                          href={getRoleHref(section.role)}
                          className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb] shrink-0 print:hidden"
                        >
                          Open {getRoleLabel(section.role)} workspace
                        </Link>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase text-[#585b70] print:text-slate-500">User</p>
                        <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap print:text-slate-800">
                          {selectedSession.query}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase text-[#585b70] print:text-slate-500">
                          Clipped segments of session
                        </p>
                        {section.clippedItems.length === 0 ? (
                          <p className="text-[12px] text-[#585b70] mt-2 print:text-slate-600">
                            No clipped segments saved for this exec.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-3">
                            {section.clippedItems.map((clip) => (
                              <div
                                key={clip.id}
                                className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-3 print:bg-white print:border-slate-300"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-[12px] text-[#cdd6f4] font-medium print:text-black">
                                    {clip.title}
                                  </p>
                                  <span className="text-[10px] text-[#585b70] shrink-0 print:text-slate-500">
                                    {clip.createdAt}
                                  </span>
                                </div>
                                <p className="text-[12px] text-[#a6adc8] mt-2 whitespace-pre-wrap print:text-slate-800">
                                  {clip.content}
                                </p>
                                {clip.clipComment && (
                                  <div className="mt-2">
                                    <p className="text-[10px] uppercase text-[#585b70] print:text-slate-500">
                                      User clipped note
                                    </p>
                                    <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap print:text-slate-800">
                                      {clip.clipComment}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase text-[#585b70] print:text-slate-500">
                          Action items
                        </p>
                        {section.actionItems.length > 0 ? (
                          <ul className="mt-2 space-y-2">
                            {section.actionItems.map((item) => (
                              <li key={item.id} className="text-[12px] text-[#a6adc8] print:text-slate-800">
                                <span className="text-[#89b4fa] print:text-slate-600">• </span>
                                <span className="font-medium text-[#cdd6f4] print:text-black">{item.title}:</span>{" "}
                                {item.summary}
                                {item.clipComment ? ` (${item.clipComment})` : ""}
                              </li>
                            ))}
                          </ul>
                        ) : section.fallbackActionItems.length > 0 ? (
                          <ul className="mt-2 space-y-2">
                            {section.fallbackActionItems.map((point, index) => (
                              <li
                                key={`${selectedSession.id}-${section.role}-fallback-${index}`}
                                className="text-[12px] text-[#a6adc8] print:text-slate-800"
                              >
                                <span className="text-[#89b4fa] print:text-slate-600">• </span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[12px] text-[#585b70] mt-2 print:text-slate-600">
                            No action items saved for this exec yet.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1 print:hidden">
                        <Link
                          href={`/library/sessions?session=${encodeURIComponent(selectedSession.id)}`}
                          className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                        >
                          Open full saved session
                        </Link>
                        <Link href="/library/knowledge" className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]">
                          Review clippings
                        </Link>
                        <Link href="/tasks" className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]">
                          Review action items
                        </Link>
                      </div>
                    </section>
                  ))
                )}

                {selectedSession.closeout && (
                  <div className="rounded-xl border border-[#89b4fa]/40 bg-[#89b4fa]/10 p-4 print:border-slate-300 print:bg-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa] print:text-slate-600">
                      MAYA automatic closeout
                    </p>
                    {[
                      ["What changed", selectedSession.closeout.whatChanged],
                      ["Key decisions", selectedSession.closeout.keyDecisions],
                      ["Unresolved blockers", selectedSession.closeout.unresolvedBlockers],
                      [
                        "Security or deployment",
                        selectedSession.closeout.securityOrDeploymentIssues,
                      ],
                    ].map(([label, values]) => (
                      <div key={label as string} className="mt-3">
                        <p className="text-[10px] uppercase text-[#6c7086] print:text-slate-500">
                          {label as string}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {(values as string[]).map((value) => (
                            <li key={value} className="text-[12px] text-[#a6adc8] print:text-slate-800">
                              · {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="mt-3 border-t border-[#89b4fa]/20 pt-3">
                      <p className="text-[10px] uppercase text-[#6c7086] print:text-slate-500">
                        Exact restart point
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-[#cdd6f4] print:text-slate-900">
                        {selectedSession.closeout.nextAction}
                      </p>
                    </div>
                  </div>
                )}

                {selectedSession.transcript && selectedSession.transcript.length > 0 && (
                  <div className="border-t border-[#313244] pt-4 print:border-slate-300">
                    <p className="text-[10px] uppercase text-[#585b70] print:text-slate-500">Full saved session</p>
                    <div className="mt-2 space-y-2">
                      {selectedSession.transcript.map((message, index) => (
                        <div
                          key={`${selectedSession.id}-${index}`}
                          className="rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 print:bg-white print:border-slate-300"
                        >
                          <p className="text-[10px] uppercase text-[#89b4fa] print:text-slate-600">
                            {message.role}
                          </p>
                          <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap print:text-slate-800">
                            {message.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[12px] text-[#585b70] print:text-slate-500">Estimated query fee</p>
                  <p className="text-[12px] text-[#a6adc8] mt-1 print:text-slate-800">
                    ${selectedSession.estimatedFeeUsd?.toFixed(4) ?? "0.0000"} ·{" "}
                    {selectedSession.estimatedPromptTokens ?? 0} prompt tokens ·{" "}
                    {selectedSession.estimatedCompletionTokens ?? 0} completion tokens
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  "Auto-saved — no manual action needed",
                  "Filterable by exec role",
                  "Resume from exactly where you left off",
                  "Exec reports expose saved recommendations, clips, and action items",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <span className="text-[#89b4fa] mt-0.5">·</span>
                    <span className="text-[12px] text-[#a6adc8]">{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
