import { apiConfig, request, simulateLatency } from "./client";
import { TESTING_STOCKS } from "@/mock/data/testingStocks";
import { RESEARCH_RESULTS } from "@/mock/data/researchResults";
import { MULTIBAGGER_CANDIDATES } from "@/mock/data/multibaggerCandidates";
import type { TrackedStock } from "@/types/testing";

export interface AddStockInput {
  ticker: string;
  company?: string;
  dateAdded: string;
  quantity?: number;
  /** if omitted, the backend/mock fetches the market price as of dateAdded */
  entryPrice?: number;
}

export interface UpdatePricesResult {
  updated: number;
  total: number;
  timestamp: string;
  prices: Record<string, number>;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/** Looks up a plausible current price for a ticker. Prefers known mock
 * universe prices so tickers seen elsewhere in the demo stay consistent,
 * otherwise derives a stable pseudo-price from the ticker itself. */
function lookupPrice(ticker: string): { price: number; company: string } {
  const known = [...RESEARCH_RESULTS, ...MULTIBAGGER_CANDIDATES].find((x) => x.ticker.toUpperCase() === ticker.toUpperCase());
  if (known) return { price: known.price, company: known.company };
  const seed = hashSeed(ticker.toUpperCase());
  const price = 40 + (seed % 4600) / 10;
  return { price: Math.round(price * 100) / 100, company: ticker.toUpperCase() };
}

/**
 * Domain service for the Testing Lab.
 *
 *   GET  /testing/stocks
 *   POST /testing/stocks
 *   POST /testing/prices/update
 */
export const testingApi = {
  async listStocks(): Promise<TrackedStock[]> {
    if (apiConfig.useMocks) {
      await simulateLatency();
      return TESTING_STOCKS.map((s) => ({ ...s }));
    }
    return request<TrackedStock[]>("/testing/stocks");
  },

  async addStock(input: AddStockInput): Promise<TrackedStock> {
    if (apiConfig.useMocks) {
      await simulateLatency(300, 700);
      const looked = lookupPrice(input.ticker);
      const entryPrice = input.entryPrice ?? looked.price;
      const currentPrice = looked.price;
      const now = new Date().toISOString();
      return {
        id: `ts-${Date.now()}`,
        company: input.company?.trim() || looked.company,
        ticker: input.ticker.toUpperCase(),
        dateAdded: input.dateAdded,
        entryPrice,
        quantity: input.quantity,
        currentPrice,
        lastUpdated: now,
        status: "active",
        priceHistory: [
          { date: input.dateAdded, price: entryPrice },
          { date: now, price: currentPrice },
        ],
      };
    }
    return request<TrackedStock>("/testing/stocks", { method: "POST", body: JSON.stringify(input) });
  },

  async updatePrices(stocks: TrackedStock[]): Promise<UpdatePricesResult> {
    if (apiConfig.useMocks) {
      await simulateLatency(500, 1100);
      const prices: Record<string, number> = {};
      for (const s of stocks) {
        const drift = (Math.random() - 0.47) * 0.028;
        const next = Math.max(1, s.currentPrice * (1 + drift));
        prices[s.id] = Math.round(next * 100) / 100;
      }
      return { updated: stocks.length, total: stocks.length, timestamp: new Date().toISOString(), prices };
    }
    return request<UpdatePricesResult>("/testing/prices/update", {
      method: "POST",
      body: JSON.stringify({ ids: stocks.map((s) => s.id) }),
    });
  },
};
