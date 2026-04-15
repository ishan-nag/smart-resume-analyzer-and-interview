import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useApi } from '../hooks/useApi';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function Upload() {
  const navigate = useNavigate();
  const { 
    parsedResume, setParsedResume, 
    selectedMode, setSelectedMode, 
    selectedRoles, setSelectedRoles,
    setAnalysisResults, setUpgradeTip, setInterviewQuestions
  } = useResume();
  const { uploadResume, getRoles, analyzeResume, generateInterview, error, setError } = useApi();

  const [pdfFile, setPdfFile] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingState, setLoadingState] = useState(null); // null, 'extracting', 'analyzing', 'generating'
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getRoles().then(data => setAvailableRoles(data?.roles || [])).catch(err => console.error(err));
    // Reset selected roles when coming back
    setSelectedRoles([]);
  }, []);

  const handleFileChange = (e) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }
    
    setPdfFile(file);
    setParsedResume(null); // clear cached if new file selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    setPdfFile(file);
    setParsedResume(null);
  };

  const toggleRole = (role) => {
    const isSelected = selectedRoles.some(r => r.id === role.id);
    if (isSelected) {
      setSelectedRoles(prev => prev.filter(r => r.id !== role.id));
    } else {
      if (selectedRoles.length >= 3) {
        // Max 3 roles reached handled by UX, ignore 4th click
        return;
      }
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  const maxRolesReached = selectedRoles.length >= 3;

  const handleSubmit = async () => {
    try {
      let currentResume = parsedResume;

      // Step 1: Upload / Parsing
      if (!currentResume) {
        if (!pdfFile) return;
        setLoadingState('extracting');
        const res = await uploadResume(pdfFile);
        if (res?.error) {
          setError("We couldn't read your resume. It may be image-based or scanned. Please convert it using SmallPDF, ILovePDF, or Google Drive OCR and try again.");
          setLoadingState(null);
          return;
        }
        currentResume = res;
        setParsedResume(res);
      }

      // Step 2 & 3 based on mode
      const roleIds = selectedRoles.map(r => r.id);
      
      if (selectedMode === 'Analysis Only' || selectedMode === 'Both') {
        setLoadingState('analyzing');
        const analysisData = await analyzeResume(currentResume, roleIds);
        setAnalysisResults(analysisData.analyses || []);
        setUpgradeTip(analysisData.upgrade_tip);
      }

      if (selectedMode === 'Interview Only' || selectedMode === 'Both') {
        setLoadingState('generating');
        const defaultInterviewTypes = ['behavioural', 'technical', 'domain-specific'];
        
        // As per prompt, use ONE role for interview (take the first selected if multiple)
        const primaryRoleId = roleIds[0]; 
        
        const interviewData = await generateInterview(currentResume, primaryRoleId, defaultInterviewTypes);
        setInterviewQuestions(interviewData.sequential_questions?.map(q => q.question) || []);
        
        navigate('/interview');
        return;
      }

      // If only analysis, go to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      // error is already set by useApi hook
      setLoadingState(null);
    }
  };

  if (loadingState) {
    let msg = ["Extracting resume data...", "Matching against ATS algorithms...", "Generating interview questions..."];
    if (loadingState === 'analyzing') msg = ["Matching against ATS algorithms...", "Scoring skills gap...", "Finalizing your report..."];
    if (loadingState === 'generating') msg = ["Generating interview questions...", "Preparing mock session..."];
    
    return <LoadingScreen messages={msg} />;
  }

  const isFormValid = (pdfFile || parsedResume) && selectedRoles.length > 0;

  return (
    <div className="w-full max-w-[480px] mx-auto p-4 md:py-8 space-y-6">
      
      {error && (
        <div className="p-4 bg-brand-errorBg border border-brand-error/20 rounded-brand flex gap-3 text-brand-error items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-brand-dark dark:text-gray-100 px-1">1. Resume</h2>
        
        {parsedResume && !pdfFile ? (
          <div className="flex items-center justify-between p-4 bg-brand-light/50 dark:bg-slate-800 border border-brand-primary/30 dark:border-slate-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-md text-brand-primary dark:text-brand-light shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-brand-dark dark:text-gray-100 truncate">{parsedResume.name || 'Resume'}</p>
                <p className="text-xs text-brand-success">Uploaded & Parsed successfully</p>
              </div>
            </div>
            <button 
              onClick={() => { setParsedResume(null); setPdfFile(null); }}
              className="p-2 hover:bg-white rounded-full transition-colors shrink-0"
              title="Upload different resume"
            >
              <X className="w-4 h-4 text-brand-mid dark:text-gray-400 hover:text-brand-dark dark:text-gray-100" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={clsx(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
              dragActive || pdfFile 
                ? "border-brand-primary bg-brand-light/50 dark:bg-brand-primary/10" 
                : "border-brand-mid/40 dark:border-slate-600 hover:border-brand-primary dark:hover:border-brand-primary hover:bg-brand-light/20 dark:hover:bg-slate-800/50 bg-white/50 dark:bg-slate-800/20"
            )}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            {pdfFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm text-brand-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-brand-dark dark:text-gray-100 truncate max-w-full px-4">{pdfFile.name}</div>
                <div className="text-xs text-brand-mid dark:text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-brand-mid dark:text-gray-400">
                <div className="p-3 bg-brand-light rounded-full text-brand-primary mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-brand-dark dark:text-gray-100">Drop your PDF resume here</p>
                <p className="text-xs">or click to browse · PDF only · max 5MB</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Mode Selector */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-brand-dark dark:text-gray-100 px-1">2. Module Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Analysis Only', 'Interview Only', 'Both'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={clsx(
                "p-3 rounded-2xl text-sm font-medium text-center transition-all duration-200 border border-[1px]",
                selectedMode === mode 
                  ? "border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-light shadow-sm"
                  : "border-transparent bg-white/60 dark:bg-slate-800/60 text-brand-dark dark:text-gray-300 hover:bg-white/90 dark:hover:bg-slate-700/80 border-white/50 dark:border-slate-600/50"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* Role Selector */}
      <section className="space-y-3 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-brand-dark dark:text-gray-100">3. Select Roles</h2>
          {maxRolesReached && (
            <span className="text-xs font-medium text-brand-warning bg-brand-warningBg px-2 py-0.5 rounded-full animate-in fade-in">
              Max 3 roles reached
            </span>
          )}
        </div>
        
        <div className="glass-card rounded-2xl max-h-[300px] overflow-y-auto w-full">
          {availableRoles.length === 0 ? (
            <div className="p-8 text-center text-sm text-brand-mid dark:text-gray-400">Loading roles...</div>
          ) : (
            availableRoles.map((role) => {
              const isSelected = selectedRoles.some(r => r.id === role.id);
              const isDisabled = maxRolesReached && !isSelected;
              
              return (
                <div 
                  key={role.id}
                  onClick={() => toggleRole(role)}
                  className={clsx(
                    "flex items-center gap-4 p-3 border-b border-[0.5px] border-brand-mid/20 dark:border-slate-700/50 hover:bg-brand-light/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer",
                    isDisabled && "opacity-40 pointer-events-none"
                  )}
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <div className={clsx(
                      "w-5 h-5 rounded border border-[1.5px] flex items-center justify-center transition-colors",
                      isSelected ? "bg-brand-primary border-brand-primary" : "border-brand-mid"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium text-brand-dark dark:text-gray-100 truncate">{role.title}</div>
                    <div className="text-xs text-brand-mid dark:text-gray-400 truncate">{role.category} • {role.experience_level}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <button
          disabled={!isFormValid}
          onClick={handleSubmit}
          className="px-6 py-3 bg-brand-primary text-white rounded-brand font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors shadow-sm"
        >
          {selectedMode === 'Interview Only' ? 'Start interview →' : 'Analyze resume →'}
        </button>
      </div>

    </div>
  );
}
