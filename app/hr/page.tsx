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

function PulseRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
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
      <span className="text-[13px] text-[#cdd6f4]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#a6adc8]">{value}</span>
        <span className={`w-2 h-2 rounded-full ${dot[status]}`} />
      </div>
    </div>
  );
}

function FlagRow({ label, category }: { label: string; category: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <span className="text-[13px] text-[#cdd6f4]">{label}</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f9e2af]/10 text-[#f9e2af] font-medium">
        {category}
      </span>
    </div>
  );
}

export default function HrPage() {
  return (
    <PageShell title="HR" subtitle="People decisions, org health, and compliance — surface layer only. Exec and HR professionals make every final call.">
      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 bg-[#f9e2af]/5 border border-[#f9e2af]/20 rounded-xl px-5 py-4 mb-5">
        <span className="text-[#f9e2af] text-[16px] shrink-0 mt-0.5">⚠</span>
        <p className="text-[13px] text-[#f9e2af]/80 leading-relaxed">
          <span className="font-semibold text-[#f9e2af]">Not HR or legal advice.</span>{" "}
          MAYA surfaces information and flags for your awareness only. Your qualified HR professionals and legal counsel advise and make every final determination. MAYA does not replace them.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* People Pulse */}
          <SectionCard title="People Pulse">
            <PulseRow label="Total headcount" value="—" status="neutral" />
            <PulseRow label="Open roles" value="—" status="neutral" />
            <PulseRow label="30-day attrition" value="—" status="neutral" />
            <PulseRow label="Active PIPs" value="—" status="neutral" />
          </SectionCard>

          {/* Org Health */}
          <SectionCard title="Org Health">
            <PulseRow label="Engagement signal" value="—" status="neutral" />
            <PulseRow label="Team capacity gaps" value="—" status="neutral" />
            <PulseRow label="Manager span of control" value="—" status="neutral" />
            <PulseRow label="Succession coverage" value="—" status="neutral" />
          </SectionCard>

          {/* Headcount & Roles */}
          <SectionCard title="Headcount & Roles">
            <div className="space-y-3">
              {[
                "Approved headcount",
                "Pending approvals",
                "Budget vs. actuals",
                "Contractor spend",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#cdd6f4]">{item}</span>
                  <span className="text-[12px] text-[#585b70]">—</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Headcount links to Decisions layer — hiring triggers budget and onboarding
            </p>
          </SectionCard>

          {/* Compliance Flags */}
          <SectionCard title="Compliance Flags">
            <FlagRow label="I-9 / employment eligibility" category="Compliance" />
            <FlagRow label="Performance documentation" category="HR" />
            <FlagRow label="Policy acknowledgments due" category="Compliance" />
            <div className="mt-3 text-center">
              <p className="text-[12px] text-[#585b70]">
                Flags surface as org context is added — MAYA never advises in place of qualified HR counsel
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Right — MAYA HR Agent */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="hr" />
        </div>
      </div>
    </PageShell>
  );
}
