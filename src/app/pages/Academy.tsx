import { useState } from "react";
import { Link, useParams } from "react-router";
import { useApp } from "../context";
import { courses, getCourse, getTopic } from "../data";
import { Button, Chips, EmptyState, Icon, PageHero } from "../ui";
import { NotFoundBlock } from "./Quran";

export function Academy() {
  const { t } = useApp();
  const all = t("Барлығы", "Все");
  const cats = [all, ...Array.from(new Set(courses.map((c) => c.category)))];
  const [cat, setCat] = useState(all);
  const shown = courses.filter((c) => cat === all || c.category === cat);
  return (
    <>
      <PageHero
        aside={<div className="learning-model"><span>{t("Курс", "Курс")}</span><Icon name="arrow" /><span>{t("Сабақ", "Урок")}</span><Icon name="arrow" /><span>{t("Прогресс", "Прогресс")}</span></div>}
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Академия", "Академия") }]}
        eyebrow={t("ЖҮЙЕЛІ ОҚУ", "СИСТЕМНОЕ ОБУЧЕНИЕ")}
        lead={t("Өз қарқыныңызбен оқып, біліміңізді біртіндеп тереңдетіңіз.", "Учитесь в своём темпе и постепенно углубляйте знания.")}
        title={t("Онлайн академия", "Онлайн-академия")}
      />
      <section className="page-section">
        <div className="container">
          <Chips items={cats} onChange={setCat} value={cat} />
          {shown.length ? (
            <div className="course-grid">
              {shown.map((c) => (
                <article className="course-card" key={c.slug}>
                  <div className="course-visual" data-tone={c.tone}>
                    <span className="arabic" lang="ar">{c.glyph}</span>
                    <span>{c.category}</span>
                  </div>
                  <div className="course-content">
                    <div className="course-meta"><span>{c.level}</span><span>FREE + PREMIUM</span></div>
                    <h3>{c.title}</h3>
                    <p>{c.lessons} {t("сабақ", "уроков")} · {c.time}</p>
                    <Button icon="arrow" size="sm" to={`/academy/${c.slug}`} variant="secondary">{t("Курс туралы", "О курсе")}</Button>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState title={t("Курс табылмады", "Курсы не найдены")} />}
          <div className="inline-cta">
            <p>{t("Қай курстан бастау керегін білмесеңіз, бастаушыларға арналған жолды қараңыз.", "Не знаете, какой курс выбрать? Посмотрите путь для начинающих.")}</p>
            <Button icon="arrow" to="/beginner" variant="secondary">{t("Жаңадан бастаушыларға", "Для начинающих")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const course = getCourse(slug);
  const { t, requireAuth, notify } = useApp();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const topic = getTopic(course?.topic);
  if (!course || !topic) return <NotFoundBlock />;

  const enroll = () => requireAuth(() => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setEnrolled(true); notify(t("Курсқа жазылдыңыз", "Вы записались на курс")); }, 700);
  });

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Академия", "Академия"), to: "/academy" }, { label: course.title }]}
        eyebrow={`${course.category.toUpperCase()} · ${course.level.toUpperCase()}`}
        lead={course.desc}
        title={course.title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <h2 className="list-heading">{t("Курс бағдарламасы", "Программа курса")}<span>{topic.lessons.length}</span></h2>
            <div className="lesson-list">
              {topic.lessons.map((title, i) => {
                const locked = i >= topic.freeCount;
                return (
                  <Link className={`lesson-row ${locked ? "is-locked" : ""}`} key={title} to={`/quran/${topic.slug}/${i + 1}`}>
                    <span className="num">{String(i + 1).padStart(2, "0")}</span>
                    <div><h3>{title}</h3></div>
                    <span className={`badge ${locked ? "badge--premium" : "badge--free"}`}>{locked ? "PREMIUM" : "FREE"}</span>
                    <Icon name={locked ? "lock" : "chevron"} size={18} />
                  </Link>
                );
              })}
            </div>
            <h2 className="list-heading">{t("Нәтиже", "Результат")}</h2>
            <ul className="check-list">
              {course.outcomes.map((o) => <li key={o}><Icon name="check" size={18} />{o}</li>)}
            </ul>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <h3>{course.lessons} {t("сабақ", "уроков")} · {course.time}</h3>
              <p>{t("Алғашқы сабақтар тегін. Толық курс үшін Premium қажет.", "Первые уроки бесплатны. Для полного курса нужен Premium.")}</p>
              {enrolled
                ? <Button full icon="arrow" to={`/quran/${topic.slug}/1`}>{t("Оқуды бастау", "Начать обучение")}</Button>
                : <Button full loading={loading} onClick={enroll}>{t("Курсқа жазылу", "Записаться на курс")}</Button>}
              <Button className="panel-gap" full size="sm" to="/premium" variant="secondary">{t("Premium туралы", "О Premium")}</Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
