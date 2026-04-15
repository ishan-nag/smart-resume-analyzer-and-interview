export function SkeletonBlock({ width = '100%', height = '20px', className = '' }) {
  return (
    <div 
      className={`rounded-2xl bg-brand-light/50 relative overflow-hidden border border-white/50 ${className}`}
      style={{ width, height }}
    >
      <div 
        className="absolute inset-0 z-10 w-full h-full"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite ease-in-out'
        }}
      />
    </div>
  );
}
