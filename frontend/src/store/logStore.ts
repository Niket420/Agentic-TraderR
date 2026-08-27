import { create } from "zustand";
import type { LogEntry, LogLevel } from "@/types/common";

let seq = 0;

interface LogState {
  entries: LogEntry[];
  expanded: boolean;
  filter: LogLevel | "all";
  add: (entry: Omit<LogEntry, "id">) => void;
  clear: () => void;
  setExpanded: (v: boolean) => void;
  toggleExpanded: () => void;
  setFilter: (f: LogLevel | "all") => void;
}

const MAX_ENTRIES = 500;

export const useLogStore = create<LogState>((set) => ({
  entries: [],
  expanded: false,
  filter: "all",
  add: (entry) =>
    set((state) => {
      seq += 1;
      const withId: LogEntry = { ...entry, id: `log-${Date.now()}-${seq}` };
      const next = [...state.entries, withId];
      return { entries: next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next };
    }),
  clear: () => set({ entries: [] }),
  setExpanded: (v) => set({ expanded: v }),
  toggleExpanded: () => set((s) => ({ expanded: !s.expanded })),
  setFilter: (f) => set({ filter: f }),
}));
