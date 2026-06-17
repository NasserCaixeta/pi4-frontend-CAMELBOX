import { useState, useEffect } from "react";
import useFeedback from "../hooks/useFeedback";
import useDashboard from "../hooks/useDashboard";
import useIsMobile from "../hooks/useIsMobile";
import ProgressBar from "../components/ProgressBar";

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

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.25rem", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: "0.875rem" }}>
    {children}
  </div>
);

function MonthPicker({ availableMonths, selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {availableMonths.map((m) => {
        const active = selected?.month === m.month && selected?.year === m.year;
        return (
          <button key={`${m.year}-${m.month}`} onClick={() => onSelect(m)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid",
              borderColor: active ? C.amber : C.border,
              background: active ? C.amberGlow : "transparent",
              color: active ? C.amber : C.textMuted,
              fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: "pointer", fontFamily: "inherit",
            }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { color: C.textMuted, label: "Aguardando" },
    processing: { color: C.amber, label: "Processando" },
    completed: { color: C.success, label: "Concluído" },
    error: { color: C.danger, label: "Erro" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function ConfidenceBadge({ value }) {
  const map = {
    high: { label: "Confiança alta", color: C.success, bg: C.successBg },
    medium: { label: "Confiança média", color: C.amber, bg: C.amberGlow },
    low: { label: "Confiança baixa", color: C.textMuted, bg: C.surface },
  };
  const item = map[value] || map.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 8px",
      borderRadius: 999, background: item.bg, color: item.color,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {item.label}
    </span>
  );
}

function InsightCard({ insight, mode = "saving" }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
            {insight.title || insight.description}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>
            {insight.category || "Geral"} · {mode === "saving" ? "Reduzir" : "Acompanhar"}
          </div>
        </div>
        <ConfidenceBadge value={insight.confidence} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 9 }}>
        <span style={{ fontSize: 12, color: C.textMuted }}>
          Valor analisado: <strong style={{ color: C.text }}>{fmt(insight.amount || 0)}</strong>
        </span>
        {insight.potential_saving > 0 && (
          <span style={{ fontSize: 12, color: C.success }}>
            Economia potencial: <strong>{fmt(insight.potential_saving)}</strong>
          </span>
        )}
      </div>

      {insight.reason && (
        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55, margin: "0 0 7px" }}>
          {insight.reason}
        </p>
      )}
      {insight.suggestion && (
        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>
          {insight.suggestion}
        </p>
      )}
      {insight.evidence?.length > 0 && (
        <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 4 }}>
          {insight.evidence.slice(0, 3).map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: C.textMuted }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Summary */}
      <Card>
        <SectionTitle>Resumo da Análise</SectionTitle>
        {feedback.summary && (
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{feedback.summary}</p>
        )}
        {highlights.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: feedback.summary ? "1rem" : 0 }}>
            {highlights.map((h, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                {h}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <SectionTitle>Economia Potencial Estimada</SectionTitle>
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>
              Estimativa conservadora baseada nos padrões encontrados nas suas transações do mês.
            </p>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: totalSaving > 0 ? C.success : C.textMuted }}>
            {fmt(totalSaving || 0)}
          </div>
        </div>
      </Card>

      {/* Saving opportunities */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <SectionTitle style={{ marginBottom: 0 }}>Oportunidades Priorizadas</SectionTitle>
          {totalSaving > 0 && (
            <span style={{ fontSize: 13, fontWeight: 600, color: C.success }}>Total: {fmt(totalSaving)}</span>
          )}
        </div>
        {opportunities.length === 0 ? (
          <p style={{ fontSize: 13, color: C.textMuted }}>Nenhuma oportunidade com evidência suficiente neste período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {opportunities.map((item, i) => (
              <InsightCard key={`${item.title || item.description}-${i}`} insight={item} />
            ))}
          </div>
        )}
      </Card>

      {/* Subscriptions */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <SectionTitle style={{ marginBottom: 0 }}>Assinaturas Identificadas</SectionTitle>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>{fmt(totalSub)}/mês</span>
        </div>
        {subs.length === 0 ? (
          <p style={{ fontSize: 13, color: C.textMuted }}>Nenhuma assinatura identificada neste período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {subs.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.name}</span>
                    {s.confidence && <ConfidenceBadge value={s.confidence} />}
                  </div>
                  {s.description && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.description}</div>}
                  {s.reason && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.reason}</div>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>{fmt(s.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Watchlist */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <SectionTitle style={{ marginBottom: 0 }}>Pontos para Acompanhar</SectionTitle>
        </div>
        {watchlist.length === 0 ? (
          <p style={{ fontSize: 13, color: C.textMuted }}>Nenhum ponto relevante de acompanhamento neste período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const existingForSelected = selectedMonth
    ? feedbacks.find((f) => f.month === selectedMonth.month && f.year === selectedMonth.year)
    : null;

  const handleGenerate = async () => {
    if (!selectedMonth) return;
    setGenError(null);
    try {
      await generate(selectedMonth.month, selectedMonth.year);
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

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem 2rem", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", margin: 0 }}>Feedback de Gastos</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
          A IA analisa suas transações e sugere como melhorar seus gastos
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: "1.25rem", alignItems: "start" }}>
        {/* Main content */}
        <div>
          {/* Generate section */}
          <Card style={{ marginBottom: "1.25rem" }}>
            <SectionTitle>Gerar Nova Análise</SectionTitle>
            {availableMonths.length === 0 ? (
              <p style={{ fontSize: 13, color: C.textMuted }}>Nenhum mês disponível. Envie um extrato primeiro.</p>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Selecione o mês</div>
                  <MonthPicker availableMonths={availableMonths} selected={selectedMonth} onSelect={setSelectedMonth} />
                </div>
                {existingForSelected && existingForSelected.status !== "error" ? (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10, background: C.successBg,
                    color: C.success, fontSize: 13, marginBottom: "0.75rem",
                  }}>
                    ✓ Já existe uma análise para {selectedMonth && monthLabel(selectedMonth.month, selectedMonth.year)}.
                    <button
                      onClick={() => handleSelectHistory(existingForSelected)}
                      style={{ background: "none", border: "none", color: C.amber, fontSize: 13, cursor: "pointer", marginLeft: 8, fontFamily: "inherit" }}>
                      Ver resultado →
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: "0.75rem", padding: "8px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    ⚡ Esta análise consome 1 crédito do seu plano.
                  </div>
                )}
                {genError && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 12, marginBottom: "0.75rem" }}>
                    {genError}
                  </div>
                )}
                {(!existingForSelected || existingForSelected.status === "error") && (
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedMonth}
                    style={{
                      padding: "10px 20px", borderRadius: 9, border: "none",
                      background: C.amber, color: C.bg, fontSize: 13, fontWeight: 600,
                      cursor: generating || !selectedMonth ? "not-allowed" : "pointer",
                      fontFamily: "inherit", opacity: generating || !selectedMonth ? 0.6 : 1,
                    }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                  {monthLabel(activeFeedback.month, activeFeedback.year)}
                </h2>
                <StatusBadge status={activeFeedback.status} />
              </div>
              {isProcessing ? (
                <Card>
                  <div style={{ padding: "1.5rem 0.5rem" }}>
                    <ProgressBar
                      label="Analisando suas transações..."
                      sublabel="A IA está identificando padrões e gerando insights. Isso pode levar alguns segundos."
                    />
                  </div>
                </Card>
              ) : activeFeedback.status === "error" ? (
                <Card>
                  <div style={{ fontSize: 14, color: C.danger }}>Ocorreu um erro ao gerar o feedback. Tente novamente.</div>
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
              <div style={{ fontSize: 13, color: C.textMuted }}>Carregando...</div>
            ) : feedbacks.length === 0 ? (
              <div style={{ fontSize: 13, color: C.textMuted }}>Nenhuma análise ainda.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {feedbacks.map((fb) => {
                  const isActive = activeFeedback?.id === fb.id;
                  return (
                    <div key={fb.id} style={{
                      padding: "10px 12px", borderRadius: 10,
                      background: isActive ? C.amberGlow : C.surface,
                      border: `1px solid ${isActive ? C.amber : C.border}`,
                      cursor: "pointer",
                    }}
                      onClick={() => handleSelectHistory(fb)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{monthLabel(fb.month, fb.year)}</span>
                        <StatusBadge status={fb.status} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>
                          {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(fb.id); }}
                          style={{ background: "none", border: "none", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
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
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "1.5rem", maxWidth: 360 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Excluir análise?</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: "1.25rem" }}>Esta ação não pode ser desfeita.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={() => { deleteFeedback(confirmDelete); setConfirmDelete(null); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
