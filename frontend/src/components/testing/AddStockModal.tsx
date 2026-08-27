import { useState, type ReactNode } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useTestingStore } from "@/store/testingStore";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 font-mono-tabular text-[12.5px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:border-[var(--color-accent)]";

export function AddStockModal() {
  const open = useTestingStore((s) => s.addModalOpen);
  const setOpen = useTestingStore((s) => s.setAddModalOpen);
  const addStock = useTestingStore((s) => s.addStock);

  const [ticker, setTicker] = useState("");
  const [company, setCompany] = useState("");
  const [dateAdded, setDateAdded] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTicker("");
    setCompany("");
    setDateAdded(new Date().toISOString().slice(0, 10));
    setQuantity("");
    setEntryPrice("");
  };

  const handleSubmit = async () => {
    if (!ticker.trim()) return;
    setSubmitting(true);
    try {
      await addStock({
        ticker: ticker.trim().toUpperCase(),
        company: company.trim() || undefined,
        dateAdded: new Date(dateAdded).toISOString(),
        quantity: quantity ? Number(quantity) : undefined,
        entryPrice: entryPrice ? Number(entryPrice) : undefined,
      });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Add Stock">
      <div className="space-y-4">
        <Field label="Ticker / Company">
          <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g. ORBITPE" className={inputClass} />
        </Field>
        <Field label="Company Name (optional)">
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Auto-resolved if left blank" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date Added">
            <input type="date" value={dateAdded} onChange={(e) => setDateAdded(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Quantity (optional)">
            <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="—" className={inputClass} />
          </Field>
        </div>
        <Field label="Entry Price (optional — auto-fetched if blank)">
          <input type="number" min="0" step="0.01" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="Fetch market price at add time" className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" size="md" disabled={!ticker.trim() || submitting} onClick={handleSubmit}>
            {submitting ? "Adding" : "Add Stock"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">{label}</span>
      {children}
    </label>
  );
}
