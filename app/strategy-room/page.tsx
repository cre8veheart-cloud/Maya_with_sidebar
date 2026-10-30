"use client";

import { useState } from "react";

const EXEC_ROLES = [
  { id: "ceo", label: "CEO", icon: "🏛️", desc: "Vision & direction" },
  { id: "coo", label: "COO", icon: "⚙️", desc: "Operations & execution" },
  { id: "cmo", label: "CMO", icon: "📣", desc: "Brand & market" },
  { id: "cfo", label: "CFO", icon: "💰", desc: "Finance & risk" },
  { id: "cto", label: "CTO", icon: "🖥️", desc: "Technology & systems" },
  { id: "cio", label: "CIO", icon: "🔷", desc: "Information & data" },
  { id: "cro", label: "CRO", icon: "📈", desc: "Revenue & growth" },
  { id: "cd", label: "CD", icon: "🎨", desc: "Creative & production" },
] as const;

type RoleId = (typeof EXEC_ROLES)[number]["id"];
type Perspective = { role: RoleId; response: string };
type RoomResult = { perspectives: Perspective[]; synthesis: string };
type Entry = { prompt: string; ts: string; result: RoomResult | null; error: string | null };

function LensPanel({ role, onRemove }: { role: (typeof EXEC_ROLES)[number]; onRemove: (id: RoleId) => void }) {
  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{role.icon}</span>
          <span className="text-[13px] font-semibold text-[#89b4fa]">{role.label}</span>
        </div>
        <button onClick={() => onRemove(role.id)} title="Remove from room" className="text-[#585b70] hover:text-[#f38ba8] transition-colors text-sm leading-none">✕</button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] inline-block" />
        <span className="text-[11px] text-[#a6e3a1]">Lens active</span>
      </div>
      <p className="text-[12px] text-[#585b70]">{role.desc}</p>
    </div>
  );
}

export default function StrategyRoomPage() {
  const [selected, setSelected] = useState<Set<RoleId>>(new Set());
  const [roomActive, setRoomActive] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [running, setRunning] = useState(false);

  const activeRoles = EXEC_ROLES.filter((role) => selected.has(role.id));

  const toggle = (id: RoleId) => {
    if (roomActive) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const enterRoom = () => {
    if (selected.size >= 2) setRoomActive(true);
  };

  const exitRoom = () => {
    if (running) return;
    setRoomActive(false);
    setSelected(new Set());
    setInput("");
    setEntries([]);
  };

  const removeRole = (id: RoleId) => {
    if (running) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (next.size < 2) setRoomActive(false);
      return next;
    });
  };

  const submit = async () => {
    const prompt = input.trim();
    if (!prompt || running || activeRoles.length < 2) return;

    setRunning(true);
    setInput("");
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const index = entries.length;
    setEntries((prev) => [...prev, { prompt, ts, result: null, error: null }]);

    try {
      const response = await fetch("/api/strategy-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: activeRoles.map((role) => role.id), prompt }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Strategy Room failed");
      setEntries((prev) => prev.map((entry, i) => i === index ? { ...entry, result: payload as RoomResult } : entry));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Strategy Room failed";
      setEntries((prev) => prev.map((entry, i) => i === index ? { ...entry, error: message } : entry));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-full px-8 py-10 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-[#cdd6f4] tracking-tight leading-tight">Executive Strategy Room</h1>
          <p className="mt-1 text-[14px] text-[#a6adc8]">
            {roomActive ? `${activeRoles.length} executives active — independent analysis, Maya adjudication` : "Select two or more executives to form a decision room"}
          </p>
        </div>
        {roomActive && <button onClick={exitRoom} disabled={running} className="text-[12px] text-[#585b70] hover:text-[#f38ba8] border border-[#313244] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">Exit Room</button>}
      </div>

      {!roomActive && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">Select Executives</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {EXEC_ROLES.map((role) => {
              const isSelected = selected.has(role.id);
              return (
                <button key={role.id} onClick={() => toggle(role.id)} className={["flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left", isSelected ? "border-[#89b4fa] bg-[#89b4fa]/10 text-[#89b4fa]" : "border-[#313244] bg-[#1e1e2e] text-[#cdd6f4] hover:border-[#585b70]"].join(" ")}>
                  <span className="text-xl">{role.icon}</span>
                  <span className="text-[13px] font-semibold">{role.label}</span>
                  <span className={`text-[11px] ${isSelected ? "text-[#89b4fa]/70" : "text-[#585b70]"}`}>{role.desc}</span>
                </button>
              );
            })}
          </div>
          <button onClick={enterRoom} disabled={selected.size < 2} className={["px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all", selected.size >= 2 ? "bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/90" : "bg-[#313244] text-[#585b70] cursor-not-allowed"].join(" ")}>
            {selected.size < 2 ? `Select ${2 - selected.size} more role${selected.size === 1 ? "" : "s"}` : `Enter Room — ${selected.size} executives`}
          </button>
        </div>
      )}

      {roomActive && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {activeRoles.map((role) => <LensPanel key={role.id} role={role} onRemove={removeRole} />)}
          </div>

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 mb-4 min-h-[240px]">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">Decision Feed</h2>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2">
                <p className="text-[13px] text-[#585b70] text-center">Ask a consequential question.</p>
                <p className="text-[12px] text-[#585b70] text-center max-w-md">Each executive answers independently. Maya then weighs the disagreement and chooses a path instead of averaging them together.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <div key={`${entry.ts}-${index}`} className="border-t border-[#313244] pt-5 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold text-[#89b4fa] uppercase tracking-wider">Founder prompt</span>
                      <span className="text-[10px] text-[#585b70]">{entry.ts}</span>
                    </div>
                    <p className="text-[13px] text-[#cdd6f4] mb-4">{entry.prompt}</p>
                    {!entry.result && !entry.error && <p className="text-[12px] text-[#f9e2af]">Executives are analyzing independently; Maya adjudicates after all responses return…</p>}
                    {entry.error && <p className="text-[12px] text-[#f38ba8]">{entry.error}</p>}
                    {entry.result && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-3">
                          {entry.result.perspectives.map((perspective) => (
                            <div key={perspective.role} className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a6adc8] mb-2">{perspective.role}</p>
                              <p className="text-[12px] leading-5 whitespace-pre-wrap text-[#bac2de]">{perspective.response}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-[#89b4fa]/40 bg-[#89b4fa]/5 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#89b4fa]">Maya decision</span>
                            <span className="text-[10px] text-[#585b70]">Adjudicated, not averaged</span>
                          </div>
                          <p className="text-[13px] leading-6 whitespace-pre-wrap text-[#cdd6f4]">{entry.result.synthesis}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder={`Drive the room — ${activeRoles.map((role) => role.label).join(", ")} active`} rows={3} disabled={running} className="flex-1 resize-none bg-[#1e1e2e] border border-[#313244] rounded-xl px-4 py-3 text-[13px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#89b4fa] transition-colors disabled:opacity-60" />
            <button onClick={() => void submit()} disabled={!input.trim() || running} className={["self-end px-5 py-3 rounded-xl text-[13px] font-semibold transition-all", input.trim() && !running ? "bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/90" : "bg-[#313244] text-[#585b70] cursor-not-allowed"].join(" ")}>
              {running ? "Thinking…" : "Run Room"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
