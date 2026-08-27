import { AlertTriangle } from "lucide-react";

export function ErrorBanner({ title = "Run Failed", message }: { title?: string; message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-accent-dim)] px-4 py-3">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-text-primary)]">{message}</p>
      </div>
    </div>
  );
}
