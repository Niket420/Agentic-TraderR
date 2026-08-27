import { useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { WorkflowNode, type WorkflowNodeData } from "./WorkflowNode";
import type { WorkflowGraphDef } from "@/lib/workflows";
import type { WorkflowNodeState } from "@/types/common";

const nodeTypes = { workflowNode: WorkflowNode };

interface WorkflowGraphProps {
  graph: WorkflowGraphDef;
  nodeStates: Record<string, WorkflowNodeState>;
  direction: "vertical" | "horizontal";
  height?: number;
}

export function WorkflowGraph({ graph, nodeStates, direction, height = 620 }: WorkflowGraphProps) {
  const nodes: Node<WorkflowNodeData>[] = useMemo(
    () =>
      graph.nodes.map((n) => {
        const state = nodeStates[n.id] ?? { status: "idle" as const };
        return {
          id: n.id,
          type: "workflowNode",
          position: { x: n.x, y: n.y },
          data: { label: n.label, hint: n.hint, status: state.status, detail: state.detail, resultLabel: state.resultLabel, completedAt: state.completedAt, direction },
          draggable: false,
          selectable: false,
        };
      }),
    [graph, nodeStates, direction],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => {
        const targetStatus = nodeStates[e.target]?.status ?? "idle";
        const sourceStatus = nodeStates[e.source]?.status ?? "idle";
        const active = targetStatus === "running";
        const traversed = sourceStatus === "completed";
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: direction === "vertical" ? "smoothstep" : "smoothstep",
          animated: active,
          style: {
            stroke: active ? "var(--color-accent)" : traversed ? "var(--color-border-strong)" : "var(--color-border)",
            strokeWidth: active ? 1.75 : 1.25,
          },
        };
      }),
    [graph, nodeStates, direction],
  );

  return (
    <div style={{ height }} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll={false}
        minZoom={0.35}
        maxZoom={1.25}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--color-border)" />
      </ReactFlow>
    </div>
  );
}
