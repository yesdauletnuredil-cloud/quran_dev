import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ConfirmDialog } from "../confirm";
import { useApp } from "../context";
import { getTier, tierFeatures, tierPrice, tiers, type Tier } from "../data";
import { Button, Icon, PageHero, PromoField, tierHighlightLines } from "../ui";

export default function Premium() {
  const { t, lang, authed, subscription, tier, subscribe, requireAuth, notify, formatDate } = useApp();
  const navigate = useNavigate();
  // ?tier=plus preselects a tier (links from the home tier preview); unknown values are ignored.
  const linked = useSearchParams()[0].get("tier");
  const initial = tiers.find((x) => x.id === linked)?.id ?? subscription?.tier ?? "plus";
  const [selected, setSelected] = useState<Tier>(initial);
  // Mobile comparison tab opens on the selected tier and follows the selection; it can still be switched by hand.
  const [mobileTier, setMobileTier] = useState<Tier>(initial);
  const [loading, setLoading] = useState<Tier | null>(null);
  // Lower tier the subscriber asked to move to; the confirmation dialog is open while set.
  const [lowerTo, setLowerTo] = useState<Tier | null>(null);
  const closeLower = useCallback(() => setLowerTo(null), []);
  const current = tier;
  // "Recommended" is a suggestion for people without a paid tier; a subscriber already chose.
  const recommended = (id: Tier) => !subscription && id === "plus";
  const choose = (id: Tier) => { setSelected(id); setMobileTier(id); };

  // Radio group keyboard pattern on the tier options only (not on the action buttons between them):
  // arrows move and select, Home/End jump, Space/Enter select; only the selected option is a Tab stop.
  const onTierKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute("role") !== "radio") return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); choose(target.dataset.tier as Tier); return; }
    const ids = tiers.map((x) => x.id);
    const i = ids.indexOf(selected);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = ids[(next + ids.length) % ids.length];
    choose(id);
    e.currentTarget.querySelector<HTMLElement>(`[role="radio"][data-tier="${id}"]`)?.focus();
  };

  const subscribeNow = (id: Tier) => requireAuth(() => {
    const name = getTier(id)!.name;
    setLoading(id);
    window.setTimeout(() => { setLoading(null); subscribe(id); notify(t(`${name} іске қосылды`, `${name} активирован`)); navigate("/profile"); }, 900);
  });
  const backToBasic = () => { subscribe("basic"); notify(t("Жазылым тоқтатылды. Сіз Basic тарифіндесіз.", "Подписка отменена. Вы на тарифе Basic.")); };

  const rank = (id?: Tier | null) => tiers.findIndex((x) => x.id === id);
  // Features of the current tier that the lower one does not have (from the tier data).
  const lostFeatures = (to: Tier) => tierFeatures.filter((f) => current && f.tiers.includes(current) && !f.tiers.includes(to)).map((f) => f.label[lang]);
  const confirmLower = () => {
    const to = lowerTo; setLowerTo(null);
    if (to === "basic") {
      backToBasic();
      // The link that opened the dialog is gone now; put focus on the Basic card's new action.
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.price-card:has([data-tier="basic"]) .tier-action a, .price-card:has([data-tier="basic"]) .tier-action button')?.focus());
    } else if (to) subscribeNow(to);
  };

  // Each card's own action — the same labels the single button under the cards used to have.
  const action = (id: Tier) => {
    const name = getTier(id)!.name;
    const variant = selected === id ? "primary" : "secondary";
    if (current === id) return <Button full icon="arrow" to="/academy" variant={variant}>{t("Курстарға өту", "Перейти к курсам")}</Button>;
    // Lowering a subscription is never a same-weight button. Grant: not offered at all, the card says
    // until when the grant runs. Paid: a text link that asks for confirmation first.
    if (subscription && rank(id) < rank(current)) {
      // Non-breaking spaces keep the date on one line ("7 мая 2027 г." never leaves "г." alone).
      const until = formatDate(subscription.until).replace(/ /g, "\u00a0");
      return subscription.source === "grant"
        ? <p className="tier-grant-note">{t(`Тариф грант промокоды арқылы ${until} дейін ашық`, `Тариф открыт по грантовому промокоду до ${until}`)}</p>
        : <button className="tier-lower-link" onClick={(e) => { e.stopPropagation(); setLowerTo(id); }} type="button">{id === "basic" ? t("Жазылымды тоқтату", "Отменить подписку") : t(`${name} тарифіне ауысу`, `Перейти на ${name}`)}</button>;
    }
    if (id === "basic") {
      return <Button full icon="arrow" to="/login?mode=register" variant={variant}>{t("Тегін тіркелу", "Зарегистрироваться бесплатно")}</Button>;
    }
    return (
      <Button full icon="arrow" loading={loading === id} onClick={() => subscribeNow(id)} variant={variant}>
        {/* Guests: the note under the cards says registration comes first, so the label stays one line. */}
        {authed && current ? t(`${name} тарифіне ауысу`, `Перейти на ${name}`) : t(`${name} рәсімдеу`, `Оформить ${name}`)}
      </Button>
    );
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Тарифтер", "Тарифы") }]}
        eyebrow="BASIC · PLUS · PREMIUM"
        lead={t("Алдымен тегін материалдармен танысыңыз. Дайын болғанда өзіңізге лайық тарифті таңдаңыз.", "Сначала познакомьтесь с бесплатными материалами. Когда будете готовы — выберите подходящий тариф.")}
        title={t("Біліміңізді жалғастырыңыз", "Продолжайте своё обучение")}
      />
      {lowerTo && subscription && current && (() => {
        const from = getTier(current)!.name, to = getTier(lowerTo)!.name, until = formatDate(subscription.until);
        const cancel = lowerTo === "basic";
        const lost = lostFeatures(lowerTo);
        // The Russian date already ends with "г.", so no extra full stop after it.
        const dot = until.endsWith(".") ? "" : ".";
        const kzLost = lost.length === 1 ? "мына мүмкіндік жабылады" : "мына мүмкіндіктер жабылады";
        return (
          <ConfirmDialog
            closeLabel={t("Жабу", "Закрыть")}
            confirmLabel={cancel ? t("Жазылымды тоқтату", "Отменить подписку") : t(`${to} тарифіне ауысу`, `Перейти на ${to}`)}
            keepLabel={t(`${from} тарифін қалдыру`, `Оставить ${from}`)}
            onClose={closeLower}
            onConfirm={confirmLower}
            title={cancel ? t(`${from} жазылымын тоқтатасыз ба?`, `Отменить подписку ${from}?`) : t(`${from} тарифінен ${to} тарифіне ауысасыз ба?`, `Перейти с ${from} на ${to}?`)}
          >
            <p>{cancel
              ? t(`${from} жазылымы ${until} дейін төленген. Тоқтатқаннан кейін сізде Basic қалады, ${kzLost}:`, `Подписка ${from} оплачена до ${until}${dot} После отмены у вас останется Basic, и пропадёт:`)
              : t(`${from} ${until} дейін төленген. Ауысқаннан кейін ${kzLost}:`, `${from} оплачен до ${until}${dot} После перехода пропадёт:`)}</p>
            <ul className="check-list confirm-lost">{lost.map((f) => <li key={f}><Icon name="close" size={16} />{f}</li>)}</ul>
          </ConfirmDialog>
        );
      })()}
      <section className="page-section" id="tariffs">
        <div className="container">
          <h2 className="sr-only">{t("Тарифті таңдаңыз", "Выберите тариф")}</h2>
          <div className="pricing-grid pricing-grid--tiers" onKeyDown={onTierKey} role="radiogroup" aria-label={t("Тариф", "Тариф")}>
            {tiers.map((p) => {
              const on = selected === p.id;
              return (
                // The card is a frame: the radio (tier info) and the action button are siblings, never nested.
                // A click anywhere on the frame selects the tier; the button also runs its action.
                <div className={`price-card ${on ? "selected" : ""} ${recommended(p.id) ? "recommended" : ""}`} key={p.id} onClick={() => choose(p.id)}>
                  <div
                    aria-checked={on}
                    aria-describedby={`tier-${p.id}-desc tier-${p.id}-list`}
                    aria-label={[
                      p.name,
                      p.price ? `${tierPrice(p.price, t)} ${t("айына", "в месяц")}` : tierPrice(p.price, t),
                      recommended(p.id) && t("ұсынылады", "рекомендуем"),
                      current === p.id && t("ағымдағы тариф", "текущий тариф"),
                    ].filter(Boolean).join(", ")}
                    className="tier-option"
                    data-tier={p.id}
                    role="radio"
                    tabIndex={on ? 0 : -1}
                  >
                    {recommended(p.id) && <span className="recommend-label">{t("ҰСЫНЫЛАДЫ", "РЕКОМЕНДУЕМ")}</span>}
                    <div className="price-check">{current === p.id ? <span className="badge badge--free">{t("Ағымдағы", "Текущий")}</span> : on && <Icon name="check" />}</div>
                    <h3>{p.name}</h3>
                    <p className="price">{tierPrice(p.price, t)}</p>
                    <p className="price-per">{p.price ? `/ ${t("ай", "мес")} · ` : ""}<span id={`tier-${p.id}-desc`}>{p.desc[lang]}</span></p>
                    <ul id={`tier-${p.id}-list`}>
                      {tierHighlightLines(p.id, t, lang).map((l) => <li key={l}><Icon name="check" size={16} />{l}</li>)}
                    </ul>
                  </div>
                  <div className="tier-action">{action(p.id)}</div>
                </div>
              );
            })}
          </div>
          <p className="tier-note">{selected === "basic" ? t("Basic тегін: тіркелген әр пайдаланушыда бар.", "Basic бесплатен: он есть у каждого зарегистрированного пользователя.") : authed ? t("Төлем демо-режимде: нақты ақша алынбайды.", "Оплата в демо-режиме: деньги не списываются.") : t("Аккаунт жоқ болса, тіркелуге бағыттаймыз.", "Если аккаунта нет, предложим зарегистрироваться.")}</p>
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
