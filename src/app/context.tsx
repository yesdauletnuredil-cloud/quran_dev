import { createContext, useContext } from "react";
import type { PaidTier, PromoResult, Tier } from "./data";

export type Lang = "kz" | "ru";

export interface Subscription {
  tier: PaidTier;
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
  /** true for Plus / Premium — unlocks all lessons. Basic only gets each topic's free lessons. */
  premium: boolean;
  /** Paid subscription (Plus / Premium) or null */
  subscription: Subscription | null;
  /** Effective tier: Basic for any signed-in user without a paid subscription, null for guests */
  tier: Tier | null;
  login: () => void;
  logout: () => void;
  /** Paid tier → start subscription; "basic" → cancel it */
  subscribe: (tier: Tier, months?: number, source?: Subscription["source"]) => void;
  /** Promo codes this account already redeemed (normalized) */
  usedPromos: string[];
  /** Validates a promo code; on success applies the granted tier and marks the code as used */
  redeemPromo: (code: string) => PromoResult;
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
