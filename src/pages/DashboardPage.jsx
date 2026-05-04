import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import useDashboard from "../hooks/useDashboard";
import UploadCard from "../components/UploadCard";

// ─── Theme ──────────────────────────────────────────────────────────────────
const C = {
  bg:           "#0F0D08",
  surface:      "#1C1810",
  card:         "#231F14",
  border:       "#3A3120",
  borderHover:  "#5A4E30",
  amber:        "#D4A843",
  amberLight:   "#E8C265",
  amberDark:    "#A07C2A",
  amberGlow:    "rgba(212,168,67,0.1)",
  text:         "#F5ECD7",
  textMuted:    "#8A7A5A",
  textDim:      "#4A4030",
  success:      "#5A9A6A",
  successBg:    "rgba(90,154,106,0.12)",
  danger:       "#C0503A",
  dangerBg:     "rgba(192,80,58,0.12)",
  cat: {
    "Alimentação": "#D4A843",
    "Moradia":     "#5A9A6A",
    "Transporte":  "#4A8DB5",
    "Lazer":       "#9B6DB5",
    "Saúde":       "#C0703A",
    "Outros":      "#6A7A6A",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const getCatColor = (name) => C.cat[name] || "#6A7A6A";

// ─── Base UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: "1.25rem", ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted,
    letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "1rem" }}>
    {children}
  </div>
);

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({ label, value, change, positive, icon }) {
  const hasChange = change !== null && change !== undefined;
  const up = hasChange && parseFloat(change) >= 0;
  const isGood = hasChange && (positive ? up : !up);
  return (
    <Card style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted,
          textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </div>
        <div style={{ fontSize: 20 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.text,
        letterSpacing: "-0.5px", margin: "0.5rem 0 0.4rem" }}>
        {fmt(value)}
      </div>
      {hasChange && (
        <div style={{ display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: isGood ? C.success : C.danger }}>
          <span>{up ? "▲" : "▼"}</span>
          <span>{Math.abs(change)}% vs mês anterior</span>
        </div>
      )}
    </Card>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
const CustomDonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "6px 10px", fontSize: 12, color: C.text }}>
      <strong>{name}</strong>: {fmt(value)}
    </div>
  );
};

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card style={{ flex: 1, minWidth: 260 }}>
      <SectionTitle>Despesas por Categoria</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
              dataKey="value" strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCatColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomDonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {data.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%",
                  background: getCatColor(d.name), flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.textMuted }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>
                {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Horizontal Bar ──────────────────────────────────────────────────────────
function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card style={{ flex: 1, minWidth: 240 }}>
      <SectionTitle>Top Categorias de Gasto</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((d) => (
          <div key={d.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{d.name}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{fmt(d.value)}</span>
            </div>
            <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
              <div style={{
                width: `${(d.value / max) * 100}%`, height: "100%",
                background: getCatColor(d.name), borderRadius: 4,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Transactions Table ──────────────────────────────────────────────────────
function TransactionsTable({ transactions }) {
  if (!transactions?.items?.length) {
    return (
      <Card>
        <SectionTitle>Transações Recentes</SectionTitle>
        <div style={{ fontSize: 13, color: C.textMuted, padding: "1rem 0" }}>
          Nenhuma transação encontrada neste período.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle>Transações Recentes</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Descrição", "Categoria", "Data", "Valor"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0 8px 10px",
                  color: C.textMuted, fontWeight: 500, fontSize: 11,
                  letterSpacing: "0.4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.items.map((t) => {
              const catName = t.category?.name || "Sem categoria";
              const formattedDate = new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR');
              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.surface}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 8px", color: C.text, fontWeight: 500 }}>
                    {t.description || "—"}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
                      background: `${getCatColor(catName)}20`, color: getCatColor(catName),
                    }}>
                      {catName}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", color: C.textMuted, whiteSpace: "nowrap" }}>
                    {formattedDate}
                  </td>
                  <td style={{ padding: "10px 8px", fontWeight: 600,
                    color: t.type === "credit" ? C.success : C.danger,
                    textAlign: "right", whiteSpace: "nowrap" }}>
                    {t.type === "credit" ? "+" : "-"}{fmt(t.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Period Comparison ────────────────────────────────────────────────────────
function PeriodComparison({ categories }) {
  if (!categories?.categories?.length) return null;

  return (
    <Card>
      <SectionTitle>Comparativo com Período Anterior</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {categories.categories.map((item) => {
          const catName = item.category?.name || "Sem categoria";
          const change = item.comparison?.change_percent;
          const hasChange = change !== null && change !== undefined;
          const isGood = hasChange && change < 0;
          return (
            <div key={catName} style={{
              background: C.surface, borderRadius: 10,
              padding: "10px 12px", border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%",
                  background: getCatColor(catName), flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{catName}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {fmt(item.total)}
              </div>
              {hasChange && (
                <div style={{ fontSize: 11, marginTop: 2,
                  color: isGood ? C.success : C.danger }}>
                  {change > 0 ? "▲" : "▼"} {Math.abs(change)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const {
    summary, categories, transactions, statements,
    availableMonths, loading, error, refresh,
  } = useDashboard(selectedMonth, selectedYear);

  // Auto-select most recent month when availableMonths loads
  useEffect(() => {
    if (availableMonths.length > 0 && selectedMonth === null) {
      const latest = availableMonths[availableMonths.length - 1];
      setSelectedMonth(latest.month);
      setSelectedYear(latest.year);
    }
  }, [availableMonths, selectedMonth]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleUploadComplete = () => {
    refresh();
  };

  const hasData = statements?.some((s) => s.status === 'completed');

  // ─── Loading state ───
  if (loading && !statements) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: C.text,
      }}>
        <div style={{ fontSize: 16, color: C.textMuted }}>Carregando...</div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!hasData) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, padding: "1.5rem 2rem",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: C.text,
      }}>
        {/* Minimal header */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: C.amber,
              borderRadius: 9, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18 }}>
              🐪
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>CamelBox</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Análise Financeira</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {user?.name || user?.email}
            </span>
            <button onClick={handleLogout} style={{
              padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${C.amber}`, background: "transparent",
              color: C.amber, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Sair
            </button>
          </div>
        </div>

        <UploadCard onUploadComplete={handleUploadComplete} />
      </div>
    );
  }

  // ─── Dashboard with data ───
  const donutData = categories?.categories?.map((item) => ({
    name: item.category?.name || "Sem categoria",
    value: parseFloat(item.total),
  })) || [];

  const hBarData = [...donutData].sort((a, b) => b.value - a.value);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, padding: "1.5rem 2rem",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: C.text,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "1.75rem",
        flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: C.amber,
            borderRadius: 9, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18 }}>
            🐪
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>
              CamelBox
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Análise Financeira</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Period selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>Período:</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {availableMonths.map((p) => (
                <button key={p.label}
                  onClick={() => { setSelectedMonth(p.month); setSelectedYear(p.year); }}
                  style={{
                    padding: "5px 12px", borderRadius: 8, border: "1px solid",
                    borderColor: selectedMonth === p.month && selectedYear === p.year ? C.amber : C.border,
                    background: selectedMonth === p.month && selectedYear === p.year ? C.amberGlow : "transparent",
                    color: selectedMonth === p.month && selectedYear === p.year ? C.amber : C.textMuted,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {user?.name || user?.email}
            </span>
            <button onClick={handleLogout} style={{
              padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${C.amber}`, background: "transparent",
              color: C.amber, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.amberGlow; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Upload Card (compact) */}
      <UploadCard onUploadComplete={handleUploadComplete} compact />

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <SummaryCard
          label="Total de Receitas"
          value={summary?.total_income || 0}
          change={summary?.comparison?.income_change_percent ?? null}
          positive={true}
          icon="💰"
        />
        <SummaryCard
          label="Total de Despesas"
          value={summary?.total_expenses || 0}
          change={summary?.comparison?.expenses_change_percent ?? null}
          positive={false}
          icon="💸"
        />
        <SummaryCard
          label="Saldo"
          value={summary?.balance || 0}
          change={null}
          positive={true}
          icon="📊"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <DonutChart data={donutData} />
        <HorizontalBarChart data={hBarData} />
      </div>

      {/* Transactions + Comparison */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div style={{ flex: 2, minWidth: 300 }}>
          <TransactionsTable transactions={transactions} />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <PeriodComparison categories={categories} />
        </div>
      </div>
    </div>
  );
}
