import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from "react-router";
import { AppCtx, useApp, type Lang, type Subscription } from "./context";
import { getTier, isPaidTier, type Tier } from "./data";
import { Brand, Button, Icon, TierBadge, TierPip } from "./ui";

const navItems = (t: (a: string, b: string) => string) => [
  { label: t("Басты бет", "Главная"), to: "/", end: true },
  { label: t("Құран", "Коран"), to: "/quran" },
  { label: t("Академия", "Академия"), to: "/academy" },
  { label: t("Сұрақ-жауап", "Вопросы"), to: "/questions" },
  { label: t("Подкасттар", "Подкасты"), to: "/podcasts" },
  { label: t("Дүкен", "Магазин"), to: "/shop" },
  { label: "Premium", to: "/premium" },
];

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const { dark, setDark, lang, setLang, t, authed, premium, subscription, tier, logout } = useApp();
  const items = navItems(t);
  const ustazAccess = subscription?.tier === "plus" || subscription?.tier === "premium";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (e: MouseEvent) => { if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label={t("Негізгі навигация", "Основная навигация")} className="desktop-nav">
            {items.map((i) => <NavLink end={i.end} key={i.to} to={i.to}>{i.label}</NavLink>)}
          </nav>
          <div className="header-actions">
            <div aria-label={t("Тілді таңдау", "Выбор языка")} className="language-switch" role="group">
              <button aria-pressed={lang === "kz"} onClick={() => setLang("kz")} type="button">ҚАЗ</button>
              <span>/</span>
              <button aria-pressed={lang === "ru"} onClick={() => setLang("ru")} type="button">РУС</button>
            </div>
            <button aria-label={dark ? t("Жарық тақырып", "Светлая тема") : t("Қараңғы тақырып", "Тёмная тема")} className="icon-button" onClick={() => setDark(!dark)} type="button">
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            {authed ? (
              <div className="profile desktop-only" ref={profileRef}>
                <button aria-expanded={profileOpen} aria-label={`${t("Профиль", "Профиль")}${ustazAccess ? ` · ${getTier(subscription?.tier)!.name}` : ""}`} className="icon-button profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button"><Icon name="user" /><TierPip tier={subscription?.tier} /></button>
                {profileOpen && (
                  <div className="profile-menu">
                    <strong>{t("Оқушы", "Ученик")}</strong>
                    {ustazAccess ? <TierBadge tier={subscription?.tier} /> : <span>{getTier(tier)?.name.toUpperCase()}</span>}
                    <Link onClick={() => setProfileOpen(false)} to="/profile">{t("Профиль", "Профиль")}</Link>
                    {ustazAccess && <Link onClick={() => setProfileOpen(false)} to="/ustaz">{t("Ұстазбен байланыс", "Связь с Ұстазом")}</Link>}
                    {!premium && <Link onClick={() => setProfileOpen(false)} to="/premium">{t("Тариф таңдау", "Выбрать тариф")}</Link>}
                    <button onClick={() => { logout(); setProfileOpen(false); }} type="button">{t("Шығу", "Выйти")}</button>
                  </div>
                )}
              </div>
            ) : (
              <Button className="desktop-only" size="sm" to="/login">{t("Кіру", "Войти")}</Button>
            )}
            <button aria-controls="mobile-menu" aria-expanded={menuOpen} aria-label={t("Мәзір", "Меню")} className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} type="button">
              <Icon name={menuOpen ? "close" : "menu"} />{authed && <TierPip tier={subscription?.tier} />}
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-sheet ${menuOpen ? "is-open" : ""}`} id="mobile-menu" inert={!menuOpen}>
        <nav aria-label={t("Мобильді навигация", "Мобильная навигация")}>
          {items.map((i, index) => (
            <NavLink end={i.end} key={i.to} to={i.to}><span>0{index + 1}</span>{i.label}<Icon name="arrow" /></NavLink>
          ))}
          <NavLink to="/beginner"><span>+</span>{t("Жаңадан бастаушыларға", "Для начинающих")}<Icon name="arrow" /></NavLink>
        </nav>
        {authed && ustazAccess && <div className="mobile-tier"><TierBadge tier={subscription?.tier} /></div>}
        <div className="mobile-sheet-actions">
          {authed
            ? <><Button full to="/profile">{t("Профиль", "Профиль")}</Button>{ustazAccess && <Button full to="/ustaz" variant="secondary">{t("Ұстазбен байланыс", "Связь с Ұстазом")}</Button>}<Button full onClick={logout} variant="secondary">{t("Шығу", "Выйти")}</Button></>
            : <><Button full to="/login" variant="secondary">{t("Кіру", "Войти")}</Button><Button full to="/login?mode=register">{t("Тіркелу", "Регистрация")}</Button></>}
        </div>
      </div>
    </>
  );
}

const socials = [
  ["TikTok", "https://www.tiktok.com"],
  ["Instagram", "https://www.instagram.com"],
  ["Telegram", "https://t.me"],
  ["YouTube", "https://www.youtube.com"],
];

function Footer() {
  const { t, lang, setLang, dark, setDark } = useApp();
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand light />
          <p>{t("Құран мен ислам ілімдерін жүйелі үйренуге арналған білім платформасы.", "Образовательная платформа для системного изучения Корана и исламских наук.")}</p>
          <div><span>{t("Ханафи мазхабы", "Ханафитский мазхаб")}</span><span>QMDB</span></div>
          <address className="footer-contact">
            <a href="mailto:info@quranacademy.kz">info@quranacademy.kz</a>
            <a href="tel:+77000000000">+7 700 000 00 00</a>
            <span>{t("Қазақстан, Астана", "Казахстан, Астана")}</span>
          </address>
        </div>
        <div className="footer-nav">
          <p>{t("Платформа", "Платформа")}</p>
          <Link to="/quran">{t("Құран", "Коран")}</Link>
          <Link to="/academy">{t("Онлайн академия", "Онлайн-академия")}</Link>
          <Link to="/questions">{t("Сұрақ-жауап", "Вопросы и ответы")}</Link>
          <Link to="/podcasts">{t("Подкасттар", "Подкасты")}</Link>
          <Link to="/shop">{t("Дүкен", "Магазин")}</Link>
          <Link to="/beginner">{t("Жаңадан бастаушыларға", "Для начинающих")}</Link>
        </div>
        <div className="footer-nav">
          <p>{t("Ақпарат", "Информация")}</p>
          <Link to="/about">{t("Біз туралы", "О нас")}</Link>
          <Link to="/contact">{t("Байланыс", "Контакты")}</Link>
          <Link to="/support">{t("Жобаны қолдау", "Поддержать проект")}</Link>
          <Link to="/about#official">{t("Ресми сілтемелер", "Официальные ссылки")}</Link>
          <Link to="/privacy">{t("Құпиялылық саясаты", "Политика конфиденциальности")}</Link>
          <Link to="/terms">{t("Пайдалану шарттары", "Условия использования")}</Link>
        </div>
        <div className="footer-nav">
          <p>{t("Әлеуметтік желі", "Соцсети")}</p>
          {socials.map(([name, href]) => <a href={href} key={name} rel="noreferrer" target="_blank">{name}<Icon name="arrow" size={14} /></a>)}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Quran Academy KZ</span>
        <div>
          <button aria-pressed={lang === "kz"} onClick={() => setLang("kz")} type="button">Қазақша</button>
          <button aria-pressed={lang === "ru"} onClick={() => setLang("ru")} type="button">Русский</button>
        </div>
        <button onClick={() => setDark(!dark)} type="button">{dark ? "Light" : "Dark"} <Icon name={dark ? "sun" : "moon"} size={16} /></button>
      </div>
    </footer>
  );
}

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useApp();
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div aria-labelledby="auth-title" aria-modal="true" className="auth-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog">
        <button aria-label={t("Жабу", "Закрыть")} className="modal-close icon-button" onClick={onClose} type="button"><Icon name="close" /></button>
        <span className="modal-icon"><Icon name="user" size={25} /></span>
        <p className="eyebrow">QURAN ACADEMY KZ</p>
        <h2 id="auth-title">{t("Бұл мүмкіндікті пайдалану үшін аккаунт қажет.", "Для этого действия нужен аккаунт.")}</h2>
        <p>{t("Оқу прогресін сақтап, курстар мен арнайы материалдарға қол жеткізіңіз.", "Сохраняйте прогресс и получайте доступ к курсам и материалам.")}</p>
        <div className="modal-actions">
          <Button onClick={onClose} to={`/login?mode=register&next=${next}`}>{t("Тіркелу", "Регистрация")}</Button>
          <Button onClick={onClose} to={`/login?next=${next}`} variant="secondary">{t("Кіру", "Войти")}</Button>
        </div>
        <button className="text-button" onClick={onClose} type="button">{t("Қазір емес", "Не сейчас")}</button>
      </div>
    </div>
  );
}

const kzMonths = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];

export default function Root() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("kz");
  const [authed, setAuthed] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => { document.documentElement.lang = lang === "kz" ? "kk" : "ru"; }, [lang]);

  const notify = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);
  const t = useCallback((kz: string, ru: string) => (lang === "kz" ? kz : ru), [lang]);
  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>) => (k: string) => set((l) => (l.includes(k) ? l.filter((x) => x !== k) : [...l, k]));

  const value = {
    dark, setDark, lang, setLang, t, authed, done, saved, notify, subscription,
    tier: subscription?.tier ?? (authed ? "basic" as const : null),
    premium: isPaidTier(subscription?.tier),
    login: () => setAuthed(true),
    logout: () => { setAuthed(false); setSubscription(null); notify(t("Сіз аккаунттан шықтыңыз", "Вы вышли из аккаунта")); navigate("/"); },
    subscribe: (tier: Tier, months = 1, source: Subscription["source"] = "payment") => {
      if (!isPaidTier(tier)) { setSubscription(null); return; }
      const until = new Date();
      until.setMonth(until.getMonth() + months);
      setSubscription({ tier, source, until });
    },
    // Browsers lack Kazakh month names in Intl ("2026 М12 2"), so format kz by hand.
    formatDate: (d: Date) => lang === "kz" ? `${d.getDate()} ${kzMonths[d.getMonth()]} ${d.getFullYear()} ж.` : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
    requireAuth: (action?: () => void) => (authed ? action?.() : setAuthOpen(true)),
    toggleDone: toggle(setDone),
    toggleSaved: toggle(setSaved),
  };

  return (
    <AppCtx.Provider value={value}>
      <div className={`app ${dark ? "theme-dark" : ""}`}>
        <a className="skip-link" href="#main">{t("Мазмұнға өту", "Перейти к содержимому")}</a>
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main id="main"><Outlet /></main>
        <Footer />
        <AuthModal onClose={() => setAuthOpen(false)} open={authOpen} />
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
      <ScrollRestoration />
    </AppCtx.Provider>
  );
}
