import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useApp } from "../context";
import { getTier, tierFeatures, tierPrice, tiers, type Tier } from "../data";
import { Button, Icon, PageHero, PromoField, tierHighlightLines } from "../ui";

export default function Premium() {
  const { t, lang, authed, subscription, tier, subscribe, requireAuth, notify } = useApp();
  const navigate = useNavigate();
  // ?tier=plus preselects a tier (links from the home tier preview); unknown values are ignored.
  const linked = useSearchParams()[0].get("tier");
  const [selected, setSelected] = useState<Tier>(tiers.find((x) => x.id === linked)?.id ?? subscription?.tier ?? "plus");
  const [mobileTier, setMobileTier] = useState<Tier>("premium");
  const [loading, setLoading] = useState(false);
  const current = tier;
  const selectedName = getTier(selected)!.name;

  // Radio group keyboard pattern: arrows move and select, Home/End jump; only the selected card is a Tab stop.
  const onTierKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const ids = tiers.map((x) => x.id);
    const i = ids.indexOf(selected);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = ids[(next + ids.length) % ids.length];
    setSelected(id);
    e.currentTarget.querySelector<HTMLElement>(`[data-tier="${id}"]`)?.focus();
  };

  const subscribeNow = () => requireAuth(() => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); subscribe(selected); notify(t(`${selectedName} іске қосылды`, `${selectedName} активирован`)); navigate("/profile"); }, 900);
  });
  const backToBasic = () => { subscribe("basic"); notify(t("Жазылым тоқтатылды. Сіз Basic тарифіндесіз.", "Подписка отменена. Вы на тарифе Basic.")); };

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Тарифтер", "Тарифы") }]}
        eyebrow="BASIC · PLUS · PREMIUM"
        lead={t("Алдымен тегін материалдармен танысыңыз. Дайын болғанда өзіңізге лайық тарифті таңдаңыз.", "Сначала познакомьтесь с бесплатными материалами. Когда будете готовы — выберите подходящий тариф.")}
        title={t("Біліміңізді жалғастырыңыз", "Продолжайте своё обучение")}
      />
      <section className="page-section" id="tariffs">
        <div className="container">
          <h2 className="sr-only">{t("Тарифті таңдаңыз", "Выберите тариф")}</h2>
          <div className="pricing-grid pricing-grid--tiers" onKeyDown={onTierKey} role="radiogroup" aria-label={t("Тариф", "Тариф")}>
            {tiers.map((p) => {
              const on = selected === p.id;
              return (
                <button
                  aria-checked={on}
                  aria-describedby={`tier-${p.id}-desc tier-${p.id}-list`}
                  aria-label={[
                    p.name,
                    p.price ? `${tierPrice(p.price, t)} ${t("айына", "в месяц")}` : tierPrice(p.price, t),
                    p.id === "plus" && t("ұсынылады", "рекомендуем"),
                    current === p.id && t("ағымдағы тариф", "текущий тариф"),
                  ].filter(Boolean).join(", ")}
                  className={`price-card ${on ? "selected" : ""} ${p.id === "plus" ? "recommended" : ""}`}
                  data-tier={p.id}
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  role="radio"
                  tabIndex={on ? 0 : -1}
                  type="button"
                >
                  {p.id === "plus" && <span className="recommend-label">{t("ҰСЫНЫЛАДЫ", "РЕКОМЕНДУЕМ")}</span>}
                  <div className="price-check">{current === p.id ? <span className="badge badge--free">{t("Ағымдағы", "Текущий")}</span> : on && <Icon name="check" />}</div>
                  <h3>{p.name}</h3>
                  <p className="price">{tierPrice(p.price, t)}</p>
                  <p className="price-per">{p.price ? `/ ${t("ай", "мес")} · ` : ""}<span id={`tier-${p.id}-desc`}>{p.desc[lang]}</span></p>
                  <ul id={`tier-${p.id}-list`}>
                    {tierHighlightLines(p.id, t, lang).map((l) => <li key={l}><Icon name="check" size={16} />{l}</li>)}
                  </ul>
                </button>
              );
            })}
          </div>
          <div className="subscribe-bar">
            <p>{selected === "basic" ? t("Basic тегін: тіркелген әр пайдаланушыда бар.", "Basic бесплатен: он есть у каждого зарегистрированного пользователя.") : authed ? t("Төлем демо-режимде: нақты ақша алынбайды.", "Оплата в демо-режиме: деньги не списываются.") : t("Аккаунт жоқ болса, тіркелуге бағыттаймыз.", "Если аккаунта нет, предложим зарегистрироваться.")}</p>
            {current === selected
              ? <Button icon="arrow" to="/academy">{t("Курстарға өту", "Перейти к курсам")}</Button>
              : selected === "basic"
                ? authed
                  ? <Button onClick={backToBasic} variant="secondary">{t("Basic-ке оралу", "Вернуться на Basic")}</Button>
                  : <Button icon="arrow" to="/login?mode=register">{t("Тегін тіркелу", "Зарегистрироваться бесплатно")}</Button>
              : <Button icon="arrow" loading={loading} onClick={subscribeNow}>
                  {!authed ? t(`Тіркеліп, ${selectedName} алу`, `Зарегистрироваться и оформить ${selectedName}`) : current ? t(`${selectedName} тарифіне ауысу`, `Перейти на ${selectedName}`) : t(`${selectedName} рәсімдеу`, `Оформить ${selectedName}`)}
                </Button>}
          </div>
        </div>
      </section>
      <section className="page-section section-tint">
        <div className="container">
          <div className="section-title"><p className="eyebrow">{t("САЛЫСТЫРУ", "СРАВНЕНИЕ")}</p><h2>{t("Әр тарифте не бар", "Что входит в каждый тариф")}</h2><p className="section-intro">{t("Әр келесі тариф алдыңғысын толық қамтиды. Premium — Plus мүмкіндіктері және Ұстазбен жеке консультация.", "Каждый следующий тариф включает предыдущий. Premium — всё из Plus и личная консультация с Ұстазом.")}</p></div>
          <div aria-label={t("Тарифті көрсету", "Показать тариф")} className="compare-tabs filter-row" role="group">
            {tiers.map((p) => <button aria-pressed={mobileTier === p.id} className={mobileTier === p.id ? "active" : ""} key={p.id} onClick={() => setMobileTier(p.id)} type="button">{p.name}</button>)}
          </div>
          <div className="compare compare--tiers" data-active={mobileTier} role="table">
            <div className="compare-head" role="row">
              <span role="columnheader"><span className="sr-only">{t("Мүмкіндік", "Возможность")}</span></span>
              {tiers.map((p) => <span data-col={p.id} key={p.id} role="columnheader">{p.name.toUpperCase()}</span>)}
            </div>
            {tierFeatures.map((f) => (
              <div className="compare-row" key={f.label.ru} role="row">
                <span role="cell">{f.label[lang]}</span>
                {tiers.map((p) => (
                  <span className={p.id === "premium" ? "yes" : ""} data-col={p.id} key={p.id} role="cell">
                    {f.tiers.includes(p.id)
                      ? <><Icon name="check" size={18} /><span className="sr-only">{t("Бар", "Есть")}</span></>
                      : <><i aria-hidden="true" className="dash" /><span className="sr-only">{t("Жоқ", "Нет")}</span></>}
                  </span>
                ))}
              </div>
            ))}
            <div className="compare-row compare-price" role="row">
              <span role="cell">{t("Бағасы / ай", "Цена / мес")}</span>
              {tiers.map((p) => <span data-col={p.id} key={p.id} role="cell">{tierPrice(p.price, t)}</span>)}
            </div>
          </div>
          <div className="ustaz-callout">
            <span className="ustaz-callout-icon"><Icon name="chat" size={22} /></span>
            <div>
              <h3>{t("Ұстазбен жеке байланыс", "Личная связь с Ұстазом")}</h3>
              <p>{t("Plus — Ұстазға жазбаша сұрақ. Premium — қосымша қоңырау не бейне консультация.", "Plus — письменные вопросы Ұстазу. Premium — дополнительно звонок или видеоконсультация.")}</p>
            </div>
            <Button icon="arrow" to="/ustaz" variant="secondary">{current === "plus" || current === "premium" ? t("Ұстазға жазу", "Написать Ұстазу") : t("Қалай жұмыс істейді", "Как это работает")}</Button>
          </div>
        </div>
      </section>
      <section className="page-section">
        <h2 className="sr-only">{t("Промокод және демеушілік", "Промокод и спонсорство")}</h2>
        <div className="container promo-layout">
          <div className="panel">
            <h3>{t("Промокодыңыз бар ма?", "Есть промокод?")}</h3>
            <p>{t("Демеуші немесе грант бағдарламасы берген кодты енгізіңіз — тариф бірден ашылады.", "Введите код от спонсора или грантовой программы — тариф откроется сразу.")}</p>
            <PromoField id="promo-premium" />
          </div>
          <div className="panel panel--green">
            <h3>{t("Басқа біреудің оқуына көмектескіңіз келе ме?", "Хотите оплатить обучение другому?")}</h3>
            <p>{t("Оқушыға демеуші болыңыз: біз промокод жасаймыз, ол оны осы бетте қолданады.", "Станьте спонсором ученика: мы создадим промокод, который он активирует на этой странице.")}</p>
            <Button icon="arrow" to="/support" variant="light">{t("Жобаны қолдау", "Поддержать проект")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
