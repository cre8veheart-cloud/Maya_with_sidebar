"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { getRoleLabel, isExecRole } from "@/lib/maya/execRouting";
import {
  listHardenedKnowledgeRecords,
  loadVaultClips,
  type MayaVaultClip,
} from "@/lib/maya/libraryData";

const VAULT_TYPES = ["All", "Overrides", "Context", "Decisions", "Scope", "Other"];

export default function KnowledgePage() {
  const entries = useMemo(() => listHardenedKnowledgeRecords(), []);
  const [clips, setClips] = useState<MayaVaultClip[]>([]);
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");
  useEffect(() => {
    setClips(loadVaultClips("knowledge"));
  }, []);
  const filteredEntries = entries.filter((entry) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [entry.title, entry.summary, entry.content, entry.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesType =
      activeType === "All" ||
      entry.tags.some((tag) => tag.toLowerCase().includes(activeType.toLowerCase()));
    return matchesQuery && matchesType;
  });

  return (
    <PageShell
      title="Knowledge Vault"
      subtitle="Protected org knowledge — decisions, context, and institutional memory"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-[#585b70]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge vault…"
              className="flex-1 bg-transparent text-[13px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {VAULT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={[
                  "text-[11px] font-semibold px-3 py-1 rounded-full transition-colors",
                  activeType === t
                    ? "bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/40"
                    : "bg-[#1e1e2e] border border-[#313244] text-[#585b70] hover:text-[#cdd6f4]",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Entries */}
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              Stored Knowledge
            </h2>
            <div className="space-y-3">
              {clips.map((clip) => (
                <div key={clip.id} className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] text-[#cdd6f4] font-medium">{clip.title}</p>
                      <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">{clip.content}</p>
                    </div>
                    <span className="text-[10px] text-[#585b70] shrink-0">{clip.createdAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa]">
                      clipped-discussion
                    </span>
                    {clip.clippedBy && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#a6adc8]">
                        clipped by {getRoleLabel(clip.clippedBy)}
                      </span>
                    )}
                    {clip.assignedRoles?.filter(isExecRole).map((role) => {
                      return (
                        <span
                          key={`${clip.id}-${role}`}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa] hover:text-[#b4d0fb]"
                        >
                          route to {getRoleLabel(role)}
                        </span>
                      );
                    })}
                  </div>
                  {clip.clipComment && (
                    <div className="mt-3">
                      <p className="text-[11px] text-[#585b70]">Clipper comment</p>
                      <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                        {clip.clipComment}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {clip.sessionId && (
                      <Link
                        href={`/library/sessions?session=${encodeURIComponent(clip.sessionId)}`}
                        className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                      >
                        Open full session
                      </Link>
                    )}
                    {clip.vendorUrl && (
                      <a
                        href={clip.vendorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                      >
                        {clip.vendorName ? `Vendor · ${clip.vendorName}` : "Open vendor link"}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] text-[#cdd6f4] font-medium">{entry.title}</p>
                      <p className="text-[12px] text-[#a6adc8] mt-1">{entry.summary}</p>
                    </div>
                    <span className="text-[10px] text-[#585b70] shrink-0">{entry.updatedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#313244] text-[#a6adc8]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              Vault Stats
            </h2>
            <div className="space-y-3">
              {[
                { label: "Entries", value: `${entries.length + clips.length}` },
                { label: "Roles covered", value: "2" },
                { label: "Overrides stored", value: `${entries.filter((entry) => entry.tags.includes("overrides")).length}` },
                { label: "Context notes", value: `${entries.filter((entry) => entry.tags.includes("memory") || entry.tags.includes("board")).length + clips.length}` },
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

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-3">
              Access Control
            </h2>
            <p className="text-[12px] text-[#585b70]">
              Vault access is org-controlled. VPN integration available in Phase 2.
            </p>
          </div>

          {/* Way Back Machine */}
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">⏪</span>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Way Back Machine
              </h2>
            </div>
            <p className="text-[12px] text-[#a6adc8] leading-relaxed">
              A compressed, queryable record of your org over time — decisions, priority shifts, role overrides, outcomes.
            </p>
            <p className="text-[12px] text-[#585b70] mt-2">
              Retrieved on demand, not loaded wholesale. Browsable as your vault grows.
            </p>
            <p className="text-[11px] text-[#585b70] mt-3 italic">
              {entries.length} hardened knowledge records are queryable now.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
