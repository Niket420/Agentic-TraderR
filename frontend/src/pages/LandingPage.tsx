import { motion } from "framer-motion";
import { ArrowRight, Radar, Rocket, FlaskConical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeSwitcher } from "@/components/shell/ThemeSwitcher";
import { Button } from "@/components/common/Button";

const ENGINES = [
  {
    icon: Radar,
    name: "MARKET INTELLIGENCE",
    description: "Detect financially significant events, challenge the thesis with competing agents, and produce an investment view.",
  },
  {
    icon: Rocket,
    name: "MULTIBAGGER ENGINE",
    description: "Find small companies where future earning power may be materially larger than what the current valuation implies.",
  },
  {
    icon: FlaskConical,
    name: "TESTING LAB",
    description: "Track your own selections over time and see, unambiguously, how they actually performed.",
  },
];

export function LandingPage() {
  const goTo = useAuthStore((s) => s.goTo);
  const isAuthenticated = !!useAuthStore((s) => s.user);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-extrabold tracking-[0.02em]">ALPHA</span>
          <span className="text-[14px] font-light text-[var(--color-text-tertiary)]">//</span>
          <span className="text-[14px] font-extrabold tracking-[0.02em]">ENGINE</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Button variant="outline" size="sm" onClick={() => goTo(isAuthenticated ? "terminal" : "login")}>
            {isAuthenticated ? "Enter Terminal" : "Sign In"}
          </Button>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-1.5 font-mono-tabular text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" style={{ animation: "blink-dot 1.4s ease-in-out infinite" }} />
            AI-Native Research Terminal
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-[13vw] font-extrabold leading-[0.95] tracking-tight sm:text-[68px]"
        >
          ALPHA <span className="text-[var(--color-text-tertiary)]">//</span> ENGINE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]"
        >
          A command center for AI research agents that hunt for asymmetric opportunities — launch a run, watch the agents debate,
          inspect the evidence, and evaluate what they find.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-col items-center gap-3"
        >
          <Button variant="command" size="lg" icon={<ArrowRight size={15} />} onClick={() => goTo(isAuthenticated ? "terminal" : "login")}>
            {isAuthenticated ? "ENTER TERMINAL" : "ENTER THE TERMINAL"}
          </Button>
          <p className="font-mono-tabular text-[10.5px] text-[var(--color-text-disabled)]">
            Bring your own LLM and market data keys — configured after sign in.
          </p>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {ENGINES.map((engine, i) => (
            <motion.div
              key={engine.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="px-6 py-8 first:pl-0 last:pr-0 sm:first:pl-0"
            >
              <engine.icon size={17} className="text-[var(--color-text-tertiary)]" />
              <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-primary)]">{engine.name}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-text-tertiary)]">{engine.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-[var(--color-border)] px-6 py-4 sm:px-10">
        <p className="font-mono-tabular text-[10px] tracking-[0.08em] text-[var(--color-text-disabled)]">
          SYSTEM READY · MOCK DATA MODE · CONNECT YOUR OWN PROVIDERS FROM API &amp; INTEGRATIONS
        </p>
      </div>
    </div>
  );
}
