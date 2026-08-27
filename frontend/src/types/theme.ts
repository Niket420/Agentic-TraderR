export type ThemeName = "mono" | "signal";

export interface ThemeMeta {
  id: ThemeName;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "mono", label: "MONO", description: "Black & white command terminal" },
  { id: "signal", label: "SIGNAL", description: "White & orange research desk" },
];
