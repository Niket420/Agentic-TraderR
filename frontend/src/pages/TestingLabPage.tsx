import { useEffect } from "react";
import { FlaskConical, Plus, RefreshCw } from "lucide-react";
import { useTestingStore } from "@/store/testingStore";
import { PerformanceTable } from "@/components/testing/PerformanceTable";
import { AddStockModal } from "@/components/testing/AddStockModal";
import { StockDetailPanel } from "@/components/testing/StockDetailPanel";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { formatDateTime } from "@/lib/formatters";

export function TestingLabPage() {
  const stocks = useTestingStore((s) => s.stocks);
  const loading = useTestingStore((s) => s.loading);
  const updating = useTestingStore((s) => s.updating);
  const lastUpdateResult = useTestingStore((s) => s.lastUpdateResult);
  const error = useTestingStore((s) => s.error);
  const selectedStockId = useTestingStore((s) => s.selectedStockId);
  const load = useTestingStore((s) => s.load);
  const updatePrices = useTestingStore((s) => s.updatePrices);
  const selectStock = useTestingStore((s) => s.selectStock);
  const setAddModalOpen = useTestingStore((s) => s.setAddModalOpen);

  useEffect(() => {
    load();
  }, [load]);

  const selectedStock = stocks.find((s) => s.id === selectedStockId) ?? null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
            <FlaskConical size={13} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Manual Tracking</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">TESTING LAB</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Manually track stock selections over time and evaluate how they actually performed.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={<Plus size={14} />} onClick={() => setAddModalOpen(true)}>
            Add Stock
          </Button>
          <Button variant="command" size="md" icon={<RefreshCw size={14} className={updating ? "animate-spin" : undefined} />} disabled={updating || stocks.length === 0} onClick={() => updatePrices()}>
            {updating ? "Updating" : "Update Market Prices"}
          </Button>
        </div>
      </div>

      {error && <ErrorBanner title="Price Update Failed" message={error} />}

      {lastUpdateResult && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-y border-[var(--color-border)] py-3 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">
          <span>
            Updated <span className="text-[var(--color-text-primary)]">{lastUpdateResult.updated} / {lastUpdateResult.total}</span> securities
          </span>
          <span className="text-[var(--color-text-disabled)]">·</span>
          <span>Last updated: {formatDateTime(lastUpdateResult.timestamp)}</span>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-[12px] text-[var(--color-text-tertiary)]">Loading tracked positions…</p>
      ) : stocks.length === 0 ? (
        <EmptyState
          title="No stocks tracked yet"
          description="Add a stock to begin tracking its performance from the date you selected it."
          action={
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={() => setAddModalOpen(true)}>
              Add Stock
            </Button>
          }
        />
      ) : (
        <PerformanceTable stocks={stocks} onSelect={selectStock} />
      )}

      <AddStockModal />
      <StockDetailPanel stock={selectedStock} onClose={() => selectStock(null)} />
    </div>
  );
}
