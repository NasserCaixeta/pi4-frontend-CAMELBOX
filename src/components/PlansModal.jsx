import { useState } from 'react';

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  card: "#231F14",
  border: "#3A3120",
  amber: "#D4A843",
  amberLight: "#E8C265",
  amberGlow: "rgba(212,168,67,0.1)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
  success: "#5A9A6A",
  danger: "#C0503A",
};

const plans = [
  {
    id: "super",
    name: "Super",
    price: "R$ 9,99",
    period: "/mês",
    features: [
      "20 análises por mês",
      "Todas as categorias",
      "Dashboard completo",
      "Suporte por email",
    ],
    highlight: false,
  },
  {
    id: "master",
    name: "Master",
    price: "R$ 19,99",
    period: "/mês",
    features: [
      "Análises ilimitadas",
      "Todas as categorias",
      "Dashboard completo",
      "Suporte prioritário",
    ],
    highlight: true,
  },
];

export default function PlansModal({ open, onClose, onCheckout, currentPlan }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!open) return null;

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId);
    try {
      await onCheckout(planId);
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "2rem", maxWidth: 640, width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
            Escolha seu plano
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Desbloqueie mais análises e aproveite todos os recursos
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                style={{
                  background: C.card,
                  border: `2px solid ${plan.highlight ? C.amber : C.border}`,
                  borderRadius: 16, padding: "1.5rem", flex: 1, minWidth: 240,
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: C.amber, color: C.bg, fontSize: 11, fontWeight: 700,
                    padding: "3px 12px", borderRadius: 20, letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}>
                    Popular
                  </div>
                )}

                <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {plan.name}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "1rem" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.amber }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{plan.period}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: C.success, fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.textMuted }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: 10,
                    border: plan.highlight ? "none" : `1px solid ${C.amber}`,
                    background: plan.highlight ? C.amber : "transparent",
                    color: plan.highlight ? C.bg : C.amber,
                    fontSize: 14, fontWeight: 600, cursor: isCurrentPlan ? "default" : "pointer",
                    fontFamily: "inherit", opacity: isCurrentPlan ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {loadingPlan === plan.id
                    ? "Redirecionando..."
                    : isCurrentPlan
                    ? "Plano atual"
                    : `Assinar ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            display: "block", margin: "1.25rem auto 0", padding: "8px 24px",
            borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent",
            color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
