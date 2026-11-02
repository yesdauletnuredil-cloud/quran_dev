import { useState } from "react";
import { Link, useParams } from "react-router";
import { useApp } from "../context";
import { formatPrice, getProduct, productCategories, products } from "../data";
import { Button, Chips, Icon, PageHero } from "../ui";
import { NotFoundBlock } from "./Quran";

export function Shop() {
  const { t } = useApp();
  const [cat, setCat] = useState(productCategories[0]);
  const shown = products.filter((p) => cat === productCategories[0] || p.category === cat);
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Дүкен", "Магазин") }]}
        eyebrow={t("ДҮКЕН", "МАГАЗИН")}
        lead={t("Оқуға көмектесетін кітаптар, мұсхафтар және оқу құралдары.", "Книги, мусхафы и учебные материалы, которые помогают в обучении.")}
        title={t("Оқуға арналған құралдар", "Всё для учёбы")}
      />
      <section className="page-section">
        <div className="container">
          <Chips items={productCategories} onChange={setCat} value={cat} />
          <div className="course-grid">
            {shown.map((p) => (
              <Link className="course-card product-card" key={p.id} to={`/shop/${p.id}`}>
                <div className="course-visual" data-tone={p.tone === "emerald" ? undefined : p.tone}>
                  <span className="arabic" lang="ar">{p.glyph}</span>
                  <span>{p.category}</span>
                </div>
                <div className="course-content">
                  <h3>{p.title}</h3>
                  <p className="price-line">{formatPrice(p.price)}</p>
                  <span className="card-link">{t("Толығырақ", "Подробнее")} <Icon name="arrow" size={17} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const p = getProduct(id);
  const { t, requireAuth, notify } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (!p) return <NotFoundBlock />;
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Дүкен", "Магазин"), to: "/shop" }, { label: p.title }]}
        eyebrow={p.category.toUpperCase()}
        title={p.title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className="product-visual arabic" data-tone={p.tone} lang="ar">{p.glyph}</div>
            <div className="prose">
              <p>{p.desc}</p>
              <h3>{t("Сипаттамасы", "Характеристики")}</h3>
              <ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <p className="price-big">{formatPrice(p.price * qty)}</p>
              <div className="qty" role="group" aria-label={t("Саны", "Количество")}>
                <button aria-label="−" disabled={qty <= 1} onClick={() => setQty(qty - 1)} type="button">−</button>
                <span aria-live="polite">{qty}</span>
                <button aria-label="+" disabled={qty >= 9} onClick={() => setQty(qty + 1)} type="button">+</button>
              </div>
              <Button full icon="cart" onClick={() => { setAdded(true); notify(t("Себетке қосылды", "Добавлено в корзину")); }}>{added ? t("Себетте", "В корзине") : t("Себетке салу", "В корзину")}</Button>
              {added && <Button className="panel-gap" full onClick={() => requireAuth(() => notify(t("Тапсырыс рәсімдеу жақында қолжетімді болады", "Оформление заказа скоро будет доступно")))} variant="secondary">{t("Тапсырыс беру", "Оформить заказ")}</Button>}
              <p className="panel-note">{t("Тапсырыс беру үшін аккаунт қажет.", "Для оформления заказа нужен аккаунт.")}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
