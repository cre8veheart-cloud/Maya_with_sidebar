interface PageShellProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  action,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-full w-full min-w-0 max-w-5xl overflow-x-hidden px-1 py-3 pb-[max(6rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-6 sm:pb-6 lg:px-8 lg:py-10 lg:pb-10">
      <div className="flex min-w-0 items-start justify-between gap-3 mb-4 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold text-[#cdd6f4] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-full break-words text-[14px] text-[#a6adc8]">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
