import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { Dashboard } from './Dashboard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { clsx } from 'clsx';

export function Results() {
  const { analysisResults, evaluationResults } = useResume();
  const [activeTab, setActiveTab] = useState('Overview');

  const renderOverview = () => {
    const hasAnalysis = analysisResults && analysisResults.length > 0;
    const hasInterview = !!evaluationResults;

    const bestAts = hasAnalysis
      ? [...analysisResults].sort((a, b) => (b.ats?.overall_score || 0) - (a.ats?.overall_score || 0))[0].ats?.overall_score
      : 0;

    let interviewScore = 0;
    let allEvaluations = [];
    if (hasInterview && evaluationResults.reports) {
      const reports = Object.values(evaluationResults.reports);
      const validReports = reports.filter((r) => !r.error);
      if (validReports.length > 0) {
        interviewScore = Math.round(validReports.reduce((sum, r) => sum + (r.overall_score || 0), 0) / validReports.length);
      }
      reports.forEach((r) => { if (r.evaluations) allEvaluations.push(...r.evaluations); });
      evaluationResults.allEvaluationsList = allEvaluations;
    } else if (hasInterview && evaluationResults.evaluation) {
      interviewScore = evaluationResults.evaluation.overall_score || 0;
      evaluationResults.allEvaluationsList = evaluationResults.evaluation.evaluations || [];
    }

    const overallCombined = hasAnalysis && hasInterview
      ? Math.round((bestAts + interviewScore) / 2)
      : hasAnalysis ? bestAts : interviewScore;

    const scoreLabel = overallCombined >= 75 ? 'Strong' : overallCombined >= 50 ? 'Average' : 'Needs Work';

    return (
      <div className="space-y-6 animate-float-up">
        {/* Hero Score Card */}
        <div className="rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 justify-center shadow-sm"
             style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>

          {/* Circular Score */}
          <div className="relative w-36 h-36 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(83,74,183,0.1)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallCombined / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#534AB7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{overallCombined}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Overall</span>
            </div>
          </div>

          <div className="max-w-md text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Star className="w-4 h-4 text-brand-primary" fill="#534AB7" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#534AB7' }}>{scoreLabel} Performance</span>
            </div>
            <h2 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Final Evaluation Report</h2>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              Based on your resume analysis and mock interview session, you are showing{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{scoreLabel.toLowerCase()}</strong> potential for your targeted roles.
            </p>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {hasAnalysis && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#EEEDFE', color: '#534AB7' }}>✓ Resume Analyzed</span>
              )}
              {hasInterview && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#DCFCE7', color: '#166534' }}>✓ Interview Completed</span>
              )}
            </div>
          </div>
        </div>

        {/* 2-col stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hasAnalysis && (
            <div className="rounded-2xl p-6 shadow-sm"
                 style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>ATS Match by Role</h3>
              <div className="space-y-3">
                {analysisResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[13px] font-medium truncate pr-4" style={{ color: 'var(--text-primary)' }}>{r.role?.title}</span>
                    <ScoreBadge score={r.ats?.overall_score || 0} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasInterview && (
            <div className="rounded-2xl p-6 shadow-sm"
                 style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Interview Summary</h3>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                {evaluationResults?.evaluation?.overall_summary || 'Good effort overall.'}
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl"
                   style={{ background: '#EEEDFE' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#534AB7' }}>Final Interview Score</span>
                <span className="text-[18px] font-bold" style={{ color: '#534AB7' }}>{interviewScore}/100</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInterviewTab = () => {
    if (!evaluationResults) {
      return <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No interview data available.</div>;
    }
    const evals = evaluationResults.allEvaluationsList || [];
    if (evals.length === 0) {
      return <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No specific question feedback available.</div>;
    }

    return (
      <div className="space-y-4 animate-float-up">
        {evals.map((item, i) => <EvaluationRow key={i} data={item} />)}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:py-8 space-y-6">

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b pb-0 overflow-x-auto"
           style={{ borderColor: 'var(--card-border)' }}>
        {['Overview', 'Resume analysis', 'Interview'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-px"
            style={{
              color: activeTab === tab ? '#534AB7' : 'var(--text-muted)',
              borderColor: activeTab === tab ? '#534AB7' : 'transparent',
              background: 'transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pb-16">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Resume analysis' && (
          <div className="animate-float-up -mx-4 md:mx-0">
            <Dashboard />
          </div>
        )}
        {activeTab === 'Interview' && renderInterviewTab()}
      </div>
    </div>
  );
}

function EvaluationRow({ data }) {
  const [expanded, setExpanded] = useState(false);
  const score = data.score_out_of_10;

  let scoreStyle = { background: '#FEE2E2', color: '#991B1B', borderColor: 'rgba(153,27,27,0.2)' };
  if (score >= 8) scoreStyle = { background: '#DCFCE7', color: '#166534', borderColor: 'rgba(22,101,52,0.2)' };
  else if (score >= 5) scoreStyle = { background: '#FEF3C7', color: '#92400E', borderColor: 'rgba(146,64,14,0.2)' };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
         style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>

      <div className="p-5 flex items-start gap-4 cursor-pointer transition-colors"
           onClick={() => setExpanded(!expanded)}>
        <div className="px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 mt-0.5"
             style={scoreStyle}>
          {score}/10
        </div>
        <div className="flex-1 pr-4">
          <p className="text-[13.5px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Q{data.question_number}: {data.question}
          </p>
          <p className="text-[12.5px] line-clamp-2" style={{ color: 'var(--text-muted)' }}>{data.feedback}</p>
        </div>
        <div className="shrink-0 mt-1" style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-3 animate-float-up"
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="p-4 rounded-xl" style={{ background: '#EEEDFE' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#534AB7' }}>AI Feedback</span>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: '#1E1B4B' }}>{data.feedback}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#DCFCE7' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#166534' }}>Ideal Answer</span>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: '#14532D' }}>{data.ideal_answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
