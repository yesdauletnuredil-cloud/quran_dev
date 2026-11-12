import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApp } from "../context";
import { getAchievements, getTier, isPaidTier, nextLesson, ruOf, tierFeatures, totalLessons, type Achievement, type Tier } from "../data";
import { StoryModal } from "../share";
import { Button, EmptyState, Icon, PageHero, PromoField, TierBadge } from "../ui";
import { getVisual } from "../visuals";

function Achievements() {
  const { t, lang, done } = useApp();
  const [story, setStory] = useState<Achievement | null>(null);
  const items = getAchievements(done);
  return (
    <section aria-labelledby="ach-title" className="achievements">
      <h2 className="list-heading" id="ach-title">{t("Жетістіктер", "Достижения")}<span>{items.filter((a) => a.earned).length} / {items.length}</span></h2>
      <div className="achievement-grid">
        {items.map((a) => (
          <article className={`achievement ${a.earned ? "is-earned" : ""}`} key={a.id}>
            <div className="achievement-top">
              {/* Locked achievements show a lock, not the target value, so they never read as earned */}
              <span className="medal">{a.earned ? a.medal : <Icon name="lock" size={18} />}</span>
              {a.demo && <span className="badge badge--demo">DEMO</span>}
            </div>
            <h3>{a.title[lang]}</h3>
            <p>{a.desc[lang]}</p>
            {a.earned
              ? <Button icon="image" onClick={() => setStory(a)} size="sm" variant="secondary">Stories</Button>
              : <>
                  <div aria-hidden="true" className="progress"><i style={{ width: `${(a.progress[0] / (a.progress[1] || 1)) * 100}%` }} /></div>
                  <small>{a.progress[0]} / {a.progress[1]} {t("сабақ", ruOf(a.progress[1], ["урока", "уроков"]))}</small>
                </>}
          </article>
        ))}
      </div>
      <p className="achievements-note">{t("DEMO белгісі бар жетістік үлгі деректермен көрсетілген: күн сериясы әзірге есептелмейді.", "Достижение с меткой DEMO показано на примерных данных: серия дней пока не считается.")}</p>
      {story && (
        <StoryModal
          data={{ eyebrow: t("Жетістік", "Достижение"), title: story.title[lang], subtitle: story.desc[lang], visual: getVisual(story.topic), path: "/profile", medal: story.medal, demo: story.demo }}
          onClose={() => setStory(null)}
        />
      )}
    </section>
  );
}

/**
 * Right after buying or upgrading on /premium: what the new tier opened, from the tier data
 * (features of the new tier that the previous one did not have). Shown once, above progress.
 */
function OpenedPanel({ tier, from, onClose }: { tier: Tier; from: Tier; onClose: () => void }) {
  const { t, lang } = useApp();
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const name = getTier(tier)!.name;
  const gained = tierFeatures.filter((f) => f.tiers.includes(tier) && !f.tiers.includes(from)).map((f) => f.label[lang]);
  return (
    <section aria-labelledby="opened-title" className="panel opened-panel">
      <div className="opened-head">
        <TierBadge tier={tier} />
        <h2 id="opened-title" ref={ref} tabIndex={-1}>{t(`${name} тарифі ашылды`, `Тариф ${name} открыт`)}</h2>
      </div>
      {gained.length > 0 && (
        <>
          <p>{t("Енді сізге қолжетімді:", "Теперь вам доступно:")}</p>
          <ul className="check-list">{gained.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}</ul>
        </>
      )}
      <div className="opened-actions">
        <Button icon="arrow" size="sm" to="/ustaz">{t("Ұстазбен байланыс", "Связь с Ұстазом")}</Button>
        <Button onClick={onClose} size="sm" variant="secondary">{t("Түсінікті", "Понятно")}</Button>
      </div>
    </section>
  );
}

