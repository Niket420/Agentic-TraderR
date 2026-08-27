import { useResearchStore } from "@/store/researchStore";
import { useMultibaggerStore } from "@/store/multibaggerStore";

export function SystemStatus() {
  const miRunning = useResearchStore((s) => s.runStatus === "running");
  const mbRunning = useMultibaggerStore((s) => s.runStatus === "running");
  const running = miRunning || mbRunning;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: running ? "var(--color-status-running)" : "var(--color-text-tertiary)",
          animation: running ? "blink-dot 1.1s ease-in-out infinite" : undefined,
        }}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] font-mono-tabular">
        {running ? "RUNNING" : "SYSTEM READY"}
      </span>
    </div>
  );
}
