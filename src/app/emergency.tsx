import { useState } from "react";
import { emergencyContacts, telegramUrl, whatsappUrl } from "./config";
import { useApp } from "./context";
import { Button, Icon, type IconName } from "./ui";

type Format = "message" | "call";
type Channel = "whatsapp" | "telegram";

/** Quick talk with the on-duty ustaz via WhatsApp / Telegram. Contacts live in config.ts. */
export default function EmergencyContact() {
  const { t, lang } = useApp();
  const [format, setFormat] = useState<Format>("message");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [topic, setTopic] = useState("");

  const formats: { id: Format; icon: IconName; label: string }[] = [
    { id: "message", icon: "chat", label: t("Хабарлама", "Сообщение") },
    { id: "call", icon: "phone", label: t("Қоңырау", "Звонок") },
  ];
  const channels: { id: Channel; icon: IconName; label: string; contact: string }[] = [
    { id: "whatsapp", icon: "chat", label: "WhatsApp", contact: emergencyContacts.whatsappLabel },
    { id: "telegram", icon: "send", label: "Telegram", contact: `@${emergencyContacts.telegram}` },
  ];

  const greeting = format === "call"
    ? t("Ассаляму алейкум! Ұстазбен қоңырау арқылы сөйлескім келеді.", "Ассаляму алейкум! Хочу поговорить с Ұстазом по телефону.")
    : t("Ассаляму алейкум! Ұстазға сұрағым бар.", "Ассаляму алейкум! У меня вопрос к Ұстазу.");
  const text = topic.trim() ? `${greeting} ${t("Тақырып", "Тема")}: ${topic.trim()}` : greeting;
  const href = channel === "whatsapp" ? whatsappUrl(text) : telegramUrl();
  const contact = channels.find((c) => c.id === channel)!.contact;

  return (
    <section aria-labelledby="quick-title" className="quick-consult">
      <div className="quick-info">
        <p className="eyebrow">{t("ЖЕДЕЛ КЕҢЕС", "СРОЧНАЯ КОНСУЛЬТАЦИЯ")}</p>
        <h2 id="quick-title">{t("Кезекші Ұстазбен сөйлесу", "Разговор с дежурным Ұстазом")}</h2>
        <p>{t("Сұрақ күте алмаса, кезекші Ұстазға жазыңыз немесе қоңырау шалуды сұраңыз. Әдетте [30 минут] ішінде жауап береді.", "Если вопрос не может ждать, напишите дежурному Ұстазу или попросите звонок. Обычно он отвечает в течение [30 минут].")}</p>
        <p className="quick-hours"><Icon name="clock" size={18} />{emergencyContacts.hours[lang]}</p>
      </div>
      <div className="quick-form">
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
        <Button full href={href} icon="arrow">{format === "call" ? t("Қоңырауға жазылу", "Записаться на звонок") : t("Сұраныс жіберу", "Отправить запрос")}</Button>
        <p className="quick-contact">
          {channel === "telegram"
            ? t(`Telegram ашылады: ${contact}. Мәтінді чатқа өзіңіз жазасыз.`, `Откроется Telegram: ${contact}. Текст напишете в чате сами.`)
            : t(`WhatsApp ашылады: ${contact}. Хабарлама дайын болады.`, `Откроется WhatsApp: ${contact}. Сообщение будет подготовлено.`)}
        </p>
      </div>
      <p className="quick-disclaimer" role="note">
        {t("Бұл жедел жәрдем қызметі емес. Өмірге немесе денсаулыққа қауіп төнсе, 112 нөміріне қоңырау шалыңыз.", "Это не служба экстренного реагирования. При угрозе жизни или здоровью звоните 112.")}
      </p>
    </section>
  );
}
