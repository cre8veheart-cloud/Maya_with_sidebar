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

function CampaignRow({ name, stage }: { name: string; stage: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <span className="text-[13px] text-[#cdd6f4]">{name}</span>
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa]">{stage}</span>
    </div>
  );
}

export default function CmoPage() {
  return (
    <PageShell title="Erica · CMO" subtitle="Brand, market intelligence, integrated communications, partnerships, and measurable growth.">
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* Market Pulse */}
          <SectionCard title="Market Pulse">
            <PulseRow label="Brand awareness signal" detail="Aided / unaided recognition" status="neutral" />
            <PulseRow label="NPS / sentiment" detail="Customer perception" status="neutral" />
            <PulseRow label="Pipeline contribution" detail="Marketing-sourced pipeline" status="neutral" />
            <PulseRow label="Market share signal" detail="Competitive position" status="neutral" />
          </SectionCard>

          {/* Active Campaigns */}
          <SectionCard title="Active Campaigns">
            <CampaignRow name="Add a campaign" stage="Planning" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Campaigns link to the Campaigns layer — each has a brief, owner, and budget
            </p>
          </SectionCard>

          {/* Positioning & Messaging */}
          <SectionCard title="Positioning & Messaging">
            <div className="space-y-2">
              {[
                "Core positioning statement",
                "Primary buyer persona",
                "Key differentiators",
                "Competitive framing",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <span className="text-[#89b4fa] mt-0.5 shrink-0">·</span>
                  <span className="text-[12px] text-[#585b70]">{point} — not set</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              MAYA holds and evolves positioning as you train it on your market
            </p>
          </SectionCard>

          {/* Demand & Pipeline */}
          <SectionCard title="Demand & Pipeline">
            <PulseRow label="MQLs this period" detail="Marketing qualified leads" status="neutral" />
            <PulseRow label="MQL → SQL conversion" detail="Handoff quality signal" status="neutral" />
            <PulseRow label="Content attribution" detail="Touches to pipeline" status="neutral" />
            <PulseRow label="CAC (marketing portion)" detail="Cost per acquired customer" status="neutral" />
          </SectionCard>
        </div>

        {/* Right — Erica, MAYA CMO */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="cmo" />
        </div>
      </div>
    </PageShell>
  );
}
