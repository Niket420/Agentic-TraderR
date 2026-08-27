import { cn } from "@/lib/cn";
import type { NodeStatus } from "@/types/common";

const COLOR_MAP: Record<NodeStatus, string> = {
  idle: "bg-[var(--color-text-disabled)]",
  waiting: "bg-[var(--color-text-tertiary)]",
  running: "bg-[var(--color-status-running)]",
  completed: "bg-[var(--color-status-success)]",
  failed: "bg-[var(--color-status-error)]",
};

export function StatusDot({ status, size = 6 }: { status: NodeStatus; size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {status === "running" && (
        <span
          className={cn("absolute inline-flex rounded-full", COLOR_MAP[status])}
          style={{ width: size, height: size, animation: "pulse-ring 1.4s cubic-bezier(0.4,0,0.6,1) infinite" }}
        />
      )}
      <span
        className={cn("relative inline-flex rounded-full", COLOR_MAP[status])}
        style={{ width: size, height: size, animation: status === "running" ? "blink-dot 1.4s ease-in-out infinite" : undefined }}
      />
    </span>
  );
}
