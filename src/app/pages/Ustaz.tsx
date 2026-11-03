import { useState } from "react";
import { useApp } from "../context";
import EmergencyContact from "../emergency";
import { type Tier } from "../data";
import { Button, Icon, PageHero, type IconName } from "../ui";

type Method = "chat" | "whatsapp" | "telegram" | "video";
const methods: { id: Method; icon: IconName; label: { kz: string; ru: string }; tiers: Tier[] }[] = [
  { id: "chat", icon: "chat", label: { kz: "Платформадағы чат", ru: "Чат на платформе" }, tiers: ["plus", "premium"] },
  { id: "whatsapp", icon: "chat", label: { kz: "WhatsApp", ru: "WhatsApp" }, tiers: ["plus", "premium"] },
  { id: "telegram", icon: "send", label: { kz: "Telegram", ru: "Telegram" }, tiers: ["plus", "premium"] },
  { id: "video", icon: "video", label: { kz: "Қоңырау не бейне", ru: "Звонок или видео" }, tiers: ["premium"] },
];

function RequestForm({ tier }: { tier: Tier }) {
  const { t, lang, notify } = useApp();
  const topics = [t("Құран оқу және тәжуид", "Чтение Корана и таджвид"), t("Сабақ бойынша сұрақ", "Вопрос по уроку"), t("Ғибадат және фиқһ", "Поклонение и фикх"), t("Жеке жағдай", "Личная ситуация")];
  const times = [t("Таңертең", "Утром"), t("Күндіз", "Днём"), t("Кешке", "Вечером")];
  const [topic, setTopic] = useState(topics[0]);
  const [time, setTime] = useState(times[0]);
  const [method, setMethod] = useState<Method>("chat");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 15) { setError(t("Сұранысты кемінде 15 таңбамен жазыңыз.", "Опишите запрос не короче 15 символов.")); return; }
    setError("");
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setSent(true); notify(t("Сұраныс жіберілді", "Запрос отправлен")); }, 800);
  };

  if (sent) {
    return (
      <div className="panel">
        <span className="badge badge--demo">DEMO</span>
        <h3 className="panel-gap">{t("Сұраныс қабылданды", "Запрос принят")}</h3>
        <p>{t("Ұстаз [1 жұмыс күні] ішінде таңдалған тәсілмен хабарласады. Бұл демо: сұраныс ешқайда жіберілген жоқ.", "Ұстаз свяжется выбранным способом в течение [1 рабочего дня]. Это демо: запрос никуда не отправлен.")}</p>
        <Button onClick={() => { setSent(false); setText(""); }} variant="secondary">{t("Жаңа сұраныс", "Новый запрос")}</Button>
      </div>
    );
  }

  return (
    <form className="panel ustaz-form" noValidate onSubmit={submit}>
      <h3>{t("Консультацияға сұраныс", "Запрос на консультацию")}</h3>
      <div className="field">
        <label htmlFor="u-topic">{t("Тақырып", "Тема")}</label>
        <select className="input select" id="u-topic" onChange={(e) => setTopic(e.target.value)} value={topic}>{topics.map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="u-text">{t("Сұрағыңыз немесе жағдайыңыз", "Ваш вопрос или ситуация")}</label>
        <textarea aria-describedby={error ? "u-err" : undefined} aria-invalid={!!error} className="textarea" id="u-text" onChange={(e) => setText(e.target.value)} value={text} />
        {error && <span className="field-error" id="u-err">{error}</span>}
      </div>
      <fieldset className="field method-field">
        <legend>{t("Байланыс тәсілі", "Способ связи")}</legend>
        <div className="method-grid">
          {methods.map((m) => {
            const allowed = m.tiers.includes(tier);
            return (
              <label className={`method ${method === m.id ? "selected" : ""} ${allowed ? "" : "is-locked"}`} key={m.id}>
                <input checked={method === m.id} disabled={!allowed} name="method" onChange={() => setMethod(m.id)} type="radio" />
                <Icon name={allowed ? m.icon : "lock"} size={18} />
                <span>{m.label[lang]}</span>
                {!allowed && <small>Premium</small>}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="u-time">{t("Ыңғайлы уақыт", "Удобное время")}</label>
        <select className="input select" id="u-time" onChange={(e) => setTime(e.target.value)} value={time}>{times.map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <Button icon="arrow" loading={loading} type="submit">{t("Сұраныс жіберу", "Отправить запрос")}</Button>
    </form>
  );
}

export default function Ustaz() {
  const { t, authed, subscription } = useApp();
  const tier = subscription?.tier;
  const steps = [
    t("Сұраныс қалдырасыз: тақырып, сұрақ және байланыс тәсілі.", "Вы оставляете запрос: тема, вопрос и способ связи."),
    t("Бекітілген Ұстаз [1 жұмыс күні] ішінде жауап береді немесе уақыт ұсынады.", "Закреплённый Ұстаз отвечает или предлагает время в течение [1 рабочего дня]."),
    t("Plus — жазбаша жауап. Premium — қосымша қоңырау не бейне кездесу.", "Plus — письменный ответ. Premium — дополнительно звонок или видеовстреча."),
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Ұстазбен байланыс", "Связь с Ұстазом") }]}
        eyebrow={t("ЖЕКЕ БАЙЛАНЫС", "ЛИЧНАЯ СВЯЗЬ")}
        lead={t("Оқу барысындағы сұрақтарыңызды өзіңізге бекітілген Ұстазбен жеке талқылаңыз.", "Обсуждайте вопросы по обучению лично с закреплённым за вами Ұстазом.")}
        title={t("Ұстазбен жеке байланыс", "Личная связь с Ұстазом")}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <h2 className="list-heading">{t("Қалай жұмыс істейді", "Как это работает")}</h2>
            <ol className="ustaz-steps">{steps.map((s, i) => <li key={s}><span>0{i + 1}</span>{s}</li>)}</ol>
            {tier === "plus" || tier === "premium" ? <RequestForm tier={tier} /> : (
              <div className="panel panel--green lock-panel">
                <Icon name="lock" size={28} />
                <h3>{t("Plus және Premium тарифтерінде қолжетімді", "Доступно на тарифах Plus и Premium")}</h3>
                <p>{t("Plus — Ұстазға жазбаша сұрақ. Premium — қосымша қоңырау не бейне консультация.", "Plus — письменные вопросы Ұстазу. Premium — дополнительно звонок или видеоконсультация.")}</p>
                <div className="lock-actions">
                  <Button icon="arrow" to={authed ? "/premium" : "/login?next=/ustaz"} variant="light">{authed ? t("Тарифтерді көру", "Посмотреть тарифы") : t("Кіру", "Войти")}</Button>
                </div>
              </div>
            )}
          </div>
          <aside className="detail-aside">
            <div className="panel ustaz-card">
              <div className="achievement-top"><span className="medal ustaz-avatar"><Icon name="user" size={24} /></span><span className="badge badge--demo">DEMO</span></div>
              <h3>{t("Ерлан Ұстаз", "Ұстаз Ерлан")}</h3>
              <p>{t("[Ұстаз туралы қысқаша ақпарат: білімі, мамандығы, тәжірибесі]", "[Краткая информация об Ұстазе: образование, специализация, опыт]")}</p>
              <ul className="check-list support-list">
                <li><Icon name="check" size={18} />{t("Тәжуид, фиқһ", "Таджвид, фикх")}</li>
                <li><Icon name="check" size={18} />{t("Қазақ, орыс тілдері", "Казахский, русский")}</li>
              </ul>
            </div>
          </aside>
        </div>
        <div className="container">
          <EmergencyContact />
        </div>
      </section>
    </>
  );
}
