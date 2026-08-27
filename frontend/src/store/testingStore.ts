import { create } from "zustand";
import { testingApi, type AddStockInput, type UpdatePricesResult } from "@/api/testing";
import type { StockSortKey, TrackedStock } from "@/types/testing";

interface TestingState {
  stocks: TrackedStock[];
  loading: boolean;
  updating: boolean;
  lastUpdateResult: UpdatePricesResult | null;
  error: string | null;
  sortKey: StockSortKey;
  sortDir: "asc" | "desc";
  selectedStockId: string | null;
  addModalOpen: boolean;

  load: () => Promise<void>;
  addStock: (input: AddStockInput) => Promise<void>;
  updatePrices: () => Promise<void>;
  setSort: (key: StockSortKey) => void;
  selectStock: (id: string | null) => void;
  setAddModalOpen: (open: boolean) => void;
}

export const useTestingStore = create<TestingState>((set, get) => ({
  stocks: [],
  loading: false,
  updating: false,
  lastUpdateResult: null,
  error: null,
  sortKey: "dateAdded",
  sortDir: "desc",
  selectedStockId: null,
  addModalOpen: false,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const stocks = await testingApi.listStocks();
      set({ stocks, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Failed to load tracked stocks" });
    }
  },

  addStock: async (input) => {
    const stock = await testingApi.addStock(input);
    set({ stocks: [stock, ...get().stocks] });
  },

  updatePrices: async () => {
    set({ updating: true, error: null });
    try {
      const stocks = get().stocks;
      const result = await testingApi.updatePrices(stocks);
      const now = result.timestamp;
      const next = stocks.map((s) => {
        const price = result.prices[s.id];
        if (price === undefined) return s;
        return { ...s, currentPrice: price, lastUpdated: now, priceHistory: [...s.priceHistory, { date: now, price }] };
      });
      set({ stocks: next, updating: false, lastUpdateResult: result });
    } catch (e) {
      set({ updating: false, error: e instanceof Error ? e.message : "Price update failed" });
    }
  },

  setSort: (key) =>
    set((state) => ({
      sortKey: key,
      sortDir: state.sortKey === key ? (state.sortDir === "asc" ? "desc" : "asc") : "desc",
    })),

  selectStock: (id) => set({ selectedStockId: id }),
  setAddModalOpen: (open) => set({ addModalOpen: open }),
}));
