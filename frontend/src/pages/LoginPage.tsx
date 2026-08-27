import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeSwitcher } from "@/components/shell/ThemeSwitcher";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";

type Mode = "signin" | "signup";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2.5 font-mono-tabular text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:border-[var(--color-accent)]";

export function LoginPage() {
  const goTo = useAuthStore((s) => s.goTo);
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === "signin") login(email.trim(), password);
    else signup(email.trim(), password, name.trim());
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={() => goTo("landing")} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft size={13} />
          Back
        </button>
        <ThemeSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[15px] font-extrabold tracking-[0.02em]">ALPHA</span>
              <span className="text-[15px] font-light text-[var(--color-text-tertiary)]">//</span>
              <span className="text-[15px] font-extrabold tracking-[0.02em]">ENGINE</span>
            </div>
            <p className="mt-2 text-[12px] text-[var(--color-text-tertiary)]">
              {mode === "signin" ? "Sign in to access the terminal" : "Create an account to get started"}
            </p>
          </div>

          <div className="mb-6 flex rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] p-0.5 text-[11px] font-bold uppercase tracking-[0.06em]">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-[3px] py-2 transition-colors duration-200 ${
                  mode === m ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {error && <div className="mb-4"><ErrorBanner title="Authentication Failed" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Name (optional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Analyst" className={inputClass} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@fund.com" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </label>

            <Button type="submit" variant="command" size="lg" className="w-full" disabled={loading || !email.trim() || !password.trim()}>
              {loading ? "Working" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-inset)] px-3 py-2.5">
            <Info size={13} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />
            <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
              Demo mode — any email and password will work. Provider credentials are configured separately from API &amp; Integrations
              once inside.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
