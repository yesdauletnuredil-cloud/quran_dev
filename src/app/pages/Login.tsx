import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useApp } from "../context";
import { Brand, Button } from "../ui";

export default function Login() {
  const { t, login, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const register = params.get("mode") === "register";
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = t("Электрондық пошта дұрыс емес", "Некорректный e-mail");
    if (password.length < 6) err.password = t("Кемінде 6 таңба", "Не менее 6 символов");
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    window.setTimeout(() => {
      login();
      notify(register ? t("Аккаунт құрылды", "Аккаунт создан") : t("Қош келдіңіз", "Добро пожаловать"));
      navigate(next && next.startsWith("/") ? next : "/", { replace: true });
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
          <Button full icon="arrow" loading={loading} type="submit">{register ? t("Тіркелу", "Зарегистрироваться") : t("Кіру", "Войти")}</Button>
        </form>
        <button className="text-button" onClick={() => { const p = new URLSearchParams(params); register ? p.delete("mode") : p.set("mode", "register"); setParams(p); }} type="button">
          {register ? t("Аккаунтым бар — кіру", "Уже есть аккаунт — войти") : t("Аккаунт жоқ — тіркелу", "Нет аккаунта — зарегистрироваться")}
        </button>
      </div>
    </section>
  );
}
