import { Header } from "./Header";
import { NavTabs } from "./NavTabs";
import { LiveConsole } from "@/components/console/LiveConsole";
import { IntegrationsDrawer } from "@/components/integrations/IntegrationsDrawer";
import { useNavStore } from "@/store/navStore";
import { MarketIntelligencePage } from "@/pages/MarketIntelligencePage";
import { MultibaggerEnginePage } from "@/pages/MultibaggerEnginePage";
import { TestingLabPage } from "@/pages/TestingLabPage";

export function AppShell() {
  const activeTab = useNavStore((s) => s.activeTab);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Header />
      <div className="flex overflow-x-auto border-b border-[var(--color-border)] lg:hidden">
        <NavTabs />
      </div>
      <main className="flex-1 overflow-y-auto">
        {activeTab === "market_intelligence" && <MarketIntelligencePage />}
        {activeTab === "multibagger" && <MultibaggerEnginePage />}
        {activeTab === "testing_lab" && <TestingLabPage />}
      </main>
      <LiveConsole />
      <IntegrationsDrawer />
    </div>
  );
}
