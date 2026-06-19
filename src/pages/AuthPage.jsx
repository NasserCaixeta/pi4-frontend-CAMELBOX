import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  bg: "#0F0D08",
  border: "#3A3120",
  amberDark: "#A07C2A",
  error: "#C0503A",
  success: "#5A9A6A",
};

function CamelIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 17c0-2.5 1-4 3-5 1-.5 2-1 2-2.5V8c0-1.5 1-2.5 2.5-2.5S16 6.5 16 8v1c0 1.5 1 2 2 2.5 1.5.7 2 2 2 4v2H4v-1z"
        fill={COLORS.bg}
        stroke={COLORS.bg}
        strokeWidth="0"
      />
      <ellipse cx="9" cy="7.5" rx="2" ry="2.5" fill={COLORS.bg} />
      <path d="M4 19h16" stroke={COLORS.bg} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: COLORS.border };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"];
  const colors = [COLORS.border, COLORS.error, "#D4883A", COLORS.amberDark, COLORS.success];
  return { score, label: labels[score], color: colors[score] };
}

function Field({ id, label, type, placeholder, value, onChange, error, focusKey, focused, onFocus, onBlur, autoComplete }) {
  const isFocused = focused === focusKey;
  const errorId = `${id}-error`;
  return (
    <div className="cb-field">
      <label className="cb-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`cb-input${isFocused ? " is-focused" : ""}${error ? " is-error" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => onFocus(focusKey)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <div id={errorId} className="cb-message is-error auth-field-error">⚠ {error}</div>}
    </div>
  );
}

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido";
    if (!password) e.password = "Senha é obrigatória";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };
  const canSubmit = !loading && !success;

  return (
    <>
      <div className="auth-title">Boas-vindas de volta</div>
      <div className="auth-subtitle">Acesse sua conta CamelBox</div>

      {success && (
        <div className="cb-message is-success auth-success-box">
          ✓ Login realizado com sucesso!
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); if (canSubmit) handleSubmit(); }}>
        <div className="auth-field-group">
          <Field
            id="login-email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
            error={errors.email}
            focusKey="email"
            focused={focused}
            onFocus={setFocused}
            onBlur={() => setFocused(null)}
            autoComplete="email"
          />
          <div>
            <Field
              id="login-password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }}
              error={errors.password}
              focusKey="password"
              focused={focused}
              onFocus={setFocused}
              onBlur={() => setFocused(null)}
              autoComplete="current-password"
            />
            <button type="button" className="auth-link auth-forgot-link">Esqueceu a senha?</button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="cb-button cb-button--primary auth-submit"
        >
          {loading ? "Entrando..." : success ? "✓ Conectado" : "Entrar"}
        </button>
      </form>

      <div className="auth-divider">
        <div className="auth-divider__line" />
        <span className="auth-divider__text">ou</span>
        <div className="auth-divider__line" />
      </div>

      <button type="button" className="auth-google-button">
        <GoogleIcon /> Continuar com Google
      </button>

      <div className="auth-footer">
        Não tem conta?{" "}
        <button type="button" className="auth-link auth-footer__link" onClick={onSwitch}>Criar agora</button>
      </div>
    </>
  );
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.password) e.password = "Senha é obrigatória";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirm) e.confirm = "As senhas não coincidem";
    if (!agreed) e.terms = "Você deve aceitar os termos";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };
  const canSubmit = !loading && !success;

  return (
    <>
      <div className="auth-title">Criar conta</div>
      <div className="auth-subtitle">Comece a usar o CamelBox hoje mesmo</div>

      {success && (
        <div className="cb-message is-success auth-success-box">
          ✓ Conta criada! Verifique seu email para confirmar.
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); if (canSubmit) handleSubmit(); }}>
        <div className="auth-field-group">
          <Field
            id="register-name"
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            focusKey="name"
            focused={focused}
            onFocus={setFocused}
            onBlur={() => setFocused(null)}
            autoComplete="name"
          />
          <Field
            id="register-email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            focusKey="email"
            focused={focused}
            onFocus={setFocused}
            onBlur={() => setFocused(null)}
            autoComplete="email"
          />
          <div>
            <Field
              id="register-password"
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              focusKey="password"
              focused={focused}
              onFocus={setFocused}
              onBlur={() => setFocused(null)}
              autoComplete="new-password"
            />
            {form.password && (
              <>
                <div className="auth-strength">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="auth-strength__segment"
                      style={{ background: i <= strength.score ? strength.color : COLORS.border }}
                    />
                  ))}
                </div>
                <div className="auth-strength__label" style={{ color: strength.color }}>{strength.label}</div>
              </>
            )}
          </div>
          <Field
            id="register-confirm"
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            focusKey="confirm"
            focused={focused}
            onFocus={setFocused}
            onBlur={() => setFocused(null)}
            autoComplete="new-password"
          />
        </div>

        <div className={`auth-check-row${errors.terms ? " has-error" : ""}`}>
          <input
            type="checkbox"
            id="register-terms"
            checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: "" })); }}
            className="auth-checkbox"
            aria-invalid={Boolean(errors.terms)}
            aria-describedby={errors.terms ? "register-terms-error" : undefined}
          />
          <div className={`auth-check-label${errors.terms ? " is-error" : ""}`}>
            <label htmlFor="register-terms">Concordo com os</label>{" "}
            <button type="button" className="auth-link auth-terms-link">Termos de Uso</button>{" "}
            <span>e a</span>{" "}
            <button type="button" className="auth-link auth-terms-link">Política de Privacidade</button>
          </div>
        </div>
        {errors.terms && <div id="register-terms-error" className="cb-message is-error auth-terms-error">{errors.terms}</div>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="cb-button cb-button--primary auth-submit"
        >
          {loading ? "Criando conta..." : success ? "✓ Conta criada!" : "Criar conta grátis"}
        </button>
      </form>

      <div className="auth-footer">
        Já tem conta?{" "}
        <button type="button" className="auth-link auth-footer__link" onClick={onSwitch}>Entrar</button>
      </div>
    </>
  );
}

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("mode") === "register" ? "register" : "login";
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="auth-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-decor__circle auth-bg-decor__circle--top" />
        <div className="auth-bg-decor__circle auth-bg-decor__circle--bottom" />
        <div className="auth-bg-decor__dot" />
      </div>

      <div className="auth-card">
        <div className="landing-logo auth-logo">
          <div className="landing-logo__mark auth-logo__mark">
            <CamelIcon />
          </div>
          <div>
            <div className="landing-logo__name auth-logo__name">CamelBox</div>
            <div className="landing-logo__sub auth-logo__sub">Plataforma</div>
          </div>
        </div>

        <div className="auth-tabs">
          {["login", "register"].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className={`auth-tab${tab === t ? " is-active" : ""}`}
            >
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {tab === "login"
          ? <LoginForm onSwitch={() => setTab("register")} />
          : <RegisterForm onSwitch={() => setTab("login")} />
        }
      </div>
    </div>
  );
}
