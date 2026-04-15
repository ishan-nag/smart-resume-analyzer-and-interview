export function ProgressBar({ value, color = 'bg-brand-primary', height = 'h-2', className = '' }) {
  const safeValue = Math.min(100, Math.max(0, value || 0));
  return (
    <div className={`w-full bg-brand-light rounded-full overflow-hidden ${height} ${className}`}>
      <div 
        className={`${height} ${color} transition-all duration-500 ease-out`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
