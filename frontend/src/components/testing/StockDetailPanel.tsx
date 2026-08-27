import { SlideOver } from "@/components/common/SlideOver";
import { SectionLabel } from "@/components/common/EmptyState";
import { PriceChart } from "./PriceChart";
import { daysBetween, formatDate, formatPct, formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { TrackedStock } from "@/types/testing";

export function StockDetailPanel({ stock, onClose }: { stock: TrackedStock | null; onClose: () => void }) {
  return (
    <SlideOver open={!!stock} onClose={onClose} width="lg" title={stock ? `${stock.company} — ${stock.ticker}` : ""} subtitle={stock ? `Added ${formatDate(stock.dateAdded)}` : undefined}>
      {stock && <StockDetailContent stock={stock} />}
    </SlideOver>
  );
}

function StockDetailContent({ stock }: { stock: TrackedStock }) {
  const absChange = stock.currentPrice - stock.entryPrice;
  const pctChange = (absChange / stock.entryPrice) * 100;
  const daysHeld = daysBetween(stock.dateAdded);
  const maxPrice = Math.max(...stock.priceHistory.map((p) => p.price));
  const maxGainPct = ((maxPrice - stock.entryPrice) / stock.entryPrice) * 100;
  const gaining = absChange >= 0;

  return (
    <div className="space-y-8 px-6 py-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Entry Price" value={formatPrice(stock.entryPrice)} />
        <Stat label="Current Price" value={formatPrice(stock.currentPrice)} />
        <Stat label="Absolute Change" value={`${gaining ? "+" : "-"}${formatPrice(Math.abs(absChange))}`} accent={gaining} />
        <Stat label="Percentage Change" value={formatPct(pctChange, { signed: true })} accent={gaining} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Holding Period" value={`${daysHeld} days`} />
        <Stat label="Max Gain Since Entry" value={formatPct(maxGainPct, { signed: true })} />
        {stock.quantity && <Stat label="Quantity" value={String(stock.quantity)} />}
      </div>

      <div>
        <SectionLabel>Price History — Entry to Today</SectionLabel>
        <div className="mt-3">
          <PriceChart history={stock.priceHistory} entryPrice={stock.entryPrice} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">{label}</p>
      <p className={cn("mt-1 font-mono-tabular text-[16px] font-semibold", accent ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]")}>{value}</p>
    </div>
  );
}
