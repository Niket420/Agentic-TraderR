export type IntegrationCategory = "llm" | "data";

export type ConnectionStatus = "connected" | "disconnected" | "error" | "testing";

export interface IntegrationProvider {
  id: string;
  category: IntegrationCategory;
  name: string;
  description: string;
  status: ConnectionStatus;
  maskedKey?: string;
  lastTestedAt?: string;
}

export interface SaveCredentialPayload {
  providerId: string;
  apiKey: string;
}
