import { useResume } from '../context/ResumeContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { SkillTag } from '../components/common/SkillTag';
import { SectionFeedbackRow } from '../components/common/SectionFeedbackRow';
import { Trophy, Users, FileBarChart, Lightbulb, Target } from 'lucide-react';

export function Dashboard() {
  const { analysisResults, upgradeTip, evaluationResults } = useResume();

  if (!analysisResults || analysisResults.length === 0) {
    return (
      <div className="p-8 text-center text-brand-mid dark:text-gray-400">
        <p>No analysis data available. Please upload a resume first.</p>
      </div>
    );
  }

  // Calculate stats
  const bestMatch = [...analysisResults].sort((a, b) => (b.ats?.overall_score || 0) - (a.ats?.overall_score || 0))[0];
  const rolesCount = analysisResults.length;
  const qualityScore = bestMatch?.quality_score?.overall || 0;
  const interviewScore = evaluationResults?.evaluation?.overall_score;

  const skillsGap = bestMatch?.skills_gap || { matched: [], missing: [], nice_to_have_missing: [] };
  const sections = bestMatch?.section_feedback || {};

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-brand-successBg dark:bg-green-500/10 text-brand-success dark:text-green-400 p-3 rounded-full shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-mid dark:text-gray-400 uppercase tracking-wide">Best Match Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-dark dark:text-gray-100">{bestMatch?.ats?.overall_score || 0}%</span>
            </div>
            <p className="text-xs text-brand-dark dark:text-gray-100 truncate">{bestMatch?.role?.title}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-brand-light dark:bg-brand-primary/20 text-brand-primary dark:text-indigo-400 p-3 rounded-full shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-mid dark:text-gray-400 uppercase tracking-wide">Roles Compared</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-dark dark:text-gray-100">{rolesCount}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-brand-light dark:bg-brand-primary/20 text-brand-primary dark:text-indigo-400 p-3 rounded-full shrink-0">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-mid dark:text-gray-400 uppercase tracking-wide">Resume Quality</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-dark dark:text-gray-100">{qualityScore}/100</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-brand-warningBg dark:bg-amber-500/10 text-brand-warning dark:text-amber-400 p-3 rounded-full shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-mid dark:text-gray-400 uppercase tracking-wide">Interview Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-brand-dark dark:text-gray-100">
                {interviewScore !== undefined ? `${interviewScore}/100` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Role Comparisons & Skills */}
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[0.5px] border-brand-mid/30">
            <h3 className="text-base font-medium text-brand-dark dark:text-gray-100">Role Comparisons</h3>
            <p className="text-xs text-brand-mid dark:text-gray-400 mt-1">ATS matching scores for your selected roles</p>
          </div>
          <div className="p-5 space-y-5">
            {analysisResults.map((res, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="truncate pr-4">
                    <div className="text-sm font-medium text-brand-dark dark:text-gray-100 truncate">{res.role?.title}</div>
                    <div className="text-xs text-brand-mid dark:text-gray-400">{res.ats?.recommendation}</div>
                  </div>
                  <ScoreBadge score={res.ats?.overall_score || 0} />
                </div>
                <ProgressBar value={res.ats?.overall_score || 0} />
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-[0.5px] border-white/20 dark:border-slate-700/50 bg-brand-light/30 dark:bg-slate-800/50 flex-1">
            <h3 className="text-sm font-medium text-brand-dark dark:text-gray-100 mb-3">Skills Gap Analysis (Best Match)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsGap.matched?.map((s, i) => <SkillTag key={`m-${i}`} label={s} type="matched" />)}
              {skillsGap.missing?.map((s, i) => <SkillTag key={`miss-${i}`} label={s} type="missing" />)}
              {skillsGap.nice_to_have_missing?.map((s, i) => <SkillTag key={`nth-${i}`} label={s} type="nice-to-have" />)}
              
              {skillsGap.matched?.length === 0 && skillsGap.missing?.length === 0 && (
                <span className="text-sm text-brand-mid dark:text-gray-400">No skills data available.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quality & Upgrade Tip */}
        <div className="glass-card rounded-2xl flex flex-col">
          <div className="p-5 border-b border-[0.5px] border-brand-mid/30">
            <h3 className="text-base font-medium text-brand-dark dark:text-gray-100">Quality Breakdown</h3>
            <p className="text-xs text-brand-mid dark:text-gray-400 mt-1">How well your resume is written</p>
          </div>
          <div className="p-5 space-y-5">
            {Object.entries(bestMatch?.quality_score?.breakdown || {}).map(([key, val]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-brand-dark dark:text-gray-100 capitalize">{key}</div>
                  <div className="text-sm text-brand-mid dark:text-gray-400">{val}/100</div>
                </div>
                <ProgressBar value={val} color="bg-brand-mid" />
              </div>
            ))}
          </div>
          
          {upgradeTip && (
          <div className="m-5 mt-auto p-4 bg-brand-light/50 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/30 rounded-2xl flex gap-3">
              <Lightbulb className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-brand-dark dark:text-gray-100 mb-2">Global Upgrade Tip</h4>
                <ul className="space-y-1.5">
                  {upgradeTip.split(/\.\s+/).filter(s => s.trim().length > 5).map((sentence, i) => (
                    <li key={i} className="flex gap-2 text-sm text-brand-dark dark:text-gray-100 leading-relaxed">
                      <span className="text-brand-primary shrink-0 mt-0.5">•</span>
                      <span>{sentence.replace(/\.$/, '')}.</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Section Feedback */}
      <div className="glass-card rounded-2xl w-full">
        <div className="p-5 border-b border-[0.5px] border-brand-mid/30">
          <h3 className="text-base font-medium text-brand-dark dark:text-gray-100">Section-by-Section Feedback</h3>
        </div>
        <div className="flex flex-col">
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
            <div className="p-5 text-center text-brand-mid dark:text-gray-400 text-sm">No section feedback available.</div>
          )}
        </div>
      </div>

    </div>
  );
}
