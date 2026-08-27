import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AgentMessage } from "./AgentMessage";
import { cn } from "@/lib/cn";
import type { AgentState } from "@/types/research";

interface AgentPanelProps {
  side: "bull" | "bear";
  agent: AgentState;
}

const META = {
  bull: { title: "Bull Researcher", icon: TrendingUp, role: "Builds the long thesis" },
  bear: { title: "Bear Researcher", icon: TrendingDown, role: "Stress-tests the case" },
};

export function AgentPanel({ side, agent }: AgentPanelProps) {
  const { title, icon: Icon, role } = META[side];
  const listRef = useRef<HTMLDivElement>(null);
  const accent = side === "bull";

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [agent.messages.length]);

  return (
    <div className="flex flex-col border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border", accent ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-border-strong)] text-[var(--color-text-tertiary)]")}>
            <Icon size={14} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-primary)]">{title}</p>
            <p className="text-[10px] text-[var(--color-text-disabled)]">{role}</p>
          </div>
        </div>
        <span
          className={cn(
            "text-[9.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-[var(--radius-sm)] border",
            agent.status === "active" && "border-[var(--color-accent)] text-[var(--color-accent)]",
            agent.status === "waiting" && "border-[var(--color-border)] text-[var(--color-text-tertiary)]",
            agent.status === "concluded" && "border-[var(--color-border-strong)] text-[var(--color-text-secondary)]",
          )}
        >
          {agent.status === "active" ? "ACTIVE" : agent.status === "concluded" ? "CONCLUDED" : "WAITING"}
        </span>
      </div>

      {(agent.currentCompany || agent.evidenceCount > 0) && (
        <div className="grid grid-cols-2 gap-3 border-b border-[var(--color-border-hairline)] px-4 py-2.5 text-[11px]">
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Current Company</p>
            <p className="mt-0.5 font-mono-tabular text-[var(--color-text-primary)]">{agent.currentCompany ?? "—"} {agent.currentTicker && <span className="text-[var(--color-text-tertiary)]">· {agent.currentTicker}</span>}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Evidence Count</p>
            <p className="mt-0.5 font-mono-tabular text-[var(--color-text-primary)]">{agent.evidenceCount}</p>
          </div>
          {agent.currentHypothesis && (
            <div className="col-span-2">
              <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Hypothesis</p>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">{agent.currentHypothesis}</p>
            </div>
          )}
        </div>
      )}

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3" style={{ maxHeight: 360, minHeight: 240 }}>
        {agent.messages.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-[var(--color-text-disabled)]">Awaiting activation…</p>
        ) : (
          agent.messages.map((m) => <AgentMessage key={m.id} message={m} />)
        )}
      </div>
    </div>
  );
}
