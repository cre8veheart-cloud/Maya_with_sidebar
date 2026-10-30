import PageShell from "@/components/PageShell";
import RoleChat from "@/components/RoleChat";
import CtoWorkflow from "@/components/CtoWorkflow";

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
        <div className="flex items-center justify-center h-16">
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

function BetRow({ name, type, risk }: { name: string; type: string; risk: "low" | "medium" | "high" }) {
  const riskColor: Record<typeof risk, string> = {
    low: "text-[#a6e3a1]",
    medium: "text-[#f9e2af]",
    high: "text-[#f38ba8]",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <div>
        <p className="text-[13px] text-[#cdd6f4] font-medium">{name}</p>
        <p className="text-[11px] text-[#585b70]">{type}</p>
      </div>
      <span className={`text-[11px] font-medium ${riskColor[risk]}`}>{risk}</span>
    </div>
  );
}

export default function CtoPage() {
  return (
    <PageShell title="Ari · CTO" subtitle="Architecture, engineering, security, adjudication, continuity, and reliable delivery.">
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          <CtoWorkflow />

          {/* Platform Health */}
          <SectionCard title="Platform Health">
            <StatusRow label="Core infrastructure" detail="Uptime & reliability" status="green" />
            <StatusRow label="Technical debt index" detail="Estimated carry cost" status="neutral" />
            <StatusRow label="Scale readiness" detail="Next growth phase" status="neutral" />
            <StatusRow label="Security posture" detail="Vulnerabilities / patches" status="neutral" />
          </SectionCard>

          {/* Engineering Pulse */}
          <SectionCard title="Engineering Pulse">
            <StatusRow label="Delivery velocity" detail="Sprint / cycle throughput" status="neutral" />
            <StatusRow label="Active blockers" detail="Cross-team dependencies" status="neutral" />
            <StatusRow label="Team health" detail="Psych safety & morale signals" status="neutral" />
            <StatusRow label="On-call load" detail="Incidents last 14 days" status="green" />
          </SectionCard>

          {/* Active Platform Bets */}
          <SectionCard title="Active Platform Bets">
            <BetRow name="Add a decision" type="Build / Buy / Partner" risk="low" />
            <div className="mt-3 text-center">
              <p className="text-[12px] text-[#585b70]">Bets link to Decisions layer</p>
            </div>
          </SectionCard>

          {/* Tech Budget */}
          <SectionCard title="Tech Budget">
            <div className="space-y-3">
              {[
                { label: "Infrastructure & cloud" },
                { label: "Tooling & licences" },
                { label: "Security & compliance" },
                { label: "Engineering headcount" },
              ].map(({ label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#585b70]">{label}</span>
                  <div className="h-1.5 bg-[#313244] rounded-full">
                    <div className="h-full bg-[#89b4fa] rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-[12px] text-[#a6adc8]">Not set</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right — Ari, MAYA CTO */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="cto" />
        </div>
      </div>
    </PageShell>
  );
}
