import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/cn";

export function ThemeSwitcher() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] p-0.5 text-[10px] font-bold uppercase tracking-[0.08em] font-mono-tabular">
      {(["mono", "signal"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            "px-2.5 py-1.5 rounded-[3px] transition-colors duration-200",
            theme === t ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]",
          )}
        >
          {t === "mono" ? "MONO" : "SIGNAL"}
        </button>
      ))}
    </div>
  );
}
