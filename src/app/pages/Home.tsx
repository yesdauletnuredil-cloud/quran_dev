import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context";
import { courses, getTopic, lessonMinutes, questions, tierPrice, tiers, totalLessons } from "../data";
import { Button, Icon, tierHighlightLines } from "../ui";
import { getVisual, visualUrl } from "../visuals";

/** Russian noun form for a number: [1 урок, 2 урока, 5 уроков]. */
const ruPlural = (n: number, [one, few, many]: [string, string, string]) => {
  const d = n % 10, h = n % 100;
  return d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
};

// Compact tier cards; same sources as /premium. Paid tiers list "everything from <previous>" + their own new features.
function TierPreview() {
  const { t, lang } = useApp();
  return (
    <div className="tier-preview">
      {tiers.map((tier) => {
        const lines = tierHighlightLines(tier.id, t, lang, 3);
        return (
          <article className={`panel tier-preview-card ${tier.id === "plus" ? "is-recommended" : ""}`} key={tier.id}>
            {tier.id === "plus" && <span className="recommend-label">{t("ҰСЫНЫЛАДЫ", "РЕКОМЕНДУЕМ")}</span>}
            <h3>{tier.name}</h3>
            <p className="tier-preview-price">{tierPrice(tier.price, t)}{tier.price > 0 && <small> / {t("ай", "мес")}</small>}</p>
            <ul className="check-list">
              {lines.map((l) => <li key={l}><Icon name="check" size={16} />{l}</li>)}
            </ul>
            <Button full icon="arrow" size="sm" to="/premium" variant={tier.id === "plus" ? "primary" : "secondary"}>{t("Толығырақ", "Подробнее")}</Button>
          </article>
        );
      })}
    </div>
  );
}

// Preview cards for the closing CTA — every value comes from data.ts / app state.
function CtaCards() {
  const { t, done } = useApp();
  const topic = getTopic("tajweed")!;
  const course = courses.find((c) => c.slug === "tajweed-basics")!;
  const question = questions[0];
  const visual = getVisual(topic.slug);
  return (
    <div className="cta-cards">
      <Link className="panel cta-card cta-card--lesson" to={`/quran/${topic.slug}/1`}>
        <span aria-hidden="true" className="cta-card-visual" style={{ backgroundImage: `url("${visualUrl(visual, 600, 160)}")` }}>
          <span className="arabic" lang="ar">{visual.glyph}</span>
        </span>
        <span className="cta-card-label"><Icon name="play" size={14} />{t("Құран", "Коран")} · {topic.title}</span>
        <strong>{topic.lessons[0]}</strong>
        <small>{t("Сабақ", "Урок")} 1 · ~{lessonMinutes(0)} {t("мин", "мин")}</small>
      </Link>
      <Link className="panel cta-card cta-card--course" to={`/academy/${course.slug}`}>
        <span className="cta-card-label"><Icon name="bookmark" size={14} />{t("Онлайн академия", "Онлайн-академия")}</span>
        <strong>{course.title}</strong>
        <small>{course.lessons} {t("сабақ", "уроков")} · {course.time} · {course.level}</small>
      </Link>
      <Link className="panel cta-card cta-card--question" to={`/questions/${question.id}`}>
        <span className="cta-card-label"><Icon name="chat" size={14} />{t("Сұрақ-жауап", "Вопросы")} · {question.category}</span>
        <strong>{question.title}</strong>
        <small>{question.imam}</small>
      </Link>
      <Link className="panel cta-card cta-card--progress" to="/profile">
        <span className="cta-card-label"><Icon name="check" size={14} />{t("Сіздің прогрессіңіз", "Ваш прогресс")}</span>
        <strong><b>{done.length}</b> / {totalLessons} {t("сабақ", "уроков")}</strong>
        <span aria-hidden="true" className="progress"><i style={{ width: `${(done.length / totalLessons) * 100}%` }} /></span>
      </Link>
    </div>
  );
}

