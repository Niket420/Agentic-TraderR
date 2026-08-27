import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { AgentMessage as AgentMessageType } from "@/types/research";

export function AgentMessage({ message }: { message: AgentMessageType }) {
  const isBull = message.agent === "bull";
  const Icon = isBull ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn("border-l-2 pl-3 py-1.5", isBull ? "border-l-[var(--color-accent)]" : "border-l-[var(--color-text-tertiary)]")}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={11} className={isBull ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"} />
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.08em]", isBull ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]")}>
          {isBull ? "Bull" : "Bear"}
        </span>
        <span className="font-mono-tabular text-[10px] text-[var(--color-text-disabled)]">{message.ticker}</span>
        <span className="ml-auto font-mono-tabular text-[9.5px] text-[var(--color-text-disabled)]">{formatTime(message.timestamp)}</span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-[var(--color-text-primary)]">{message.text}</p>
      {message.citations.length > 0 && (
        <p className="mt-1 font-mono-tabular text-[9.5px] text-[var(--color-text-disabled)]">
          {message.citations.length} citation{message.citations.length !== 1 ? "s" : ""}
        </p>
      )}
    </motion.div>
  );
}
