import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { MONTHLY_DATA, PERIODS, TRANSACTIONS } from "../data/mockData";

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
  // Category colors
  cat: {
    Alimentação:  "#D4A843",
    Moradia:      "#5A9A6A",
    Transporte:   "#4A8DB5",
    Lazer:        "#9B6DB5",
    Saúde:        "#C0703A",
    Outros:       "#6A7A6A",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtK = (v) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;
const pct = (curr, prev) =>
  prev === 0 ? 0 : (((curr - prev) / prev) * 100).toFixed(1);

// ─── Base UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: "1.25rem",
    ...style,
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

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, change, positive, icon }) {
  const up = parseFloat(change) >= 0;
  const isGood = positive ? up : !up;
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
      <div style={{ display: "flex", alignItems: "center", gap: 4,
        fontSize: 12, color: isGood ? C.success : C.danger }}>
        <span>{up ? "▲" : "▼"}</span>
        <span>{Math.abs(change)}% vs mês anterior</span>
      </div>
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
                <Cell key={entry.name} fill={C.cat[entry.name] || C.textDim} />
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
                  background: C.cat[d.name], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.textMuted }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Grouped Bar ─────────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.text }}>
      <div style={{ marginBottom: 4, color: C.textMuted }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtK(p.value)}
        </div>
      ))}
    </div>
  );
};

function GroupedBarChart({ data }) {
  return (
    <Card style={{ flex: 2, minWidth: 320 }}>
      <SectionTitle>Receitas vs Despesas por Mês</SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtK} tick={{ fill: C.textMuted, fontSize: 10 }}
            axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="receitas" name="Receitas" fill={C.success} radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill={C.danger}  radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────
function SaldoLineChart({ data }) {
  return (
    <Card style={{ flex: 2, minWidth: 320 }}>
      <SectionTitle>Evolução do Saldo</SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtK} tick={{ fill: C.textMuted, fontSize: 10 }}
            axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<BarTooltip />} cursor={{ stroke: C.amber, strokeWidth: 1 }} />
          <Line type="monotone" dataKey="saldo" name="Saldo" stroke={C.amber}
            strokeWidth={2} dot={{ fill: C.amber, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: C.amberLight }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Horizontal Bar ──────────────────────────────────────────────────────────
function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <Card style={{ flex: 1, minWidth: 240 }}>
      <SectionTitle>Top Categorias de Gasto</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((d) => (
          <div key={d.name}>
            <div style={{ display: "flex", justifyContent: "space-between",
              marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{d.name}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>
                {fmt(d.value)}
              </span>
            </div>
            <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
              <div style={{
                width: `${(d.value / max) * 100}%`, height: "100%",
                background: C.cat[d.name], borderRadius: 4,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────
function TransactionsTable() {
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
                  letterSpacing: "0.4px", textTransform: "uppercase",
                  whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t) => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.surface}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 8px", color: C.text, fontWeight: 500 }}>
                  {t.desc}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 500, padding: "3px 8px",
                    borderRadius: 20,
                    background: `${C.cat[t.categoria]}20`,
                    color: C.cat[t.categoria],
                  }}>
                    {t.categoria}
                  </span>
                </td>
                <td style={{ padding: "10px 8px", color: C.textMuted, whiteSpace: "nowrap" }}>
                  {t.data}
                </td>
                <td style={{ padding: "10px 8px", fontWeight: 600,
                  color: t.tipo === "credit" ? C.success : C.danger,
                  textAlign: "right", whiteSpace: "nowrap" }}>
                  {t.tipo === "credit" ? "+" : ""}{fmt(t.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Period Comparison ────────────────────────────────────────────────────────
function PeriodComparison({ curr, prev }) {
  const cats = Object.keys(curr.categorias);
  return (
    <Card>
      <SectionTitle>Comparativo com Período Anterior</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {cats.map((cat) => {
          const c = curr.categorias[cat];
          const p = prev.categorias[cat];
          const diff = parseFloat(pct(c, p));
          const isGood = diff < 0;
          return (
            <div key={cat} style={{
              background: C.surface, borderRadius: 10,
              padding: "10px 12px", border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%",
                  background: C.cat[cat], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{cat}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {fmt(c)}
              </div>
              <div style={{ fontSize: 11, marginTop: 2,
                color: isGood ? C.success : C.danger }}>
                {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}%
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Jun/2025");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const periodIndex = PERIODS.indexOf(selectedPeriod);
  const curr = MONTHLY_DATA[selectedPeriod];
  const prev = MONTHLY_DATA[PERIODS[periodIndex - 1]] || curr;

  const saldo = curr.receitas - curr.despesas;
  const prevSaldo = prev.receitas - prev.despesas;

  const donutData = Object.entries(curr.categorias).map(([name, value]) => ({
    name, value,
  }));

  const barData = PERIODS.map((p) => ({
    name: p.replace("/2025", ""),
    receitas: MONTHLY_DATA[p].receitas,
    despesas: MONTHLY_DATA[p].despesas,
  }));

  const lineData = PERIODS.map((p) => ({
    name: p.replace("/2025", ""),
    saldo: MONTHLY_DATA[p].receitas - MONTHLY_DATA[p].despesas,
  }));

  const hBarData = [...donutData].sort((a, b) => b.value - a.value);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, padding: "1.5rem 2rem",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      color: C.text,
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
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setSelectedPeriod(p)}
                  style={{
                    padding: "5px 12px", borderRadius: 8, border: "1px solid",
                    borderColor: selectedPeriod === p ? C.amber : C.border,
                    background: selectedPeriod === p ? C.amberGlow : "transparent",
                    color: selectedPeriod === p ? C.amber : C.textMuted,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: `1px solid ${C.amber}`, background: "transparent",
                color: C.amber, fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.amberGlow; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem",
        flexWrap: "wrap" }}>
        <SummaryCard
          label="Total de Receitas"
          value={curr.receitas}
          change={pct(curr.receitas, prev.receitas)}
          positive={true}
          icon="💰"
        />
        <SummaryCard
          label="Total de Despesas"
          value={curr.despesas}
          change={pct(curr.despesas, prev.despesas)}
          positive={false}
          icon="💸"
        />
        <SummaryCard
          label="Saldo"
          value={saldo}
          change={pct(saldo, prevSaldo)}
          positive={true}
          icon="📊"
        />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem",
        flexWrap: "wrap" }}>
        <DonutChart data={donutData} />
        <GroupedBarChart data={barData} />
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem",
        flexWrap: "wrap" }}>
        <SaldoLineChart data={lineData} />
        <HorizontalBarChart data={hBarData} />
      </div>

      {/* Transactions + Comparison */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap",
        marginBottom: "1.25rem" }}>
        <div style={{ flex: 2, minWidth: 300 }}>
          <TransactionsTable />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <PeriodComparison curr={curr} prev={prev} />
        </div>
      </div>
    </div>
  );
}
