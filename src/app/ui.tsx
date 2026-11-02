import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "./context";
import { checkPromo, getTier, type PromoResult } from "./data";

export type IconName =
  | "arrow" | "back" | "bookmark" | "cart" | "check" | "chevron" | "close" | "globe" | "lock"
  | "menu" | "moon" | "pause" | "play" | "search" | "sun" | "user" | "mail";

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  back: <path d="M19 12H5M10 7l-5 5 5 5" />,
  bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.7L6 21V4.8Z" />,
  cart: <><path d="M3 4h2.5l2 11h10l2-8H7" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  moon: <path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" />,
  pause: <path d="M8 6v12M16 6v12" />,
  play: <path d="m9 7 9 5-9 5V7Z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {paths[name]}
    </svg>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  icon?: IconName;
  onClick?: () => void;
  to?: string;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "light";
  size?: "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
}

export function Button({ children, className = "", icon, onClick, to, href, type = "button", variant = "primary", size = "md", disabled, loading, full }: ButtonProps) {
  const cls = `button button--${variant} ${size === "sm" ? "button--sm" : ""} ${full ? "button--full" : ""} ${loading ? "is-loading" : ""} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {loading ? <i aria-hidden="true" className="spinner" /> : icon && <Icon name={icon} size={18} />}
    </>
  );
  if (to && !disabled) return <Link className={cls} to={to}>{inner}</Link>;
  if (href && !disabled) return <a className={cls} href={href} rel="noreferrer" target="_blank">{inner}</a>;
  return (
    <button aria-busy={loading || undefined} className={cls} disabled={disabled || loading} onClick={onClick} type={type}>
      {inner}
    </button>
  );
}

export function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="section-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p className="section-intro">{text}</p>}
    </div>
  );
}

export function Brand({ light }: { light?: boolean }) {
  const { t } = useApp();
  return (
    <Link aria-label={t("Quran Academy KZ — басты бет", "Quran Academy KZ — главная")} className={`brand ${light ? "brand--light" : ""}`} to="/">
      <span className="brand-mark"><span>ق</span></span>
      <span className="brand-name">Quran Academy <b>KZ</b></span>
    </Link>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {i < items.length - 1 && <span aria-hidden="true" className="breadcrumb-sep">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({ crumbs, eyebrow, title, lead, aside }: { crumbs?: { label: string; to?: string }[]; eyebrow?: string; title: React.ReactNode; lead?: string; aside?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="container">
        {crumbs && <Breadcrumb items={crumbs} />}
        <div className={aside ? "page-hero-grid" : ""}>
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {lead && <p className="lead">{lead}</p>}
          </div>
          {aside && <aside>{aside}</aside>}
        </div>
      </div>
    </section>
  );
}

export function AccessBadge({ access }: { access: "FREE" | "PREMIUM" }) {
  return (
    <span className={`badge ${access === "PREMIUM" ? "badge--premium" : "badge--free"}`}>
      {access === "PREMIUM" && <Icon name="lock" size={12} />}{access}
    </span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function PromoField({ id = "promo" }: { id?: string }) {
  const { t, requireAuth, subscribe, notify } = useApp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoResult | "empty" | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setResult("empty"); return; }
    setResult(null);
    requireAuth(() => {
      setLoading(true);
      window.setTimeout(() => {
        const r = checkPromo(code);
        setLoading(false);
        setResult(r);
        if (r.status === "ok") { subscribe(r.tier, r.months, "grant"); notify(t("Промокод іске қосылды", "Промокод активирован")); }
      }, 800);
    });
  };

  const error = result === "empty" ? t("Промокодты енгізіңіз", "Введите промокод")
    : result?.status === "invalid" ? t("Мұндай промокод табылмады. Әріптерді тексеріңіз.", "Такой промокод не найден. Проверьте написание.")
    : result?.status === "expired" ? t("Бұл промокодтың мерзімі өтіп кеткен. Жаңа код алу үшін демеушіге хабарласыңыз.", "Срок действия промокода истёк. Обратитесь к спонсору за новым кодом.")
    : null;

  return (
    <form className="promo-form" noValidate onSubmit={submit}>
      <label htmlFor={id}>{t("Промокод", "Промокод")}</label>
      <div className="promo-row">
        <input aria-describedby={`${id}-status`} aria-invalid={!!error} autoCapitalize="characters" className="input" id={id} onChange={(e) => { setCode(e.target.value); setResult(null); }} placeholder="GRANT-XXXX" value={code} />
        <Button loading={loading} type="submit" variant="secondary">{t("Қолдану", "Применить")}</Button>
      </div>
      <div aria-live="polite" id={`${id}-status`}>
        {error && <span className="field-error">{error}</span>}
        {result !== "empty" && result?.status === "ok" && (
          <p className="promo-success"><Icon name="check" size={18} />{t(`${getTier(result.tier)?.name} тарифі ${result.months} айға ашылды — грант арқылы.`, `Тариф ${getTier(result.tier)?.name} открыт на ${result.months} мес. по гранту.`)}</p>
        )}
      </div>
    </form>
  );
}

export function Chips({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="filter-row" role="group">
      {items.map((item) => (
        <button aria-pressed={value === item} className={value === item ? "active" : ""} key={item} onClick={() => onChange(item)} type="button">{item}</button>
      ))}
    </div>
  );
}
