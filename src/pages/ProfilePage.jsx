import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import useIsMobile from "../hooks/useIsMobile";

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  card: "#231F14",
  border: "#3A3120",
  amber: "#D4A843",
  amberGlow: "rgba(212,168,67,0.1)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
  success: "#5A9A6A",
  successBg: "rgba(90,154,106,0.12)",
  danger: "#C0503A",
  dangerBg: "rgba(192,80,58,0.12)",
};

const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "1.5rem", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "1.25rem" }}>
    {children}
  </div>
);

function Field({ label, type = "text", value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", padding: "10px 14px",
          background: disabled ? C.surface : C.surface,
          border: `1px solid ${C.border}`, borderRadius: 10,
          color: disabled ? C.textMuted : C.text,
          fontSize: 14, fontFamily: "inherit", outline: "none",
          boxSizing: "border-box",
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  );
}

export default function ProfilePage({ onLogout, onShowPlans }) {
  const { user, setUser } = useAuth();
  const isMobile = useIsMobile();

  const [name, setName] = useState(user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const handleSaveName = async () => {
    setNameLoading(true);
    setNameMsg(null);
    try {
      const updated = await api.patch("/auth/me", { name });
      if (setUser) setUser(updated);
      setNameMsg({ type: "success", text: "Nome atualizado com sucesso!" });
    } catch (err) {
      setNameMsg({ type: "error", text: err.message || "Erro ao atualizar nome" });
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "As senhas não coincidem" });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: "error", text: "A nova senha deve ter no mínimo 8 caracteres" });
      return;
    }
    setPwLoading(true);
    try {
      await api.patch("/auth/me", { current_password: currentPw, new_password: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwMsg({ type: "success", text: "Senha alterada com sucesso!" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message || "Erro ao alterar senha" });
    } finally {
      setPwLoading(false);
    }
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem 2rem", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: C.text, maxWidth: 700 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", margin: 0 }}>Meu Perfil</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Gerencie suas informações pessoais</p>
      </div>

      {/* Info card */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle>Informações da Conta</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.75rem 1.5rem" }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 14, color: C.text }}>{user?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Membro desde</div>
            <div style={{ fontSize: 14, color: C.text }}>{joinedDate}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Provedor</div>
            <div style={{ fontSize: 14, color: C.text, textTransform: "capitalize" }}>{user?.auth_provider || "email"}</div>
          </div>
        </div>
      </Card>

      {/* Edit name */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <SectionTitle>Editar Nome</SectionTitle>
        <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
        {nameMsg && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: "0.75rem",
            background: nameMsg.type === "success" ? C.successBg : C.dangerBg,
            color: nameMsg.type === "success" ? C.success : C.danger,
          }}>{nameMsg.text}</div>
        )}
        <button
          onClick={handleSaveName}
          disabled={nameLoading || name === (user?.name || "")}
          style={{
            padding: "9px 20px", borderRadius: 9, border: "none",
            background: C.amber, color: C.bg, fontSize: 13, fontWeight: 600,
            cursor: nameLoading || name === (user?.name || "") ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: nameLoading || name === (user?.name || "") ? 0.6 : 1,
          }}
        >
          {nameLoading ? "Salvando..." : "Salvar Nome"}
        </button>
      </Card>

      {/* Change password — only for email auth */}
      {isMobile && (
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionTitle>Conta</SectionTitle>
          {onShowPlans && (
            <button onClick={onShowPlans} style={{
              width: "100%", padding: "9px 14px", borderRadius: 9,
              border: `1px solid ${C.amber}`, background: C.amberGlow,
              color: C.amber, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
            }}>Aumentar plano</button>
          )}
          {onLogout && (
            <button onClick={onLogout} style={{
              width: "100%", padding: "9px 14px", borderRadius: 9,
              border: `1px solid ${C.border}`, background: "transparent",
              color: C.textMuted, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
            }}>Sair</button>
          )}
        </Card>
      )}

      {user?.auth_provider === "email" && (
        <Card>
          <SectionTitle>Alterar Senha</SectionTitle>
          <Field label="Senha atual" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
          <Field label="Nova senha" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Mínimo 8 caracteres" />
          <Field label="Confirmar nova senha" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repita a nova senha" />
          {pwMsg && (
            <div style={{
              padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: "0.75rem",
              background: pwMsg.type === "success" ? C.successBg : C.dangerBg,
              color: pwMsg.type === "success" ? C.success : C.danger,
            }}>{pwMsg.text}</div>
          )}
          <button
            onClick={handleChangePassword}
            disabled={pwLoading || !currentPw || !newPw || !confirmPw}
            style={{
              padding: "9px 20px", borderRadius: 9, border: "none",
              background: C.amber, color: C.bg, fontSize: 13, fontWeight: 600,
              cursor: pwLoading || !currentPw || !newPw || !confirmPw ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: pwLoading || !currentPw || !newPw || !confirmPw ? 0.6 : 1,
            }}
          >
            {pwLoading ? "Alterando..." : "Alterar Senha"}
          </button>
        </Card>
      )}
    </div>
  );
}
