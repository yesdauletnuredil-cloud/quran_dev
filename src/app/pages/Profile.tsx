import { useApp } from "../context";
import { getTier, tierFeatures } from "../data";
import { Button, EmptyState, Icon, PageHero, PromoField } from "../ui";

export default function Profile() {
  const { t, lang, authed, subscription, done, saved, formatDate, logout } = useApp();
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

  const tier = getTier(subscription?.tier);
  const features = tier ? tierFeatures.filter((f) => f.tiers.includes(tier.id)) : [];

  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={t("ЖЕКЕ КАБИНЕТ", "ЛИЧНЫЙ КАБИНЕТ")} title={t("Профиль", "Профиль")} />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className={`panel tier-panel ${tier ? "panel--green" : ""}`}>
              <p className="eyebrow">{t("ТАРИФ", "ТАРИФ")}</p>
              <h3 className="tier-name">{tier?.name ?? "Free"}</h3>
              {subscription ? (
                <p>
                  {subscription.source === "grant" ? t("Грант промокоды арқылы", "По грантовому промокоду") : t("Жазылым", "Подписка")}
                  {" · "}
                  {t(`${formatDate(subscription.until)} дейін`, `до ${formatDate(subscription.until)}`)}
                </p>
              ) : (
                <p>{t("Тегін сабақтар мен сұрақ-жауап базасы қолжетімді.", "Доступны бесплатные уроки и база вопросов и ответов.")}</p>
              )}
              {features.length > 0 && (
                <ul className="check-list tier-features">
                  {features.map((f) => <li key={f.label.ru}><Icon name="check" size={18} />{f.label[lang]}</li>)}
                </ul>
              )}
              <Button icon="arrow" to="/premium" variant={tier ? "light" : "primary"}>{tier ? t("Тарифті өзгерту", "Изменить тариф") : t("Тариф таңдау", "Выбрать тариф")}</Button>
            </div>
            <div className="profile-stats">
              <div className="panel"><strong>{done.length}</strong><span>{t("аяқталған сабақ", "уроков завершено")}</span></div>
              <div className="panel"><strong>{saved.length}</strong><span>{t("сақталған материал", "сохранённых материалов")}</span></div>
            </div>
            <div className="panel">
              <h3>{t("Грант промокоды", "Грантовый промокод")}</h3>
              <p>{t("Демеушіден немесе грант бағдарламасынан код алсаңыз, осында енгізіңіз.", "Если вы получили код от спонсора или грантовой программы, введите его здесь.")}</p>
              <PromoField id="promo-profile" />
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <h3>{t("Оқушы", "Ученик")}</h3>
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
