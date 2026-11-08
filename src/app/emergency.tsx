import { emergencyContacts, telegramUrl, whatsappUrl } from "./config";
import { useApp } from "./context";
import type { PaidTier } from "./data";
import { Button, Icon } from "./ui";

/**
 * Urgent contact with the on-duty ustaz — Plus and Premium only. A secondary row under the paid
 * request form (which goes to the assigned ustaz): messenger buttons only, no extra choices.
 * Calls follow the paid form: Premium only. Contacts, hours and reply time live in config.ts.
 */
export default function EmergencyContact({ tier }: { tier: PaidTier }) {
  const { t, lang } = useApp();
  const reply = emergencyContacts.responseTime;
  // Buttons are links that open the messenger in a new tab (Button href → target="_blank").
  const newTab = <span className="sr-only">{t(" (жаңа бетте ашылады)", " (откроется в новой вкладке)")}</span>;
  const message = t("Ассаляму алейкум! Ұстазға сұрағым бар.", "Ассаляму алейкум! У меня вопрос к Ұстазу.");
  const callRequest = t("Ассаляму алейкум! Ұстазбен қоңырау арқылы сөйлескім келеді.", "Ассаляму алейкум! Хочу поговорить с Ұстазом по телефону.");

  return (
    <section aria-labelledby="quick-title" className="quick-row">
      <h2 id="quick-title">{t("Жедел сұрақ — кезекші Ұстазға", "Срочный вопрос — дежурному Ұстазу")}</h2>
      <p>
        {t("Сұрақ күте алмаса. Оқу бойынша әдеттегі сұрақтар — жоғарыдағы бекітілген Ұстазға сұраныс арқылы.", "Если вопрос не может ждать. Обычные вопросы по учёбе — в запросе закреплённому Ұстазу выше.")}
        {reply && ` ${t(`Әдетте ${reply.kz} ішінде жауап береді.`, `Обычно отвечает в течение ${reply.ru}.`)}`}
      </p>
      <p className="quick-hours"><Icon name="clock" size={16} />{emergencyContacts.hours[lang]}</p>
      <div className="quick-actions">
        <Button href={whatsappUrl(message)} icon="chat" size="sm" variant="secondary">{t("WhatsApp-қа жазу", "Написать в WhatsApp")}{newTab}</Button>
        <Button href={telegramUrl()} icon="send" size="sm" variant="secondary">{t("Telegram ашу", "Открыть Telegram")}{newTab}</Button>
        {tier === "premium" && <Button href={whatsappUrl(callRequest)} icon="phone" size="sm" variant="secondary">{t("Қоңырау сұрау", "Попросить звонок")}{newTab}</Button>}
      </div>
      <p className="quick-contacts">WhatsApp: {emergencyContacts.whatsappLabel} · Telegram: @{emergencyContacts.telegram}</p>
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
