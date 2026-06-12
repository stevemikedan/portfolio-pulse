"use client";

export interface SourceStatus {
  label: string;
  active: boolean;
}

interface AppHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
  lastUpdated?: Date | null;
  sources: SourceStatus[];
}

function timeAgo(date: Date | null | undefined): string {
  if (!date) return "—";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PulseLogo() {
  return (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 12h3.5l2-6 4 12 2.5-9 1.5 3H21" />
      </svg>
    </div>
  );
}

export function AppHeader({ onRefresh, refreshing, lastUpdated, sources }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* identity + actions */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <PulseLogo />
            <div>
              <h1 className="text-base font-semibold leading-tight tracking-tight">
                Portfolio Pulse
              </h1>
              <p className="text-[0.7rem] text-[var(--text-3)] leading-tight">
                Personal work-rhythm dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[0.7rem] text-[var(--text-3)] hidden sm:inline">
              Updated {timeAgo(lastUpdated)}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className={refreshing ? "inline-block animate-spin" : "inline-block"}>↻</span>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
        {/* hero: value statement + source chips */}
        <div className="pb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-xs sm:text-sm text-[var(--text-2)] max-w-2xl leading-relaxed">
            See what you should be doing, what you&apos;re actually doing, and where the gaps
            are — your assignments and your real dev activity, side by side.
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[0.6rem] text-[var(--text-3)] mr-0.5">Sources:</span>
            {sources.map((s) => (
              <span
                key={s.label}
                title={s.active ? `${s.label}: connected` : `${s.label}: not connected`}
                className={`flex items-center gap-1 text-[0.6rem] px-1.5 py-0.5 rounded border ${
                  s.active
                    ? "border-emerald-500/30 text-emerald-400"
                    : "border-[var(--border)] text-[var(--text-3)]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.active ? "bg-emerald-400" : "bg-[var(--text-3)]/40"
                  }`}
                />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
