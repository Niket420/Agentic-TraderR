import { apiConfig, request, simulateLatency } from "./client";
import { INTEGRATION_PROVIDERS } from "@/mock/data/integrations";
import { maskKey } from "@/lib/formatters";
import type { ConnectionStatus, IntegrationProvider, SaveCredentialPayload } from "@/types/integrations";

/**
 * SECURITY NOTE: this service never persists a raw API key client-side.
 * `saveCredential` sends the key over the wire to the backend (mocked
 * here) and only ever keeps the masked form the "backend" returns. There
 * is deliberately no localStorage write of secret material anywhere in
 * this app — credential storage/usage is the Python backend's job.
 *
 *   GET    /integrations
 *   POST   /integrations/:id/credential
 *   POST   /integrations/:id/test
 *   DELETE /integrations/:id/credential
 */
export const integrationsApi = {
  async list(): Promise<IntegrationProvider[]> {
    if (apiConfig.useMocks) {
      await simulateLatency();
      return INTEGRATION_PROVIDERS.map((p) => ({ ...p }));
    }
    return request<IntegrationProvider[]>("/integrations");
  },

  async saveCredential(payload: SaveCredentialPayload): Promise<IntegrationProvider> {
    if (apiConfig.useMocks) {
      await simulateLatency(400, 900);
      const provider = INTEGRATION_PROVIDERS.find((p) => p.id === payload.providerId);
      if (!provider) throw new Error("Unknown provider");
      const updated: IntegrationProvider = {
        ...provider,
        status: "connected",
        maskedKey: maskKey(payload.apiKey),
        lastTestedAt: new Date().toISOString(),
      };
      Object.assign(provider, updated);
      return updated;
    }
    return request<IntegrationProvider>(`/integrations/${payload.providerId}/credential`, {
      method: "POST",
      body: JSON.stringify({ apiKey: payload.apiKey }),
    });
  },

  async testConnection(providerId: string): Promise<{ status: ConnectionStatus }> {
    if (apiConfig.useMocks) {
      await simulateLatency(500, 1200);
      const provider = INTEGRATION_PROVIDERS.find((p) => p.id === providerId);
      const ok = provider?.status !== "disconnected";
      const status: ConnectionStatus = ok ? "connected" : "error";
      if (provider) provider.status = status;
      return { status };
    }
    return request<{ status: ConnectionStatus }>(`/integrations/${providerId}/test`, { method: "POST" });
  },

  async disconnect(providerId: string): Promise<void> {
    if (apiConfig.useMocks) {
      await simulateLatency();
      const provider = INTEGRATION_PROVIDERS.find((p) => p.id === providerId);
      if (provider) {
        provider.status = "disconnected";
        provider.maskedKey = undefined;
      }
      return;
    }
    await request<void>(`/integrations/${providerId}/credential`, { method: "DELETE" });
  },
};
