import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[11px] font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 w-56 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] py-1.5 shadow-[var(--shadow-md)]">
          <div className="border-b border-[var(--color-border-hairline)] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Signed in as</p>
            <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-primary)]">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11.5px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
