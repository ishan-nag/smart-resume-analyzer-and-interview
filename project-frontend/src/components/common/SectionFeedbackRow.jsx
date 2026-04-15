import { ProgressBar } from './ProgressBar';

export function SectionFeedbackRow({ title, feedback, score, improvements = [] }) {
  const initials = title?.substring(0, 2).toUpperCase() || 'NA';
  
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border-b border-[0.5px] border-brand-mid/30 last:border-0 hover:bg-brand-light/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-medium shrink-0">
        {initials}
      </div>
      <div className="flex-1 space-y-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-medium text-brand-dark dark:text-gray-100">{title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{score}/100</span>
            <ProgressBar value={score} className="w-24" />
          </div>
        </div>
        <p className="text-sm text-brand-mid dark:text-gray-400">{feedback}</p>
        
        {improvements?.length > 0 && (
          <div className="mt-2 text-sm text-brand-dark dark:text-gray-100">
            <strong>Suggested: </strong>
            <ul className="list-disc pl-4 mt-1 text-brand-mid dark:text-gray-400">
              {improvements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
