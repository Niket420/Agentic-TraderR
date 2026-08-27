import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "command" | "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function Button({ variant = "outline", size = "md", icon, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-mono-tabular font-semibold uppercase tracking-[0.08em] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
        size === "sm" && "text-[11px] px-2.5 py-1.5 rounded-[var(--radius-sm)]",
        size === "md" && "text-xs px-4 py-2.5 rounded-[var(--radius-sm)]",
        size === "lg" && "text-sm px-6 py-3.5 rounded-[var(--radius-md)] tracking-[0.12em]",
        variant === "command" && "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:opacity-90 border border-[var(--color-accent)]",
        variant === "primary" && "bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 border border-[var(--color-text-primary)]",
        variant === "outline" && "border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
        variant === "ghost" && "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
