import { createContext, useState, useContext } from 'react';

const ResumeContext = createContext();

export function ResumeProvider({ children }) {
  const [parsedResume, setParsedResume] = useState(null);
  const [selectedMode, setSelectedMode] = useState('Both'); // 'Analysis', 'Interview', 'Both'
  const [selectedRoles, setSelectedRoles] = useState([]); // Array of role objects
  const [analysisResults, setAnalysisResults] = useState([]);
  const [upgradeTip, setUpgradeTip] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]); // Flattened sequential questions
  const [interviewAnswers, setInterviewAnswers] = useState({
    behavioural: [],
    technical: [],
    'domain-specific': []
  });
  const [evaluationResults, setEvaluationResults] = useState(null);

  const resetSession = () => {
    setParsedResume(null);
    setSelectedMode('Both');
    setSelectedRoles([]);
    setAnalysisResults([]);
    setUpgradeTip(null);
    setInterviewQuestions([]);
    setInterviewAnswers({
      behavioural: [],
      technical: [],
      'domain-specific': []
    });
    setEvaluationResults(null);
  };

  const value = {
    parsedResume, setParsedResume,
    selectedMode, setSelectedMode,
    selectedRoles, setSelectedRoles,
    analysisResults, setAnalysisResults,
    upgradeTip, setUpgradeTip,
    interviewQuestions, setInterviewQuestions,
    interviewAnswers, setInterviewAnswers,
    evaluationResults, setEvaluationResults,
    resetSession
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  return useContext(ResumeContext);
}
