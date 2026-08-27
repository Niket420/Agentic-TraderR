import { motion } from "framer-motion";
import { useNavStore, type TabId } from "@/store/navStore";
import { cn } from "@/lib/cn";

const TABS: { id: TabId; label: string }[] = [
  { id: "market_intelligence", label: "Market Intelligence" },
  { id: "multibagger", label: "Multibagger Engine" },
  { id: "testing_lab", label: "Testing Lab" },
];

export function NavTabs() {
  const activeTab = useNavStore((s) => s.activeTab);
  const setActiveTab = useNavStore((s) => s.setActiveTab);

  return (
    <nav className="flex items-center gap-1">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-150",
              active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {tab.label}
            {active && (
              <motion.span
                layoutId="nav-active-indicator"
                className="absolute inset-x-2 -bottom-[1px] h-[2px] bg-[var(--color-accent)]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
