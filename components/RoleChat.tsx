"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { EXEC_ROLE_OPTIONS, getRoleLabel } from "@/lib/maya/execRouting";
import { loadLens } from "@/lib/maya/lensStorage";
import {
  saveSessionRecord,
  saveVaultClip,
  saveWorkItem,
} from "@/lib/maya/libraryData";
import {
  checkpointPocketOfficeSession,
  recoverPocketOfficeSession,
} from "@/lib/maya/sessionLifecycleClient";
import type {
  ExecRole,
  MayaMessage,
  RoleLens,
} from "@/lib/maya/types";

type ActionType = "email" | "task" | "decision" | "meeting";

interface PendingAction {
  id: string;
  type: ActionType;
  label: string;
  context: string;
  targetRole: ExecRole;
  vendorName: string;
  vendorUrl: string;
  status: "pending" | "approved" | "dismissed";
}

const ACTION_LABELS: Record<ActionType, string> = {
  email: "Draft Email",
  task: "Create Task",
  decision: "Add to Decisions",
  meeting: "Schedule Meeting",
};

interface RoleChatProps {
  role: ExecRole;
  clientVaultId?: string;
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

function normalizeVendorUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function RoleChat({
  role,
  clientVaultId = "personal",
}: RoleChatProps) {
  const [lens, setLens] = useState<RoleLens>({ role, overrides: [] });
  const [messages, setMessages] = useState<MayaMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [sessionId, setSessionId] = useState(() => `${role}-${Date.now()}`);
  const [clipDraft, setClipDraft] = useState("");
  const [clipComment, setClipComment] = useState("");
  const [clipAssignments, setClipAssignments] = useState<ExecRole[]>([role]);
  const [clipVendorName, setClipVendorName] = useState("");
  const [clipVendorUrl, setClipVendorUrl] = useState("");
  const [clipStatus, setClipStatus] = useState("");
  const [restartPoint, setRestartPoint] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLens(loadLens(role));
    setMessages([]);
    setPendingActions([]);
    setSessionId(`${role}-${Date.now()}`);
    setClipDraft("");
    setClipComment("");
    setClipAssignments([role]);
    setClipVendorName("");
    setClipVendorUrl("");
    setClipStatus("");
    setRestartPoint("");

    void recoverPocketOfficeSession(clientVaultId, role).then((saved) => {
      if (cancelled || !saved) return;
      if (saved.status === "active") {
        setSessionId(saved.id);
        setMessages(saved.transcript);
        return;
      }
      setRestartPoint(saved.closeout?.nextAction ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [clientVaultId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingActions]);

  const lastAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant" && message.content.trim().length > 0) ??
      null,
    [messages]
  );

  useEffect(() => {
    if (lastAssistantMessage?.content) {
      setClipDraft(lastAssistantMessage.content);
    }
  }, [lastAssistantMessage]);

  function persistSession(nextMessages: MayaMessage[]) {
    const lastUser = [...nextMessages].reverse().find((message) => message.role === "user");
    const lastAssistant = [...nextMessages]
      .reverse()
      .find((message) => message.role === "assistant");

    if (!lastUser || !lastAssistant) {
      return;
    }

    const promptTokens = estimateTokens(nextMessages.map((message) => message.content).join("\n"));
    const completionTokens = estimateTokens(lastAssistant.content);
    const title = lastUser.content.slice(0, 80);
    saveSessionRecord({
      id: sessionId,
      role,
      title,
      query: lastUser.content,
      answer: lastAssistant.content,
      savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      sourceCount: pendingActions.length,
      transcript: nextMessages,
      estimatedPromptTokens: promptTokens,
      estimatedCompletionTokens: completionTokens,
    });
    checkpointPocketOfficeSession({
      id: sessionId,
      clientVaultId,
      role,
      title,
      transcript: nextMessages,
    });
  }

  async function send(e: FormEvent | React.KeyboardEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: MayaMessage = { role: "user", content: text };
    const thread = [...messages, userMsg];
    setInput("");
    setRestartPoint("");
    setStreaming(true);
    setClipStatus("");
    setMessages([...thread, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread,
          lens,
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || "Provider request failed");
        }
        throw new Error((await res.text()) || "Provider request failed");
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([...thread, { role: "assistant", content: full }]);
      }

      const completedThread: MayaMessage[] = [
        ...thread,
        { role: "assistant", content: full },
      ];
      setMessages(completedThread);
      persistSession(completedThread);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Connection error. Check your provider configuration.";
      const erroredThread: MayaMessage[] = [
        ...thread,
        { role: "assistant", content: message },
      ];
      setMessages(erroredThread);
      persistSession(erroredThread);
    } finally {
      setStreaming(false);
    }
  }

