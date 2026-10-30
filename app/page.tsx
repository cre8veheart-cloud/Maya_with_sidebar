"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveSessionRecord } from "@/lib/maya/libraryData";
import {
  checkpointPocketOfficeSession,
  recoverPocketOfficeSession,
} from "@/lib/maya/sessionLifecycleClient";
import type { MayaMessage } from "@/lib/maya/types";

interface Recommendation {
  text: string;
}

/** Extract bullet lines from markdown-style text (-, *, •, or numbered). */
function extractBullets(text: string): Recommendation[] {
  const lines = text.split("\n");
  const bullets: Recommendation[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:[-*•]|\d+\.)\s+(.+)/);
    if (match) bullets.push({ text: match[1].trim() });
  }
  return bullets;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MayaMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [restartPoint, setRestartPoint] = useState("");
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void recoverPocketOfficeSession("personal", "ceo").then((saved) => {
      if (cancelled || !saved) return;
      if (saved.status === "active") {
        sessionId.current = saved.id;
        setMessages(saved.transcript);
        return;
      }
      setRestartPoint(saved.closeout?.nextAction ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(e: FormEvent | React.KeyboardEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    if (!sessionId.current) {
      sessionId.current = `home-${crypto.randomUUID()}`;
    }

    const userMsg: MayaMessage = { role: "user", content: text };
    const thread: MayaMessage[] = [...messages, userMsg];
    setInput("");
    setRestartPoint("");
    setStreaming(true);
    setRecommendations([]);
    setSavedId(null);
    setMessages([...thread, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread,
          lens: { role: "ceo", overrides: [] },
          workspace: "exec",
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
      }

      // Extract bullet recommendations from response
      const bullets = extractBullets(full);
      setRecommendations(bullets);

      // Save full session
      const finalThread: MayaMessage[] = [...thread, { role: "assistant", content: full }];
      const sid = sessionId.current;
      const title = text.slice(0, 80);
      saveSessionRecord({
        id: sid,
        role: "ceo",
        title,
        query: text,
        answer: full,
        savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        sourceCount: bullets.length,
        transcript: finalThread,
      });
      checkpointPocketOfficeSession({
        id: sid,
        clientVaultId: "personal",
        role: "ceo",
        title,
        transcript: finalThread,
      });
      setSavedId(sid);
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="min-h-screen bg-[#1e1e2e] flex flex-col items-center justify-start px-4 py-16">
      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#cdd6f4] tracking-tight">Maya</h1>
        <p className="mt-2 text-[15px] text-[#585b70]">Your executive AI — ask anything</p>
      </div>

      {/* Chat box */}
      <div className="w-full max-w-2xl">
        {restartPoint && (
          <div className="mb-4 rounded-xl border border-[#89b4fa]/40 bg-[#89b4fa]/10 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#89b4fa]">
              MAYA restart point
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#cdd6f4]">
              {restartPoint}
            </p>
          </div>
        )}
        <form onSubmit={send} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            placeholder="Ask Maya anything…"
            rows={2}
            disabled={streaming}
            className="flex-1 bg-[#313244] border border-[#45475a] rounded-xl px-4 py-3 text-[14px] text-[#cdd6f4] placeholder-[#585b70] resize-none focus:outline-none focus:border-[#89b4fa] transition-colors disabled:opacity-50"
            style={{ minHeight: "56px", maxHeight: "160px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="px-5 py-3 bg-[#89b4fa] text-[#1e1e2e] rounded-xl text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b4d0fb] transition-colors shrink-0"
          >
            {streaming ? "…" : "Send"}
          </button>
        </form>

        {/* Response */}
        {lastAssistant && (
          <div className="mt-6 bg-[#181825] border border-[#313244] rounded-xl p-5">
            <p className="text-[13px] text-[#cdd6f4] leading-relaxed whitespace-pre-wrap">
              {lastAssistant.content}
              {streaming && (
                <span className="inline-block w-1.5 h-4 bg-[#89b4fa] ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>

            {/* Bullet recommendations */}
            {!streaming && recommendations.length > 0 && (
              <div className="mt-5 border-t border-[#313244] pt-4">
                <p className="text-[11px] text-[#585b70] uppercase tracking-widest mb-3 font-semibold">
                  Recommendations
                </p>
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#89b4fa] shrink-0" />
                      <span className="text-[13px] text-[#a6adc8] leading-snug">{rec.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Session saved indicator */}
            {!streaming && savedId && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-[#a6e3a1]">✓ Session saved</span>
                <Link
                  href="/library/sessions"
                  className="text-[11px] text-[#89b4fa] hover:underline"
                >
                  View in Sessions →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
