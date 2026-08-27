import { create } from "zustand";

export type TabId = "market_intelligence" | "multibagger" | "testing_lab";

interface NavState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  integrationsOpen: boolean;
  openIntegrations: () => void;
  closeIntegrations: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: "market_intelligence",
  setActiveTab: (tab) => set({ activeTab: tab }),
  integrationsOpen: false,
  openIntegrations: () => set({ integrationsOpen: true }),
  closeIntegrations: () => set({ integrationsOpen: false }),
}));
