// PLACEHOLDER values — replace with the client's real data before launch.

export const site = {
  /** Shown on Stories cards; share links use the current origin and base path. */
  domain: "quranacademy.kz",
  /**
   * Header / footer brand:
   * "logo" — full logo image (emblem + "QURAN academy"), no extra text;
   * "mark" — emblem + "Quran Academy KZ" text.
   */
  brand: "mark" as "logo" | "mark",
};

/**
 * Site base path without the trailing slash: "" at the domain root, "/quran-academy" on GitHub Pages (BASE_PATH at build).
 * Only the path part is used, in case the base is a full URL (FIGMA_PUBLIC_URL).
 */
export const basePath = new URL(import.meta.env.BASE_URL, "http://localhost").pathname.replace(/\/$/, "");
/** Root paths ("/premium", "/visuals/x.jpg") prefixed with the base so they also work in a subfolder; other URLs unchanged. */
export const withBase = (path: string) => (path.startsWith("/") ? `${basePath}${path}` : path);

export const emergencyContacts = {
  /** Digits only, international format, for https://wa.me/<number> */
  whatsapp: "77000000000",
  whatsappLabel: "+7 700 000 00 00",
  /** Username without @, for https://t.me/<username> */
  telegram: "quranacademy_help",
  /** Hours when the line is staffed */
  hours: { kz: "[Күн сайын 09:00–21:00]", ru: "[Ежедневно 09:00–21:00]" },
  /**
   * Typical reply time of the on-duty ustaz, e.g. { kz: "30 минут", ru: "30 минут" }.
   * Leave undefined until the client confirms it: the "usually replies within …" line is then hidden.
   */
  responseTime: undefined as { kz: string; ru: string } | undefined,
};

/** The student's assigned ustaz (paid request form on /ustaz). */
export const assignedUstaz = {
  /**
   * Typical reply time, e.g. { kz: "1 жұмыс күні", ru: "1 рабочего дня" }.
   * Leave undefined until the client confirms it: the "usually within …" text is then hidden.
   */
  replyTime: undefined as { kz: string; ru: string } | undefined,
};

export const whatsappUrl = (text?: string) => `https://wa.me/${emergencyContacts.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const telegramUrl = () => `https://t.me/${emergencyContacts.telegram}`;