/** First block of the profile: progress and the real next lesson (see nextLesson in data.ts). */
function ProgressPanel() {
  const { t, done, premium } = useApp();
  const next = nextLesson(done, premium);
  const started = done.length > 0;
  return (
    <section aria-labelledby="progress-title" className="panel progress-panel">
      <h2 className="sr-only" id="progress-title">{t("Оқу барысы", "Прогресс обучения")}</h2>
      <p className="progress-count"><strong>{done.length}<small> / {totalLessons}</small></strong><span>{t("сабақ аяқталды", `${ruOf(totalLessons, ["урока", "уроков"])} пройдено`)}</span></p>
      <span aria-hidden="true" className="progress"><i style={{ width: `${(done.length / totalLessons) * 100}%` }} /></span>
      <div className="next-lesson">
        {next ? (
          <>
            <p>
              <span>{started ? t("Келесі сабақ", "Следующий урок") : t("Алғашқы сабақтан бастаңыз", "Начните с первого урока")}</span>
              <b>{next.title}</b>
              <small>{next.topic.title} · {t("Сабақ", "Урок")} {next.index + 1}</small>
            </p>
            <Button icon="arrow" to={next.url}>{started ? t("Жалғастыру", "Продолжить") : t("Бастау", "Начать")}</Button>
          </>
        ) : premium ? (
          <>
            <p><b>{t("Барлық сабақ аяқталды", "Все уроки пройдены")}</b></p>
            <Button icon="arrow" to="/quran" variant="secondary">{t("Сабақтар тізімі", "К списку уроков")}</Button>
          </>
        ) : (
          <>
            <p>
              <b>{t("Тегін сабақтар аяқталды", "Бесплатные уроки пройдены")}</b>
              <small>{t("Қалғандары Plus және Premium тарифтерінде ашылады.", "Остальные открываются на тарифах Plus и Premium.")}</small>
            </p>
            <Button icon="arrow" to="/premium" variant="secondary">{t("Тарифтерді көру", "Посмотреть тарифы")}</Button>
          </>
        )}
      </div>
    </section>
  );
}

