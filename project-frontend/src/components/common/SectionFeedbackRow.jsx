import { ProgressBar } from './ProgressBar';

const sectionColors = [
  '#818CF8', '#34D399', '#FB923C', '#F472B6',
  '#60A5FA', '#A78BFA', '#FBBF24', '#4ADE80',
];

let colorIdx = 0;
const colorMap = {};

function getColor(title) {
  if (!colorMap[title]) {
    colorMap[title] = sectionColors[colorIdx % sectionColors.length];
    colorIdx++;
  }
  return colorMap[title];
}

export function SectionFeedbackRow({ title, feedback, score, improvements = [] }) {
  const initials = title?.substring(0, 2).toUpperCase() || 'NA';
  const accent   = getColor(title);

  return (
    <div
      className="flex flex-col sm:flex-row items-start gap-4 p-5 transition-all"
      style={{ borderColor: 'var(--card-border)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Initials Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm"
        style={{
          background: `${accent}20`,
          color: accent,
          border: `1.5px solid ${accent}40`,
        }}
      >
        {initials}
      </div>

      <div className="flex-1 space-y-2 w-full min-w-0">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h4>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-black" style={{ color: accent }}>{score}/100</span>
            <div className="w-24">
              <ProgressBar value={score} color={accent} />
            </div>
          </div>
        </div>

        {/* Feedback */}
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {feedback}
        </p>

        {/* Improvements */}
        {improvements?.length > 0 && (
          <div className="mt-1.5 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
              Suggested Improvements
            </p>
            <ul className="space-y-1">
              {improvements.map((item, idx) => (
                <li key={idx} className="flex gap-2 items-start text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
