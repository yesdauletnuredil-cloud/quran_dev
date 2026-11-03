// PLACEHOLDER values — replace with the client's real data before launch.

export const site = {
  /** Shown on Stories cards; share links use the current origin. */
  domain: "quranacademy.kz",
  /**
   * Header / footer brand:
   * "logo" — full logo image (emblem + "QURAN academy"), no extra text;
   * "mark" — emblem + "Quran Academy KZ" text.
   */
  brand: "mark" as "logo" | "mark",
};

export const emergencyContacts = {
  /** Digits only, international format, for https://wa.me/<number> */
  whatsapp: "77000000000",
  whatsappLabel: "+7 700 000 00 00",
  /** Username without @, for https://t.me/<username> */
  telegram: "quranacademy_help",
  /** Hours when the line is staffed */
  hours: { kz: "[Күн сайын 09:00–21:00]", ru: "[Ежедневно 09:00–21:00]" },
};

export const whatsappUrl = (text?: string) => `https://wa.me/${emergencyContacts.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const telegramUrl = () => `https://t.me/${emergencyContacts.telegram}`;
