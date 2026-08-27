import { create } from "zustand";
import { authApi } from "@/api/auth";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "alpha-engine-session";

export type AppView = "landing" | "login" | "terminal";

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

const initialUser = readStoredUser();

interface AuthState {
  user: AuthUser | null;
  view: AppView;
  loading: boolean;
  error: string | null;
  goTo: (view: AppView) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  view: initialUser ? "terminal" : "landing",
  loading: false,
  error: null,

  goTo: (view) => set({ view, error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authApi.login({ email, password });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, view: "terminal", loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Sign in failed" });
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const user = await authApi.signup({ email, password, name });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, view: "terminal", loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Sign up failed" });
    }
  },

  logout: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ user: null, view: "landing" });
  },
}));
