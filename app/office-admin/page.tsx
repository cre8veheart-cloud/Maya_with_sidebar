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

function AgendaRow({
  time,
  label,
  flag,
}: {
  time: string;
  label: string;
  flag?: "prep-gap" | "double-book" | "travel" | null;
}) {
  const flagStyle: Record<string, string> = {
    "prep-gap": "text-[#f9e2af] bg-[#f9e2af]/10",
    "double-book": "text-[#f38ba8] bg-[#f38ba8]/10",
    "travel": "text-[#89b4fa] bg-[#89b4fa]/10",
  };
  const flagLabel: Record<string, string> = {
    "prep-gap": "prep gap",
    "double-book": "double-book",
    "travel": "travel time",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] text-[#585b70] shrink-0 w-12">{time}</span>
        <span className="text-[13px] text-[#cdd6f4] truncate">{label}</span>
      </div>
      {flag && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${flagStyle[flag]}`}>
          {flagLabel[flag]}
        </span>
      )}
    </div>
  );
}

function DraftRow({ label, recipient }: { label: string; recipient: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] text-[#cdd6f4] font-medium truncate">{label}</p>
        <p className="text-[11px] text-[#585b70]">To: {recipient}</p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f9e2af]/10 text-[#f9e2af] font-medium shrink-0 ml-3">
        Awaiting approval
      </span>
    </div>
  );
}

function ActionRow({ label, source }: { label: string; source: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#313244] last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] text-[#cdd6f4] truncate">{label}</p>
        <p className="text-[11px] text-[#585b70]">From: {source}</p>
      </div>
    </div>
  );
}

export default function OfficeAdminPage() {
  return (
    <PageShell
      title="Admin Secretary"
      subtitle="The executive coordination backbone — organizes, drafts, tracks, and surfaces what needs attention. Draft freely; send or schedule nothing without approval."
    >
      <div className="flex flex-col xl:flex-row gap-5 h-full">
        <div className="flex flex-col gap-5 xl:w-[420px] shrink-0">
          <SectionCard title="Today's Agenda">
            <AgendaRow time="—" label="Add calendar context to surface prep gaps" />
            <AgendaRow time="—" label="Double-books and travel time flagged automatically" />
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Connects to MS365 / Google Workspace when configured
            </p>
          </SectionCard>

          <SectionCard title="Pending Drafts">
            <DraftRow label="No drafts awaiting approval yet" recipient="—" />
            <div className="mt-3 space-y-1.5">
              {["Offer letters", "PIPs & performance comms", "Board updates", "Vendor communications"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-[#89b4fa] shrink-0">·</span>
                  <span className="text-[12px] text-[#a6adc8]">{type}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              All drafts require exec approval before any outbound action
            </p>
          </SectionCard>

          <SectionCard title="Action Queue">
            <ActionRow label="Actions extract from sessions automatically" source="Strategy Room / Exec sessions" />
            <div className="mt-3 text-center">
              <p className="text-[12px] text-[#585b70]">
                Owners, deadlines, and follow-ups surfaced — linked to Decisions layer
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Integrations">
            <div className="space-y-2">
              {[
                { name: "Microsoft 365", status: "Not connected" },
                { name: "Google Workspace", status: "Not connected" },
                { name: "Calendar", status: "Not connected" },
                { name: "Email drafts", status: "Not connected" },
              ].map(({ name, status }) => (
                <div key={name} className="flex items-center justify-between py-1.5 border-b border-[#313244] last:border-0">
                  <span className="text-[13px] text-[#cdd6f4]">{name}</span>
                  <span className="text-[11px] text-[#585b70]">{status}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#585b70] text-center">
              Integrations connect in Settings — MAYA never stores credentials
            </p>
          </SectionCard>
        </div>

        <div className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden min-h-[520px] xl:min-h-0">
          <RoleChat role="admin" />
        </div>
      </div>
    </PageShell>
  );
}
