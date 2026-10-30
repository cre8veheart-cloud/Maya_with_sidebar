import PageShell from "@/components/PageShell";

function CampaignRow({
  name,
  phase,
  owner,
  status,
}: {
  name: string;
  phase: string;
  owner: string;
  status: "active" | "planning" | "complete";
}) {
  const badge: Record<typeof status, string> = {
    active: "text-[#a6e3a1] bg-[#a6e3a1]/10",
    planning: "text-[#f9e2af] bg-[#f9e2af]/10",
    complete: "text-[#585b70] bg-[#313244]",
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#313244] last:border-0">
      <div>
        <p className="text-[13px] text-[#cdd6f4] font-medium">{name}</p>
        <p className="text-[11px] text-[#585b70]">{phase} · {owner}</p>
      </div>
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge[status]}`}>
        {status}
      </span>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <PageShell
      title="Campaigns"
      subtitle="Cross-functional campaign execution — each exec contributes their piece"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Campaign list */}
        <div className="md:col-span-2 bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
            Active Campaigns
          </h2>
          <CampaignRow
            name="Campaigns are reactive to your Decisions layer"
            phase="Start in Decisions"
            owner="All roles"
            status="planning"
          />
          <div className="mt-6 flex items-center justify-center">
            <p className="text-[12px] text-[#585b70] text-center max-w-xs">
              Vendor lists, subcontractors, and production rosters pull from your Decisions vault — not hardcoded
            </p>
          </div>
        </div>

        {/* Campaign phases */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
            Phase Contributions
          </h2>
          <div className="space-y-2">
            {[
              { role: "CMO", phase: "Brief & strategy" },
              { role: "CFO", phase: "Budget approval" },
              { role: "CRO", phase: "Revenue targets" },
              { role: "COO", phase: "Resource & vendor" },
              { role: "CD", phase: "Production & traffic" },
            ].map(({ role, phase }) => (
              <div
                key={role}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[#313244]"
              >
                <span className="text-[11px] text-[#89b4fa] font-bold w-8">{role}</span>
                <span className="text-[12px] text-[#a6adc8]">{phase}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic view */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
          Traffic — Asset Deadlines
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[#585b70] text-left border-b border-[#313244]">
                <th className="pb-2 font-medium">Asset</th>
                <th className="pb-2 font-medium">Campaign</th>
                <th className="pb-2 font-medium">Owner</th>
                <th className="pb-2 font-medium">Due</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="pt-4 text-center text-[#585b70]">
                  Assets populate when campaigns are created from Decisions
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
