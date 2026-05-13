import { useResume } from '../context/ResumeContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { SkillTag } from '../components/common/SkillTag';
import { SectionFeedbackRow } from '../components/common/SectionFeedbackRow';
import { Trophy, Users, FileBarChart, Lightbulb, Target } from 'lucide-react';

/* Stat card accents */
const statCards = [
  { key: 'best',      icon: Trophy,        iconBg: 'linear-gradient(135deg,#34D399,#059669)', label: 'Best Match Score' },
  { key: 'roles',     icon: Users,         iconBg: 'linear-gradient(135deg,#818CF8,#534AB7)', label: 'Roles Compared'  },
  { key: 'quality',   icon: FileBarChart,  iconBg: 'linear-gradient(135deg,#60A5FA,#2563EB)', label: 'Resume Quality'  },
  { key: 'interview', icon: Target,        iconBg: 'linear-gradient(135deg,#F472B6,#DB2777)', label: 'Interview Score' },
];

export function Dashboard() {
  const { analysisResults, upgradeTip, evaluationResults } = useResume();

  if (!analysisResults || analysisResults.length === 0) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>No analysis data available. Please upload a resume first.</p>
      </div>
    );
  }

  const bestMatch     = [...analysisResults].sort((a, b) => (b.ats?.overall_score || 0) - (a.ats?.overall_score || 0))[0];
  const rolesCount    = analysisResults.length;
  const qualityScore  = bestMatch?.quality_score?.overall || 0;
  const interviewScore= evaluationResults?.evaluation?.overall_score;
  const skillsGap     = bestMatch?.skills_gap || { matched: [], missing: [], nice_to_have_missing: [] };
  const sections      = bestMatch?.section_feedback || {};

  const statValues = [
    { value: `${bestMatch?.ats?.overall_score || 0}%`, sub: bestMatch?.role?.title },
    { value: rolesCount,                                sub: 'roles analyzed'       },
    { value: `${qualityScore}/100`,                     sub: 'quality score'        },
    { value: interviewScore !== undefined ? `${interviewScore}/100` : '—', sub: 'mock interview' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-float-up">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="glass-card p-5 rounded-2xl flex items-center gap-4 group hover:scale-[1.02] transition-transform">
              <div className="p-3 rounded-xl shrink-0 shadow-md"
                   style={{ background: card.iconBg }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: 'var(--text-muted)' }}>
                  {card.label}
                </p>
                <p className="text-[20px] font-black leading-none"
                   style={{ color: 'var(--text-primary)' }}>
                  {statValues[i].value}
                </p>
                {statValues[i].sub && (
                  <p className="text-[11px] mt-1 truncate font-medium"
                     style={{ color: 'var(--accent, #818CF8)' }}>
                    {statValues[i].sub}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Role Comparisons + Skills */}
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Role Comparisons</h3>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              ATS matching scores for your selected roles
            </p>
          </div>
          <div className="p-5 space-y-5">
            {analysisResults.map((res, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="truncate pr-4">
                    <div className="text-[13.5px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {res.role?.title}
                    </div>
                    <div className="text-[11.5px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                      {res.ats?.recommendation}
                    </div>
                  </div>
                  <ScoreBadge score={res.ats?.overall_score || 0} />
                </div>
                <ProgressBar value={res.ats?.overall_score || 0} />
              </div>
            ))}
          </div>

          {/* Skills Gap */}
          <div className="p-5 border-t flex-1" style={{ background: 'var(--hover-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-[13.5px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Skills Gap Analysis <span className="font-medium text-[12px]" style={{ color: 'var(--text-muted)' }}>(Best Match)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsGap.matched?.map((s, i) => <SkillTag key={`m-${i}`} label={s} type="matched" />)}
              {skillsGap.missing?.map((s, i) => <SkillTag key={`miss-${i}`} label={s} type="missing" />)}
              {skillsGap.nice_to_have_missing?.map((s, i) => <SkillTag key={`nth-${i}`} label={s} type="nice-to-have" />)}
              {skillsGap.matched?.length === 0 && skillsGap.missing?.length === 0 && (
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No skills data available.</span>
              )}
            </div>
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="glass-card rounded-2xl flex flex-col">
          <div className="p-5 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Quality Breakdown</h3>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>How well your resume is written</p>
          </div>
          <div className="p-5 space-y-5">
            {Object.entries(bestMatch?.quality_score?.breakdown || {}).map(([key, val]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="text-[13px] font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{key}</div>
                  <div className="text-[13px] font-bold" style={{ color: 'var(--text-muted)' }}>{val}/100</div>
                </div>
                <ProgressBar value={val} />
              </div>
            ))}
          </div>

          {/* Upgrade Tip */}
          {upgradeTip && (
            <div className="m-5 mt-auto p-4 rounded-2xl flex gap-3"
                 style={{ background: 'linear-gradient(135deg, rgba(83,74,183,0.12), rgba(124,58,237,0.06))',
                          border: '1px solid rgba(83,74,183,0.2)' }}>
              <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
              <div>
                <h4 className="text-[13px] font-bold mb-1" style={{ color: '#818CF8' }}>💡 Global Upgrade Tip</h4>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{upgradeTip}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section Feedback ── */}
      <div className="glass-card rounded-2xl w-full overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Section-by-Section Feedback</h3>
          <p className="text-[12px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            Detailed review of each resume section
          </p>
        </div>
        <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {Object.entries(sections).map(([key, data]) => (
            <SectionFeedbackRow
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              feedback={data.feedback}
              score={data.score}
              improvements={data.improvements}
            />
          ))}
          {Object.keys(sections).length === 0 && (
            <div className="p-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No section feedback available.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
