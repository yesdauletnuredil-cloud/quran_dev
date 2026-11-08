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
