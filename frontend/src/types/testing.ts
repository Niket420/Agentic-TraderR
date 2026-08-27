import type { ISODateString } from "./common";

export interface PricePoint {
  date: ISODateString;
  price: number;
}

export interface TrackedStock {
  id: string;
  company: string;
  ticker: string;
  dateAdded: ISODateString;
  entryPrice: number;
  quantity?: number;
  currentPrice: number;
  lastUpdated: ISODateString;
  priceHistory: PricePoint[];
  experimentId?: string;
  status: "active" | "closed";
}

export interface Experiment {
  id: string;
  name: string;
  createdAt: ISODateString;
  stockIds: string[];
  notes?: string;
}

export type StockSortKey = "return" | "dateAdded" | "marketCap" | "company" | "daysHeld";
