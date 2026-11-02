import { Link, useParams } from "react-router";
import { useApp } from "../context";
import { arabicSamples, getTopic, quranTopics, type Topic } from "../data";
import { AccessBadge, Button, EmptyState, Icon, PageHero } from "../ui";

export function Quran() {
  const { t } = useApp();
  const featured = quranTopics.find((q) => q.slug === "tajweed")!;
  const rest = quranTopics.filter((q) => q.slug !== "tajweed");
  return (
    <>
      <PageHero
        aside={<div className="arabic-aside arabic" lang="ar">ٱقْرَأْ</div>}
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Құран", "Коран") }]}
        eyebrow={t("ҚҰРАН", "КОРАН")}
        lead={t("Оқу, түсіну және күнделікті өмірде қолдануға арналған жүйелі материалдар.", "Системные материалы для чтения, понимания и применения в повседневной жизни.")}
        title={t("Құранды тереңірек таныңыз", "Познайте Коран глубже")}
      />
      <section className="page-section">
        <div className="container">
          <Link className="feature-row" to="/quran/tajweed">
            <div>
              <p className="eyebrow">{t("ҰСЫНЫЛАДЫ", "РЕКОМЕНДУЕМ")}</p>
              <h2>{featured.title}</h2>
              <p>{featured.desc}</p>
              <span className="destination-cta">{t("Сабақтар тізімі", "Список уроков")}<Icon name="arrow" size={18} /></span>
            </div>
            <div className="feature-row-art arabic" lang="ar">تَجْوِيد</div>
          </Link>
          <div className="content-grid">
            {rest.map((item, i) => (
              <Link className="content-card" key={item.slug} to={`/quran/${item.slug}`}>
                <div className="card-top"><span className="card-number">0{i + 1}</span><AccessBadge access={item.access} /></div>
                <h3>{item.title}</h3>
                <p className="card-desc">{item.desc}</p>
                <div className="card-link">{t("Танысу", "Подробнее")} <Icon name="arrow" size={17} /></div>
              </Link>
            ))}
          </div>
          <div className="inline-cta">
            <p>{t("Құранды алғаш үйреніп жатсаңыз, дайын оқу жолынан бастаңыз.", "Если вы только начинаете, пройдите готовый учебный путь.")}</p>
            <Button icon="arrow" to="/beginner" variant="secondary">{t("Жаңадан бастаушыларға", "Для начинающих")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}

export function TopicPage() {
  const { topic: slug } = useParams();
  const topic = getTopic(slug);
  const { t, premium, done } = useApp();
  if (!topic) return <NotFoundBlock />;
  const doneCount = topic.lessons.filter((_, i) => done.includes(`${topic.slug}/${i + 1}`)).length;
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, topic.quran ? { label: t("Құран", "Коран"), to: "/quran" } : { label: t("Академия", "Академия"), to: "/academy" }, { label: topic.title }]}
        eyebrow={topic.quran ? t("ҚҰРАН", "КОРАН") : t("ІЛІМ", "ЗНАНИЯ")}
        lead={topic.desc}
        title={topic.title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <h2 className="list-heading">{t("Сабақтар тізімі", "Список уроков")}<span>{topic.lessons.length}</span></h2>
            <div className="lesson-list">
              {topic.lessons.map((title, i) => <LessonRow done={done.includes(`${topic.slug}/${i + 1}`)} i={i} key={title} locked={i >= topic.freeCount && !premium} title={title} topic={topic} />)}
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <h3>{t("Прогресс", "Прогресс")}</h3>
              <div aria-hidden="true" className="progress"><i style={{ width: `${(doneCount / topic.lessons.length) * 100}%` }} /></div>
              <p>{doneCount} / {topic.lessons.length} {t("сабақ аяқталды", "уроков завершено")}</p>
              <Button full icon="arrow" to={`/quran/${topic.slug}/1`}>{doneCount ? t("Жалғастыру", "Продолжить") : t("Бірінші сабақты бастау", "Начать первый урок")}</Button>
            </div>
            {!premium && topic.freeCount < topic.lessons.length && (
              <div className="panel panel--green">
                <h3>{t("Толық қолжетімділік", "Полный доступ")}</h3>
                <p>{t(`Алғашқы ${topic.freeCount} сабақ тегін. Қалғаны Premium арқылы ашылады.`, `Первые ${topic.freeCount} урока бесплатны. Остальные откроются с Premium.`)}</p>
                <Button full to="/premium" variant="light">{t("Premium туралы", "О Premium")}</Button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

function LessonRow({ topic, title, i, locked, done }: { topic: Topic; title: string; i: number; locked: boolean; done: boolean }) {
  const { t } = useApp();
  return (
    <Link className={`lesson-row ${locked ? "is-locked" : ""} ${done ? "is-done" : ""}`} to={`/quran/${topic.slug}/${i + 1}`}>
      <span className="num">{done ? <Icon name="check" size={16} /> : String(i + 1).padStart(2, "0")}</span>
      <div><h3>{title}</h3><p>{t("Сабақ", "Урок")} {i + 1} · ~{12 + (i % 4) * 4} {t("мин", "мин")}</p></div>
      <AccessBadge access={locked ? "PREMIUM" : "FREE"} />
      <Icon name={locked ? "lock" : "chevron"} size={18} />
    </Link>
  );
}

export function LessonPage() {
  const { topic: slug, n } = useParams();
  const topic = getTopic(slug);
  const { t, premium, done, toggleDone, requireAuth, notify } = useApp();
  const index = Number(n) - 1;
  if (!topic || !(index >= 0 && index < topic.lessons.length)) return <NotFoundBlock />;
  const title = topic.lessons[index];
  const locked = index >= topic.freeCount && !premium;
  const key = `${topic.slug}/${index + 1}`;
  const isDone = done.includes(key);
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, topic.quran ? { label: t("Құран", "Коран"), to: "/quran" } : { label: t("Академия", "Академия"), to: "/academy" }, { label: topic.title, to: `/quran/${topic.slug}` }, { label: `${t("Сабақ", "Урок")} ${index + 1}` }]}
        eyebrow={`${topic.title.toUpperCase()} · ${t("САБАҚ", "УРОК")} ${index + 1}`}
        title={title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            {locked ? (
              <div className="panel panel--green lock-panel">
                <Icon name="lock" size={28} />
                <h3>{t("Бұл сабақ Premium жазылушыларға арналған", "Этот урок доступен подписчикам Premium")}</h3>
                <p>{t("Premium арқылы барлық сабақтар мен қосымша материалдар ашылады. Тегін сабақтар қолжетімді күйінде қалады.", "Premium открывает все уроки и дополнительные материалы. Бесплатные уроки остаются доступными.")}</p>
                <div className="lock-actions">
                  <Button icon="arrow" to="/premium" variant="light">{t("Тарифтерді көру", "Посмотреть тарифы")}</Button>
                  <Button to={`/quran/${topic.slug}`} variant="ghost">{t("Тегін сабақтарға оралу", "К бесплатным урокам")}</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="arabic-block arabic" lang="ar">{arabicSamples[index % arabicSamples.length]}</div>
                <div className="prose">
                  <p>{t(`Бұл сабақта «${title}» тақырыбы қарастырылады. Алдымен қысқа түсіндірмені оқып, содан кейін мысалды дауыстап қайталаңыз.`, `В этом уроке рассматривается тема «${title}». Сначала прочитайте краткое объяснение, затем повторите пример вслух.`)}</p>
                  <h3>{t("Негізгі ойлар", "Главное")}</h3>
                  <ul>
                    <li>{t("Баяу және анық оқыңыз, қарқынды кейін арттырасыз.", "Читайте медленно и чётко, темп увеличите позже.")}</li>
                    <li>{t("Әр мысалды кемінде үш рет қайталаңыз.", "Повторяйте каждый пример не менее трёх раз.")}</li>
                    <li>{t("Күмән туындаса, сабақты қайта тыңдаңыз немесе имамға сұрақ қойыңыз.", "Если возникли сомнения, прослушайте урок снова или задайте вопрос имаму.")}</li>
                  </ul>
                </div>
              </>
            )}
            <div className="lesson-nav">
              {index > 0 ? <Button icon="back" size="sm" to={`/quran/${topic.slug}/${index}`} variant="secondary">{t("Алдыңғы", "Назад")}</Button> : <span />}
              {index < topic.lessons.length - 1 && <Button icon="arrow" size="sm" to={`/quran/${topic.slug}/${index + 2}`} variant="secondary">{t("Келесі сабақ", "Следующий урок")}</Button>}
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <h3>{t("Сабақ күйі", "Статус урока")}</h3>
              <p>{isDone ? t("Аяқталған. Прогресс сақталды.", "Завершён. Прогресс сохранён.") : t("Сабақты аяқтаған соң белгілеңіз. Прогресс аккаунтта сақталады.", "Отметьте урок после завершения. Прогресс сохранится в аккаунте.")}</p>
              <Button disabled={locked} full icon={isDone ? "check" : undefined} onClick={() => requireAuth(() => { toggleDone(key); notify(isDone ? t("Белгі алынды", "Отметка снята") : t("Сабақ аяқталды", "Урок завершён")); })} variant={isDone ? "secondary" : "primary"}>
                {isDone ? t("Аяқталды", "Завершён") : t("Аяқталды деп белгілеу", "Отметить завершённым")}
              </Button>
            </div>
            <div className="panel">
              <h3>{t("Сұрағыңыз бар ма?", "Есть вопрос?")}</h3>
              <p>{t("Сабақ бойынша түсінбеген жерді имамға жіберіңіз.", "Отправьте непонятный момент имаму.")}</p>
              <Button full size="sm" to="/questions/ask" variant="secondary">{t("Имамға сұрақ қою", "Задать вопрос имаму")}</Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export function NotFoundBlock() {
  const { t } = useApp();
  return (
    <section className="page-section">
      <div className="container">
        <EmptyState action={<Button to="/" variant="secondary">{t("Басты бетке", "На главную")}</Button>} text={t("Сұралған бет табылмады.", "Запрошенная страница не найдена.")} title="404" />
      </div>
    </section>
  );
}
