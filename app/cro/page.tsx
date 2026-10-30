import PageShell from "@/components/PageShell";
import RoleChat from "@/components/RoleChat";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
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

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <span className="text-[13px] text-[#cdd6f4]">{label}</span>
      <span className="text-[13px] text-[#585b70]">{value}</span>
    </div>
  );
}

function PulseRow({
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

export default function CroPage() {
  return (
    <PageShell title="CRO" subtitle="Pipeline, conversion, and the full revenue system — where revenue is created, where it leaks, and what's the rate-limiting step.">
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* Revenue Pulse */}
          <SectionCard title="Revenue Pulse">
            <MetricRow label="ARR / MRR" value="—" />
            <MetricRow label="Pipeline value" value="—" />
            <MetricRow label="Win rate" value="—" />
            <MetricRow label="Churn rate" value="—" />
          </SectionCard>

          {/* Pipeline by Stage */}
          <SectionCard title="Pipeline by Stage">
            <div className="space-y-2.5">
              {["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won"].map((stage) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#a6adc8] w-24 shrink-0">{stage}</span>
                  <div className="flex-1 h-1.5 bg-[#313244] rounded-full">
                    <div className="h-full bg-[#89b4fa] rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-[12px] text-[#585b70] w-4 text-right">0</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Forecast & Reliability */}
          <SectionCard title="Forecast & Reliability">
            <PulseRow label="Forecast accuracy" detail="Predicted vs. actual close rate" status="neutral" />
            <PulseRow label="Commit vs. best case" detail="Sales team confidence signal" status="neutral" />
            <PulseRow label="Average deal cycle" detail="Days from qualified to close" status="neutral" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Forecast reliability is a leading indicator of sales team health
            </p>
          </SectionCard>

          {/* Renewal & Expansion */}
          <SectionCard title="Renewal & Expansion">
            <PulseRow label="Renewals this quarter" detail="At-risk accounts flagged" status="neutral" />
            <PulseRow label="Net revenue retention" detail="Expansion minus churn" status="neutral" />
            <PulseRow label="Expansion pipeline" detail="Upsell / cross-sell in motion" status="neutral" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Retention is cheaper than acquisition — expansion is cheaper than both
            </p>
          </SectionCard>
        </div>

        {/* Right — MAYA CRO Agent */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="cro" />
        </div>
      </div>
    </PageShell>
  );
}
