import { useState } from "react";
import { useApp } from "../context";
import { getAchievements, getTier, totalLessons, type Achievement } from "../data";
import { StoryModal } from "../share";
import { Button, EmptyState, Icon, PageHero, PromoField, TierBadge, tierHighlightLines } from "../ui";
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
                  <small>{a.progress[0]} / {a.progress[1]} {t("сабақ", "уроков")}</small>
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

export default function Profile() {
  const { t, lang, authed, subscription, tier: tierId, done, formatDate, logout } = useApp();
  const crumbs = [{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Профиль", "Профиль") }];

  if (!authed) {
    return (
      <>
        <PageHero crumbs={crumbs} eyebrow={t("ЖЕКЕ КАБИНЕТ", "ЛИЧНЫЙ КАБИНЕТ")} title={t("Профиль", "Профиль")} />
        <section className="page-section">
          <div className="container">
            <EmptyState action={<Button to="/login?next=/profile">{t("Кіру", "Войти")}</Button>} text={t("Тариф пен прогресті көру үшін аккаунтқа кіріңіз.", "Войдите, чтобы увидеть тариф и прогресс.")} title={t("Аккаунтқа кіріңіз", "Войдите в аккаунт")} />
          </div>
        </section>
      </>
    );
  }

  const tier = getTier(tierId);
  // Short summary only; the full comparison lives on /premium.
  const features = tier ? tierHighlightLines(tier.id, t, lang, 3) : [];

  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={t("ЖЕКЕ КАБИНЕТ", "ЛИЧНЫЙ КАБИНЕТ")} title={t("Профиль", "Профиль")} />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className={`panel tier-panel ${subscription ? "panel--green" : ""}`}>
              <p className="eyebrow">{t("ТАРИФ", "ТАРИФ")}</p>
              <h3 className="tier-name">{tier?.name}</h3>
              {subscription ? (
                <p>
                  {subscription.source === "grant" ? t("Грант промокоды арқылы", "По грантовому промокоду") : t("Жазылым", "Подписка")}
                  {" · "}
                  {t(`${formatDate(subscription.until)} дейін`, `до ${formatDate(subscription.until)}`)}
                </p>
              ) : (
                <p>{t("Тегін · тіркелген әр пайдаланушыда бар", "Бесплатно · есть у каждого зарегистрированного пользователя")}</p>
              )}
              {features.length > 0 && (
                <ul className="check-list tier-features">
                  {features.map((f) => <li key={f}><Icon name="check" size={18} />{f}</li>)}
                </ul>
              )}
              <Button icon="arrow" to="/premium" variant={subscription ? "light" : "primary"}>{subscription ? t("Тарифті өзгерту", "Изменить тариф") : t("Plus не Premium-ға өту", "Перейти на Plus или Premium")}</Button>
            </div>
            <div className="profile-stats">
              <div className="panel">
                <strong>{done.length}<small> / {totalLessons}</small></strong>
                <span>{t("сабақ аяқталды", "уроков пройдено")}</span>
                <span aria-hidden="true" className="progress"><i style={{ width: `${(done.length / totalLessons) * 100}%` }} /></span>
              </div>
            </div>
            <Achievements />
            <div className="panel">
              <h3>{t("Грант промокоды", "Грантовый промокод")}</h3>
              <p>{t("Демеушіден немесе грант бағдарламасынан код алсаңыз, осында енгізіңіз.", "Если вы получили код от спонсора или грантовой программы, введите его здесь.")}</p>
              <PromoField id="promo-profile" />
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <div className="tier-heading"><h3>{t("Оқушы", "Ученик")}</h3><TierBadge small tier={tier?.id} /></div>
              <p>[email@example.com]</p>
              <Button full onClick={logout} size="sm" variant="secondary">{t("Шығу", "Выйти")}</Button>
            </div>
            {(tier?.id === "plus" || tier?.id === "premium") && (
              <div className="panel panel--green">
                <h3>{t("Сіздің Ұстазыңыз", "Ваш Ұстаз")}</h3>
                <p>{tier.id === "premium" ? t("Жазбаша сұрақтар, қоңырау не бейне консультация.", "Письменные вопросы, звонок или видеоконсультация.") : t("Ұстазға жеке жазбаша сұрақ қоя аласыз.", "Вы можете задавать Ұстазу личные письменные вопросы.")}</p>
                <Button full icon="arrow" size="sm" to="/ustaz" variant="light">{t("Ұстазбен байланыс", "Связь с Ұстазом")}</Button>
              </div>
            )}
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
