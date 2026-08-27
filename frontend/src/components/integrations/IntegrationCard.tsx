import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, PlugZap } from "lucide-react";
import { useIntegrationsStore } from "@/store/integrationsStore";
import { Button } from "@/components/common/Button";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { IntegrationProvider } from "@/types/integrations";

const STATUS_META = {
  connected: { label: "Connected", icon: CheckCircle2, className: "text-[var(--color-text-primary)]" },
  disconnected: { label: "Not connected", icon: PlugZap, className: "text-[var(--color-text-tertiary)]" },
  error: { label: "Connection error", icon: XCircle, className: "text-[var(--color-accent)]" },
  testing: { label: "Testing…", icon: Loader2, className: "text-[var(--color-accent)]" },
} as const;

export function IntegrationCard({ provider }: { provider: IntegrationProvider }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const saveCredential = useIntegrationsStore((s) => s.saveCredential);
  const testConnection = useIntegrationsStore((s) => s.testConnection);
  const disconnect = useIntegrationsStore((s) => s.disconnect);
  const savingId = useIntegrationsStore((s) => s.savingId);
  const testingId = useIntegrationsStore((s) => s.testingId);

  const saving = savingId === provider.id;
  const testing = testingId === provider.id;
  const meta = STATUS_META[provider.status];
  const Icon = meta.icon;

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{provider.name}</p>
          <p className="mt-0.5 text-[11.5px] text-[var(--color-text-tertiary)]">{provider.description}</p>
        </div>
        <div className={cn("flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em]", meta.className)}>
          <Icon size={12} className={testing ? "animate-spin" : undefined} />
          {meta.label}
        </div>
      </div>

      {provider.status === "connected" ? (
        <div className="mt-3 flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-bg-inset)] px-3 py-2">
          <div className="font-mono-tabular text-[12px] text-[var(--color-text-secondary)]">
            Connected {provider.maskedKey}
            {provider.lastTestedAt && <span className="ml-2 text-[var(--color-text-disabled)]">· tested {formatDateTime(provider.lastTestedAt)}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => testConnection(provider.id)} disabled={testing}>
              {testing ? "Testing" : "Test"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => disconnect(provider.id)}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 pr-9 font-mono-tabular text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button onClick={() => setShowKey((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" tabIndex={-1}>
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={!apiKey.trim() || saving}
            onClick={async () => {
              await saveCredential(provider.id, apiKey.trim());
              setApiKey("");
              setShowKey(false);
            }}
          >
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
