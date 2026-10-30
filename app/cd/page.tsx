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

function PhaseRow({ phase, owner, status }: { phase: string; owner: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <div>
        <p className="text-[13px] text-[#cdd6f4] font-medium">{phase}</p>
        <p className="text-[11px] text-[#585b70]">{owner}</p>
      </div>
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#313244] text-[#a6adc8]">{status}</span>
    </div>
  );
}

function DeadlineRow({ asset, due }: { asset: string; due: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <span className="text-[13px] text-[#cdd6f4]">{asset}</span>
      <span className="text-[12px] text-[#585b70]">{due}</span>
    </div>
  );
}

export default function CdPage() {
  return (
    <PageShell title="CD" subtitle="Brief to final deliverable — creative integrity, production reality, and the execution chain that makes it real.">
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        {/* Left — Dashboard */}
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          {/* Active Campaigns */}
          <SectionCard title="Active Campaigns">
            <div className="flex items-center justify-center h-12">
              <p className="text-[12px] text-[#585b70]">Campaigns link from the Campaigns layer</p>
            </div>
          </SectionCard>

          {/* Production Phases */}
          <SectionCard title="Production Phases">
            <PhaseRow phase="Brief & Strategy" owner="CMO / Account" status="not started" />
            <PhaseRow phase="Concepting" owner="Creative team" status="not started" />
            <PhaseRow phase="Pre-production" owner="CD / Traffic" status="not started" />
            <PhaseRow phase="Production" owner="Vendors" status="not started" />
            <PhaseRow phase="Review & Delivery" owner="Account / Client" status="not started" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              CD owns the production flow — traffic is a creative function, not a PM function
            </p>
          </SectionCard>

          {/* Brief Queue */}
          <SectionCard title="Brief Queue">
            <div className="space-y-2">
              {[
                "Awaiting brief approval",
                "Brief in revision",
                "Brief approved — concepting",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#89b4fa] mt-0.5 shrink-0">·</span>
                  <span className="text-[12px] text-[#585b70]">{item} — none</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              A great brief produces better creative than a great team with a bad brief
            </p>
          </SectionCard>

          {/* Traffic & Deadlines */}
          <SectionCard title="Traffic & Deadlines">
            <DeadlineRow asset="Add an asset" due="No deadline set" />
            <DeadlineRow asset="Add an asset" due="No deadline set" />
            <DeadlineRow asset="Add an asset" due="No deadline set" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Vendor availability is a scheduling input — not an afterthought
            </p>
          </SectionCard>
        </div>

        {/* Right — MAYA CD Agent */}
        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="cd" />
        </div>
      </div>
    </PageShell>
  );
}
