import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      {icon && <div className="text-[var(--color-text-disabled)]">{icon}</div>}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">{title}</p>
        {description && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{children}</div>;
}
