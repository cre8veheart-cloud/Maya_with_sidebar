import PageShell from "@/components/PageShell";

const SANDBOX_STEPS = [
  "Define the tool objective, inputs, and the executive decision it should support.",
  "Constrain the sandbox with fixed data, safe actions, and explicit approval boundaries.",
  "Run the tool in isolation first, review outputs, then promote it into broader MAYA workflows only after it behaves consistently.",
];

export default function ToolSandboxPage() {
  return (
    <PageShell
      title="Tool Sandbox"
      subtitle="Design and pressure-test new tools inside a contained MAYA workspace before they ship into live operating flows."
    >
      <div className="grid gap-4 md:grid-cols-[1.4fr,0.9fr]">
        <section className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
            Sandbox workflow
          </p>
          <div className="mt-4 space-y-3">
            {SANDBOX_STEPS.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-[#313244] bg-[#181825] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#89b4fa] text-[11px] font-semibold text-[#1e1e2e]">
                    {index + 1}
                  </span>
                  <p className="text-[13px] leading-relaxed text-[#cdd6f4]">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
            Guardrails
          </p>
          <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-[#a6adc8]">
            <li>• Keep tool runs isolated from production memory and decisions until approved.</li>
            <li>• Limit the tool to sample inputs, reversible actions, and clearly scoped outputs.</li>
            <li>• Capture what worked, what failed, and what human approval is still required.</li>
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}
