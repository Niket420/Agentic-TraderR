import { Handle, Position, type NodeProps } from "reactflow";
import { StatusDot } from "@/components/common/StatusDot";
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
  direction: "vertical" | "horizontal";
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  idle: "IDLE",
  waiting: "WAITING",
  running: "RUNNING",
  completed: "COMPLETED",
  failed: "FAILED",
};

export function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  const { label, hint, status, detail, resultLabel, completedAt, direction } = data;
  const sourcePos = direction === "vertical" ? Position.Bottom : Position.Right;
  const targetPos = direction === "vertical" ? Position.Top : Position.Left;

  return (
    <div
      className={cn(
        "w-[228px] rounded-[var(--radius-md)] border bg-[var(--color-bg-elevated)] px-4 py-3 transition-shadow duration-300",
        status === "running" && "border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]",
        status === "completed" && "border-[var(--color-border-strong)]",
        status === "failed" && "border-[var(--color-accent)]",
        (status === "idle" || status === "waiting") && "border-[var(--color-border)]",
      )}
    >
      <Handle type="target" position={targetPos} className="!bg-[var(--color-border-strong)] !border-none !w-1.5 !h-1.5" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusDot status={status} size={7} />
          <span
            className={cn(
              "text-[11.5px] font-bold uppercase tracking-[0.06em]",
              status === "idle" || status === "waiting" ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]",
            )}
          >
            {label}
          </span>
        </div>
      </div>

      {hint && (status === "idle" || status === "waiting") && (
        <p className="mt-1 text-[10.5px] leading-snug text-[var(--color-text-disabled)]">{hint}</p>
      )}

      {status === "running" && detail && (
        <p className="mt-1.5 text-[10.5px] leading-snug text-[var(--color-accent)]">{detail}</p>
      )}

      {status === "completed" && (
        <div className="mt-1.5 flex items-center justify-between">
          {resultLabel && <span className="font-mono-tabular text-[10.5px] text-[var(--color-text-secondary)]">{resultLabel}</span>}
          {completedAt && <span className="font-mono-tabular text-[9.5px] text-[var(--color-text-disabled)]">{formatTime(completedAt)}</span>}
        </div>
      )}

      {status === "failed" && detail && <p className="mt-1.5 text-[10.5px] leading-snug text-[var(--color-accent)]">{detail}</p>}

      <div className="mt-1.5 font-mono-tabular text-[9px] tracking-[0.1em] text-[var(--color-text-disabled)]">{STATUS_LABEL[status]}</div>

      <Handle type="source" position={sourcePos} className="!bg-[var(--color-border-strong)] !border-none !w-1.5 !h-1.5" />
    </div>
  );
}
