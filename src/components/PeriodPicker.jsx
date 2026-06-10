import { useMemo, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  border: "#3A3120",
  amber: "#D4A843",
  amberGlow: "rgba(212,168,67,0.1)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
};

function pad(n) { return String(n).padStart(2, "0"); }
function lastDayOfMonth(year, month) { return new Date(year, month, 0).getDate(); }
function monthLabel(month, year, style = "short") {
  const d = new Date(year, month - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: style, year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function keyFor(y, m) { return `${y}-${m}`; }

function buildLabelFromRange(s, e) {
  if (s.year === e.year) {
    const a = monthLabel(s.month, s.year, "short");
    const b = monthLabel(e.month, e.year, "short");
    return `${a} – ${b}`;
  }
  const a = monthLabel(s.month, s.year, "short");
  const b = monthLabel(e.month, e.year, "short");
  return `${a} – ${b}`;
}

export default function PeriodPicker({ availableMonths, value, onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const monthsSet = useMemo(() => new Set(availableMonths.map(m => keyFor(m.year, m.month))), [availableMonths]);
  const sorted = useMemo(() => [...availableMonths].sort((a,b)=> a.year!==b.year? a.year-b.year : a.month-b.month), [availableMonths]);
  const years = useMemo(() => {
    const ys = Array.from(new Set(sorted.map(m => m.year)));
    return ys.sort((a,b)=> a-b);
  }, [sorted]);

  const currentLabel = useMemo(() => {
    if (!value) return "Selecionar período";
    if (value.month && value.year) return monthLabel(value.month, value.year);
    if (value.startDate && value.endDate) return `${new Date(value.startDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} – ${new Date(value.endDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;
    return "Selecionar período";
  }, [value]);

  function handlePickMonth(y, m) {
    const k = { year: y, month: m };
    if (!start || (start && end)) { setStart(k); setEnd(null); return; }
    // if selecting earlier than start, reset start
    if (y < start.year || (y === start.year && m < start.month)) { setStart(k); setEnd(null); return; }
    setEnd(k);
  }

  function applyRange(selStart, selEnd) {
    if (!selStart) return;
    const a = selStart;
    const b = selEnd || selStart;
    // if single month, use month/year mode
    if (a.year === b.year && a.month === b.month) {
      const label = monthLabel(a.month, a.year);
      onChange({ month: a.month, year: a.year }, label);
    } else {
      const s = `${a.year}-${pad(a.month)}-01`;
      const e = `${b.year}-${pad(b.month)}-${pad(lastDayOfMonth(b.year, b.month))}`;
      const label = buildLabelFromRange(a, b);
      onChange({ startDate: s, endDate: e }, label);
    }
    setOpen(false);
  }

  function shortcutCurrentMonth() {
    if (!sorted.length) return;
    const last = sorted[sorted.length - 1];
    onChange({ month: last.month, year: last.year }, monthLabel(last.month, last.year));
    setOpen(false);
  }

  function shortcutLastN(n) {
    if (sorted.length < n) return;
    const endM = sorted[sorted.length - 1];
    const startM = sorted[sorted.length - n];
    applyRange(startM, endM);
  }

  function shortcutThisYear() {
    if (!sorted.length) return;
    const last = sorted[sorted.length - 1];
    const inYear = sorted.filter(m => m.year === last.year);
    if (!inYear.length) return;
    applyRange(inYear[0], inYear[inYear.length-1]);
  }

  function isInPreview(y, m) {
    if (!start || !end) return false;
    const a = start; const b = end;
    const afterA = y > a.year || (y === a.year && m >= a.month);
    const beforeB = y < b.year || (y === b.year && m <= b.month);
    return afterA && beforeB;
  }

  const btnStyle = {
    padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.border}`,
    background: "transparent", color: C.text, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  };

  const panelStyle = isMobile
    ? { position: "fixed", left: "1rem", right: "1rem", top: "50%", transform: "translateY(-50%)" }
    : { position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 520 };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
      >
        {currentLabel} ›
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: isMobile ? "rgba(0,0,0,0.5)" : "transparent", zIndex: 49 }}
          />
          <div style={{ ...panelStyle, zIndex: 50, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, color: C.text }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr", gap: 14 }}>
              {/* Shortcuts */}
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>Atalhos</div>
                <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flexWrap: "wrap", gap: 6 }}>
                  <button onClick={shortcutCurrentMonth} style={btnStyle}>Mês atual</button>
                  {sorted.length >= 3 && (
                    <button onClick={() => shortcutLastN(3)} style={btnStyle}>Últ. 3 meses</button>
                  )}
                  {sorted.length >= 6 && (
                    <button onClick={() => shortcutLastN(6)} style={btnStyle}>Últ. 6 meses</button>
                  )}
                  <button onClick={shortcutThisYear} style={btnStyle}>Este ano</button>
                </div>
              </div>

              {/* Month grid */}
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>Personalizado</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {years.map((y) => (
                    <div key={y}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{y}</div>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 4 : 6}, minmax(0, 1fr))`, gap: 5 }}>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = i + 1;
                          const enabled = monthsSet.has(keyFor(y, m));
                          const isStart = start && start.year === y && start.month === m;
                          const isEnd = end && end.year === y && end.month === m;
                          const inPreview = start && (isStart || isInPreview(y, m));
                          return (
                            <button key={m} disabled={!enabled}
                              onClick={() => enabled && handlePickMonth(y, m)}
                              style={{
                                padding: "5px 4px", borderRadius: 6, fontFamily: "inherit",
                                border: `1px solid ${isStart || isEnd ? C.amber : C.border}`,
                                background: isStart || isEnd ? C.amberGlow : inPreview ? C.amberGlow : "transparent",
                                color: enabled ? (isStart || isEnd ? C.amber : C.text) : C.textMuted,
                                cursor: enabled ? "pointer" : "not-allowed",
                                fontSize: 11,
                              }}
                            >{monthLabel(m, y, "short").split(" ")[0]}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 8 }}>
                  <button onClick={() => setOpen(false)} style={{ ...btnStyle, color: C.textMuted }}>Cancelar</button>
                  <button onClick={() => applyRange(start, end)} disabled={!start}
                    style={{ ...btnStyle, border: `1px solid ${C.amber}`, color: C.amber, fontWeight: 600, opacity: start ? 1 : 0.5 }}>
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