export default function Home() {
  const { t } = useApp();
  const [playing, setPlaying] = useState(false);

  // What the platform actually offers; each card links to the section that provides it.
  const benefits: { n: string; title: string; text: string; links: { to: string; label: string }[]; primary?: boolean }[] = [
    { n: "01", primary: true, title: t("Деңгейіңізге сай бастау", "Старт с вашего уровня"), text: t("Жаңадан бастаушыларға дайын жол бар: иман негіздерінен Құран оқуға дейін.", "Для начинающих есть готовый путь: от основ веры до чтения Корана."), links: [{ to: "/beginner", label: t("Жолды көру", "Посмотреть путь") }] },
    { n: "02", title: t("Құран мен тәжуид қадам-қадаммен", "Коран и таджвид шаг за шагом"), text: t("Әліпбиден тәжуид ережелеріне дейін — сабақтар ретімен берілген.", "От алфавита до правил таджвида — уроки идут по порядку."), links: [{ to: "/quran", label: t("Құранға өту", "Перейти к Корану") }] },
    { n: "03", title: t("Курстар мен дайын жауаптар", "Курсы и база ответов"), text: t("Академиядағы жүйелі курстар және имамдар жауап берген сұрақтар базасы.", "Системные курсы Академии и база вопросов с ответами имамов."), links: [{ to: "/academy", label: t("Курстар", "Курсы") }, { to: "/questions", label: t("Сұрақ-жауап", "Вопросы") }] },
    { n: "04", title: t("Өз қарқыныңызбен", "В своём темпе"), text: t("Сабақтарды өз ырғағыңызбен өтіп, аяқталғанын белгілеңіз — прогресс аккаунтта сақталады.", "Проходите уроки в своём ритме и отмечайте завершённые — прогресс сохраняется в аккаунте."), links: [{ to: "/profile", label: t("Прогресс", "Прогресс") }] },
  ];
  const stats: [number, string, [string, string, string]][] = [
    [questions.length, "дайын сұрақ-жауап", ["готовый ответ", "готовых ответа", "готовых ответов"]],
    [courses.length, "Академия курсы", ["курс Академии", "курса Академии", "курсов Академии"]],
    [totalLessons, "сабақ", ["урок", "урока", "уроков"]],
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-grid container">
          <div className="hero-copy">
            <p className="eyebrow">{t("БІЛІМ · РУХАНИЯТ · ДАМУ", "ЗНАНИЕ · ДУХОВНОСТЬ · РАЗВИТИЕ")}</p>
            <h1>
              {t("Құранды үйрену.", "Изучайте Коран.")}<br />
              <em>{t("Білімді тереңдету.", "Углубляйте знания.")}</em>
            </h1>
            <p className="hero-description">{t("Құран мен ислам ілімдерін заманауи, түсінікті және жүйелі форматта үйреніңіз.", "Изучайте Коран и исламские науки в современном, понятном и системном формате.")}</p>
            <div className="hero-actions">
              <Button icon="arrow" to="/quran">{t("Оқуды бастау", "Начать обучение")}</Button>
              <Button to="/beginner" variant="secondary">{t("Неден бастауды білмеймін", "Не знаю, с чего начать")}</Button>
            </div>
            <div className="hero-proof">
              {stats.map(([n, kz, ru]) => <div key={kz}><strong>{n}</strong><span>{t(kz, ruPlural(n, ru))}</span></div>)}
            </div>
          </div>
          <div aria-label={t("Құран аяты бейнеленген сәндік композиция", "Декоративная композиция с аятом")} className="hero-art" role="img">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-card">
              <div className="hero-card-top"><span>96:1</span><span>АЛ-АЛАҚ</span></div>
              <p className="arabic hero-arabic" lang="ar">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
              <span className="translation">{t("«Жаратқан Раббыңның атымен оқы»", "«Читай во имя Господа твоего, который сотворил»")}</span>
              <div className="verse-player">
                <button aria-label={playing ? t("Тоқтату", "Пауза") : t("Аятты тыңдау", "Слушать аят")} onClick={() => setPlaying(!playing)} type="button"><Icon name={playing ? "pause" : "play"} /></button>
                <span className={playing ? "wave is-playing" : "wave"}><i /><i /><i /><i /><i /><i /><i /><i /></span>
                <span>00:18</span>
              </div>
            </div>
            <span className="art-caption">{t("Алғашқы уахи", "Первое откровение")}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="benefits-title" className="section section-tint" id="destinations">
        <div className="container">
          <div className="section-title"><p className="eyebrow">{t("МҮМКІНДІКТЕР", "ВОЗМОЖНОСТИ")}</p><h2 id="benefits-title">{t("Неге осында оқу ыңғайлы", "Почему здесь удобно учиться")}</h2></div>
          <div className="destinations destinations--4">
            {benefits.map((d) => (
              <article className={`destination ${d.primary ? "destination--primary" : ""}`} key={d.n}>
                <span className="destination-n">{d.n}</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
                <div className="destination-links">
                  {d.links.map((l) => <Link className="destination-cta" key={l.to} to={l.to}>{l.label}<Icon name="arrow" size={18} /></Link>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about section">
        <div className="container about-grid">
          <div>
            <p className="eyebrow">{t("БІЗ ТУРАЛЫ", "О НАС")}</p>
            <h2>Quran Academy <span>KZ</span></h2>
          </div>
          <div className="about-copy">
            <p className="about-lead">{t("Құран мен ислам білімін үйренгісі келетін әр адамға ашық кеңістік.", "Открытое пространство для каждого, кто хочет изучать Коран и исламские знания.")}</p>
            <p>{t("Бастапқы деңгейден тереңдетілген білімге дейін: оқу, түсіну және күнделікті өмірде қолдану. Әр материал жүйелі, түсінікті және сенімді дереккөздерге сүйенеді.", "От начального уровня до углублённых знаний: чтение, понимание и применение в жизни. Каждый материал структурирован и опирается на надёжные источники.")}</p>
            <div className="trust-note">
              <Icon name="check" />
              <span>{t("Платформа Ханафи мазхабы негізінде құрылған және QMDB ұсынымдарын ескереді. Материалдар барлық оқырманға ашық.", "Платформа построена на основе ханафитского мазхаба и учитывает рекомендации QMDB. Материалы открыты для всех читателей.")} <Link to="/about">{t("Толығырақ", "Подробнее")}</Link></span>
            </div>
          </div>
        </div>
      </section>

      <section className="section beginner-section">
        <div className="container beginner-shell">
          <div className="beginner-copy">
            <p className="eyebrow">{t("БАСТАУ НҮКТЕСІ", "С ЧЕГО НАЧАТЬ")}</p>
            <h2>{t("Исламды жаңадан үйреніп жүрсіз бе?", "Только начинаете изучать ислам?")}</h2>
            <p>{t("Неден бастау керегін білмесеңіз, біз түсінікті жол дайындадық.", "Если не знаете, с чего начать, мы подготовили понятный путь.")}</p>
            <Button icon="arrow" to="/beginner" variant="light">{t("Жолды көру", "Посмотреть путь")}</Button>
          </div>
          <div className="path-list">
            {[t("Иман негіздері", "Основы веры"), t("Дәрет пен намаз", "Омовение и намаз"), t("Құран оқудың алғашқы қадамдары", "Первые шаги в чтении Корана")].map((item, index) => (
              <div className="path-item" key={item}><span>0{index + 1}</span><b>{item}</b>{index < 2 && <i />}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section access-section">
        <div className="container access-shell">
          <div className="access-heading">
            <div>
              <p className="eyebrow">{t("ҚОЛЖЕТІМДІЛІК", "ДОСТУП")}</p>
              <h2>{t("Алдымен танысыңыз.", "Сначала познакомьтесь.")}<br />{t("Содан кейін тереңдетіңіз.", "Затем углубляйтесь.")}</h2>
            </div>
            <Button to="/premium" variant="secondary">{t("Тарифтерді салыстыру", "Сравнить тарифы")}</Button>
          </div>
          <TierPreview />
        </div>
      </section>

      <section className="final-cta section">
        <div className="container final-cta-grid">
          <div className="final-cta-inner">
            <p className="arabic cta-arabic" lang="ar">رَبِّ زِدْنِي عِلْمًا</p>
            <p className="eyebrow">{t("БІЛІМГЕ ҚАРАЙ БІР ҚАДАМ", "ОДИН ШАГ К ЗНАНИЮ")}</p>
            <h2>{t("Білім жолыңызды бүгін бастаңыз", "Начните путь к знаниям сегодня")}</h2>
            <p>{t("Тіркеліп, өзіңізге қажетті білімді жүйелі түрде үйреніңіз.", "Зарегистрируйтесь и изучайте нужные знания последовательно.")}</p>
            <div>
              <Button icon="arrow" to="/login?mode=register" variant="light">{t("Тіркелу", "Регистрация")}</Button>
              <Button to="/academy" variant="ghost">{t("Курстарды көру", "Смотреть курсы")}</Button>
            </div>
          </div>
          <CtaCards />
        </div>
      </section>
    </>
  );
}
