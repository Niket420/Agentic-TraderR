import { create } from "zustand";
import { integrationsApi } from "@/api/integrations";
import type { IntegrationProvider } from "@/types/integrations";

interface IntegrationsState {
  providers: IntegrationProvider[];
  loading: boolean;
  savingId: string | null;
  testingId: string | null;

  load: () => Promise<void>;
  saveCredential: (providerId: string, apiKey: string) => Promise<void>;
  testConnection: (providerId: string) => Promise<void>;
  disconnect: (providerId: string) => Promise<void>;
}

export const useIntegrationsStore = create<IntegrationsState>((set, get) => ({
  providers: [],
  loading: false,
  savingId: null,
  testingId: null,

  load: async () => {
    set({ loading: true });
    const providers = await integrationsApi.list();
    set({ providers, loading: false });
  },

  saveCredential: async (providerId, apiKey) => {
    set({ savingId: providerId });
    const updated = await integrationsApi.saveCredential({ providerId, apiKey });
    set({ providers: get().providers.map((p) => (p.id === providerId ? updated : p)), savingId: null });
  },

  testConnection: async (providerId) => {
    set({ testingId: providerId });
    const { status } = await integrationsApi.testConnection(providerId);
    set({ providers: get().providers.map((p) => (p.id === providerId ? { ...p, status, lastTestedAt: new Date().toISOString() } : p)), testingId: null });
  },

  disconnect: async (providerId) => {
    await integrationsApi.disconnect(providerId);
    set({ providers: get().providers.map((p) => (p.id === providerId ? { ...p, status: "disconnected", maskedKey: undefined } : p)) });
  },
}));
