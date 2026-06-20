import useIsMobile from '../hooks/useIsMobile';

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
        <div className="cb-mobile-header">
          <div className="landing-logo">
            <div className="landing-logo__mark">C</div>
            <div className="landing-logo__name">CamelBox</div>
          </div>
          <div>
            {billing && (
              <span className="cb-muted cb-text-xs cb-mobile-header__billing">
                {billing.plan === "free"
                  ? `Grátis · ${billing.analyses_remaining}/${billing.analyses_limit}`
                  : billing.plan === "super"
                  ? `Super · ${billing.analyses_remaining} restantes`
                  : "Master"}
              </span>
            )}
          </div>
        </div>

        <nav className="cb-mobile-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`cb-mobile-nav__item${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="cb-icon-scale">{NavIcons[item.id]}</span>
                <span className="cb-text-xs">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }

  // ── Desktop sidebar ───────────────────────────────────────────────────────
  return (
    <div className="cb-sidebar">
      <div className="cb-sidebar__brand">
        <div className="landing-logo">
          <div className="landing-logo__mark">C</div>
          <div>
            <div className="landing-logo__name">CamelBox</div>
            <div className="landing-logo__sub">Análise Financeira</div>
          </div>
        </div>
      </div>

      <nav className="cb-sidebar__nav" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`cb-nav-item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="cb-nav-item__icon">{NavIcons[item.id]}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="cb-sidebar__footer">
        {billing && (
          <div className="cb-muted cb-text-xs cb-sidebar__billing">
            {billing.plan === "free"
              ? `Plano Grátis · ${billing.analyses_remaining} análises restantes`
              : billing.plan === "super"
              ? `Plano Super · ${billing.analyses_remaining} restantes`
              : "Plano Master"}
          </div>
        )}
        {onShowPlans && (
          <button
            type="button"
            onClick={onShowPlans}
            className="cb-button cb-button--outline cb-sidebar__action"
          >
            Aumentar plano
          </button>
        )}
        <div className="cb-muted cb-sidebar__user">
          {user?.name || user?.email}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="cb-button cb-button--secondary cb-sidebar__logout"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
