import useIsMobile from '../hooks/useIsMobile';

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  border: "#3A3120",
  amber: "#D4A843",
  amberGlow: "rgba(212,168,67,0.1)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
};

const NavIcons = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="7" width="3" height="7" rx="1" fill="currentColor"/>
      <rect x="6" y="4" width="3" height="10" rx="1" fill="currentColor"/>
      <rect x="11" y="1" width="3" height="13" rx="1" fill="currentColor"/>
    </svg>
  ),
  feedback: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1.5 2.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3.5 2.5V3.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  profile: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Início" },
  { id: "feedback", label: "Análise de Gastos", shortLabel: "Análise" },
  { id: "profile", label: "Perfil", shortLabel: "Perfil" },
];

export default function Sidebar({ currentView, onNavigate, user, billing, onLogout, onShowPlans }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {/* Top header */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 50,
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1rem", zIndex: 200,
          fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: C.amber, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.bg, lineHeight: 1,
            }}>C</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>CamelBox</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {billing && (
              <span style={{
                fontSize: 10, color: C.textMuted, fontWeight: 500,
              }}>
                {billing.plan === "free"
                  ? `Grátis · ${billing.analyses_remaining}/${billing.analyses_limit}`
                  : billing.plan === "super"
                  ? `Super · ${billing.analyses_remaining} restantes`
                  : "Master"}
              </span>
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 74,
          background: C.surface, borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "stretch", zIndex: 200,
        }}>
          {NAV_ITEMS.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  border: "none", borderTop: active ? `2px solid ${C.amber}` : "2px solid transparent",
                  background: active ? C.amberGlow : "transparent",
                  color: active ? C.amber : C.textMuted,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{ display: "flex", transform: "scale(1.33)", transformOrigin: "center" }}>{NavIcons[item.id]}</span>
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // ── Desktop sidebar ───────────────────────────────────────────────────────
  return (
    <div style={{
      width: 220,
      minHeight: "100vh",
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: C.amber, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.bg, lineHeight: 1,
          }}>C</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>CamelBox</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Análise Financeira</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
        {NAV_ITEMS.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 9, border: "none",
                background: active ? C.amberGlow : "transparent",
                color: active ? C.amber : C.textMuted,
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                marginBottom: 2, transition: "all 0.15s",
                borderLeft: active ? `2px solid ${C.amber}` : "2px solid transparent",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(212,168,67,0.05)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ display: "flex", color: active ? C.amber : C.textMuted }}>{NavIcons[item.id]}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${C.border}` }}>
        {billing && (
          <div style={{
            fontSize: 11, color: C.textMuted,
            marginBottom: 8,
          }}>
            {billing.plan === "free"
              ? `Plano Grátis · ${billing.analyses_remaining} análises restantes`
              : billing.plan === "super"
              ? `Plano Super · ${billing.analyses_remaining} restantes`
              : "Plano Master"}
          </div>
        )}
        {onShowPlans && (
          <button onClick={onShowPlans} style={{
            width: "100%", padding: "7px 10px", borderRadius: 8,
            border: `1px solid ${C.amber}`, background: C.amberGlow,
            color: C.amber, fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit", marginBottom: 6,
          }}>
            Aumentar plano
          </button>
        )}
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name || user?.email}
        </div>
        <button onClick={onLogout} style={{
          width: "100%", padding: "7px 10px", borderRadius: 8,
          border: `1px solid ${C.border}`, background: "transparent",
          color: C.textMuted, fontSize: 12,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Sair
        </button>
      </div>
    </div>
  );
}
