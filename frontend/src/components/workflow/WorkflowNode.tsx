import { Handle, Position, type NodeProps } from "reactflow";
import { Check, X, type LucideIcon } from "lucide-react";
import { formatTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { NodeStatus } from "@/types/common";

export interface WorkflowNodeData {
  label: string;
  hint?: string;
  status: NodeStatus;
  detail?: string;
  resultLabel?: string;
  completedAt?: string;
  icon: LucideIcon;
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  idle: "IDLE",
  waiting: "WAITING",
  running: "RUNNING",
  completed: "COMPLETED",
  failed: "FAILED",
};

function IconBadge({ Icon, status }: { Icon: LucideIcon; status: NodeStatus }) {
  const dim = status === "idle" || status === "waiting";
  return (
    <div className="relative shrink-0">
      {status === "running" && (
        <span className="absolute -inset-[3px] animate-spin rounded-full border-2 border-transparent border-t-[var(--color-accent)] border-r-[var(--color-accent)]" />
      )}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300",
          status === "running" && "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
          status === "completed" && "border-[var(--color-border-strong)] bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]",
          status === "failed" && "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
          dim && "border-[var(--color-border)] text-[var(--color-text-disabled)]",
        )}
      >
        <Icon size={15} strokeWidth={2.1} />
      </div>
      {status === "completed" && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] ring-2 ring-[var(--color-bg-elevated)]">
          <Check size={9} strokeWidth={3} />
        </span>
      )}
      {status === "failed" && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] ring-2 ring-[var(--color-bg-elevated)]">
          <X size={9} strokeWidth={3} />
        </span>
      )}
    </div>
  );
}

export function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  const { label, hint, status, detail, resultLabel, completedAt, icon } = data;
  const dim = status === "idle" || status === "waiting";

  return (
    <div
      className={cn(
        "relative w-[226px] overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-bg-elevated)] px-3.5 py-3 transition-shadow duration-300",
        status === "running" && "border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]",
        status === "completed" && "border-[var(--color-border-strong)]",
        status === "failed" && "border-[var(--color-accent)]",
        dim && "border-[var(--color-border)]",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-border-strong)] !border-none !w-1.5 !h-1.5" />

      <div className="flex items-start gap-2.5">
        <IconBadge Icon={icon} status={status} />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className={cn("text-[11px] font-bold uppercase tracking-[0.06em] leading-tight", dim ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]")}>{label}</p>
          <p className="mt-0.5 font-mono-tabular text-[9px] tracking-[0.1em] text-[var(--color-text-disabled)]">{STATUS_LABEL[status]}</p>
        </div>
      </div>

      <div className="mt-2 min-h-[30px]">
        {dim && hint && <p className="text-[10.5px] leading-snug text-[var(--color-text-disabled)]">{hint}</p>}
        {status === "running" && detail && <p className="text-[10.5px] leading-snug text-[var(--color-accent)]">{detail}</p>}
        {status === "failed" && detail && <p className="text-[10.5px] leading-snug text-[var(--color-accent)]">{detail}</p>}
        {status === "completed" && (
          <div className="flex items-center justify-between">
            {resultLabel && <span className="font-mono-tabular text-[10.5px] text-[var(--color-text-secondary)]">{resultLabel}</span>}
            {completedAt && <span className="font-mono-tabular text-[9.5px] text-[var(--color-text-disabled)]">{formatTime(completedAt)}</span>}
          </div>
        )}
      </div>

      {status === "running" && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-[var(--color-bg-hover)]">
          <div className="h-full w-1/3 bg-[var(--color-accent)]" style={{ animation: "scan-sweep 1.3s linear infinite" }} />
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-[var(--color-border-strong)] !border-none !w-1.5 !h-1.5" />
    </div>
  );
}
