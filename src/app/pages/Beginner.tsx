import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context";
import { Button, Icon, PageHero } from "../ui";

export default function Beginner() {
  const { t } = useApp();
  const [level, setLevel] = useState(0);
  const levels = [
    t("Әліпбиді білмеймін", "Не знаю алфавит"),
    t("Әріптерді танимын, баяу оқимын", "Знаю буквы, читаю медленно"),
    t("Оқимын, тәжуидті үйренгім келеді", "Читаю, хочу изучить таджвид"),
  ];
  const steps = [
    { title: t("Иман негіздері", "Основы веры"), to: "/quran/aqidah", text: t("Иманның алты шарты.", "Шесть столпов веры.") },
    { title: t("Тазалық және дәрет", "Чистота и омовение"), to: "/quran/fiqh", text: t("Күнделікті ғибадаттың негізі.", "Основа ежедневных обрядов.") },
    { title: t("Намаз", "Намаз"), to: "/questions?cat=Намаз", text: t("Шарттары мен орындалу тәртібі.", "Условия и порядок совершения.") },
    { title: t("Құран оқу", "Чтение Корана"), to: "/quran/learn-quran", text: t("Әріптерден сөздерге дейін.", "От букв до слов.") },
    { title: t("Тәжуид", "Таджвид"), to: "/quran/tajweed", text: t("Дұрыс оқу ережелері.", "Правила правильного чтения.") },
    { title: t("Дұғалар", "Дуа"), to: "/questions?cat=Дұғалар", text: t("Күнделікті дұғалар.", "Ежедневные дуа.") },
  ];
  const recommended = [
    { to: "/academy/recitation-start", label: t("Құран оқуды бастау курсы", "Курс «Начало чтения Корана»") },
    { to: "/academy/tajweed-basics", label: t("Тәжуид негіздері курсы", "Курс «Основы таджвида»") },
    { to: "/academy/tajweed-basics", label: t("Тәжуид негіздері курсы (толық)", "Курс «Основы таджвида» (полный)") },
  ][level];

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Жаңадан бастаушыларға", "Для начинающих") }]}
        eyebrow={t("БАСТАУ НҮКТЕСІ", "С ЧЕГО НАЧАТЬ")}
        lead={t("Неден бастау керегін білмесеңіз, дәл осы жерден бастаңыз. Қадамдар қарапайымнан күрделіге қарай реттелген.", "Если не знаете, с чего начать — начните здесь. Шаги идут от простого к сложному.")}
        title={t("Білім жолының алғашқы қадамы", "Первый шаг на пути к знаниям")}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <h2 className="list-heading">{t("Сіздің деңгейіңіз қандай?", "Какой у вас уровень?")}</h2>
            <div className="choice-list" role="radiogroup">
              {levels.map((l, i) => (
                <button aria-checked={level === i} className={`choice ${level === i ? "selected" : ""}`} key={l} onClick={() => setLevel(i)} role="radio" type="button">
                  <span>{l}</span>{level === i && <Icon name="check" size={18} />}
                </button>
              ))}
            </div>
            <div className="panel panel--green recommend">
              <p className="eyebrow">{t("ҰСЫНЫЛАТЫН ЖОЛ", "РЕКОМЕНДУЕМЫЙ ПУТЬ")}</p>
              <h3>{recommended.label}</h3>
              <Button icon="arrow" to={recommended.to} variant="light">{t("Курсты ашу", "Открыть курс")}</Button>
            </div>
          </div>
          <aside className="detail-aside">
            <h2 className="list-heading">{t("Толық жол", "Полный путь")}</h2>
            <div className="steps-path">
              {steps.map((s, i) => (
                <Link key={s.title} to={s.to}>
                  <span>0{i + 1}</span>
                  <div><b>{s.title}</b><small>{s.text}</small></div>
                  <Icon name="chevron" size={18} />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
