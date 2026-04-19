import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  bg: "#0F0D08",
  surface: "#1C1810",
  card: "#231F14",
  border: "#3A3120",
  borderHover: "#5A4E30",
  amber: "#D4A843",
  amberLight: "#E8C265",
  amberDark: "#A07C2A",
  amberGlow: "rgba(212,168,67,0.12)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
  textDim: "#4A4030",
  error: "#C0503A",
  errorBg: "rgba(192,80,58,0.12)",
  success: "#5A9A6A",
};

const styles = {
  root: {
    minHeight: "100vh",
    background: COLORS.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  bgDecor: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    border: `1px solid ${COLORS.border}`,
    opacity: 0.4,
  },
  circle2: {
    position: "absolute",
    bottom: "-30%",
    left: "-15%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    border: `1px solid ${COLORS.border}`,
    opacity: 0.3,
  },
  dot: {
    position: "absolute",
    top: "50%",
    right: "15%",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: COLORS.amberDark,
    opacity: 0.6,
  },
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    padding: "2.5rem",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: COLORS.amber,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: "-0.3px",
  },
  logoSub: {
    fontSize: "12px",
    color: COLORS.textMuted,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  tabs: {
    display: "flex",
    background: COLORS.surface,
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "2rem",
    border: `1px solid ${COLORS.border}`,
  },
  tab: {
    flex: 1,
    padding: "8px",
    borderRadius: "9px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  tabActive: {
    background: COLORS.amber,
    color: COLORS.bg,
  },
  tabInactive: {
    color: COLORS.textMuted,
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: "6px",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: "14px",
    color: COLORS.textMuted,
    marginBottom: "1.75rem",
    lineHeight: "1.5",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: COLORS.textMuted,
    marginBottom: "6px",
    letterSpacing: "0.2px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    color: COLORS.text,
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: COLORS.amber,
    boxShadow: `0 0 0 3px ${COLORS.amberGlow}`,
  },
  inputError: {
    borderColor: COLORS.error,
    boxShadow: "0 0 0 3px rgba(192,80,58,0.12)",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  errorText: {
    fontSize: "12px",
    color: COLORS.error,
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  forgotLink: {
    display: "block",
    textAlign: "right",
    fontSize: "13px",
    color: COLORS.amber,
    textDecoration: "none",
    marginTop: "6px",
    marginBottom: "4px",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    padding: 0,
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: COLORS.amber,
    color: COLORS.bg,
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "-0.2px",
    transition: "all 0.15s ease",
    marginBottom: "1.25rem",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.25rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: COLORS.border,
  },
  dividerText: {
    fontSize: "12px",
    color: COLORS.textDim,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  googleBtn: {
    width: "100%",
    padding: "11px",
    background: "transparent",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    color: COLORS.text,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "border-color 0.2s, background 0.2s",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "13px",
    color: COLORS.textMuted,
  },
  footerLink: {
    color: COLORS.amber,
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
    fontWeight: "500",
  },
  terms: {
    fontSize: "12px",
    color: COLORS.textDim,
    textAlign: "center",
    marginTop: "1rem",
    lineHeight: "1.5",
  },
  termsLink: {
    color: COLORS.textMuted,
    textDecoration: "underline",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
  },
  successBox: {
    background: "rgba(90,154,106,0.1)",
    border: "1px solid rgba(90,154,106,0.3)",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "13px",
    color: COLORS.success,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  strengthBar: {
    display: "flex",
    gap: "4px",
    marginTop: "6px",
  },
  strengthSegment: {
    flex: 1,
    height: "3px",
    borderRadius: "2px",
    transition: "background 0.3s",
  },
  strengthLabel: {
    fontSize: "11px",
    marginTop: "4px",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "1.25rem",
  },
  checkbox: {
    marginTop: "2px",
    accentColor: COLORS.amber,
    cursor: "pointer",
    flexShrink: 0,
  },
  checkLabel: {
    fontSize: "12px",
    color: COLORS.textMuted,
    lineHeight: "1.5",
    cursor: "pointer",
  },
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

function Field({ label, type, placeholder, value, onChange, error, focusKey, focused, onFocus, onBlur, autoComplete }) {
  const isFocused = focused === focusKey;
  const inputStyle = {
    ...styles.input,
    ...(isFocused ? styles.inputFocus : {}),
    ...(error ? styles.inputError : {}),
  };
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => onFocus(focusKey)}
        onBlur={onBlur}
        style={inputStyle}
        autoComplete={autoComplete}
      />
      {error && <div style={styles.errorText}>⚠ {error}</div>}
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

  return (
    <>
      <div style={styles.title}>Boas-vindas de volta</div>
      <div style={styles.subtitle}>Acesse sua conta CamelBox</div>

      {success && (
        <div style={styles.successBox}>
          ✓ Login realizado com sucesso!
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <div style={styles.fieldGroup}>
          <Field
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
            <button type="button" style={styles.forgotLink}>Esqueceu a senha?</button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          style={{ ...styles.btn, ...(loading || success ? styles.btnDisabled : {}) }}
        >
          {loading ? "Entrando..." : success ? "✓ Conectado" : "Entrar"}
        </button>
      </form>

      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerText}>ou</span>
        <div style={styles.dividerLine} />
      </div>

      <button
        style={styles.googleBtn}
        onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderHover; e.currentTarget.style.background = COLORS.surface; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = "transparent"; }}
      >
        <GoogleIcon /> Continuar com Google
      </button>

      <div style={styles.footer}>
        Não tem conta?{" "}
        <button style={styles.footerLink} onClick={onSwitch}>Criar agora</button>
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

  return (
    <>
      <div style={styles.title}>Criar conta</div>
      <div style={styles.subtitle}>Comece a usar o CamelBox hoje mesmo</div>

      {success && (
        <div style={styles.successBox}>
          ✓ Conta criada! Verifique seu email para confirmar.
        </div>
      )}

      <div style={styles.fieldGroup}>
        <Field
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
              <div style={styles.strengthBar}>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      ...styles.strengthSegment,
                      background: i <= strength.score ? strength.color : COLORS.border,
                    }}
                  />
                ))}
              </div>
              <div style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</div>
            </>
          )}
        </div>
        <Field
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

      <div style={styles.checkRow}>
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: "" })); }}
          style={styles.checkbox}
        />
        <label htmlFor="terms" style={{ ...styles.checkLabel, ...(errors.terms ? { color: COLORS.error } : {}) }}>
          Concordo com os <button style={{ ...styles.termsLink, color: COLORS.amber }}>Termos de Uso</button> e a{" "}
          <button style={{ ...styles.termsLink, color: COLORS.amber }}>Política de Privacidade</button>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || success}
        style={{ ...styles.btn, ...(loading || success ? styles.btnDisabled : {}) }}
      >
        {loading ? "Criando conta..." : success ? "✓ Conta criada!" : "Criar conta grátis"}
      </button>

      <div style={styles.footer}>
        Já tem conta?{" "}
        <button style={styles.footerLink} onClick={onSwitch}>Entrar</button>
      </div>
    </>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <div style={styles.root}>
      <div style={styles.bgDecor}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.dot} />
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <CamelIcon />
          </div>
          <div>
            <div style={styles.logoText}>CamelBox</div>
            <div style={styles.logoSub}>Plataforma</div>
          </div>
        </div>

        <div style={styles.tabs}>
          {["login", "register"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...styles.tab,
                ...(tab === t ? styles.tabActive : styles.tabInactive),
              }}
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
