import PageShell from "@/components/PageShell";
import RoleChat from "@/components/RoleChat";

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 ${className ?? ""}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
        {title}
      </h2>
      {children ?? (
        <div className="flex items-center justify-center h-20">
          <p className="text-[13px] text-[#585b70]">No items yet</p>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: "green" | "yellow" | "red" | "neutral";
}) {
  const dot: Record<typeof status, string> = {
    green: "bg-[#a6e3a1]",
    yellow: "bg-[#f9e2af]",
    red: "bg-[#f38ba8]",
    neutral: "bg-[#585b70]",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <div>
        <p className="text-[13px] text-[#cdd6f4]">{label}</p>
        <p className="text-[11px] text-[#585b70]">{detail}</p>
      </div>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[status]}`} />
    </div>
  );
}

function RiskFlag({ label, severity }: { label: string; severity: "high" | "medium" | "low" }) {
  const style: Record<typeof severity, string> = {
    high: "text-[#f38ba8] bg-[#f38ba8]/10",
    medium: "text-[#f9e2af] bg-[#f9e2af]/10",
    low: "text-[#a6e3a1] bg-[#a6e3a1]/10",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <span className="text-[13px] text-[#cdd6f4]">{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${style[severity]}`}>
        {severity}
      </span>
    </div>
  );
}

export default function LegalPage() {
  return (
    <PageShell title="Legal" subtitle="Contract triage, risk flags, and decision audit trail — surface layer only. Qualified legal counsel advises and acts.">
      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 bg-[#f9e2af]/5 border border-[#f9e2af]/20 rounded-xl px-5 py-4 mb-5">
        <span className="text-[#f9e2af] text-[16px] shrink-0 mt-0.5">⚠</span>
        <p className="text-[13px] text-[#f9e2af]/80 leading-relaxed">
          <span className="font-semibold text-[#f9e2af]">Not legal advice.</span>{" "}
          MAYA surfaces contract terms, risk flags, and compliance context for your awareness only. Qualified legal counsel reviews, advises, and acts on every matter. MAYA does not replace them.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* Contract Queue */}
          <SectionCard title="Contract Queue">
            <StatusRow label="Awaiting triage" detail="New contracts to review" status="neutral" />
            <StatusRow label="Non-standard clauses flagged" detail="Needs counsel review" status="neutral" />
            <StatusRow label="Renewals approaching" detail="30-day window" status="neutral" />
            <StatusRow label="Executed this month" detail="Closed contracts" status="neutral" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Add contracts to surface key terms and risk exposure in plain language
            </p>
          </SectionCard>

          {/* Compliance Posture */}
          <SectionCard title="Compliance Posture">
            <StatusRow label="Regulatory standing" detail="Industry compliance status" status="neutral" />
            <StatusRow label="Policy review cycle" detail="Last reviewed" status="neutral" />
            <StatusRow label="Data privacy obligations" detail="GDPR / CCPA / other" status="neutral" />
            <StatusRow label="Employment law flags" detail="Jurisdiction-specific" status="neutral" />
          </SectionCard>

          {/* Decision Audit Trail */}
          <SectionCard title="Decision Audit Trail">
            <div className="space-y-2">
              {[
                "Decisions logged with timestamp",
                "Owner attributed on each entry",
                "Cross-lens risk flags linked",
                "Available as legal defense asset",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <span className="text-[#89b4fa] mt-0.5 shrink-0">·</span>
                  <span className="text-[12px] text-[#a6adc8]">{point}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Trail builds as decisions are logged — feeds from the Decisions layer
            </p>
          </SectionCard>

          {/* Risk Flags */}
          <SectionCard title="Risk Flags">
            <RiskFlag label="Unreviewed contract exposure" severity="medium" />
            <RiskFlag label="Cross-lens compliance gap" severity="low" />
            <RiskFlag label="Jurisdiction mismatch" severity="low" />
            <div className="mt-3 text-center">
              <p className="text-[12px] text-[#585b70]">
                MAYA surfaces risk — qualified legal counsel advises and acts
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Right — MAYA Legal Agent */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="legal" />
        </div>
      </div>
    </PageShell>
  );
}
