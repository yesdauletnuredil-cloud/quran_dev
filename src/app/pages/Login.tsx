import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useApp } from "../context";
import { checkPromo } from "../data";
import { Brand, Button, promoMessage } from "../ui";

export default function Login() {
  const { t, login, notify, usedPromos, redeemPromo } = useApp();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const register = params.get("mode") === "register";
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promo, setPromo] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; promo?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = t("Электрондық пошта дұрыс емес", "Некорректный e-mail");
    if (password.length < 6) err.password = t("Кемінде 6 таңба", "Не менее 6 символов");
    // Optional promo code: validated up front so a bad code does not silently create a Basic account.
    const withPromo = register && promo.trim() !== "";
    if (withPromo) {
      const check = checkPromo(promo, usedPromos);
      if (check.status !== "ok") err.promo = promoMessage(check, t).text;
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    window.setTimeout(() => {
      login();
      const granted = withPromo ? redeemPromo(promo) : null;
      notify(granted?.status === "ok" ? `${t("Аккаунт құрылды", "Аккаунт создан")} · ${promoMessage(granted, t).text}` : register ? t("Аккаунт құрылды", "Аккаунт создан") : t("Қош келдіңіз", "Добро пожаловать"));
      navigate(next && next.startsWith("/") ? next : granted?.status === "ok" ? "/profile" : "/", { replace: true });
    }, 800);
  };

  return (
    <section className="page-section login-page">
      <div className="container narrow">
        <Brand />
        <h1>{register ? t("Аккаунт ашу", "Создать аккаунт") : t("Кіру", "Вход")}</h1>
        <p className="lead-sm">{t("Прогресті сақтап, курстар мен Premium материалдарға қол жеткізіңіз.", "Сохраняйте прогресс и получайте доступ к курсам и материалам Premium.")}</p>
        <form noValidate onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input aria-invalid={!!errors.email} autoComplete="email" className="input" id="email" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">{t("Құпиясөз", "Пароль")}</label>
            <input aria-invalid={!!errors.password} autoComplete={register ? "new-password" : "current-password"} className="input" id="password" onChange={(e) => setPassword(e.target.value)} type="password" value={password} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          {register && (
            <div className="field">
              <label htmlFor="promo">{t("Промокод", "Промокод")} <span className="optional">{t("(міндетті емес)", "(необязательно)")}</span></label>
              <input aria-describedby="promo-hint" aria-invalid={!!errors.promo} autoCapitalize="characters" className="input promo-input" id="promo" onChange={(e) => { setPromo(e.target.value); setErrors((x) => ({ ...x, promo: undefined })); }} placeholder="GRANT-XXXX" value={promo} />
              {errors.promo
                ? <span className="field-error" id="promo-hint">{errors.promo}</span>
                : <span className="field-hint" id="promo-hint">{t("Демеушіден не грант бағдарламасынан код алсаңыз, тариф тіркелгенде бірден ашылады.", "Если у вас есть код от спонсора или грантовой программы, тариф откроется сразу при регистрации.")}</span>}
            </div>
          )}
          <Button full icon="arrow" loading={loading} type="submit">{register ? t("Тіркелу", "Зарегистрироваться") : t("Кіру", "Войти")}</Button>
        </form>
        <button className="text-button" onClick={() => { const p = new URLSearchParams(params); register ? p.delete("mode") : p.set("mode", "register"); setParams(p); }} type="button">
          {register ? t("Аккаунтым бар — кіру", "Уже есть аккаунт — войти") : t("Аккаунт жоқ — тіркелу", "Нет аккаунта — зарегистрироваться")}
        </button>
      </div>
    </section>
  );
}
