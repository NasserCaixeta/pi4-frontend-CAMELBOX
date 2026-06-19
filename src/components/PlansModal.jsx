import { useEffect, useRef, useState } from 'react';

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
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;

    requestAnimationFrame(() => {
      const modal = modalRef.current;
      if (!modal) return;
      const firstButton = modal.querySelector('button:not(:disabled)');
      const closeButton = modal.querySelector('.cb-modal__close button');
      (firstButton || closeButton || modal).focus();
    });

    return () => {
      const previousFocus = previousFocusRef.current;
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
      previousFocusRef.current = null;
    };
  }, [open]);

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId);
    try {
      await onCheckout(planId);
    } catch {
      setLoadingPlan(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

    if (!focusable.length) {
      e.preventDefault();
      modal.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="cb-modal-overlay"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="cb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-modal-title"
        aria-describedby="plans-modal-description"
        tabIndex={-1}
      >
        <div className="cb-modal__header">
          <div id="plans-modal-title" className="cb-modal__title">
            Escolha seu plano
          </div>
          <div id="plans-modal-description" className="cb-modal__subtitle">
            Desbloqueie mais análises e aproveite todos os recursos
          </div>
        </div>

        <div className="cb-plan-grid">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`cb-plan-card${plan.highlight ? " is-highlighted" : ""}`}
              >
                {plan.highlight && (
                  <div className="cb-plan-card__badge">
                    Popular
                  </div>
                )}

                <div className="cb-plan-card__title">
                  {plan.name}
                </div>

                <div className="cb-plan-card__price">
                  <span className="cb-plan-card__price-value">{plan.price}</span>
                  <span className="cb-plan-card__period">{plan.period}</span>
                </div>

                <div className="cb-plan-card__features">
                  {plan.features.map((f, i) => (
                    <div key={i} className="cb-plan-card__feature">
                      <span className="cb-plan-card__check">✓</span>
                      <span className="cb-plan-card__feature-text">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  className={`cb-button cb-plan-card__button ${plan.highlight ? "cb-button--primary" : "cb-button--outline"}${isCurrentPlan ? " is-current" : ""}`}
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

        <div className="cb-modal__close">
          <button
            onClick={onClose}
            className="cb-button cb-button--ghost cb-button--compact"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
