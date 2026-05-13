export function QuestionCard({ question }) {
  return (
    <div className="p-6 rounded-2xl border-l-4 border-brand-primary shadow-sm"
         style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#534AB7' }}>
        Interview Question
      </p>
      <h3 className="text-[16px] font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {question}
      </h3>
    </div>
  );
}
