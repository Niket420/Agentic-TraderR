import { AgentPanel } from "./AgentPanel";
import { SectionLabel } from "@/components/common/EmptyState";
import type { AgentState } from "@/types/research";

export function AgentRoom({ bull, bear }: { bull: AgentState; bear: AgentState }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Agent Room — Research Debate</SectionLabel>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentPanel side="bull" agent={bull} />
        <AgentPanel side="bear" agent={bear} />
      </div>
    </div>
  );
}
