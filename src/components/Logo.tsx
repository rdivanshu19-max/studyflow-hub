export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" fill="currentColor" opacity=".9" />
          <path d="M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z" fill="currentColor" opacity=".55" />
          <path d="M15.5 4h2.5v7l-1.25-1.4L15.5 11V4Z" fill="currentColor" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight text-foreground">
          BookFlux
        </span>
        {!compact && (
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            by Rankers
          </span>
        )}
      </span>
    </div>
  );
}
