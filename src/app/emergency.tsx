import { useState } from "react";
import { emergencyContacts, telegramUrl, whatsappUrl } from "./config";
import { useApp } from "./context";
import type { PaidTier } from "./data";
import { Button, Icon, type IconName } from "./ui";

type Format = "message" | "call";
type Channel = "whatsapp" | "telegram";

/**
 * Quick talk with the on-duty ustaz via WhatsApp / Telegram — Plus and Premium only.
 * A secondary row under the paid request form; the channel choice opens on demand.
 * Calls follow the paid form: Premium only. Contacts live in config.ts.
 */
export default function EmergencyContact({ tier }: { tier: PaidTier }) {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("message");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [topic, setTopic] = useState("");
  const canCall = tier === "premium";
  const call = canCall && format === "call";

  const formats: { id: Format; icon: IconName; label: string }[] = [
    { id: "message", icon: "chat", label: t("Хабарлама", "Сообщение") },
    { id: "call", icon: "phone", label: t("Қоңырау", "Звонок") },
  ];
  const channels: { id: Channel; icon: IconName; label: string; contact: string }[] = [
    { id: "whatsapp", icon: "chat", label: "WhatsApp", contact: emergencyContacts.whatsappLabel },
    { id: "telegram", icon: "send", label: "Telegram", contact: `@${emergencyContacts.telegram}` },
  ];

  const greeting = call
    ? t("Ассаляму алейкум! Ұстазбен қоңырау арқылы сөйлескім келеді.", "Ассаляму алейкум! Хочу поговорить с Ұстазом по телефону.")
    : t("Ассаляму алейкум! Ұстазға сұрағым бар.", "Ассаляму алейкум! У меня вопрос к Ұстазу.");
  const text = topic.trim() ? `${greeting} ${t("Тақырып", "Тема")}: ${topic.trim()}` : greeting;
  const href = channel === "whatsapp" ? whatsappUrl(text) : telegramUrl();
  const contact = channels.find((c) => c.id === channel)!.contact;
  // The button says what actually happens: a messenger opens, nothing is sent from the site.
  const actionLabel = channel === "telegram"
    ? t("Telegram ашу", "Открыть Telegram")
    : call ? t("WhatsApp-та қоңырау сұрау", "Попросить звонок в WhatsApp") : t("WhatsApp-қа жазу", "Написать в WhatsApp");
  const reply = emergencyContacts.responseTime;

  return (
    <section aria-labelledby="quick-title" className="quick-row">
      <div className="quick-row-head">
        <div>
          <h2 id="quick-title">{t("Жедел сұрақ па?", "Срочный вопрос?")}</h2>
          <p>
            {t("Сұрақ күте алмаса, кезекші Ұстазға жазыңыз.", "Если вопрос не может ждать, напишите дежурному Ұстазу.")}
            {reply && ` ${t(`Әдетте ${reply.kz} ішінде жауап береді.`, `Обычно отвечает в течение ${reply.ru}.`)}`}
          </p>
          <p className="quick-hours"><Icon name="clock" size={16} />{emergencyContacts.hours[lang]}</p>
        </div>
        <button aria-controls="quick-panel" aria-expanded={open} className="button button--secondary button--sm quick-toggle" onClick={() => setOpen(!open)} type="button">
          <span>{t("Кезекші Ұстазға жазу", "Написать дежурному Ұстазу")}</span>
          <Icon name="chevron" size={16} />
        </button>
      </div>
      {open && (
        <div className="quick-form" id="quick-panel">
          {canCall && (
            <fieldset className="method-field">
              <legend>{t("Формат", "Формат")}</legend>
              <div className="method-grid">
                {formats.map((f) => (
                  <label className={`method ${format === f.id ? "selected" : ""}`} key={f.id}>
                    <input checked={format === f.id} name="quick-format" onChange={() => setFormat(f.id)} type="radio" />
                    <Icon name={f.icon} size={18} /><span>{f.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset className="method-field">
            <legend>{t("Байланыс арнасы", "Канал связи")}</legend>
            <div className="method-grid">
              {channels.map((c) => (
                <label className={`method ${channel === c.id ? "selected" : ""}`} key={c.id}>
                  <input checked={channel === c.id} name="quick-channel" onChange={() => setChannel(c.id)} type="radio" />
                  <Icon name={c.icon} size={18} /><span>{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="quick-topic">{t("Тақырып", "Тема")} <span className="optional">{t("(міндетті емес)", "(необязательно)")}</span></label>
            <input className="input" id="quick-topic" onChange={(e) => setTopic(e.target.value)} placeholder={t("Мысалы: жаназа намазы", "Например: джаназа-намаз")} value={topic} />
          </div>
          <Button full href={href} icon="arrow" variant="secondary">{actionLabel}</Button>
          <p className="quick-contact">
            {channel === "telegram"
              ? t(`Telegram ашылады: ${contact}. Мәтінді чатқа өзіңіз жазасыз.`, `Откроется Telegram: ${contact}. Текст напишете в чате сами.`)
              : t(`WhatsApp ашылады: ${contact}. Хабарлама дайын болады.`, `Откроется WhatsApp: ${contact}. Сообщение будет подготовлено.`)}
          </p>
        </div>
      )}
    </section>
  );
}

/** Safety line for every visitor of /ustaz, whatever their tier. */
export function EmergencyNote() {
  const { t } = useApp();
  return (
    <p className="emergency-note" role="note">
      {t("Бұл жедел жәрдем қызметі емес. Өмірге немесе денсаулыққа қауіп төнсе, 112 нөміріне қоңырау шалыңыз.", "Это не служба экстренного реагирования. При угрозе жизни или здоровью звоните 112.")}
    </p>
  );
}
