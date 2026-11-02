import { createContext, useContext } from "react";
import type { Tier } from "./data";

export type Lang = "kz" | "ru";

export interface Subscription {
  tier: Tier;
  source: "payment" | "grant";
  until: Date;
}

export interface AppState {
  dark: boolean;
  setDark: (v: boolean) => void;
  lang: Lang;
  setLang: (v: Lang) => void;
  t: (kz: string, ru: string) => string;
  authed: boolean;
  /** true for any paid tier — unlocks all lessons */
  premium: boolean;
  subscription: Subscription | null;
  login: () => void;
  logout: () => void;
  subscribe: (tier: Tier, months?: number, source?: Subscription["source"]) => void;
  formatDate: (d: Date) => string;
  requireAuth: (action?: () => void) => void;
  done: string[];
  toggleDone: (key: string) => void;
  saved: string[];
  toggleSaved: (key: string) => void;
  notify: (message: string) => void;
}

export const AppCtx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
