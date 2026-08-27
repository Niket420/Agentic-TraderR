import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: "md" | "lg" | "xl";
  headerRight?: ReactNode;
}

const WIDTH_MAP = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

export function SlideOver({ open, onClose, title, subtitle, children, width = "lg", headerRight }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={cn("relative h-full w-full bg-[var(--color-bg-elevated)] border-l border-[var(--color-border)] flex flex-col shadow-[var(--shadow-md)]", WIDTH_MAP[width])}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5 shrink-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-text-primary)]">{title}</h2>
                {subtitle && <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                {headerRight}
                <button onClick={onClose} className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
