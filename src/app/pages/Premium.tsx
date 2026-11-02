import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context";
import { formatPrice, plans } from "../data";
import { Button, Icon, PageHero } from "../ui";

export default function Premium() {
  const { t, lang, authed, premium, subscribe, requireAuth, notify } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("m6");
  const [loading, setLoading] = useState(false);

  const rows: [string, string, boolean, boolean][] = [
    [t("Алғашқы сабақтар мен бастаушылар жолы", "Первые уроки и путь для начинающих"), "", true, true],
    [t("Сұрақ-жауап базасы", "База вопросов и ответов"), "", true, true],
    [t("Толық курстар мен сабақтар", "Полные курсы и уроки"), "", false, true],
    [t("Аудио және видео материалдар", "Аудио и видеоматериалы"), "", false, true],
    [t("Арнайы материалдар мен кітаптар", "Эксклюзивные материалы и книги"), "", false, true],
    [t("Оқу прогресін сақтау", "Сохранение прогресса"), "", false, true],
  ];

  const subscribeNow = () => requireAuth(() => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); subscribe(); notify(t("Premium іске қосылды", "Premium активирован")); navigate("/academy"); }, 900);
  });

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: "Premium" }]}
        eyebrow="FREE · PREMIUM"
        lead={t("Алдымен тегін материалдармен танысыңыз. Дайын болғанда барлық курстарға қолжетімділік алыңыз.", "Сначала познакомьтесь с бесплатными материалами. Когда будете готовы — получите доступ ко всем курсам.")}
        title={t("Біліміңізді жалғастырыңыз", "Продолжайте своё обучение")}
      />
      <section className="page-section">
        <div className="container">
          <div className="compare" role="table">
            <div className="compare-head" role="row"><span role="columnheader" /><span role="columnheader">FREE</span><span role="columnheader">PREMIUM</span></div>
            {rows.map(([label, , free, prem]) => (
              <div className="compare-row" key={label} role="row">
                <span role="cell">{label}</span>
                <span role="cell">{free ? <Icon name="check" size={18} /> : <i className="dash" aria-label={t("Жоқ", "Нет")} />}</span>
                <span className="yes" role="cell">{prem && <Icon name="check" size={18} />}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section section-tint" id="tariffs">
        <div className="container">
          <div className="section-title"><p className="eyebrow">{t("ТАРИФТЕР", "ТАРИФЫ")}</p><h2>{t("Өзіңізге ыңғайлы мерзімді таңдаңыз", "Выберите удобный срок")}</h2><p className="section-intro">{t("Барлық тарифте Premium материалдарына толық қолжетімділік беріледі.", "Все тарифы дают полный доступ к материалам Premium.")}</p></div>
          <div className="pricing-grid" role="radiogroup">
            {plans.map((p) => {
              const on = selected === p.id;
              return (
                <button aria-checked={on} className={`price-card ${on ? "selected" : ""} ${p.id === "m6" ? "recommended" : ""}`} key={p.id} onClick={() => setSelected(p.id)} role="radio" type="button">
                  {p.id === "m6" && <span className="recommend-label">{t("ҰСЫНЫЛАДЫ", "РЕКОМЕНДУЕМ")}</span>}
                  <div className="price-check">{on && <Icon name="check" />}</div>
                  <h3>{p.label[lang]}</h3>
                  <p className="price">{formatPrice(p.price)}</p>
                  <p className="price-per">{formatPrice(p.per)} / {t("ай", "мес")}</p>
                </button>
              );
            })}
          </div>
          <div className="subscribe-bar">
            <p>{t("Аккаунт жоқ болса, тіркелуге бағыттаймыз.", "Если аккаунта нет, предложим зарегистрироваться.")}</p>
            {premium
              ? <Button icon="arrow" to="/academy">{t("Курстарға өту", "Перейти к курсам")}</Button>
              : <Button icon="arrow" loading={loading} onClick={subscribeNow}>{authed ? t("Жазылуды рәсімдеу", "Оформить подписку") : t("Тіркеліп жазылу", "Зарегистрироваться и подписаться")}</Button>}
          </div>
        </div>
      </section>
    </>
  );
}
