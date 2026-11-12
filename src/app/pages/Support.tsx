import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../confirm";
import { useApp } from "../context";
import { formatPrice, getTier, ruPlural, tiers, type Tier } from "../data";
import { Button, Chips, Icon, PageHero } from "../ui";

// Placeholder requisites — the client will supply real values.
// `collapsible`: folded behind "Реквизиты для перевода" where the card already has a pay button.
function Requisites({ rows, collapsible, id }: { rows: [string, string][]; collapsible?: boolean; id?: string }) {
  const { t } = useApp();
  const [open, setOpen] = useState(!collapsible);
  const list = (
    <dl className="requisites" hidden={!open} id={id}>
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
  if (!collapsible) return list;
  return (
    <div className="requisites-fold">
      <button aria-controls={id} aria-expanded={open} className="disclosure-button" onClick={() => setOpen(!open)} type="button">
        {t("Аударым деректемелері", "Реквизиты для перевода")}<Icon name="chevron" size={16} />
      </button>
      {list}
    </div>
  );
}

const SPONSOR_MONTHS = 6;
// Only paid tiers that add value beyond the basic course access can be sponsored.
const sponsorTiers = tiers.filter((x) => x.id === "plus" || x.id === "premium");

function SponsorCard() {
  const { t, notify } = useApp();
  const [tier, setTier] = useState<Tier>("plus");
  const [count, setCount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  // "Check before" dialog: tier, term, number of students and total — the same values as on the card.
  const [review, setReview] = useState(false);
  const closeReview = useCallback(() => setReview(false), []);
  // The button is replaced by the code: move focus to the code instead of losing it to the page.
  const codeRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (code) codeRef.current?.focus(); }, [code]);
  const total = getTier(tier)!.price * SPONSOR_MONTHS * Number(count);

  const generate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setCode(`SPONSOR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
      notify(t("Демо-промокод жасалды", "Демо-промокод создан"));
    }, 900);
  };

  return (
    <article className="panel support-card">
      <span className="support-num">01</span>
      <h3>{t("Оқушыға демеушілік", "Спонсорство ученика")}</h3>
      <p>{t("Оқушының оқуын төлеңіз — біз грант промокодын жасаймыз, сіз оны оқушыға бересіз.", "Оплатите обучение ученика — мы создадим грантовый промокод, и вы передадите его ученику.")}</p>
      <p className="support-label" id="sponsor-tier-label">{t("Тариф", "Тариф")} · {SPONSOR_MONTHS} {t("ай", "мес.")}</p>
      <Chips items={sponsorTiers.map((x) => x.name)} labelledBy="sponsor-tier-label" onChange={(name) => { setTier(sponsorTiers.find((x) => x.name === name)!.id); setCode(null); }} value={getTier(tier)!.name} />
      <p className="support-label" id="sponsor-count-label">{t("Оқушылар саны", "Количество учеников")}</p>
      <Chips items={["1", "5", "10"]} labelledBy="sponsor-count-label" onChange={(v) => { setCount(v); setCode(null); }} value={count} />
      <p className="support-label">{t(`Барлығы, ${SPONSOR_MONTHS} ай · ${count} оқушы`, `Итого за ${SPONSOR_MONTHS} мес. · ${count} ${ruPlural(Number(count), ["ученик", "ученика", "учеников"])}`)}</p>
      <p className="price-line">{formatPrice(total)}</p>
      {code ? (
        <div className="promo-code" ref={codeRef} tabIndex={-1}>
          <span>{t(`Промокод · ${count} активация`, `Промокод · активаций: ${count}`)}</span>
          <strong>{code}</strong>
          <small>{t("Демо: нақты төлемнен кейін код поштаға жіберіледі.", "Демо: после реальной оплаты код придёт на почту.")}</small>
        </div>
      ) : (
        <Button full loading={loading} onClick={() => setReview(true)}>{t("Демеуші болу", "Стать спонсором")}</Button>
      )}
      {review && (
        <ConfirmDialog
          className="review-dialog"
          closeLabel={t("Жабу", "Закрыть")}
          confirmLabel={t("Демеуші болу", "Стать спонсором")}
          keepLabel={t("Артқа", "Назад")}
          onClose={closeReview}
          onConfirm={() => { setReview(false); generate(); }}
          primary="confirm"
          title={t("Демеушілікті тексеріңіз", "Проверьте спонсорство")}
        >
          <dl className="review-list">
            <div><dt>{t("Тариф", "Тариф")}</dt><dd>{getTier(tier)!.name}</dd></div>
            <div><dt>{t("Мерзімі", "Срок")}</dt><dd>{SPONSOR_MONTHS} {t("ай", "мес.")}</dd></div>
            <div><dt>{t("Оқушылар саны", "Учеников")}</dt><dd>{count}</dd></div>
            <div><dt>{t("Барлығы", "Итого")}</dt><dd><b>{formatPrice(total)}</b></dd></div>
          </dl>
        </ConfirmDialog>
      )}
      <p className="support-foot">{t("Оқушы кодты тіркелу кезінде, «Тарифтер» немесе «Профиль» бетінде енгізеді.", "Ученик вводит код при регистрации, на странице «Тарифы» или в профиле.")}</p>
    </article>
  );
}

function DevelopmentCard() {
  const { t, notify } = useApp();
  const amounts = [2000, 5000, 10000, 25000];
  const [amount, setAmount] = useState(formatPrice(5000));
  const [monthly, setMonthly] = useState(false);
  const [loading, setLoading] = useState(false);
  const once = t("Бір рет", "Разово");
  const each = t("Ай сайын", "Ежемесячно");

  const donate = () => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); notify(t("Рақмет! Бұл демо — төлем алынбады.", "Спасибо! Это демо — оплата не списана.")); }, 900);
  };

  return (
    <article className="panel support-card">
      <span className="support-num">02</span>
      <h3>{t("Жобаны дамытуға", "Поддержка разработки")}</h3>
      <p>{t("Жаңа сабақтар, аудио жазбалар, қосымша мен сервер шығындары. Әр үлес платформаны тегін бөлімдерімен бірге дамытуға көмектеседі.", "Новые уроки, аудиозаписи, приложение и серверы. Каждый вклад помогает развивать платформу и её бесплатные разделы.")}</p>
      <p className="support-label" id="donate-amount-label">{t("Сома", "Сумма")}</p>
      <Chips items={amounts.map(formatPrice)} labelledBy="donate-amount-label" onChange={setAmount} value={amount} />
      <p className="support-label" id="donate-period-label">{t("Мерзімділік", "Периодичность")}</p>
      <Chips items={[once, each]} labelledBy="donate-period-label" onChange={(v) => setMonthly(v === each)} value={monthly ? each : once} />
      <Button full loading={loading} onClick={donate}>{monthly ? t(`Ай сайын ${amount} қолдау`, `Поддерживать по ${amount} в месяц`) : t(`${amount} қолдау`, `Поддержать на ${amount}`)}</Button>
      <Requisites collapsible id="dev-requisites" rows={[
        [t("Алушы", "Получатель"), t("[Ұйым атауы]", "[Название организации]")],
        [t("БСН", "БИН"), "[000000000000]"],
        ["IBAN", "[KZ00 0000 0000 0000 0000]"],
        ["Kaspi", "[+7 7XX XXX XX XX]"],
      ]} />
    </article>
  );
}

function ZakatCard() {
  const { t } = useApp();
  return (
    <article className="panel support-card">
      <span className="support-num">03</span>
      <h3>{t("Зекет", "Закят")}</h3>
      <p>{t("Зекет бөлек есепшотқа түседі және жобаның басқа шығындарымен араласпайды. Қаражатты бөлу тәртібі [шариғат кеңесімен келісілетін ереже].", "Закят поступает на отдельный счёт и не смешивается с другими расходами проекта. Порядок распределения — [правило, согласованное с шариатским советом].")}</p>
      <ul className="check-list support-list">
        <li><Icon name="check" size={18} />{t("Бөлек есепшот", "Отдельный счёт")}</li>
        <li><Icon name="check" size={18} />{t("Жылдық есеп: [сілтеме]", "Годовой отчёт: [ссылка]")}</li>
        <li><Icon name="check" size={18} />{t("Ханафи мазхабы бойынша", "По ханафитскому мазхабу")}</li>
      </ul>
      <Requisites rows={[
        [t("Алушы", "Получатель"), t("[Зекет қорының атауы]", "[Название фонда закята]")],
        [t("БСН", "БИН"), "[000000000000]"],
        ["IBAN", "[KZ00 0000 0000 0000 0000]"],
        [t("Төлем мақсаты", "Назначение"), t("«Зекет»", "«Закят»")],
      ]} />
      <Button className="panel-gap" full size="sm" to="/questions/ask" variant="secondary">{t("Зекет мөлшері туралы имамнан сұрау", "Спросить имама о размере закята")}</Button>
    </article>
  );
}

export default function Support() {
  const { t } = useApp();
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Жобаны қолдау", "Поддержать проект") }]}
        eyebrow={t("ҚОЛДАУ", "ПОДДЕРЖКА")}
        lead={t("Quran Academy KZ білімді қолжетімді етуге тырысады. Өзіңізге ыңғайлы көмек жолын таңдаңыз.", "Quran Academy KZ стремится сделать знания доступными. Выберите удобный для вас способ помочь.")}
        title={t("Жобаны қолдау", "Поддержать проект")}
      />
      <section className="page-section">
        <div className="container">
          <h2 className="sr-only">{t("Көмектесу жолдары", "Способы помочь")}</h2>
          <div className="support-grid">
            <SponsorCard />
            <DevelopmentCard />
            <ZakatCard />
          </div>
          <div className="inline-cta">
            <p>{t("Есептілік: түскен қаражат пен оның жұмсалуы туралы есеп [кезеңділік] сайын жарияланады.", "Прозрачность: отчёт о поступлениях и расходах публикуется [периодичность].")}</p>
            <Button icon="arrow" to="/contact" variant="secondary">{t("Бізбен байланысу", "Связаться с нами")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
