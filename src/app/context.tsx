import { createContext, useContext } from "react";

export type Lang = "kz" | "ru";

export interface AppState {
  dark: boolean;
  setDark: (v: boolean) => void;
  lang: Lang;
  setLang: (v: Lang) => void;
  t: (kz: string, ru: string) => string;
  authed: boolean;
  premium: boolean;
  login: () => void;
  logout: () => void;
  subscribe: () => void;
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
