import type { TrackedStock } from "@/types/testing";

function generateHistory(startDateIso: string, startPrice: number, endPrice: number): { date: string; price: number }[] {
  const start = new Date(startDateIso).getTime();
  const end = Date.now();
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const points: { date: string; price: number }[] = [];
  let seed = startPrice;
  const drift = (endPrice - startPrice) / days;
  for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 24))) {
    const noise = (Math.sin(i * 1.7 + startPrice) * 0.5 + (Math.cos(i * 0.9) * 0.3)) * (startPrice * 0.015);
    seed = startPrice + drift * i + noise;
    points.push({ date: new Date(start + i * 86400000).toISOString(), price: Math.max(1, Math.round(seed * 100) / 100) });
  }
  points.push({ date: new Date(end).toISOString(), price: endPrice });
  return points;
}

const RAW: Array<Omit<TrackedStock, "priceHistory">> = [
  { id: "ts-1", company: "Orbit Precision Engineering", ticker: "ORBITPE", dateAdded: "2026-08-12T10:00:00+05:30", entryPrice: 1450.0, quantity: 40, currentPrice: 1842.35, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
  { id: "ts-2", company: "Arka Industrials", ticker: "ARKAIND", dateAdded: "2026-07-02T10:00:00+05:30", entryPrice: 268.1, quantity: 200, currentPrice: 342.4, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
  { id: "ts-3", company: "Kestrel Auto Components", ticker: "KESTRELA", dateAdded: "2026-06-18T10:00:00+05:30", entryPrice: 705.0, quantity: 60, currentPrice: 618.2, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
  { id: "ts-4", company: "Brightline Diagnostics", ticker: "BRIGHTDX", dateAdded: "2026-05-27T10:00:00+05:30", entryPrice: 94.2, quantity: 500, currentPrice: 158.9, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
  { id: "ts-5", company: "Meridian Textiles", ticker: "MERITEX", dateAdded: "2026-08-05T10:00:00+05:30", entryPrice: 231.5, quantity: 300, currentPrice: 284.75, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
  { id: "ts-6", company: "Solterra Agritech", ticker: "SOLTAGRI", dateAdded: "2026-03-14T10:00:00+05:30", entryPrice: 168.0, quantity: 250, currentPrice: 226.6, lastUpdated: "2026-08-27T18:05:00+05:30", status: "active" },
];

export const TESTING_STOCKS: TrackedStock[] = RAW.map((s) => ({
  ...s,
  priceHistory: generateHistory(s.dateAdded, s.entryPrice, s.currentPrice),
}));
