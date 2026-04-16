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

  // Fallback if not loaded properly
  if (!interviewQuestions || interviewQuestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm italic text-brand-mid dark:text-gray-500">⚠️ No questions loaded. Please restart the session.</p>
      </div>
    );
  }

  const totalQuestions = interviewQuestions.length;
  const progressPercent = (currentIndex / totalQuestions) * 100;
  
  // Determine current domain based on 15 total (5 each)
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
      setError("Please provide an answer before continuing.");
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
      setCurrentIndex(prev => prev + 1);
    }
  };

  // --- ANTI-CHEAT & TIMER EFFECTS ---
  
  // 1. Countdown Timer
  useEffect(() => {
    if (isEvaluating || showWarning) return; // Pause timer if evaluating or warning exists
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext(true); // Force next question due to timeout
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
            // Terminate session
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
      // Group answers by type (assuming exact blocks of 5)
      const submittedAnswers = {
        'behavioural': fullList.slice(0, 5),
        'technical': fullList.slice(5, 10),
        'domain-specific': fullList.slice(10, 15)
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
    return <LoadingScreen messages={[
      "Analyzing your answers...", 
      "Grading against ideal responses...", 
      "Finalizing your interview report..."
    ]} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:py-8 flex flex-col h-full animate-in fade-in">
      
      {/* Anti-Cheat Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a2e] rounded-brand p-6 max-w-sm w-full text-center shadow-xl border border-brand-error/20">
            <div className="mx-auto w-12 h-12 bg-brand-errorBg text-brand-error rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-dark dark:text-gray-100 mb-2">Warning: Tab Switching</h3>
            <p className="text-sm text-brand-mid dark:text-gray-400 mb-6">
              You left the interview window. This is a strict environment. You have {3 - strikes} strike(s) left before the interview is terminated.
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full py-2 bg-brand-primary text-white rounded-brand font-medium hover:bg-brand-dark transition-colors border-none cursor-pointer"
            >
              I understand
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-brand-errorBg border border-brand-error/20 rounded-brand flex gap-3 text-brand-error items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Top Progress Bar & Dots */}
      <div className="bg-white dark:bg-[#1a1a2e] p-6 rounded-brand border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 shadow-sm mb-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-medium text-brand-dark dark:text-gray-100">
              {selectedRoles[0]?.title || 'Mock Interview'}
            </h2>
            <p className="text-sm text-brand-mid dark:text-gray-400 font-medium mt-1">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className={clsx(
              "mr-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
              timeLeft <= 30 
                ? "bg-brand-errorBg text-brand-error border-brand-error/30 animate-pulse" 
                : "bg-brand-light dark:bg-white/5 text-brand-primary border-brand-primary/20"
            )}>
              ⏳ {formatTime(timeLeft)}
            </div>
            {Array.from({ length: totalQuestions }).map((_, i) => {
              if (i < currentIndex) {
                return <CheckCircle2 key={i} className="w-4 h-4 text-brand-primary" />;
              } else if (i === currentIndex) {
                return (
                  <div key={i} className="w-4 h-4 rounded-full border-2 border-brand-primary bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                  </div>
                );
              } else {
                return <Circle key={i} className="w-4 h-4 text-brand-mid dark:text-gray-400/30" />;
              }
            })}
          </div>
        </div>

        <div className="w-full bg-brand-light rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-1.5 bg-brand-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <DomainBadge label="Behavioural 1–5" active={currentDomain === 'Behavioural'} />
          <DomainBadge label="Technical 6–10" active={currentDomain === 'Technical'} />
          <DomainBadge label="Domain 11–15" active={currentDomain === 'Domain-specific'} />
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-6 shrink-0">
        <QuestionCard question={interviewQuestions[currentIndex]} />
      </div>

      {/* Answer Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#1a1a2e] rounded-brand border border-[0.5px] border-brand-mid/30 dark:border-brand-mid/10 shadow-sm p-2 focus-within:border-brand-primary/60 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all duration-200">
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Give a concise 2–3 sentence answer. Focus on the key point, not a full essay."
          className="w-full h-full min-h-[200px] resize-none outline-none p-4 text-brand-dark dark:text-gray-100 rounded-md bg-transparent placeholder:text-brand-mid/60 dark:placeholder:text-gray-500 placeholder:italic"
        />
        <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 border-t border-[0.5px] border-brand-mid/20 mt-auto rounded-b-brand">
          <p className="text-xs text-brand-mid dark:text-gray-400">
            {currentAnswer.trim().length === 0
              ? 'Min 2–3 sentences recommended'
              : `${currentAnswer.trim().split(/\s+/).length} words`}
          </p>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-brand hover:bg-brand-dark transition-colors shadow-sm"
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
    <span className={clsx(
      "px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors border",
      active 
        ? "bg-brand-light dark:bg-brand-primary/20 text-brand-primary border-brand-primary/30" 
        : "bg-gray-50 dark:bg-white/5 text-brand-mid dark:text-gray-400 border-brand-mid/20"
    )}>
      {label}
    </span>
  );
}