  function proposeAction(type: ActionType) {
    if (!lastAssistantMessage) return;
    setPendingActions((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${type}`,
        type,
        label: ACTION_LABELS[type],
        context: lastAssistantMessage.content.slice(0, 220),
        targetRole: role,
        vendorName: "",
        vendorUrl: "",
        status: "pending",
      },
    ]);
  }

  function updatePendingAction(
    id: string,
    updates: Partial<Pick<PendingAction, "targetRole" | "vendorName" | "vendorUrl">>
  ) {
    setPendingActions((prev) =>
      prev.map((action) => (action.id === id ? { ...action, ...updates } : action))
    );
  }

  function resolveAction(id: string, resolution: "approved" | "dismissed") {
    const action = pendingActions.find((item) => item.id === id);

    if (
      resolution === "approved" &&
      action &&
      !window.confirm(
        `Approve recording “${action.label}” as authorized? MAYA will not execute the external action.`
      )
    ) {
      return;
    }

    setPendingActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: resolution } : item))
    );

    if (resolution !== "approved" || !action) {
      return;
    }

    saveWorkItem({
      id: action.id,
      title: action.label,
      summary: action.context,
      type: action.type,
      sourceRole: role,
      targetRoles: [action.targetRole],
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      sessionId,
      vendorName: action.vendorName.trim() || undefined,
      vendorUrl: normalizeVendorUrl(action.vendorUrl) || undefined,
      status: "approved",
      clippedBy: role,
    });
  }

  function toggleClipAssignment(nextRole: ExecRole) {
    setClipAssignments((prev) =>
      prev.includes(nextRole)
        ? prev.filter((assignedRole) => assignedRole !== nextRole)
        : [...prev, nextRole]
    );
  }

  function saveClip() {
    const content = clipDraft.trim();
    if (!content) return;

    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    const clipId = `${Date.now()}-clip`;
    const vendorUrl = normalizeVendorUrl(clipVendorUrl);
    const createdAt = new Date().toISOString().slice(0, 16).replace("T", " ");

    saveVaultClip({
      id: clipId,
      vault: "knowledge",
      title: `${role.toUpperCase()} clip · ${(lastUser?.content || "untitled").slice(0, 60)}`,
      content,
      createdAt,
      sessionId,
      query: lastUser?.content,
      sourceRole: role,
      assignedRoles: clipAssignments,
      vendorName: clipVendorName.trim() || undefined,
      vendorUrl: vendorUrl || undefined,
      clippedBy: role,
      clipComment: clipComment.trim() || undefined,
    });

    clipAssignments.forEach((assignedRole, index) => {
      saveWorkItem({
        id: `${clipId}-${assignedRole}-${index}`,
        title: `${role.toUpperCase()} clip for ${getRoleLabel(assignedRole)}`,
        summary: content.slice(0, 220),
        type: "clip",
        sourceRole: role,
        targetRoles: [assignedRole],
        createdAt,
        sessionId,
        clipId,
        vendorName: clipVendorName.trim() || undefined,
        vendorUrl: vendorUrl || undefined,
        status: "approved",
        clippedBy: role,
        clipComment: clipComment.trim() || undefined,
      });
    });

    setClipStatus(
      clipAssignments.length > 0
        ? "Saved clip, clipper comment, and routed work item(s)."
        : "Saved clip with clipper comment."
    );
  }

  const lastIsAssistant =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !streaming;

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-hidden">
      <div className="px-4 py-2.5 border-b border-[#313244] shrink-0 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
          Talk to your {role.toUpperCase()} · MAYA executive workspace
        </span>
      </div>

      {restartPoint && (
        <div className="mx-4 mt-3 rounded-xl border border-[#89b4fa]/40 bg-[#89b4fa]/10 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa]">
            MAYA restart point
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#cdd6f4]">
            {restartPoint}
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-x-hidden overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-[#585b70] text-center leading-relaxed">
              {role.toUpperCase()} lens active.
              <br />
              Ask anything.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] px-4 py-3 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                message.role === "user"
                  ? "bg-[#89b4fa] text-[#1e1e2e] font-medium"
                  : "bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4]"
              }`}
            >
              {message.content || (
                <span className="inline-block w-1.5 h-3.5 bg-[#89b4fa] animate-pulse rounded-sm align-middle" />
              )}
              {message.role === "assistant" &&
                streaming &&
                index === messages.length - 1 &&
                message.content && (
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#89b4fa] animate-pulse rounded-sm align-middle" />
                )}
            </div>
          </div>
        ))}

        {lastIsAssistant && (
          <>
            <div className="flex gap-2 flex-wrap pl-1">
              {(Object.entries(ACTION_LABELS) as [ActionType, string][]).map(
                ([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => proposeAction(type)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-[#cdd6f4] transition-colors"
                  >
                    + {label}
                  </button>
                )
              )}
            </div>

            <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                  Save Working Clip
                </p>
                <span className="text-[11px] text-[#89b4fa]">Full session auto-saved</span>
              </div>

              <textarea
                value={clipDraft}
                onChange={(e) => setClipDraft(e.target.value)}
                rows={4}
                className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
              />

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
                    Clipper comment
                  </span>
                  <textarea
                    value={clipComment}
                    onChange={(e) => setClipComment(e.target.value)}
                    rows={3}
                    placeholder="Why this was clipped, what to do next, or context for the receiving exec."
                    className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
                  />
                </label>
                <div className="grid gap-3">
                  <label className="block">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
                      Vendor name
                    </span>
                    <input
                      value={clipVendorName}
                      onChange={(e) => setClipVendorName(e.target.value)}
                      placeholder="Optional vendor or partner"
                      className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
                      Vendor link
                    </span>
                    <input
                      value={clipVendorUrl}
                      onChange={(e) => setClipVendorUrl(e.target.value)}
                      placeholder="vendor.example.com"
                      className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-2">
                  Route clip to exec workspace(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXEC_ROLE_OPTIONS.map((assignedRole) => {
                    const selected = clipAssignments.includes(assignedRole);
                    return (
                      <button
                        key={assignedRole}
                        type="button"
                        onClick={() => toggleClipAssignment(assignedRole)}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                          selected
                            ? "bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/40"
                            : "bg-[#313244] text-[#a6adc8] border border-[#45475a] hover:bg-[#45475a]"
                        }`}
                      >
                        {getRoleLabel(assignedRole)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={saveClip}
                  className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#89b4fa] text-[11px] font-semibold hover:bg-[#45475a] transition-colors"
                >
                  Save clip
                </button>
                {clipStatus && <span className="text-[11px] text-[#a6e3a1]">{clipStatus}</span>}
              </div>
            </div>
          </>
        )}

        {pendingActions.map((action) => (
          <div
            key={action.id}
            className={`min-w-0 w-full max-w-full overflow-hidden rounded-xl border p-4 text-[13px] transition-all ${
              action.status === "pending"
                ? "border-[#f9e2af] bg-[#1e1e2e]"
                : action.status === "approved"
                  ? "border-[#a6e3a1] bg-[#1e1e2e] opacity-60"
                  : "border-[#313244] bg-[#1e1e2e] opacity-40"
            }`}
          >
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#f9e2af] mb-1">
                  Proposed · {action.label}
                </p>
                <p className="text-[#a6adc8] text-[12px] leading-relaxed line-clamp-2 break-words [overflow-wrap:anywhere]">
                  {action.context}
                  {action.context.length >= 220 ? "…" : ""}
                </p>
                {action.status === "pending" && (
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <label className="block">
                      <span className="block text-[10px] text-[#6c7086] mb-1">Target exec</span>
                      <select
                        value={action.targetRole}
                        onChange={(e) =>
                          updatePendingAction(action.id, {
                            targetRole: e.target.value as ExecRole,
                          })
                        }
                        className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa]"
                      >
                        {EXEC_ROLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {getRoleLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-[10px] text-[#6c7086] mb-1">Vendor name</span>
                      <input
                        value={action.vendorName}
                        onChange={(e) =>
                          updatePendingAction(action.id, { vendorName: e.target.value })
                        }
                        placeholder="Optional"
                        className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa]"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[10px] text-[#6c7086] mb-1">Vendor link</span>
                      <input
                        value={action.vendorUrl}
                        onChange={(e) =>
                          updatePendingAction(action.id, { vendorUrl: e.target.value })
                        }
                        placeholder="vendor.example.com"
                        className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[12px] text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa]"
                      />
                    </label>
                  </div>
                )}
              </div>

              {action.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => resolveAction(action.id, "approved")}
                    className="px-3 py-1.5 rounded-lg bg-[#a6e3a1] text-[#1e1e2e] text-[11px] font-bold hover:bg-[#cdf0cb] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveAction(action.id, "dismissed")}
                    className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#a6adc8] text-[11px] font-bold hover:bg-[#45475a] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {action.status === "approved" && (
                <span className="text-[11px] text-[#a6e3a1] font-semibold shrink-0">
                  ✓ Approved · Not executed
                </span>
              )}

              {action.status === "dismissed" && (
                <span className="text-[11px] text-[#585b70] shrink-0">Dismissed</span>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="px-4 py-3 border-t border-[#313244] shrink-0">
        <div className="flex min-w-0 gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            placeholder={`Ask your ${role.toUpperCase()} lens…`}
            rows={1}
            className="min-w-0 flex-1 bg-[#313244] border border-[#45475a] rounded-xl px-3 py-2.5 text-[13px] text-[#cdd6f4] placeholder-[#585b70] resize-none focus:outline-none focus:border-[#89b4fa] transition-colors"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="px-4 py-2.5 bg-[#89b4fa] text-[#1e1e2e] rounded-xl text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b4d0fb] transition-colors shrink-0"
          >
            Send
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[#585b70]">
          Enter to send · Shift+Enter for new line · Queries are auto-saved with estimated token fee
        </p>
      </form>
    </div>
  );
}
