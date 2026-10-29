"use client";

interface MainContentProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function MainContent({ isOpen, onToggle, children }: MainContentProps) {
  return (
    <main
      className={[
        "flex flex-col flex-1 min-w-0 w-full max-w-full h-screen overflow-x-hidden overflow-y-auto",
        "bg-[#1a1a2e] transition-all duration-300 ease-in-out",
      ].join(" ")}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#313244] bg-[#1e1e2e] sticky top-0 z-10">
        {!isOpen && (
          <button
            onClick={onToggle}
            aria-label="Open sidebar"
            className="p-1.5 rounded-md text-[#cdd6f4] hover:bg-[#313244] hover:text-[#89b4fa] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <span className="text-sm text-[#a6adc8] font-medium">Maya</span>
      </div>

      {/* Page content */}
      <div className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden p-4 md:p-6">
        {children}
      </div>
    </main>
  );
}
