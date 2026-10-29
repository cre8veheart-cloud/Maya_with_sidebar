"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { listHardenedIntelVaultRecords } from "@/lib/maya/libraryData";

const EXTERNAL_SOURCES = [
  {
    id: "pubmed",
    name: "PubMed",
    category: "Medical & Life Sciences",
    icon: "🔬",
    desc: "NIH biomedical literature database — clinical research, trials, peer-reviewed publications",
    industry: "Healthcare / Medical",
  },
  {
    id: "westlaw",
    name: "Westlaw",
    category: "Legal",
    icon: "⚖️",
    desc: "Comprehensive legal research — case law, statutes, regulations, legal analysis",
    industry: "Legal / Law",
  },
  {
    id: "bloomberg",
    name: "Bloomberg Terminal",
    category: "Finance",
    icon: "📊",
    desc: "Real-time financial data, market intelligence, and economic research",
    industry: "Finance / Investment",
  },
  {
    id: "factset",
    name: "FactSet",
    category: "Finance",
    icon: "📈",
    desc: "Financial data and analytics for investment professionals",
    industry: "Finance / Investment",
  },
  {
    id: "lexisnexis",
    name: "LexisNexis",
    category: "Legal & News",
    icon: "📰",
    desc: "Legal, news, and business information — case law, regulatory, public records",
    industry: "Legal / Compliance",
  },
  {
    id: "custom",
    name: "Custom Source",
    category: "User-defined",
    icon: "🔗",
    desc: "Connect any proprietary database, internal API, or domain-specific knowledge source",
    industry: "Any",
  },
];

type ConnectionStatus = "connected" | "available";

function SourceCard({
  source,
  status,
  onToggle,
}: {
  source: (typeof EXTERNAL_SOURCES)[number];
  status: ConnectionStatus;
  onToggle: () => void;
}) {
  return (
    <div
      className={[
        "bg-[#1e1e2e] border rounded-xl p-4 flex flex-col gap-3 transition-all",
        status === "connected"
          ? "border-[#89b4fa]/50"
          : "border-[#313244] hover:border-[#585b70]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{source.icon}</span>
          <div>
            <p className="text-[13px] font-semibold text-[#cdd6f4]">{source.name}</p>
            <p className="text-[10px] text-[#585b70]">{source.category}</p>
          </div>
        </div>
        {status === "connected" && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] inline-block" />
            <span className="text-[10px] text-[#a6e3a1]">Connected</span>
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#585b70] leading-relaxed">{source.desc}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] text-[#585b70] italic">{source.industry}</span>
        <button
          onClick={onToggle}
          className={[
            "text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors",
            status === "connected"
              ? "text-[#f38ba8] border border-[#f38ba8]/30 hover:bg-[#f38ba8]/10"
              : "text-[#89b4fa] border border-[#89b4fa]/30 hover:bg-[#89b4fa]/10",
          ].join(" ")}
        >
          {status === "connected" ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export default function IntelVaultPage() {
  const storedIntel = useMemo(() => listHardenedIntelVaultRecords(), []);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const toggleSource = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <PageShell
      title="Intel Vault"
      subtitle="Adaptive intelligence + external domain sources — the trained memory that makes Maya yours"
    >
      <div className="space-y-6">
        {/* Internal intel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              Stored Intel — Internal
            </h2>
            <div className="space-y-3">
              {storedIntel.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#cdd6f4]">{entry.title}</p>
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

          <div className="space-y-4">
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
                By Role
              </h2>
              <div className="space-y-2">
                {["CEO", "COO", "CFO", "CMO", "CTO", "CIO", "CRO", "CD"].map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#313244]"
                  >
                    <span className="text-[13px] text-[#cdd6f4]">{role}</span>
                    <span className="text-[11px] text-[#585b70]">
                      {storedIntel.filter((entry) => entry.roleScope === "all" || entry.roleScope.toUpperCase() === role).length} entries
                    </span>
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
          </div>
        </div>

        {/* External source connectors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#cdd6f4]">External Sources</h2>
              <p className="text-[13px] text-[#a6adc8] mt-0.5">
                Connect domain-specific knowledge bases — your industry, your sources
              </p>
            </div>
            {connected.size > 0 && (
              <span className="text-[12px] text-[#a6e3a1] border border-[#a6e3a1]/30 px-3 py-1 rounded-full">
                {connected.size} connected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXTERNAL_SOURCES.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                status={connected.has(source.id) ? "connected" : "available"}
                onToggle={() => toggleSource(source.id)}
              />
            ))}
          </div>

          <p className="mt-4 text-[12px] text-[#585b70]">
            External sources augment MAYA with domain expertise specific to your industry. Connection credentials are org-managed and never stored by MAYA.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
