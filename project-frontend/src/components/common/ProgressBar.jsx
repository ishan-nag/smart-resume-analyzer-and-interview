export function ProgressBar({ value, color, height = 'h-2', className = '' }) {
  const safeValue = Math.min(100, Math.max(0, value || 0));

  // `color` can be a hex/CSS color string or a Tailwind class
  const isHex = color && (color.startsWith('#') || color.startsWith('rgb'));
  const barStyle = isHex
    ? { width: `${safeValue}%`, background: color }
    : { width: `${safeValue}%`, background: 'linear-gradient(90deg, #534AB7, #818CF8)' };

  const trackStyle = {
    background: 'var(--hover-bg, rgba(238,237,254,0.6))',
  };

  return (
    <div className={`w-full rounded-full overflow-hidden ${height} ${className}`} style={trackStyle}>
      <div
        className={`${height} rounded-full transition-all duration-500 ease-out ${!isHex && !color ? 'bg-gradient-to-r from-brand-primary to-indigo-400' : ''}`}
        style={barStyle}
      />
    </div>
  );
}
