import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Verdict } from "@/types/common";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "outline"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] font-mono-tabular",
        tone === "neutral" && "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
        tone === "accent" && "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-dim-strong)]",
        tone === "outline" && "border border-[var(--color-border-strong)] text-[var(--color-text-primary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

const VERDICT_STYLE: Record<Verdict, string> = {
  BUY: "text-[var(--color-accent)] border-[var(--color-accent)] bg-[var(--color-accent-dim)]",
  WATCH: "text-[var(--color-text-primary)] border-[var(--color-border-strong)] bg-[var(--color-bg-hover)]",
  PASS: "text-[var(--color-text-tertiary)] border-[var(--color-border)] bg-transparent",
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] font-mono-tabular",
        VERDICT_STYLE[verdict],
        className,
      )}
    >
      {verdict}
    </span>
  );
}
