"use client";

interface AgentWorkspaceProps {
  name: string;
  title: string;
  mission: string;
  placeholder: string;
}

export default function AgentWorkspace({ name, title, mission, placeholder }: AgentWorkspaceProps) {
  return (
    <main className="min-h-screen flex flex-col bg-[#11111b] text-[#cdd6f4]">
      <header className="border-b border-[#313244] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-label="active" />
          <div>
            <h1 className="text-xl font-semibold">{name}</h1>
            <p className="text-sm text-[#a6adc8]">{title}</p>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-[#a6adc8]">{mission}</p>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl rounded-2xl border border-[#313244] bg-[#181825] p-5 shadow-sm">
          <div className="min-h-[280px] text-sm text-[#6c7086] flex items-center justify-center text-center">
            {name} workspace is ready for conversation, tools, and role-specific workflows.
          </div>
          <div className="border-t border-[#313244] pt-4">
            <textarea
              aria-label={`Message ${name}`}
              placeholder={placeholder}
              className="min-h-[96px] w-full resize-none rounded-xl border border-[#45475a] bg-[#11111b] p-4 text-sm text-[#cdd6f4] outline-none placeholder:text-[#585b70] focus:border-[#89b4fa]"
            />
            <p className="mt-2 text-xs text-[#585b70]">
              Action authority remains approval-gated until tools are explicitly connected.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
