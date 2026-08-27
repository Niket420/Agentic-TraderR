import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Trash2, TerminalSquare } from "lucide-react";
import { useLogStore } from "@/store/logStore";
import { useResearchStore } from "@/store/researchStore";
import { useMultibaggerStore } from "@/store/multibaggerStore";
import { LogLine } from "./LogLine";
import { cn } from "@/lib/cn";
import type { LogLevel } from "@/types/common";

const FILTERS: Array<LogLevel | "all"> = ["all", "info", "running", "success", "warning", "error"];

export function LiveConsole() {
  const entries = useLogStore((s) => s.entries);
  const expanded = useLogStore((s) => s.expanded);
  const filter = useLogStore((s) => s.filter);
  const toggleExpanded = useLogStore((s) => s.toggleExpanded);
  const setFilter = useLogStore((s) => s.setFilter);
  const clear = useLogStore((s) => s.clear);

  const miRunning = useResearchStore((s) => s.runStatus === "running");
  const mbRunning = useMultibaggerStore((s) => s.runStatus === "running");
  const running = miRunning || mbRunning;

  const listRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.level === filter);

  useEffect(() => {
    if (!autoScroll || !expanded) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [filtered.length, autoScroll, expanded]);

  return (
    <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-inset)]">
      <button
        onClick={toggleExpanded}
        className="flex w-full items-center justify-between px-5 py-2 text-left transition-colors hover:bg-[var(--color-bg-hover)]"
      >
        <div className="flex items-center gap-2.5">
          <TerminalSquare size={13} className="text-[var(--color-text-tertiary)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Live Logs</span>
          <span className="text-[var(--color-text-disabled)]">•</span>
          <span className="font-mono-tabular text-[10px] text-[var(--color-text-tertiary)]">{entries.length} EVENTS</span>
          {running && (
            <>
              <span className="text-[var(--color-text-disabled)]">•</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" style={{ animation: "blink-dot 1.1s ease-in-out infinite" }} />
                RUNNING
              </span>
            </>
          )}
        </div>
        {expanded ? <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" /> : <ChevronUp size={14} className="text-[var(--color-text-tertiary)]" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "clamp(220px, 30vh, 420px)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col overflow-hidden border-t border-[var(--color-border)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-hairline)] px-4 py-1.5">
              <div className="flex items-center gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-[var(--radius-sm)] px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] transition-colors",
                      filter === f ? "bg-[var(--color-bg-active)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={clear} className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]">
                <Trash2 size={11} />
                Clear
              </button>
            </div>
            <div
              ref={listRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
              }}
              className="flex-1 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-[11px] text-[var(--color-text-disabled)]">No log events yet. Run an engine to begin.</p>
              ) : (
                filtered.map((entry) => <LogLine key={entry.id} entry={entry} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
