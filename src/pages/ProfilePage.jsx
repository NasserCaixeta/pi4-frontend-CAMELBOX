import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import useIsMobile from "../hooks/useIsMobile";

const Card = ({ children, className = "" }) => (
  <div className={`cb-card profile-card${className ? ` ${className}` : ""}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="profile-section-title">
    {children}
  </div>
);

function Field({ id, label, type = "text", value, onChange, placeholder, disabled, error }) {
  const errorId = `${id}-error`;
  return (
    <div className="cb-field">
      <label className="cb-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="cb-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <div id={errorId} className="cb-message is-error profile-field-error">{error}</div>}
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
  const canSaveName = !nameLoading && name !== (user?.name || "");
  const canChangePassword = !pwLoading && currentPw && newPw && confirmPw;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      {/* Info card */}
      <Card className="profile-card--spaced">
        <SectionTitle>Informações da Conta</SectionTitle>
        <div className="profile-info-grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          <div>
            <div className="profile-info-label">Email</div>
            <div className="profile-info-value">{user?.email}</div>
          </div>
          <div>
            <div className="profile-info-label">Membro desde</div>
            <div className="profile-info-value">{joinedDate}</div>
          </div>
          <div>
            <div className="profile-info-label">Provedor</div>
            <div className="profile-info-value profile-info-value--capitalize">{user?.auth_provider || "email"}</div>
          </div>
        </div>
      </Card>

      {/* Edit name */}
      <Card className="profile-card--spaced">
        <SectionTitle>Editar Nome</SectionTitle>
        <form onSubmit={(e) => { e.preventDefault(); if (canSaveName) handleSaveName(); }}>
          <Field id="profile-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          {nameMsg && (
            <div className={`cb-message profile-message is-${nameMsg.type}`}>{nameMsg.text}</div>
          )}
          <button
            type="submit"
            disabled={!canSaveName}
            className="cb-button cb-button--primary cb-button--compact"
          >
            {nameLoading ? "Salvando..." : "Salvar Nome"}
          </button>
        </form>
      </Card>

      {/* Change password — only for email auth */}
      {isMobile && (
        <Card className="profile-card--spaced">
          <SectionTitle>Conta</SectionTitle>
          {onShowPlans && (
            <button type="button" onClick={onShowPlans} className="cb-button cb-button--outline profile-mobile-action">Aumentar plano</button>
          )}
          {onLogout && (
            <button type="button" onClick={onLogout} className="cb-button cb-button--ghost profile-mobile-action">Sair</button>
          )}
        </Card>
      )}

      {user?.auth_provider === "email" && (
        <Card>
          <SectionTitle>Alterar Senha</SectionTitle>
          <form onSubmit={(e) => { e.preventDefault(); if (canChangePassword) handleChangePassword(); }}>
            <Field id="profile-current-password" label="Senha atual" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
            <Field id="profile-new-password" label="Nova senha" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Mínimo 8 caracteres" />
            <Field id="profile-confirm-password" label="Confirmar nova senha" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repita a nova senha" />
            {pwMsg && (
              <div className={`cb-message profile-message is-${pwMsg.type}`}>{pwMsg.text}</div>
            )}
            <button
              type="submit"
              disabled={!canChangePassword}
              className="cb-button cb-button--primary cb-button--compact"
            >
              {pwLoading ? "Alterando..." : "Alterar Senha"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
