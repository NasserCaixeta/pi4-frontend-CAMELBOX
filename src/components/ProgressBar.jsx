export default function ProgressBar({ label, sublabel }) {
  return (
    <div
      className="cb-progress"
      role="progressbar"
      aria-label={label || sublabel || "Loading"}
    >
      {label && <div className="cb-progress__label">{label}</div>}
      <div className="cb-progress__track">
        <div className="cb-progress__bar" />
        <div className="cb-progress__bar-secondary" />
      </div>
      {sublabel && <div className="cb-progress__sublabel">{sublabel}</div>}
    </div>
  );
}
