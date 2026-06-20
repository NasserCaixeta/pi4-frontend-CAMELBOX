import { useEffect, useRef, useState } from "react";
import useFeedback from "../hooks/useFeedback";
import useDashboard from "../hooks/useDashboard";
import useIsMobile from "../hooks/useIsMobile";
import ProgressBar from "../components/ProgressBar";

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const Card = ({ children, className = "" }) => (
  <div className={`cb-card feedback-card${className ? ` ${className}` : ""}`}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <div className="cb-section-title">{children}</div>
);

function MonthPicker({ availableMonths, selected, onSelect }) {
  return (
    <div className="feedback-month-picker">
      {availableMonths.map((m) => {
        const active = selected?.month === m.month && selected?.year === m.year;
        return (
          <button
            key={`${m.year}-${m.month}`}
            type="button"
            className={`feedback-month-button${active ? " is-active" : ""}`}
            onClick={() => onSelect(m)}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Aguardando", className: "cb-status-badge--pending" },
    processing: { label: "Processando", className: "cb-status-badge--processing" },
    completed: { label: "Concluído", className: "cb-status-badge--completed" },
    error: { label: "Erro", className: "cb-status-badge--error" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`cb-status-badge ${s.className}`}>
      <span className="cb-status-badge__dot" />
      {s.label}
    </span>
  );
}

function ConfidenceBadge({ value }) {
  const map = {
    high: { label: "Confiança alta", className: "cb-confidence-badge--high" },
    medium: { label: "Confiança média", className: "cb-confidence-badge--medium" },
    low: { label: "Confiança baixa", className: "cb-confidence-badge--low" },
  };
  const item = map[value] || map.medium;
  return (
    <span className={`cb-confidence-badge ${item.className}`}>
      {item.label}
    </span>
  );
}

function InsightCard({ insight, mode = "saving" }) {
  return (
    <div className="cb-insight-card">
      <div className="feedback-insight-head">
        <div className="feedback-min-width">
          <div className="feedback-insight-title">
            {insight.title || insight.description}
          </div>
          <div className="feedback-insight-meta">
            {insight.category || "Geral"} · {mode === "saving" ? "Reduzir" : "Acompanhar"}
          </div>
        </div>
        <ConfidenceBadge value={insight.confidence} />
      </div>

      <div className="feedback-insight-values">
        <span className="feedback-muted-text">
          Valor analisado: <strong className="feedback-text">{fmt(insight.amount || 0)}</strong>
        </span>
        {insight.potential_saving > 0 && (
          <span className="feedback-success-text">
            Economia potencial: <strong>{fmt(insight.potential_saving)}</strong>
          </span>
        )}
      </div>

      {insight.reason && (
        <p className="feedback-insight-reason">
          {insight.reason}
        </p>
      )}
      {insight.suggestion && (
        <p className="feedback-insight-suggestion">
          {insight.suggestion}
        </p>
      )}
      {insight.evidence?.length > 0 && (
        <div className="feedback-evidence-list">
          {insight.evidence.slice(0, 3).map((e, i) => (
            <div key={i} className="feedback-evidence-item">
              Base: {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackResult({ feedback }) {
  const subs = feedback.subscriptions || [];
  const opportunities = feedback.saving_opportunities || feedback.reducible_expenses || [];
  const watchlist = feedback.watchlist || [];
  const highlights = feedback.highlights || [];
  const totalSub = subs.reduce((s, i) => s + (i.amount || 0), 0);
  const totalSaving = feedback.total_potential_saving ?? opportunities.reduce((s, i) => s + (i.potential_saving || 0), 0);

  return (
    <div className="feedback-stack">
      {/* Summary */}
      <Card>
        <SectionTitle>Resumo da Análise</SectionTitle>
        {feedback.summary && (
          <p className="feedback-summary">{feedback.summary}</p>
        )}
        {highlights.length > 0 && (
          <div className={`feedback-highlights${feedback.summary ? " feedback-highlights--spaced" : ""}`}>
            {highlights.map((h, i) => (
              <div key={i} className="feedback-highlight">
                {h}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="feedback-summary-row">
          <div>
            <SectionTitle>Economia Potencial Estimada</SectionTitle>
            <p className="feedback-muted-paragraph">
              Estimativa conservadora baseada nos padrões encontrados nas suas transações do mês.
            </p>
          </div>
          <div className={`feedback-total-saving${totalSaving > 0 ? " is-positive" : " is-muted"}`}>
            {fmt(totalSaving || 0)}
          </div>
        </div>
      </Card>

      {/* Saving opportunities */}
      <Card>
        <div className="feedback-card-head">
          <SectionTitle>Oportunidades Priorizadas</SectionTitle>
          {totalSaving > 0 && (
            <span className="feedback-success-total">Total: {fmt(totalSaving)}</span>
          )}
        </div>
        {opportunities.length === 0 ? (
          <p className="feedback-empty-text">Nenhuma oportunidade com evidência suficiente neste período.</p>
        ) : (
          <div className="feedback-insight-list">
            {opportunities.map((item, i) => (
              <InsightCard key={`${item.title || item.description}-${i}`} insight={item} />
            ))}
          </div>
        )}
      </Card>

      {/* Subscriptions */}
      <Card>
        <div className="feedback-card-head">
          <SectionTitle>Assinaturas Identificadas</SectionTitle>
          <span className="feedback-amber-total">{fmt(totalSub)}/mês</span>
        </div>
        {subs.length === 0 ? (
          <p className="feedback-empty-text">Nenhuma assinatura identificada neste período.</p>
        ) : (
          <div className="feedback-subscription-list">
            {subs.map((s, i) => (
              <div key={i} className="feedback-subscription-item">
                <div>
                  <div className="feedback-subscription-title-row">
                    <span className="feedback-subscription-name">{s.name}</span>
                    {s.confidence && <ConfidenceBadge value={s.confidence} />}
                  </div>
                  {s.description && <div className="feedback-subscription-meta">{s.description}</div>}
                  {s.reason && <div className="feedback-subscription-meta">{s.reason}</div>}
                </div>
                <div className="feedback-subscription-amount">{fmt(s.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Watchlist */}
      <Card>
        <div className="feedback-card-head">
          <SectionTitle>Pontos para Acompanhar</SectionTitle>
        </div>
        {watchlist.length === 0 ? (
          <p className="feedback-empty-text">Nenhum ponto relevante de acompanhamento neste período.</p>
        ) : (
          <div className="feedback-insight-list">
            {watchlist.map((item, i) => (
              <InsightCard key={`${item.title || item.description}-${i}`} insight={item} mode="watch" />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function FeedbackPage() {
  const isMobile = useIsMobile();
  const { feedbacks, activeFeedback, setActiveFeedback, loading, generating, generate, loadFeedback, deleteFeedback } = useFeedback();
  const { availableMonths } = useDashboard({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [genError, setGenError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const deleteModalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const effectiveSelectedMonth = selectedMonth || availableMonths[availableMonths.length - 1] || null;

  const existingForSelected = effectiveSelectedMonth
    ? feedbacks.find((f) => f.month === effectiveSelectedMonth.month && f.year === effectiveSelectedMonth.year)
    : null;

  const handleGenerate = async () => {
    if (!effectiveSelectedMonth) return;
    setGenError(null);
    try {
      await generate(effectiveSelectedMonth.month, effectiveSelectedMonth.year);
    } catch (err) {
      setGenError(err.message || "Erro ao gerar análise");
    }
  };

  const handleSelectHistory = async (fb) => {
    if (fb.status === "completed") {
      await loadFeedback(fb.id);
    } else {
      setActiveFeedback(fb);
    }
  };

  const monthLabel = (month, year) => {
    const d = new Date(year, month - 1, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const isProcessing = activeFeedback && (activeFeedback.status === "pending" || activeFeedback.status === "processing");

  useEffect(() => {
    if (!confirmDelete) return undefined;

    previousFocusRef.current = document.activeElement;

    requestAnimationFrame(() => {
      const modal = deleteModalRef.current;
      if (!modal) return;
      const firstButton = modal.querySelector("button:not(:disabled)");
      (firstButton || modal).focus();
    });

    return () => {
      const previousFocus = previousFocusRef.current;
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
      previousFocusRef.current = null;
    };
  }, [confirmDelete]);

  const handleDeleteModalKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setConfirmDelete(null);
      return;
    }

    if (e.key !== "Tab") return;

    const modal = deleteModalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

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

  return (
    <div className={`feedback-page${isMobile ? " is-mobile" : ""}`}>
      <div className="feedback-header">
        <h1 className="feedback-title">Feedback de Gastos</h1>
        <p className="feedback-subtitle">
          A IA analisa suas transações e sugere como melhorar seus gastos
        </p>
      </div>

      <div className="feedback-layout">
        {/* Main content */}
        <div>
          {/* Generate section */}
          <Card className="feedback-generate-card">
            <SectionTitle>Gerar Nova Análise</SectionTitle>
            {availableMonths.length === 0 ? (
              <p className="feedback-empty-text">Nenhum mês disponível. Envie um extrato primeiro.</p>
            ) : (
              <>
                <div className="feedback-field-group">
                  <div className="feedback-field-label">Selecione o mês</div>
                  <MonthPicker availableMonths={availableMonths} selected={effectiveSelectedMonth} onSelect={setSelectedMonth} />
                </div>
                {existingForSelected && existingForSelected.status !== "error" ? (
                  <div className="feedback-alert feedback-alert--success">
                    ✓ Já existe uma análise para {effectiveSelectedMonth && monthLabel(effectiveSelectedMonth.month, effectiveSelectedMonth.year)}.
                    <button
                      onClick={() => handleSelectHistory(existingForSelected)}
                      className="feedback-inline-action"
                    >
                      Ver resultado →
                    </button>
                  </div>
                ) : (
                  <div className="feedback-credit-note">
                    ⚡ Esta análise consome 1 crédito do seu plano.
                  </div>
                )}
                {genError && (
                  <div className="feedback-alert feedback-alert--danger">
                    {genError}
                  </div>
                )}
                {(!existingForSelected || existingForSelected.status === "error") && (
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !effectiveSelectedMonth}
                    className="cb-button cb-button--primary feedback-generate-button"
                  >
                    {generating ? "Gerando análise..." : "Gerar Análise de Gastos"}
                  </button>
                )}
              </>
            )}
          </Card>

          {/* Result */}
          {activeFeedback && (
            <div>
              <div className="feedback-result-head">
                <h2 className="feedback-result-title">
                  {monthLabel(activeFeedback.month, activeFeedback.year)}
                </h2>
                <StatusBadge status={activeFeedback.status} />
              </div>
              {isProcessing ? (
                <Card>
                  <div className="feedback-progress-wrap">
                    <ProgressBar
                      label="Analisando suas transações..."
                      sublabel="A IA está identificando padrões e gerando insights. Isso pode levar alguns segundos."
                    />
                  </div>
                </Card>
              ) : activeFeedback.status === "error" ? (
                <Card>
                  <div className="feedback-error-text">Ocorreu um erro ao gerar o feedback. Tente novamente.</div>
                </Card>
              ) : activeFeedback.status === "completed" ? (
                <FeedbackResult feedback={activeFeedback} />
              ) : null}
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div>
          <Card>
            <SectionTitle>Histórico de Análises</SectionTitle>
            {loading ? (
              <div className="feedback-empty-text">Carregando...</div>
            ) : feedbacks.length === 0 ? (
              <div className="feedback-empty-text">Nenhuma análise ainda.</div>
            ) : (
              <div className="feedback-history-list">
                {feedbacks.map((fb) => {
                  const isActive = activeFeedback?.id === fb.id;
                  return (
                    <div
                      key={fb.id}
                      className={`cb-history-item${isActive ? " is-active" : ""}`}>
                      <button
                        type="button"
                        className="feedback-history-select"
                        onClick={() => handleSelectHistory(fb)}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div className="feedback-history-head">
                          <span className="feedback-history-title">{monthLabel(fb.month, fb.year)}</span>
                          <StatusBadge status={fb.status} />
                        </div>
                        <div className="feedback-history-meta-row">
                          <span className="feedback-history-date">
                            {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </button>
                      <div className="feedback-history-actions">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(fb.id)}
                          className="feedback-delete-button">
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="cb-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            ref={deleteModalRef}
            className="cb-modal feedback-delete-modal"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDeleteModalKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-delete-title"
            tabIndex={-1}
          >
            <div id="feedback-delete-title" className="feedback-delete-modal__title">Excluir análise?</div>
            <div className="feedback-delete-modal__copy">Esta ação não pode ser desfeita.</div>
            <div className="feedback-delete-modal__actions">
              <button type="button" onClick={() => setConfirmDelete(null)} className="cb-button cb-button--secondary cb-button--small">Cancelar</button>
              <button type="button" onClick={() => { deleteFeedback(confirmDelete); setConfirmDelete(null); }} className="cb-button cb-button--danger-solid cb-button--small">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
