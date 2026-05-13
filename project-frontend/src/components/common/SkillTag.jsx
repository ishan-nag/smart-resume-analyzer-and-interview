export function SkillTag({ label, type = 'matched', className = '' }) {
  const styles = {
    matched: {
      background: 'rgba(52,211,153,0.12)',
      color: '#059669',
      border: '1px solid rgba(52,211,153,0.3)',
    },
    missing: {
      background: 'rgba(248,113,113,0.12)',
      color: '#DC2626',
      border: '1px solid rgba(248,113,113,0.3)',
    },
    'nice-to-have': {
      background: 'rgba(251,191,36,0.12)',
      color: '#D97706',
      border: '1px solid rgba(251,191,36,0.3)',
    },
  };

  const style = styles[type] || styles.matched;

  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-semibold ${className}`}
      style={style}
    >
      {type === 'matched'       && '✓ '}
      {type === 'missing'       && '✗ '}
      {type === 'nice-to-have'  && '~ '}
      {label}
    </span>
  );
}
