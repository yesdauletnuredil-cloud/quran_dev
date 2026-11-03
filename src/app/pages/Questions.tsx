import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useApp } from "../context";
import { getQuestion, questionCategories, questions } from "../data";
import { Button, EmptyState, Icon, PageHero } from "../ui";
import { NotFoundBlock } from "./Quran";
import { SharePanel } from "../share";
import { questionVisual } from "../visuals";

export function Questions() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "";
  const update = (next: { q?: string; cat?: string }) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) v ? p.set(k, v) : p.delete(k);
    setParams(p, { replace: true });
  };
  const shown = questions.filter((x) => (!cat || x.category === cat) && `${x.title} ${x.category} ${x.short}`.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Сұрақ-жауап", "Вопросы и ответы") }]}
        eyebrow={t("СҰРАҚ-ЖАУАП", "ВОПРОСЫ И ОТВЕТЫ")}
        lead={t("3000+ дайын сұрақ пен жауап. Таппасаңыз, имамға сұрақ қойыңыз.", "Более 3000 готовых вопросов и ответов. Не нашли — задайте вопрос имаму.")}
        title={t("Сенімді жауапты табыңыз", "Найдите надёжный ответ")}
      />
      <section className="page-section">
        <div className="container">
          <div className="search-box">
            <Icon name="search" />
            <input aria-label={t("Сұрақтарды іздеу", "Поиск по вопросам")} onChange={(e) => update({ q: e.target.value })} placeholder={t("Сұрағыңызды іздеңіз…", "Найдите свой вопрос…")} type="search" value={q} />
          </div>
          <div className="filter-row" role="group">
            <button aria-pressed={!cat} className={!cat ? "active" : ""} onClick={() => update({ cat: "" })} type="button">{t("Барлығы", "Все")}</button>
            {questionCategories.map((c) => <button aria-pressed={cat === c} className={cat === c ? "active" : ""} key={c} onClick={() => update({ cat: c })} type="button">{c}</button>)}
          </div>
          <div className="question-list">
            {shown.length ? shown.map((x, i) => (
              <Link className="question-row" key={x.id} to={`/questions/${x.id}`}>
                <span className="question-index">{String(i + 1).padStart(2, "0")}</span>
                <div><span>{x.category}</span><h3>{x.title}</h3><p>{x.short}</p></div>
                <span className="row-chevron"><Icon name="chevron" /></span>
              </Link>
            )) : (
              <EmptyState
                action={<Button size="sm" to="/questions/ask" variant="secondary">{t("Имамға сұрақ қою", "Задать вопрос имаму")}</Button>}
                text={t("Басқа сөзбен іздеп көріңіз немесе сұрағыңызды имамға жіберіңіз.", "Попробуйте другие слова или отправьте вопрос имаму.")}
                title={t("Нәтиже табылмады", "Ничего не найдено")}
              />
            )}
          </div>
          <div className="inline-cta">
            <p>{t("Жауап таппадыңыз ба?", "Не нашли ответ?")}</p>
            <Button icon="arrow" to="/questions/ask">{t("Имамға сұрақ қою", "Задать вопрос имаму")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}

export function Answer() {
  const { id } = useParams();
  const item = getQuestion(id);
  const { t } = useApp();
  if (!item) return <NotFoundBlock />;
  const related = questions.filter((x) => x.category === item.category && x.id !== item.id).concat(questions.filter((x) => x.category !== item.category && x.id !== item.id)).slice(0, 3);
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Сұрақ-жауап", "Вопросы и ответы"), to: "/questions" }, { label: item.category, to: `/questions?cat=${encodeURIComponent(item.category)}` }]}
        eyebrow={item.category.toUpperCase()}
        title={item.title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className="prose">
              <p className="answer-meta">{item.imam} · {item.date}</p>
              {item.answer.map((p) => <p key={p}>{p}</p>)}
              <p className="note">{t("Бұл жауап жалпы білім беру мақсатында берілген. Жеке жағдайыңыз үшін имамға сұрақ қойыңыз.", "Ответ носит общий образовательный характер. По вашей конкретной ситуации обратитесь к имаму.")}</p>
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel panel--green">
              <h3>{t("Жеке сұрағыңыз бар ма?", "Остался личный вопрос?")}</h3>
              <p>{t("Имамға сұрағыңызды жіберіңіз, жауап аккаунтыңызға келеді.", "Отправьте вопрос имаму, ответ придёт в ваш аккаунт.")}</p>
              <Button full icon="arrow" to="/questions/ask" variant="light">{t("Имамға сұрақ қою", "Задать вопрос имаму")}</Button>
            </div>
            <SharePanel path={`/questions/${item.id}`} story={{ eyebrow: `${t("Сұрақ-жауап", "Вопрос-ответ")} · ${item.category}`, title: item.title, subtitle: item.short, visual: questionVisual, path: `/questions/${item.id}` }} title={item.title} />
          </aside>
        </div>
        <div className="container related">
          <h2 className="list-heading">{t("Ұқсас сұрақтар", "Похожие вопросы")}</h2>
          <div className="question-list">
            {related.map((x, i) => (
              <Link className="question-row" key={x.id} to={`/questions/${x.id}`}>
                <span className="question-index">0{i + 1}</span>
                <div><span>{x.category}</span><h3>{x.title}</h3></div>
                <span className="row-chevron"><Icon name="chevron" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function AskImam() {
  const { t, authed, requireAuth, notify } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [category, setCategory] = useState(questionCategories[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 15) { setError(t("Сұрақты кемінде 15 таңбамен жазыңыз.", "Напишите вопрос не короче 15 символов.")); return; }
    setError("");
    requireAuth(() => {
      setLoading(true);
      window.setTimeout(() => { setLoading(false); setSent(true); notify(t("Сұрақ жіберілді", "Вопрос отправлен")); }, 800);
    });
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Сұрақ-жауап", "Вопросы и ответы"), to: "/questions" }, { label: t("Имамға сұрақ", "Вопрос имаму") }]}
        eyebrow={t("ИМАМҒА СҰРАҚ", "ВОПРОС ИМАМУ")}
        lead={t("Сұрағыңызды анық жазыңыз. Жауап әдетте бірнеше жұмыс күні ішінде беріледі.", "Сформулируйте вопрос чётко. Ответ обычно приходит в течение нескольких рабочих дней.")}
        title={t("Сұрағыңызды жіберіңіз", "Отправьте свой вопрос")}
      />
      <section className="page-section">
        <div className="container narrow">
          {sent ? (
            <div className="panel">
              <h3>{t("Рақмет! Сұрағыңыз қабылданды.", "Спасибо! Ваш вопрос принят.")}</h3>
              <p>{t("Жауап дайын болғанда аккаунтыңызда көрсетіледі. Осы уақытта дайын жауаптарды қарап шығыңыз.", "Ответ появится в вашем аккаунте. А пока посмотрите готовые ответы.")}</p>
              <Button onClick={() => navigate("/questions")} variant="secondary">{t("Барлық сұрақтарға", "Ко всем вопросам")}</Button>
            </div>
          ) : (
            <form noValidate onSubmit={submit}>
              {!authed && <p className="form-note"><Icon name="lock" size={16} />{t("Сұрақ жіберу үшін аккаунт қажет. Жіберу кезінде кіруді сұраймыз.", "Для отправки вопроса нужен аккаунт. При отправке попросим войти.")}</p>}
              <div className="field">
                <label htmlFor="cat">{t("Санат", "Категория")}</label>
                <select className="input select" id="cat" onChange={(e) => setCategory(e.target.value)} value={category}>{questionCategories.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <div className="field">
                <label htmlFor="q">{t("Сұрағыңыз", "Ваш вопрос")}</label>
                <textarea aria-describedby={error ? "q-err" : undefined} aria-invalid={!!error} className="textarea" id="q" onChange={(e) => setText(e.target.value)} value={text} />
                {error && <span className="field-error" id="q-err">{error}</span>}
              </div>
              <Button icon="arrow" loading={loading} type="submit">{t("Жіберу", "Отправить")}</Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
