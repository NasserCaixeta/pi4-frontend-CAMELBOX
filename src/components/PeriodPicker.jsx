import { useMemo, useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";

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
  const triggerRef = useRef(null);

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

  function focusTrigger() {
    triggerRef.current?.focus();
  }

  function closePicker(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(focusTrigger);
    }
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
    closePicker(true);
  }

  function shortcutCurrentMonth() {
    if (!sorted.length) return;
    const last = sorted[sorted.length - 1];
    onChange({ month: last.month, year: last.year }, monthLabel(last.month, last.year));
    closePicker(true);
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

  function handleKeyDown(e) {
    if (e.key !== "Escape" || !open) return;
    e.stopPropagation();
    closePicker(true);
  }

  return (
    <div className="cb-period-picker" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="cb-button cb-period-trigger cb-period-shortcut"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="period-picker-panel"
      >
        {currentLabel} ›
      </button>

      {open && (
        <>
          <div
            onClick={() => closePicker(true)}
            className={`cb-period-backdrop${isMobile ? " is-mobile" : ""}`}
          />
          <div
            id="period-picker-panel"
            className="cb-popover cb-period-panel"
            role="dialog"
            aria-label="Selecionar período"
          >
            <div className="cb-period-layout">
              {/* Shortcuts */}
              <div>
                <div className="cb-period-section-title">Atalhos</div>
                <div className="cb-period-shortcuts">
                  <button onClick={shortcutCurrentMonth} className="cb-button cb-period-shortcut">Mês atual</button>
                  {sorted.length >= 3 && (
                    <button onClick={() => shortcutLastN(3)} className="cb-button cb-period-shortcut">Últ. 3 meses</button>
                  )}
                  {sorted.length >= 6 && (
                    <button onClick={() => shortcutLastN(6)} className="cb-button cb-period-shortcut">Últ. 6 meses</button>
                  )}
                  <button onClick={shortcutThisYear} className="cb-button cb-period-shortcut">Este ano</button>
                </div>
              </div>

              {/* Month grid */}
              <div>
                <div className="cb-period-section-title">Personalizado</div>
                <div className="cb-period-years">
                  {years.map((y) => (
                    <div key={y}>
                      <div className="cb-period-year">{y}</div>
                      <div className="cb-month-grid">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = i + 1;
                          const enabled = monthsSet.has(keyFor(y, m));
                          const isStart = start && start.year === y && start.month === m;
                          const isEnd = end && end.year === y && end.month === m;
                          const inPreview = start && (isStart || isInPreview(y, m));
                          return (
                            <button key={m} disabled={!enabled}
                              onClick={() => enabled && handlePickMonth(y, m)}
                              aria-pressed={Boolean(isStart || isEnd || inPreview)}
                              className={`cb-month-button${isStart || isEnd ? " is-selected" : ""}${inPreview ? " is-in-range" : ""}`}
                            >{monthLabel(m, y, "short").split(" ")[0]}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cb-period-actions">
                  <button onClick={() => closePicker(true)} className="cb-button cb-period-shortcut cb-button--ghost">Cancelar</button>
                  <button onClick={() => applyRange(start, end)} disabled={!start}
                    className="cb-button cb-period-shortcut cb-period-apply">
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
