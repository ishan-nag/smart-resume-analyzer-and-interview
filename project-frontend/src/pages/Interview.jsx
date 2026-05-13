import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useApi } from '../hooks/useApi';
import { QuestionCard } from '../components/common/QuestionCard';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function Interview() {
  const navigate = useNavigate();
  const { interviewQuestions, selectedRoles, setEvaluationResults } = useResume();
  const { evaluateInterview, error, setError } = useApi();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answersList, setAnswersList] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Timer and Anti-cheat states
  const [timeLeft, setTimeLeft] = useState(120);
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Refs to read latest state inside setInterval
  const answerRef = useRef('');
  const answersListRef = useRef([]);

  useEffect(() => { answerRef.current = currentAnswer; }, [currentAnswer]);
  useEffect(() => { answersListRef.current = answersList; }, [answersList]);

  if (!interviewQuestions || interviewQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>No interview questions found. Please restart the session.</p>
      </div>
    );
  }

  const totalQuestions = interviewQuestions.length;
  const progressPercent = (currentIndex / totalQuestions) * 100;

  const getDomainLabel = (idx) => {
    if (idx < 5) return 'Behavioural';
    if (idx < 10) return 'Technical';
    return 'Domain-specific';
  };

  const currentDomain = getDomainLabel(currentIndex);

  const handleNext = async (isTimeout = false) => {
    // If timeout, force submission even if empty
    const finalAnswer = (isTimeout === true) && answerRef.current.trim().length === 0
      ? "[Time expired - no answer provided]"
      : answerRef.current;

    if (isTimeout !== true && finalAnswer.trim().length === 0) {
      setError('Please provide an answer before continuing.');
      return;
    }
    setError(null);

    const updatedList = [
      ...answersListRef.current,
      { question: interviewQuestions[currentIndex], answer: finalAnswer }
    ];
    setAnswersList(updatedList);
    setCurrentAnswer('');
    setTimeLeft(120); // Reset timer for next question

    if (currentIndex === totalQuestions - 1) {
      submitInterview(updatedList);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // --- ANTI-CHEAT & TIMER EFFECTS ---

  // 1. Countdown Timer
  useEffect(() => {
    if (isEvaluating || showWarning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext(true);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isEvaluating, showWarning]);

  // 2. Tab Switching Listener
  useEffect(() => {
    if (isEvaluating) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setStrikes(prev => {
          const newStrikes = prev + 1;
          if (newStrikes >= 3) {
            navigate('/');
          } else {
            setShowWarning(true);
          }
          return newStrikes;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEvaluating, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitInterview = async (fullList) => {
    setIsEvaluating(true);
    try {
      const submittedAnswers = {
        behavioural: fullList.slice(0, 5),
        technical: fullList.slice(5, 10),
        'domain-specific': fullList.slice(10, 15),
      };
      const primaryRoleId = selectedRoles[0]?.id || 'unknown';
      const results = await evaluateInterview(primaryRoleId, submittedAnswers);
      setEvaluationResults(results);
      navigate('/results');
    } catch (err) {
      console.error(err);
      setIsEvaluating(false);
    }
  };

  if (isEvaluating) {
    return (
      <LoadingScreen
        messages={[
          'Analyzing your answers...',
          'Grading against ideal responses...',
          'Finalizing your interview report...',
        ]}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:py-8 flex flex-col gap-5 animate-float-up">

      {/* Anti-Cheat Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
               style={{ background: 'var(--card-bg)', border: '1px solid rgba(153,27,27,0.2)' }}>
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                 style={{ background: '#FEE2E2', color: '#991B1B' }}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Warning: Tab Switching</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              You left the interview window. This is a strict environment. You have {3 - strikes} strike(s) left before the interview is terminated.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-2 text-white rounded-xl font-semibold border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #534AB7, #7C3AED)' }}
            >
              I understand
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl flex gap-3 items-start border"
             style={{ background: '#FEE2E2', borderColor: 'rgba(153,27,27,0.15)', color: '#991B1B' }}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Progress Header Card */}
      <div className="rounded-2xl p-6 shadow-sm"
           style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedRoles[0]?.title || 'Mock Interview'}
            </h2>
            <p className="text-[13px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Question dots + timer */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className={clsx(
              "mr-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
              timeLeft <= 30
                ? "animate-pulse"
                : ""
            )}
            style={{
              background: timeLeft <= 30 ? '#FEE2E2' : 'var(--hover-bg)',
              color: timeLeft <= 30 ? '#991B1B' : '#534AB7',
              borderColor: timeLeft <= 30 ? 'rgba(153,27,27,0.3)' : 'rgba(83,74,183,0.2)',
            }}>
              ⏳ {formatTime(timeLeft)}
            </div>
            {Array.from({ length: totalQuestions }).map((_, i) => {
              if (i < currentIndex) {
                return <CheckCircle2 key={i} className="w-4 h-4 text-brand-primary" />;
              } else if (i === currentIndex) {
                return (
                  <div key={i} className="w-4 h-4 rounded-full border-2 border-brand-primary flex items-center justify-center"
                       style={{ background: 'var(--card-bg)' }}>
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                  </div>
                );
              } else {
                return <Circle key={i} className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />;
              }
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #534AB7, #7C3AED)' }}
          />
        </div>

        {/* Domain badges */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <DomainBadge label="Behavioural 1–5"  active={currentDomain === 'Behavioural'} />
          <DomainBadge label="Technical 6–10"   active={currentDomain === 'Technical'} />
          <DomainBadge label="Domain 11–15"     active={currentDomain === 'Domain-specific'} />
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard question={interviewQuestions[currentIndex]} />

      {/* Answer Area */}
      <div className="flex flex-col rounded-2xl overflow-hidden shadow-sm"
           style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here…"
          className="w-full min-h-[200px] resize-none outline-none p-5 text-[14px] leading-relaxed bg-transparent font-sans"
          style={{ color: 'var(--text-primary)' }}
        />
        <div className="flex items-center justify-between px-5 py-3 border-t"
             style={{ background: 'var(--hover-bg)', borderColor: 'var(--card-border)' }}>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {currentAnswer.trim().length === 0
              ? 'Min 2–3 sentences recommended'
              : `${currentAnswer.trim().split(/\s+/).length} words`}
          </p>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 text-white text-sm font-semibold rounded-brand transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #534AB7, #7C3AED)',
              boxShadow: '0 4px 14px rgba(83,74,183,0.3)',
            }}
          >
            {currentIndex === totalQuestions - 1 ? 'Submit interview →' : 'Next question →'}
          </button>
        </div>
      </div>

    </div>
  );
}

function DomainBadge({ label, active }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 border"
      style={{
        background: active ? '#EEEDFE' : 'var(--hover-bg)',
        color: active ? '#534AB7' : 'var(--text-muted)',
        borderColor: active ? 'rgba(83,74,183,0.3)' : 'var(--card-border)',
      }}
    >
      {label}
    </span>
  );
}
