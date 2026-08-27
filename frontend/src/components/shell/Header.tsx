import { Plug, Settings } from "lucide-react";
import { NavTabs } from "./NavTabs";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SystemStatus } from "./SystemStatus";
import { useNavStore } from "@/store/navStore";
import { Button } from "@/components/common/Button";

export function Header() {
  const openIntegrations = useNavStore((s) => s.openIntegrations);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-extrabold tracking-[0.02em] text-[var(--color-text-primary)]">ALPHA</span>
          <span className="text-[15px] font-light text-[var(--color-text-tertiary)]">//</span>
          <span className="text-[15px] font-extrabold tracking-[0.02em] text-[var(--color-text-primary)]">ENGINE</span>
        </div>
        <div className="hidden h-4 w-px bg-[var(--color-border)] sm:block" />
        <div className="hidden sm:block">
          <SystemStatus />
        </div>
      </div>

      <div className="hidden lg:flex">
        <NavTabs />
      </div>

      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="sm" icon={<Plug size={13} />} onClick={openIntegrations}>
          API &amp; Integrations
        </Button>
        <ThemeSwitcher />
        <button className="rounded-[var(--radius-sm)] p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
