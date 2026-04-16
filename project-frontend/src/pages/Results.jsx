import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { Dashboard } from './Dashboard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export function Results() {
  const { analysisResults, evaluationResults } = useResume();
  const [activeTab, setActiveTab] = useState('Overview');

  // Overview Tab Component
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
      // only count successful reports
      const validReports = reports.filter(r => !r.error);
      if (validReports.length > 0) {
        interviewScore = Math.round(validReports.reduce((sum, r) => sum + (r.overall_score || 0), 0) / validReports.length);
      }
      reports.forEach(r => {
        if (r.evaluations) allEvaluations.push(...r.evaluations);
      });
      // Store allEvaluations cleanly for the interview tab to use
      evaluationResults.allEvaluationsList = allEvaluations;
    } else if (hasInterview && evaluationResults.evaluation) {
      interviewScore = evaluationResults.evaluation.overall_score || 0;
      evaluationResults.allEvaluationsList = evaluationResults.evaluation.evaluations || [];
    }

    const overallCombined = hasAnalysis && hasInterview 
      ? Math.round((bestAts + interviewScore) / 2)
      : hasAnalysis ? bestAts : interviewScore;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Big Circular Score */}
        <div className="bg-white dark:bg-[#1a1a2e] p-8 border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 rounded-brand flex flex-col md:flex-row items-center gap-8 justify-center min-h-[250px] shadow-sm text-center md:text-left">
          <div className="shrink-0 relative w-32 h-32 rounded-full border-8 border-brand-mid/20 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a2e] shadow-inner">
            <div className="absolute inset-0 border-8 border-brand-primary rounded-full" style={{ clipPath: `inset(${100 - overallCombined}% 0 0 0)` }}></div>
            <span className="text-3xl font-bold text-brand-dark dark:text-gray-100 z-10">{overallCombined}%</span>
            <span className="text-[10px] font-medium text-brand-mid dark:text-gray-400 uppercase z-10">Overall</span>
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-gray-100 mb-2">Final Evaluation Report</h2>
            <p className="text-sm text-brand-mid dark:text-gray-400 mb-4 leading-relaxed">
              Based on your resume analysis and mock interview session, you are showing {overallCombined >= 75 ? 'strong' : overallCombined >= 50 ? 'average' : 'poor'} potential for your targeted roles.
            </p>
            <div className="flex gap-2 justify-center md:justify-start">
              {hasAnalysis && <span className="px-3 py-1 bg-brand-light text-brand-primary text-xs font-medium rounded-full">Resume Analyzed</span>}
              {hasInterview && <span className="px-3 py-1 bg-brand-successBg text-brand-success text-xs font-medium rounded-full">Interview Completed</span>}
            </div>
          </div>
        </div>

        {/* 2 Column Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasAnalysis && (
            <div className="bg-white dark:bg-[#1a1a2e] p-6 border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 rounded-brand shadow-sm">
              <h3 className="text-sm font-medium text-brand-dark dark:text-gray-100 mb-4">ATS Match by Role</h3>
              <div className="space-y-4">
                {analysisResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-brand-dark dark:text-gray-100 truncate pr-4">{r.role?.title}</span>
                    <ScoreBadge score={r.ats?.overall_score || 0} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasInterview && (
            <div className="bg-white dark:bg-[#1a1a2e] p-6 border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 rounded-brand shadow-sm">
              <h3 className="text-sm font-medium text-brand-dark dark:text-gray-100 mb-4">Interview Summary</h3>
              <p className="text-sm text-brand-dark dark:text-gray-100 leading-relaxed mb-4">
                {evaluationResults?.evaluation?.overall_summary || "Good effort overall."}
              </p>
              <div className="w-full flex items-center justify-between p-3 bg-brand-light rounded-brand">
                <span className="text-sm font-medium text-brand-primary">Final Interview Score</span>
                <span className="text-lg font-bold text-brand-primary">{interviewScore}/100</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInterviewTab = () => {
    if (!evaluationResults) return <div className="p-8 text-center text-brand-mid dark:text-gray-400">No interview data available.</div>;
    
    const evals = evaluationResults.allEvaluationsList || [];
    if (evals.length === 0) return (
      <div className="p-8 text-center">
        <p className="text-sm italic text-brand-mid dark:text-gray-500">⚠️ No question feedback available.</p>
      </div>
    );

    return (
      <div className="space-y-4 animate-in fade-in">
        {evals.map((item, i) => (
          <EvaluationRow key={i} data={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:py-8 space-y-6">
      
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[0.5px] border-brand-mid/30 pb-2 overflow-x-auto no-scrollbar">
        {['Overview', 'Resume analysis', 'Interview'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-t-brand transition-colors whitespace-nowrap",
              activeTab === tab
                ? "bg-brand-primary text-white"
                : "bg-transparent text-brand-mid dark:text-gray-400 hover:text-brand-dark dark:text-gray-100 hover:bg-brand-light/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2 pb-16">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Resume analysis' && (
          <div className="animate-in fade-in -mx-4 md:mx-0">
             <Dashboard />
          </div>
        )}
        {activeTab === 'Interview' && renderInterviewTab()}
      </div>

    </div>
  );
}

// Inner Component for Interview Questions List
function EvaluationRow({ data }) {
  const [expanded, setExpanded] = useState(false);
  // data comes from api: question_number, question, score_out_of_10, feedback, ideal_answer

  const scorePct = (data.score_out_of_10 / 10) * 100;
  
  let scoreColor = 'bg-brand-errorBg text-brand-error border-brand-error/20';
  let scoreIcon = '❌';
  let scoreLabel = 'Weak Answer';
  if (data.score_out_of_10 >= 8) {
    scoreColor = 'bg-brand-successBg text-brand-success border-brand-success/20';
    scoreIcon = '✅';
    scoreLabel = 'Strong Answer';
  } else if (data.score_out_of_10 >= 5) {
    scoreColor = 'bg-brand-warningBg text-brand-warning border-brand-warning/20';
    scoreIcon = '⚠️';
    scoreLabel = 'Needs Work';
  }

  return (
    <div className="bg-white dark:bg-[#1a1a2e] border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 rounded-brand shadow-sm overflow-hidden transition-all duration-300">
      <div 
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-brand-light/20 dark:hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={clsx("px-2 py-1 rounded text-xs font-bold border", scoreColor)}>
            {data.score_out_of_10}/10
          </div>
          <span className="text-[10px] text-center leading-tight text-brand-mid dark:text-gray-500 max-w-[52px]">{scoreLabel}</span>
        </div>
        <div className="flex-1 pr-4">
          <p className="text-sm font-medium text-brand-dark dark:text-gray-100 mb-1">
            <span className="mr-1">{scoreIcon}</span>Q{data.question_number}: {data.question}
          </p>
          <p className="text-xs text-brand-mid dark:text-gray-400 line-clamp-2 italic">{data.feedback}</p>
        </div>
        <div className="shrink-0 text-brand-mid dark:text-gray-400 mt-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-5 pt-0 bg-white dark:bg-[#1a1a2e] border-t border-[0.5px] border-brand-mid/10 animate-in slide-in-from-top-2">
          <div className="mt-4 p-4 bg-brand-light/50 rounded-brand">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wide">AI Feedback</span>
            <p className="text-sm text-brand-dark dark:text-gray-100 mt-2 leading-relaxed">{data.feedback}</p>
          </div>
          <div className="mt-4 p-4 bg-brand-successBg/50 border border-brand-success/10 rounded-brand">
            <span className="text-xs font-bold text-brand-success uppercase tracking-wide">Ideal Answer</span>
            <p className="text-sm text-brand-dark dark:text-gray-100 mt-2 leading-relaxed">{data.ideal_answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
