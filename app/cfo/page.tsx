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

function MetricRow({
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
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${style[severity]}`}>{severity}</span>
    </div>
  );
}

export default function CfoPage() {
  return (
    <PageShell title="Dana · CFO" subtitle="Financial integrity, forensic review, disciplined capital allocation, and the math beneath every decision.">
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* Financial Snapshot */}
          <SectionCard title="Financial Snapshot">
            <MetricRow label="ARR / MRR" detail="Annualized recurring revenue" status="neutral" />
            <MetricRow label="Burn rate" detail="Monthly net cash outflow" status="neutral" />
            <MetricRow label="Cash on hand" detail="Current balance" status="neutral" />
            <MetricRow label="Runway" detail="Months at current burn" status="neutral" />
          </SectionCard>

          {/* Budget vs. Actuals */}
          <SectionCard title="Budget vs. Actuals">
            <div className="space-y-3">
              {[
                { label: "Revenue", detail: "vs. plan" },
                { label: "COGS", detail: "vs. plan" },
                { label: "OpEx", detail: "vs. plan" },
                { label: "Headcount cost", detail: "vs. plan" },
              ].map(({ label, detail }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-[#cdd6f4]">{label}</p>
                    <p className="text-[11px] text-[#585b70]">{detail}</p>
                  </div>
                  <span className="text-[12px] text-[#585b70]">—</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Unit Economics */}
          <SectionCard title="Unit Economics">
            <MetricRow label="CAC" detail="Customer acquisition cost" status="neutral" />
            <MetricRow label="LTV" detail="Customer lifetime value" status="neutral" />
            <MetricRow label="LTV : CAC ratio" detail="Target ≥ 3x" status="neutral" />
            <MetricRow label="Gross margin" detail="Revenue minus COGS" status="neutral" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Unit economics update as org context is added
            </p>
          </SectionCard>

          {/* Risk Flags */}
          <SectionCard title="Financial Risk Flags">
            <RiskFlag label="Runway below 6 months" severity="high" />
            <RiskFlag label="CAC payback period extended" severity="medium" />
            <RiskFlag label="Revenue concentration risk" severity="medium" />
            <div className="mt-3 text-center">
              <p className="text-[12px] text-[#585b70]">
                Flags surface as financial context is added — MAYA identifies exposure, CFO advises
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Right — Dana, MAYA CFO */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="cfo" />
        </div>
      </div>
    </PageShell>
  );
}
