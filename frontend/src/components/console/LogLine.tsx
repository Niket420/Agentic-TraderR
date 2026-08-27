import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/formatters";
import type { LogEntry } from "@/types/common";

const LEVEL_STYLE: Record<LogEntry["level"], string> = {
  info: "text-[var(--color-text-tertiary)]",
  running: "text-[var(--color-accent)]",
  success: "text-[var(--color-text-primary)]",
  warning: "text-[var(--color-status-warning)] font-semibold",
  error: "text-[var(--color-accent)] font-bold",
};

const LEVEL_TAG: Record<LogEntry["level"], string> = {
  info: "·",
  running: "▶",
  success: "✓",
  warning: "!",
  error: "✕",
};

export function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex items-baseline gap-3 px-4 py-[3px] font-mono-tabular text-[11.5px] leading-relaxed hover:bg-[var(--color-bg-hover)]">
      <span className="shrink-0 text-[var(--color-text-disabled)]">{formatTime(entry.timestamp)}</span>
      <span className={cn("w-3 shrink-0 text-center", LEVEL_STYLE[entry.level])}>{LEVEL_TAG[entry.level]}</span>
      <span className="w-16 shrink-0 font-bold tracking-[0.06em] text-[var(--color-text-secondary)]">{entry.source}</span>
      <span className={cn("truncate", entry.level === "error" || entry.level === "warning" ? LEVEL_STYLE[entry.level] : "text-[var(--color-text-primary)]")}>{entry.message}</span>
    </div>
  );
}