/** Promo field for subscribers: folded behind a link, it is rarely needed once a tier is active. */
function PromoDisclosure() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="panel promo-disclosure">
      <button aria-controls="promo-more" aria-expanded={open} className="disclosure-button" onClick={() => setOpen(!open)} type="button">
        {t("Промокодыңыз бар ма?", "Есть промокод?")}<Icon name="chevron" size={16} />
      </button>
      {open && (
        <div className="promo-more" id="promo-more">
          <p>{t("Демеушіден немесе грант бағдарламасынан код алсаңыз, осында енгізіңіз.", "Если вы получили код от спонсора или грантовой программы, введите его здесь.")}</p>
          <PromoField id="promo-profile" />
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { t, authed, subscription, tier: tierId, formatDate, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  // Set by /premium after a purchase or upgrade; cleared on "Понятно" so Back or a revisit doesn't repeat it.
  const opened = (location.state as { opened?: { tier: Tier; from: Tier } } | null)?.opened;
  const closeOpened = () => {
    navigate(location.pathname, { replace: true, state: null });
    // The panel and its button are gone: continue from the progress block's action.
    requestAnimationFrame(() => document.querySelector<HTMLElement>(".progress-panel a, .progress-panel button")?.focus());
  };
  const crumbs = [{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Профиль", "Профиль") }];

  if (!authed) {
    const first = nextLesson([], false)!;
    return (
      <>
        <PageHero crumbs={crumbs} eyebrow={t("ЖЕКЕ КАБИНЕТ", "ЛИЧНЫЙ КАБИНЕТ")} title={t("Профиль", "Профиль")} />
        <section className="page-section">
          <div className="container">
            <EmptyState
              action={(
                <div className="empty-actions">
                  <Button to="/login?next=/profile">{t("Кіру", "Войти")}</Button>
                  <Button icon="arrow" to={first.url} variant="secondary">{t("Алғашқы сабақтан бастау", "Начать с первого урока")}</Button>
                </div>
              )}
              text={t("Тариф пен прогресті көру үшін аккаунтқа кіріңіз.", "Войдите, чтобы увидеть тариф и прогресс.")}
              title={t("Аккаунтқа кіріңіз", "Войдите в аккаунт")}
            />
          </div>
        </section>
      </>
    );
  }

  const tier = getTier(tierId);
  const paid = isPaidTier(tier?.id);

  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={t("ЖЕКЕ КАБИНЕТ", "ЛИЧНЫЙ КАБИНЕТ")} title={t("Профиль", "Профиль")} />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main profile-main">
            {opened && opened.tier === tierId && <OpenedPanel from={opened.from} onClose={closeOpened} tier={opened.tier} />}
            <ProgressPanel />
            {/* Tier as one line; what each tier includes lives on /premium. */}
            <div className="panel tier-row">
              <p className="tier-row-main">
                <span className="tier-row-label">{t("Тариф", "Тариф")}</span>
                {paid ? <TierBadge tier={tier?.id} /> : <b>{tier?.name}</b>}
                <span className="tier-row-meta">
                  {subscription
                    ? `${subscription.source === "grant" ? t("Грант промокоды арқылы", "По грантовому промокоду") : t("Жазылым", "Подписка")} · ${t(`${formatDate(subscription.until)} дейін`, `до ${formatDate(subscription.until)}`)}`
                    : t("Тіркелген әр пайдаланушыға тегін", "Бесплатно для каждого зарегистрированного")}
                </span>
              </p>
              <div className="tier-row-actions">
                <Link className="tier-row-link" to="/premium">{t("Тарифке не кіреді", "Что входит в тариф")}</Link>
                {/* Paid subscription only: a grant has nothing to cancel or change (see the grant note on /premium). */}
                {subscription?.source === "payment" && <Link className="tier-row-link" to="/premium">{t("Жазылымды басқару", "Управлять подпиской")}</Link>}
                {!paid && <Button icon="arrow" size="sm" to="/premium">{t("Plus не Premium-ға өту", "Перейти на Plus или Premium")}</Button>}
              </div>
            </div>
            {paid ? (
              <div className="panel panel--green profile-ustaz">
                <div>
                  <h3>{t("Сіздің Ұстазыңыз", "Ваш Ұстаз")}</h3>
                  <p>{tier?.id === "premium" ? t("Жазбаша сұрақтар, қоңырау не бейне консультация.", "Письменные вопросы, звонок или видеоконсультация.") : t("Ұстазға жеке жазбаша сұрақ қоя аласыз.", "Вы можете задавать Ұстазу личные письменные вопросы.")}</p>
                </div>
                <Button icon="arrow" size="sm" to="/ustaz" variant="light">{t("Ұстазбен байланыс", "Связь с Ұстазом")}</Button>
              </div>
            ) : (
              <div className="ustaz-callout ustaz-callout--profile">
                <span className="ustaz-callout-icon"><Icon name="lock" size={20} /></span>
                <div>
                  <h3>{t("Ұстаз", "Ұстаз")}</h3>
                  <p>{t("Ұстазға жеке сұрақтар және кезекші Ұстазбен жедел байланыс — Plus және Premium тарифтерінде.", "Личные вопросы Ұстазу и срочная связь с дежурным — на тарифах Plus и Premium.")}</p>
                </div>
                <Button icon="arrow" size="sm" to="/ustaz" variant="secondary">{t("Қалай жұмыс істейді", "Как это работает")}</Button>
              </div>
            )}
            <Achievements />
            {paid ? <PromoDisclosure /> : (
              <div className="panel">
                <h3>{t("Грант промокоды", "Грантовый промокод")}</h3>
                <p>{t("Демеушіден немесе грант бағдарламасынан код алсаңыз, осында енгізіңіз.", "Если вы получили код от спонсора или грантовой программы, введите его здесь.")}</p>
                <PromoField id="promo-profile" />
              </div>
            )}
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <div className="tier-heading"><h3>{t("Оқушы", "Ученик")}</h3><TierBadge small tier={tier?.id} /></div>
              <p>[email@example.com]</p>
              <Button full onClick={logout} size="sm" variant="secondary">{t("Шығу", "Выйти")}</Button>
            </div>
            <div className="panel">
              <h3>{t("Жобаны қолдау", "Поддержать проект")}</h3>
              <p>{t("Басқа оқушының оқуына демеуші болыңыз немесе жобаның дамуына үлес қосыңыз.", "Станьте спонсором другого ученика или внесите вклад в развитие проекта.")}</p>
              <Button full icon="arrow" size="sm" to="/support" variant="secondary">{t("Қолдау жолдары", "Способы поддержки")}</Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
