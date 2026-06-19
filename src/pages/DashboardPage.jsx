import { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
} from "recharts";
import useDashboard from "../hooks/useDashboard";
import PeriodPicker from "../components/PeriodPicker";
import UploadCard from "../components/UploadCard";
import useIsMobile from "../hooks/useIsMobile";
import api from "../services/api";

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
    "Compras":     "#F9A8D4",
    "Assinaturas": "#8B5CF6",
    "Educação":    "#3B82F6",
    "Serviços":    "#10B981",
    "Transferências": "#64748B",
    "Outros":      "#6A7A6A",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const getCatColor = (name) => C.cat[name] || "#6A7A6A";

const formatPeriod = (month, year) => {
  const d = new Date(year, month - 1, 1);
  const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// ─── Base UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, className = "", style }) => (
  <div className={`cb-card${className ? ` ${className}` : ""}`} style={style}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="cb-section-title">
    {children}
  </div>
);

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({ label, value, change, positive }) {
  const hasChange = change !== null && change !== undefined;
  const up = hasChange && parseFloat(change) >= 0;
  const isGood = hasChange && (positive ? up : !up);
  return (
    <Card>
      <div className="dashboard-summary-label">
        {label}
      </div>
      <div className="dashboard-summary-value">
        {fmt(value)}
      </div>
      {hasChange && (
        <div className={`dashboard-summary-change ${isGood ? "is-good" : "is-bad"}`}>
          <span>{up ? "+" : "−"}{Math.abs(change)}%</span>
          <span className="dashboard-summary-change-context">vs mês anterior</span>
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
    <div className="dashboard-tooltip">
      <strong>{name}</strong>: {fmt(value)}
    </div>
  );
};

function DonutChart({ data }) {
  const isMobile = useIsMobile();
  const total = data.reduce((s, d) => s + d.value, 0);

  const legend = (
    <div className={`dashboard-donut-legend${isMobile ? " is-mobile" : ""}`}>
      {data.map((d) => (
        <div key={d.name} className="dashboard-donut-legend-item">
          <div className="dashboard-donut-label">
            <div className="dashboard-donut-dot" style={{ background: getCatColor(d.name) }} />
            <span className="dashboard-donut-name">
              {d.name}
            </span>
          </div>
          <span className="dashboard-donut-percent">
            {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
          </span>
        </div>
      ))}
    </div>
  );

  const size = 200;
  const pie = (
    <div className="dashboard-donut-chart" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx="50%" cy="50%"
          innerRadius={60} outerRadius={90}
          dataKey="value" strokeWidth={0}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={getCatColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomDonutTooltip />} />
      </PieChart>
    </div>
  );

  return (
    <Card>
      <SectionTitle>Despesas por Categoria</SectionTitle>
      <div className="dashboard-donut">
        {pie}
        {legend}
      </div>
    </Card>
  );
}

// ─── Horizontal Bar ──────────────────────────────────────────────────────────
function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card>
      <SectionTitle>Top Categorias de Gasto</SectionTitle>
      <div className="dashboard-bar-list">
        {data.map((d) => (
          <div key={d.name} className="dashboard-bar-row">
            <div className="dashboard-bar-meta">
              <span className="dashboard-bar-name">{d.name}</span>
              <span className="dashboard-bar-value">{fmt(d.value)}</span>
            </div>
            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: getCatColor(d.name),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Transactions Table ──────────────────────────────────────────────────────
// sortValue cycles: null → "asc" → "desc" → null
function TransactionsTable({ transactions }) {
  const [activeCats, setActiveCats] = useState(new Set());
  const [valueSearch, setValueSearch] = useState("");
  const [sortValue, setSortValue] = useState(null); // null | "asc" | "desc"

  const allItems = useMemo(() => transactions?.items || [], [transactions]);

  const uniqueCategories = useMemo(() => {
    const seen = new Map();
    for (const t of allItems) {
      const name = t.category?.name || "Sem categoria";
      if (!seen.has(name)) seen.set(name, name);
    }
    return Array.from(seen.keys());
  }, [allItems]);

  const toggleCat = (name) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveCats(new Set());
    setValueSearch("");
    setSortValue(null);
  };

  const cycleSortValue = () => {
    setSortValue((prev) => prev === null ? "asc" : prev === "asc" ? "desc" : null);
  };

  const hasActiveFilters = activeCats.size > 0 || valueSearch.trim() !== "" || sortValue !== null;

  const filtered = useMemo(() => {
    let items = allItems;

    if (activeCats.size > 0) {
      items = items.filter((t) => activeCats.has(t.category?.name || "Sem categoria"));
    }

    if (valueSearch.trim() !== "") {
      const needle = valueSearch.trim().replace(",", ".");
      items = items.filter((t) => {
        const amountStr = parseFloat(t.amount).toFixed(2);
        return amountStr.startsWith(needle) || amountStr === needle;
      });
    }

    if (sortValue === "asc") {
      items = [...items].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    } else if (sortValue === "desc") {
      items = [...items].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    }

    return items;
  }, [allItems, activeCats, valueSearch, sortValue]);

  const sortIcon = sortValue === "asc" ? "↑" : sortValue === "desc" ? "↓" : "↕";

  if (allItems.length === 0) {
    return (
      <Card>
        <SectionTitle>Transações Recentes</SectionTitle>
        <div className="dashboard-empty-message">
          Nenhuma transação encontrada neste período.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle>Transações Recentes</SectionTitle>

      {/* ── Category pills ── */}
      {uniqueCategories.length > 0 && (
        <div className="cb-pill-row">
          {uniqueCategories.map((name) => {
            const color = getCatColor(name);
            const active = activeCats.has(name);
            return (
              <button
                key={name}
                type="button"
                className="cb-pill"
                aria-pressed={active}
                onClick={() => toggleCat(name)}
                style={active ? {
                  borderColor: color,
                  background: `${color}28`,
                  color,
                } : undefined}
              >
                <span
                  className="dashboard-category-dot"
                  style={active ? { background: color } : undefined}
                />
                {name}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              type="button"
              className="cb-pill"
              onClick={clearFilters}
            >
              × Limpar
            </button>
          )}
        </div>
      )}

      {/* ── Value search ── */}
      <div className="dashboard-filter-row">
        <div className="dashboard-value-search">
          <label className="cb-sr-only" htmlFor="dashboard-value-search">
            Buscar transações por valor
          </label>
          <span className="dashboard-value-prefix">R$</span>
          <input
            id="dashboard-value-search"
            className={`dashboard-value-input${valueSearch ? " is-active" : ""}`}
            type="text"
            inputMode="decimal"
            placeholder="buscar por valor..."
            value={valueSearch}
            onChange={(e) => setValueSearch(e.target.value)}
          />
        </div>
        <div className="dashboard-result-count">
          Exibindo <strong>{filtered.length}</strong> de{" "}
          <strong>{allItems.length}</strong>
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="dashboard-empty-message dashboard-empty-message--compact">
          Nenhuma transação corresponde aos filtros aplicados.
        </div>
      ) : (
        <table className="cb-table">
          <colgroup>
            <col />
            <col className="dashboard-table-col-category" />
            <col className="dashboard-table-col-date" />
            <col className="dashboard-table-col-amount" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Descrição</th>
              <th scope="col">Categoria</th>
              <th scope="col">Data</th>
              <th
                scope="col"
                aria-sort={sortValue === "asc" ? "ascending" : sortValue === "desc" ? "descending" : "none"}
                className={`dashboard-table-sort${sortValue ? " is-active" : ""}`}
              >
                <button
                  type="button"
                  className="dashboard-table-sort-button"
                  onClick={cycleSortValue}
                  title="Ordenar por valor"
                >
                  Valor {sortIcon}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const catName = t.category?.name || "Sem categoria";
              const formattedDate = new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR');
              return (
                <tr key={t.id}>
                  <td className="dashboard-table-description">
                    {t.description || "—"}
                  </td>
                  <td className="dashboard-table-category">
                    <span
                      className="dashboard-category-chip"
                      style={{
                        background: `${getCatColor(catName)}20`,
                        color: getCatColor(catName),
                      }}
                    >
                      <span className="dashboard-category-chip__text">{catName}</span>
                    </span>
                  </td>
                  <td className="dashboard-table-date">
                    {formattedDate}
                  </td>
                  <td className={`dashboard-table-amount ${t.type === "credit" ? "is-credit" : "is-debit"}`}>
                    {t.type === "credit" ? "+" : "-"}{fmt(t.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ─── Period Comparison ────────────────────────────────────────────────────────
function PeriodComparison({ categories }) {
  if (!categories?.categories?.length) return null;

  return (
    <Card>
      <SectionTitle>Comparativo com Período Anterior</SectionTitle>
      <div className="dashboard-comparison-grid">
        {categories.categories.map((item) => {
          const catName = item.category?.name || "Sem categoria";
          const change = item.comparison?.change_percent;
          const hasChange = change !== null && change !== undefined;
          const isGood = hasChange && change < 0;
          return (
            <div key={catName} className="dashboard-comparison-card">
              <div className="dashboard-comparison-head">
                <div className="dashboard-comparison-dot" style={{ background: getCatColor(catName) }} />
                <span className="dashboard-comparison-name">{catName}</span>
              </div>
              <div className="dashboard-comparison-total">
                {fmt(item.total)}
              </div>
              {hasChange && (
                <div className={`dashboard-comparison-change ${isGood ? "is-good" : "is-bad"}`}>
                  {change > 0 ? "+" : "−"}{Math.abs(change)}%
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
export default function DashboardPage({ onShowPlans: onShowPlansProp }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null); // { startDate, endDate }

  const {
    summary, categories, transactions, statements,
    availableMonths, loading, refresh,
  } = useDashboard(
    selectedRange
      ? { startDate: selectedRange.startDate, endDate: selectedRange.endDate }
      : { month: selectedMonth, year: selectedYear }
  );

  // Auto-select most recent month when availableMonths loads and there is no range selected
  useEffect(() => {
    const syncSelection = window.setTimeout(() => {
      if (availableMonths.length === 0) {
        setSelectedMonth(null);
        setSelectedYear(null);
        setSelectedRange(null);
        return;
      }

      const selectedExists = selectedRange
        ? true
        : availableMonths.some((p) => p.month === selectedMonth && p.year === selectedYear);

      if (!selectedRange && (selectedMonth === null || !selectedExists)) {
        const latest = availableMonths[availableMonths.length - 1];
        setSelectedMonth(latest.month);
        setSelectedYear(latest.year);
      }
    }, 0);

    return () => window.clearTimeout(syncSelection);
  }, [availableMonths, selectedMonth, selectedYear, selectedRange]);

  const handleUploadComplete = () => {
    refresh();
  };

  const handleDeleteMonth = async () => {
    if (selectedRange) return; // disabled in UI as well
    if (!selectedMonth || !selectedYear) return;

    const label = formatPeriod(selectedMonth, selectedYear);
    const confirmed = window.confirm(
      `Remover todas as transações de ${label}? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    await api.delete(`/statements/month?month=${selectedMonth}&year=${selectedYear}`);
    await refresh();
  };

  const hasData = statements?.some((s) => s.status === 'completed');

  // ─── Loading state ───
  if (loading && !statements) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__text">Carregando...</div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!hasData) {
    return (
      <div className="dashboard-page">
        <UploadCard onUploadComplete={handleUploadComplete} onShowPlans={() => onShowPlansProp?.()} />
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
    <div className="dashboard-page">
      {/* Top bar: period selector */}
      <div className="dashboard-topbar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-period-control">
          <span className="dashboard-period-label">Período:</span>
          <PeriodPicker
            availableMonths={availableMonths}
            value={selectedRange ? selectedRange : (selectedMonth && selectedYear ? { month: selectedMonth, year: selectedYear } : null)}
            onChange={(val) => {
              if (val.startDate && val.endDate) {
                setSelectedRange(val);
                setSelectedMonth(null);
                setSelectedYear(null);
              } else if (val.month && val.year) {
                setSelectedMonth(val.month);
                setSelectedYear(val.year);
                setSelectedRange(null);
              }
            }}
          />
        </div>
      </div>

      {/* Upload Card (compact) */}
      <UploadCard
        onUploadComplete={handleUploadComplete}
        compact
        onDeleteMonth={handleDeleteMonth}
        canDeleteMonth={Boolean(!selectedRange && selectedMonth && selectedYear)}
        onShowPlans={() => onShowPlansProp?.()}
      />

      {/* Summary Cards */}
      <div className="dashboard-summary">
        <SummaryCard
          label="Total de Receitas"
          value={summary?.total_income || 0}
          change={summary?.comparison?.income_change_percent ?? null}
          positive={true}
        />
        <SummaryCard
          label="Total de Despesas"
          value={summary?.total_expenses || 0}
          change={summary?.comparison?.expenses_change_percent ?? null}
          positive={false}
        />
        <SummaryCard
          label="Saldo"
          value={summary?.balance || 0}
          change={null}
          positive={true}
        />
      </div>

      {/* Charts row */}
      <div className="dashboard-chart-row">
        <DonutChart data={donutData} />
        <HorizontalBarChart data={hBarData} />
      </div>

      {/* Transactions + Comparison */}
      <div className="dashboard-content-row">
        <div className="dashboard-transactions">
          <TransactionsTable transactions={transactions} />
        </div>
        <div className="dashboard-comparison">
          <PeriodComparison categories={categories} />
        </div>
      </div>

    </div>
  );
}
