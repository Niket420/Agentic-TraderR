import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { SlideOver } from "@/components/common/SlideOver";
import { SectionLabel } from "@/components/common/EmptyState";
import { IntegrationCard } from "./IntegrationCard";
import { useNavStore } from "@/store/navStore";
import { useIntegrationsStore } from "@/store/integrationsStore";

export function IntegrationsDrawer() {
  const open = useNavStore((s) => s.integrationsOpen);
  const close = useNavStore((s) => s.closeIntegrations);
  const providers = useIntegrationsStore((s) => s.providers);
  const load = useIntegrationsStore((s) => s.load);

  useEffect(() => {
    if (open && providers.length === 0) load();
  }, [open, providers.length, load]);

  const llmProviders = providers.filter((p) => p.category === "llm");
  const dataProviders = providers.filter((p) => p.category === "data");

  return (
    <SlideOver open={open} onClose={close} title="API & Integrations" subtitle="Bring your own provider credentials" width="lg">
      <div className="flex items-start gap-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-inset)] px-6 py-3.5">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />
        <p className="text-[11.5px] leading-relaxed text-[var(--color-text-tertiary)]">
          Credentials are sent directly to your backend over a secure connection and stored there — this app never keeps a raw key in
          the browser. Once saved, only a masked reference is shown here.
        </p>
      </div>

      <div className="space-y-8 px-6 py-6">
        <section className="space-y-3">
          <SectionLabel>LLM Providers</SectionLabel>
          <div className="space-y-3">
            {llmProviders.map((p) => (
              <IntegrationCard key={p.id} provider={p} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Financial Data</SectionLabel>
          <div className="space-y-3">
            {dataProviders.map((p) => (
              <IntegrationCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      </div>
    </SlideOver>
  );
}
