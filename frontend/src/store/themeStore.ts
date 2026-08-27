import { create } from "zustand";
import type { ThemeName } from "@/types/theme";

const STORAGE_KEY = "alpha-engine-theme";

function readStored(): ThemeName {
  if (typeof window === "undefined") return "mono";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "signal" || stored === "mono" ? stored : "mono";
}

function applyTheme(theme: ThemeName, animate: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 460);
  }
  root.setAttribute("data-theme", theme);
}

// Applied synchronously at module load (before first paint) to avoid a
// flash of the wrong theme.
applyTheme(readStored(), false);

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStored(),
  setTheme: (theme) => {
    applyTheme(theme, true);
    window.localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "mono" ? "signal" : "mono"),
}));
