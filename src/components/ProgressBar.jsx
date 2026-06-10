const STYLE_ID = 'camelbox-progress-bar-styles';

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cb-progress-indeterminate {
      0%   { left: -35%; width: 35%; }
      60%  { left: 100%; width: 35%; }
      100% { left: 100%; width: 35%; }
    }
    @keyframes cb-progress-short {
      0%   { left: -200%; width: 200%; }
      60%  { left: 107%; width: 200%; }
      100% { left: 107%; width: 200%; }
    }
  `;
  document.head.appendChild(style);
}

export default function ProgressBar({ label, sublabel }) {
  injectStyles();

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      {label && (
        <div style={{ fontSize: 14, fontWeight: 500, color: '#D4A843' }}>{label}</div>
      )}

      {/* Track */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 6,
        borderRadius: 99,
        background: '#3A3120',
        overflow: 'hidden',
      }}>
        {/* Primary bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          borderRadius: 99,
          background: 'linear-gradient(90deg, #C49030, #D4A843, #E8C265)',
          animation: 'cb-progress-indeterminate 2.1s cubic-bezier(0.65,0.815,0.735,0.395) infinite',
        }} />
        {/* Secondary bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          borderRadius: 99,
          background: 'linear-gradient(90deg, #C49030, #D4A843, #E8C265)',
          animation: 'cb-progress-short 2.1s cubic-bezier(0.165,0.84,0.44,1) infinite',
          animationDelay: '1.15s',
        }} />
      </div>

      {sublabel && (
        <div style={{ fontSize: 12, color: '#8A7A5A', textAlign: 'center' }}>{sublabel}</div>
      )}
    </div>
  );
}
