import type { IntegrationProvider } from "@/types/integrations";

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  { id: "openai", category: "llm", name: "OpenAI", description: "GPT models for agent reasoning and synthesis", status: "connected", maskedKey: "••••••••7F3A", lastTestedAt: "2026-08-27T09:12:00+05:30" },
  { id: "anthropic", category: "llm", name: "Anthropic", description: "Claude models for research agents and debate", status: "connected", maskedKey: "••••••••9A21", lastTestedAt: "2026-08-27T09:12:00+05:30" },
  { id: "google", category: "llm", name: "Google", description: "Gemini models as an alternate reasoning provider", status: "disconnected" },
  { id: "other-llm", category: "llm", name: "Other Provider", description: "Any OpenAI-compatible endpoint", status: "disconnected" },
  { id: "stock-price", category: "data", name: "Stock Price Provider", description: "Real-time and historical price feeds", status: "connected", maskedKey: "••••••••C112", lastTestedAt: "2026-08-26T21:40:00+05:30" },
  { id: "market-data", category: "data", name: "Market Data API", description: "Order book, volumes, corporate actions", status: "connected", maskedKey: "••••••••5D88", lastTestedAt: "2026-08-26T21:40:00+05:30" },
  { id: "fundamentals", category: "data", name: "Financial Fundamentals API", description: "Financial statements and ratio data", status: "error" },
  { id: "news", category: "data", name: "News API", description: "Financial news ingestion for event detection", status: "connected", maskedKey: "••••••••2E90", lastTestedAt: "2026-08-27T07:55:00+05:30" },
];
