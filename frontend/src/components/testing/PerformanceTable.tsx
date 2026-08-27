import { useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTestingStore } from "@/store/testingStore";
import { cn } from "@/lib/cn";
import { daysBetween, formatDate, formatPct, formatPrice } from "@/lib/formatters";
import type { StockSortKey, TrackedStock } from "@/types/testing";

function sortValue(s: TrackedStock, key: StockSortKey): number | string {
  switch (key) {
    case "return":
      return (s.currentPrice - s.entryPrice) / s.entryPrice;
    case "dateAdded":
      return new Date(s.dateAdded).getTime();
    case "marketCap":
      return s.currentPrice;
    case "company":
      return s.company;
    case "daysHeld":
      return daysBetween(s.dateAdded);
    default:
      return 0;
  }
}

export function PerformanceTable({ stocks, onSelect }: { stocks: TrackedStock[]; onSelect: (id: string) => void }) {
  const sortKey = useTestingStore((s) => s.sortKey);
  const sortDir = useTestingStore((s) => s.sortDir);
  const setSort = useTestingStore((s) => s.setSort);

  const sorted = useMemo(() => {
    const copy = [...stocks];
    copy.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : av - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [stocks, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-md)]">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-inset)]">
            <SortableHeader label="Company" active={sortKey === "company"} dir={sortDir} onClick={() => setSort("company")} />
            <th className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Ticker</th>
            <SortableHeader label="Added" active={sortKey === "dateAdded"} dir={sortDir} onClick={() => setSort("dateAdded")} />
            <th className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Entry Price</th>
            <th className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Current Price</th>
            <th className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Change</th>
            <SortableHeader label="Return %" active={sortKey === "return"} dir={sortDir} onClick={() => setSort("return")} />
            <SortableHeader label="Days Held" active={sortKey === "daysHeld"} dir={sortDir} onClick={() => setSort("daysHeld")} />
            <th className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const abs = s.currentPrice - s.entryPrice;
            const pct = (abs / s.entryPrice) * 100;
            const gaining = abs >= 0;
            return (
              <tr key={s.id} onClick={() => onSelect(s.id)} className="cursor-pointer border-b border-[var(--color-border-hairline)] last:border-none hover:bg-[var(--color-bg-hover)] transition-colors">
                <td className="px-3 py-2.5 text-[12px] font-medium text-[var(--color-text-primary)] whitespace-nowrap">{s.company}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{s.ticker}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11px] text-[var(--color-text-tertiary)] whitespace-nowrap">{formatDate(s.dateAdded)}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-secondary)]">{formatPrice(s.entryPrice)}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{formatPrice(s.currentPrice)}</td>
                <td className={cn("px-3 py-2.5 font-mono-tabular text-[11.5px]", gaining ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]")}>
                  {gaining ? "+" : "-"}{formatPrice(Math.abs(abs))}
                </td>
                <td className={cn("px-3 py-2.5 font-mono-tabular text-[12px] font-semibold", gaining ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]")}>
                  {formatPct(pct, { signed: true })}
                </td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{daysBetween(s.dateAdded)}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-success)]" />
                    {s.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </span>
    </th>
  );
}
