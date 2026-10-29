"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import {
  listHardenedDecisionRecords,
  loadSavedSessions,
  loadVaultClips,
  updateVaultClipStatus,
  type MayaVaultClip,
} from "@/lib/maya/libraryData";

function DecisionRow({
  title,
  owner,
  date,
  status,
}: {
  title: string;
  owner: string;
  date: string;
  status: "open" | "closed" | "pending";
}) {
  const badge: Record<typeof status, string> = {
    open: "text-[#a6e3a1] bg-[#a6e3a1]/10",
    closed: "text-[#585b70] bg-[#313244]",
    pending: "text-[#f9e2af] bg-[#f9e2af]/10",
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#313244] last:border-0">
      <div>
        <p className="text-[13px] text-[#cdd6f4] font-medium">{title}</p>
        <p className="text-[11px] text-[#585b70]">{owner} · {date}</p>
      </div>
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge[status]}`}>
        {status}
      </span>
    </div>
  );
}

export default function DecisionsPage() {
  const decisions = listHardenedDecisionRecords();
  const [clippedNotes, setClippedNotes] = useState<MayaVaultClip[]>([]);
  const [sessions, setSessions] = useState(loadSavedSessions());

  useEffect(() => {
    setClippedNotes(loadVaultClips("decisions"));
    setSessions(loadSavedSessions());
  }, []);

  return (
    <PageShell
      title="Decisions"
      subtitle="The decisions layer — vendor lists, subcontractors, and production rosters live here"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Decision log */}
        <div className="md:col-span-2 bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
            Decision Log
          </h2>
          {decisions.map((decision) => (
            <DecisionRow
              key={decision.id}
              title={decision.title}
              owner="MAYA hardened layer"
              date={decision.updatedAt}
              status={decision.confidence === "high" ? "open" : "pending"}
            />
          ))}
          {clippedNotes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#313244] space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                CEO consultation notes
              </p>
              {clippedNotes.map((clip) => (
                <div key={clip.id} className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] text-[#cdd6f4] font-medium">{clip.title}</p>
                      <p className="text-[11px] text-[#585b70] mt-1">
                        Problem / Query
                      </p>
                      <p className="text-[12px] text-[#a6adc8] mt-1">{clip.query || "—"}</p>
                      <p className="text-[11px] text-[#585b70] mt-3">
                        Consultation category
                      </p>
                      <p className="text-[12px] text-[#cdd6f4] mt-1">{clip.category || "Other"}</p>
                      <p className="text-[11px] text-[#585b70] mt-3">
                        Consultation summary
                      </p>
                      <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">{clip.content}</p>
                      <p className="text-[11px] text-[#585b70] mt-3">
                        Recommended next steps
                      </p>
                      <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                        {clip.actionableSteps || "No steps captured yet."}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-[#585b70]">{clip.createdAt}</p>
                      <p className="text-[10px] mt-1 uppercase text-[#f9e2af]">
                        {clip.status || "pending"}
                      </p>
                      {clip.sessionId && (
                        <Link
                          href={`/library/sessions?session=${encodeURIComponent(clip.sessionId)}`}
                          className="text-[10px] text-[#89b4fa] hover:text-[#b4d0fb] mt-1 inline-block"
                        >
                          Open session
                        </Link>
                      )}
                      <div className="flex flex-col gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setClippedNotes(updateVaultClipStatus(clip.id, "kept"))}
                          className="px-3 py-1.5 rounded-lg bg-[#a6e3a1] text-[#1e1e2e] text-[11px] font-semibold"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          onClick={() => setClippedNotes(updateVaultClipStatus(clip.id, "trashed"))}
                          className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#f38ba8] text-[11px] font-semibold"
                        >
                          Trash
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decision categories */}
        <div className="space-y-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              By Category
            </h2>
            <div className="space-y-1.5">
              {["Strategy", "Finance", "Execution", "Governance", "Other"].map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#313244] cursor-pointer"
                >
                  <span className="text-[13px] text-[#cdd6f4]">{cat}</span>
                  <span className="text-[11px] text-[#585b70]">
                    {
                      decisions.filter((decision) =>
                        decision.tags.some((tag) =>
                          tag.toLowerCase().includes(cat.toLowerCase().slice(0, 5))
                        )
                      ).length
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-3">
              Way Back Machine
            </h2>
            <p className="text-[12px] text-[#585b70]">
              Compressed org history — decisions, priority shifts, outcomes — queryable on demand.
            </p>
            <p className="text-[11px] text-[#585b70] mt-2">
              {decisions.length} hardened decision records available now.
            </p>
          </div>
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-3">
              Related Sessions
            </h2>
            <div className="space-y-3">
              {sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="rounded-lg border border-[#313244] bg-[#181825] p-3">
                  <p className="text-[12px] text-[#cdd6f4] font-medium">{session.title}</p>
                  <p className="text-[11px] text-[#585b70] mt-1">{session.savedAt}</p>
                  <Link
                    href={`/library/sessions?session=${encodeURIComponent(session.id)}`}
                    className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb] mt-2 inline-block"
                  >
                    Read saved session
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
