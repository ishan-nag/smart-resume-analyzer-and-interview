import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useApi } from '../hooks/useApi';
import { LoadingScreen } from '../components/common/LoadingScreen';
import {
  UploadCloud, FileText, X, AlertCircle,
  Zap, Brain, Target, CheckCircle2,
  BarChart2, ClipboardList, Bolt
} from 'lucide-react';
import { clsx } from 'clsx';

/* ── Floating decoration — large corner blobs only, no stray particles ── */
function ContentDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      {/* Top-right blob — safely off-screen */}
      <div className="absolute -top-48 -right-48 w-[520px] h-[520px] rounded-full blob opacity-[0.06]"
           style={{ background: 'radial-gradient(circle, var(--accent), var(--accent-2))' }} />
      {/* Bottom-left blob — safely off-screen */}
      <div className="absolute -bottom-36 -left-36 w-[400px] h-[400px] rounded-full blob opacity-[0.04]"
           style={{ background: 'radial-gradient(circle, var(--accent-2), var(--accent))', animationDelay:'5s' }} />
    </div>
  );
}

const features = [
  { icon: Zap,    label: 'Instant ATS Scoring', color: '#FBBF24' },
  { icon: Brain,  label: 'AI Interview Prep',   color: '#34D399' },
  { icon: Target, label: 'Role Gap Analysis',   color: '#60A5FA' },
];

const modes = [
  { key: 'Analysis Only',  emoji: '📊', icon: BarChart2,    desc: 'Resume scan & ATS scoring'      },
  { key: 'Interview Only', emoji: '📝', icon: ClipboardList, desc: 'AI-powered mock interview'      },
  { key: 'Both',           emoji: '⚡', icon: Zap,           desc: 'Full pipeline — scan + interview' },
];

const roleColors = ['#E11D48','#FB923C','#FBBF24','#34D399','#60A5FA','#A78BFA','#F472B6','#14B8A6'];

export function Upload() {
  const navigate   = useNavigate();
  const {
    parsedResume, setParsedResume,
    selectedMode, setSelectedMode,
    selectedRoles, setSelectedRoles,
    setAnalysisResults, setUpgradeTip, setInterviewQuestions
  } = useResume();
  const { uploadResume, getRoles, analyzeResume, generateInterview, error, setError } = useApi();

  const [pdfFile,        setPdfFile]        = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingState,   setLoadingState]   = useState(null);
  const [dragActive,     setDragActive]     = useState(false);
  const [uploadHovered,  setUploadHovered]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getRoles().then(d => setAvailableRoles(d?.roles || [])).catch(console.error);
    setSelectedRoles([]);
  }, []);

  const handleFileChange = e => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file only.'); return; }
    if (file.size > 10*1024*1024)         { setError('File size must be under 10MB.');  return; }
    setPdfFile(file); setParsedResume(null);
  };

  const handleDrop = e => {
    e.preventDefault(); setDragActive(false); setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file only.'); return; }
    setPdfFile(file); setParsedResume(null);
  };

  const toggleRole = role => {
    const isSel = selectedRoles.some(r => r.id === role.id);
    if (isSel) setSelectedRoles(p => p.filter(r => r.id !== role.id));
    else if (selectedRoles.length < 3) setSelectedRoles(p => [...p, role]);
  };

  const handleSubmit = async () => {
    try {
      let cur = parsedResume;
      if (!cur) {
        if (!pdfFile) return;
        setLoadingState('extracting');
        const res = await uploadResume(pdfFile);
        if (res?.error) { setError("Couldn't read your resume. It may be image-based."); setLoadingState(null); return; }
        cur = res; setParsedResume(res);
      }
      const roleIds = selectedRoles.map(r => r.id);
      if (selectedMode === 'Analysis Only' || selectedMode === 'Both') {
        setLoadingState('analyzing');
        const d = await analyzeResume(cur, roleIds);
        setAnalysisResults(d.analyses || []); setUpgradeTip(d.upgrade_tip);
      }
      if (selectedMode === 'Interview Only' || selectedMode === 'Both') {
        setLoadingState('generating');
        const d = await generateInterview(cur, roleIds[0], ['behavioural','technical','domain-specific']);
        setInterviewQuestions(d.sequential_questions?.map(q => q.question) || []);
        navigate('/interview'); return;
      }
      navigate('/dashboard');
    } catch (err) { console.error(err); setLoadingState(null); }
  };

  if (loadingState) {
    const msgs = {
      extracting: ['Extracting resume data…','Parsing your document…'],
      analyzing:  ['Matching against ATS algorithms…','Scoring skills gap…','Finalizing your report…'],
      generating: ['Generating interview questions…','Preparing mock session…'],
    };
    return <LoadingScreen messages={msgs[loadingState] || []} />;
  }

  const isValid    = (pdfFile || parsedResume) && selectedRoles.length > 0;
  const maxReached = selectedRoles.length >= 3;

  /* Upload box border/bg/shadow — indigo/slate palette, no red */
  const isDragging = dragActive;
  const isHovered  = uploadHovered && !isDragging;
  const uploadBorderColor = isDragging
    ? '#6366F1'
    : isHovered
      ? 'rgba(99,102,241,0.6)'
      : 'rgba(99,102,241,0.22)';
  const uploadBg = isDragging
    ? 'rgba(99,102,241,0.06)'
    : isHovered
      ? 'rgba(99,102,241,0.03)'
      : 'var(--card-bg)';
  const uploadShadow = isDragging
    ? '0 0 0 3px rgba(99,102,241,0.2), 0 4px 20px rgba(99,102,241,0.12)'
    : isHovered
      ? '0 0 0 2px rgba(99,102,241,0.15), 0 4px 16px rgba(99,102,241,0.08)'
      : 'none';

  return (
    <div className="relative w-full flex flex-col" style={{ height:'100vh', overflow:'hidden' }}>
      <ContentDecoration />

      <div className="relative z-10 w-full flex-1 flex flex-col px-6 pt-5 pb-4 gap-4 min-h-0 animate-float-up">

        {/* ══ HERO HEADER ══ */}
        <div className="shrink-0">
          <h1 className="text-[22px] md:text-[26px] font-display font-black leading-tight"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #FB923C 50%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
            Let's find your next opportunity — drop your resume to begin
          </h1>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="shrink-0 p-3 rounded-xl flex gap-3 items-start"
               style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)', color:'#DC2626' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* ══ STEP 1: UPLOAD — square creative drop zone ══ */}
        <section className="shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="step-badge">1</div>
            <span className="text-[13px] font-bold" style={{ color:'var(--text-muted)' }}>Upload Resume</span>
          </div>

          {parsedResume && !pdfFile ? (
            /* Already uploaded — confirmation bar */
            <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
                 style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.3)', borderLeftWidth:'4px', borderLeftColor:'#34D399' }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background:'rgba(52,211,153,0.15)', color:'#059669' }}>
                  <FileText className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-[14px] font-bold" style={{ color:'var(--text-primary)' }}>{parsedResume.name || 'Resume'}</p>
                  <p className="text-[11.5px] font-semibold" style={{ color:'#059669' }}>✓ Uploaded & Parsed</p>
                </div>
              </div>
              <button onClick={() => { setParsedResume(null); setPdfFile(null); }}
                      className="p-1.5 rounded-full hover:bg-red-50 transition-colors">
                <X className="w-4 h-4" style={{ color:'#9CA3AF' }}/>
              </button>
            </div>
          ) : (
            /* ── Square creative drop zone ── */
            <div
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setUploadHovered(true)}
              onMouseLeave={() => setUploadHovered(false)}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className="relative cursor-pointer select-none overflow-hidden rounded-3xl"
              style={{
                width: '100%',
                aspectRatio: '16/7',
                minHeight: '200px',
                maxHeight: '240px',
                background: isDragging
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(236,72,153,0.06) 100%)'
                  : isHovered
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)'
                    : 'var(--card-bg)',
                border: `2px dashed ${uploadBorderColor}`,
                boxShadow: isDragging
                  ? '0 0 0 4px rgba(99,102,241,0.15), 0 8px 32px rgba(99,102,241,0.2), inset 0 0 60px rgba(99,102,241,0.04)'
                  : isHovered
                    ? '0 0 0 3px rgba(99,102,241,0.1), 0 8px 28px rgba(99,102,241,0.12)'
                    : '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* ── Animated gradient mesh background ── */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{
                     background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(236,72,153,0.05) 0%, transparent 45%)',
                     opacity: isHovered || isDragging ? 1 : 0.5,
                     transition: 'opacity 0.4s ease',
                   }}/>

              {/* ── Corner decorative accents ── */}
              <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
                   style={{ borderTop: '3px solid rgba(99,102,241,0.4)', borderLeft: '3px solid rgba(99,102,241,0.4)', borderRadius: '24px 0 0 0', transition: 'all 0.3s ease', opacity: isHovered || isDragging ? 1 : 0.4 }}/>
              <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                   style={{ borderTop: '3px solid rgba(139,92,246,0.4)', borderRight: '3px solid rgba(139,92,246,0.4)', borderRadius: '0 24px 0 0', transition: 'all 0.3s ease', opacity: isHovered || isDragging ? 1 : 0.4 }}/>
              <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none"
                   style={{ borderBottom: '3px solid rgba(139,92,246,0.4)', borderLeft: '3px solid rgba(139,92,246,0.4)', borderRadius: '0 0 0 24px', transition: 'all 0.3s ease', opacity: isHovered || isDragging ? 1 : 0.4 }}/>
              <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none"
                   style={{ borderBottom: '3px solid rgba(99,102,241,0.4)', borderRight: '3px solid rgba(99,102,241,0.4)', borderRadius: '0 0 24px 0', transition: 'all 0.3s ease', opacity: isHovered || isDragging ? 1 : 0.4 }}/>

              {/* ── Pulsing ring behind icon ── */}
              {(isHovered || isDragging) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-24 h-24 rounded-full animate-ping"
                       style={{ background: 'rgba(99,102,241,0.08)', animationDuration:'1.8s' }}/>
                  <div className="absolute w-16 h-16 rounded-full animate-ping"
                       style={{ background: 'rgba(99,102,241,0.12)', animationDuration:'1.4s', animationDelay:'0.3s' }}/>
                </div>
              )}

              <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange}/>

              {/* ── Central content ── */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 px-6 py-5">

                {/* Icon circle */}
                <div className={clsx('flex items-center justify-center rounded-2xl transition-all duration-300',
                                    isHovered || isDragging ? 'scale-110' : 'scale-100')}
                     style={{
                       width: '64px', height: '64px',
                       background: isDragging
                         ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))'
                         : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                       boxShadow: isHovered || isDragging
                         ? '0 0 0 8px rgba(99,102,241,0.08), 0 8px 24px rgba(99,102,241,0.25)'
                         : '0 4px 16px rgba(99,102,241,0.12)',
                       border: '1px solid rgba(99,102,241,0.25)',
                       transition: 'all 0.3s ease',
                     }}>
                  {pdfFile
                    ? <FileText className="w-8 h-8" style={{ color:'#6366F1' }}/>
                    : <UploadCloud className="w-8 h-8 transition-colors duration-300"
                                   style={{ color: isHovered || isDragging ? '#818CF8' : '#6366F1' }}/>
                  }
                </div>

                {/* Text */}
                {pdfFile ? (
                  <div className="text-center">
                    <p className="text-[15px] font-black truncate max-w-[300px]" style={{ color:'var(--text-primary)' }}>{pdfFile.name}</p>
                    <p className="text-[12px] mt-1 font-semibold" style={{ color:'var(--text-muted)' }}>
                      {(pdfFile.size/1024/1024).toFixed(2)} MB
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background:'rgba(52,211,153,0.15)', color:'#34D399' }}>✓ Ready</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[15px] font-black" style={{ color:'var(--text-primary)' }}>
                      {isDragging ? '✨ Release to upload' : 'Drop your PDF resume here'}
                    </p>
                    <p className="text-[12px] mt-1" style={{ color:'var(--text-muted)' }}>
                      or <span className="font-bold cursor-pointer" style={{ color:'#818CF8' }}>click to browse</span>
                      <span className="mx-2 opacity-40">·</span>PDF only<span className="mx-2 opacity-40">·</span>max 10MB
                    </p>
                  </div>
                )}

                {/* Feature badges row */}
                {!pdfFile && (
                  <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
                    {features.map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold"
                           style={{
                             background:`${color}12`,
                             color,
                             border:`1px solid ${color}28`,
                             backdropFilter: 'blur(4px)',
                           }}>
                        <Icon className="w-3 h-3"/> {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ══ TWO-COLUMN GRID: fills remaining height ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 min-h-0 overflow-hidden">

          {/* ── LEFT: Module Mode — compact horizontal cards ── */}
          <div className="lg:col-span-2 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="step-badge">2</div>
              <h2 className="text-[13px] font-bold" style={{ color:'var(--text-primary)' }}>Module Mode</h2>
              <span className="text-[11px]" style={{ color:'var(--text-muted)' }}>— choose what to run</span>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
              {modes.map(({ key, emoji, icon: ModeIcon, desc }) => {
                const active = selectedMode === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMode(key)}
                    className="relative w-full text-left rounded-xl overflow-hidden transition-all duration-200 group flex-1"
                    style={{
                      background: active
                        ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)'
                        : 'var(--card-bg)',
                      border: active ? 'none' : '1.5px solid var(--card-border)',
                      boxShadow: active
                        ? '0 6px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15)'
                        : '0 1px 6px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.borderLeftColor = 'var(--accent)';
                      if (!active) e.currentTarget.style.borderLeftWidth = '3px';
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.borderLeftColor = 'var(--card-border)';
                      if (!active) e.currentTarget.style.borderLeftWidth = '1.5px';
                    }}
                  >
                    {/* Inner glow for active */}
                    {active && (
                      <div className="absolute inset-0 pointer-events-none"
                           style={{ background:'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.18), transparent 65%)' }}/>
                    )}

                    {/* Hover tint for inactive */}
                    {!active && (
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                           style={{ background:'var(--hover-bg)' }}/>
                    )}

                    <div className="relative z-10 flex items-center gap-4 h-full px-5">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                           style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(225,29,72,0.08)' }}>
                        <span className="text-xl">{emoji}</span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-black" style={{ color: active ? '#fff' : 'var(--text-primary)' }}>
                          {key}
                        </div>
                        <div className="text-[11.5px] font-medium mt-0.5 truncate"
                             style={{ color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                          {desc}
                        </div>
                      </div>

                      {/* Check */}
                      {active && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black"
                             style={{ background:'rgba(255,255,255,0.25)', color:'#fff' }}>✓</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Select Roles ── */}
          <div className="lg:col-span-3 flex flex-col gap-2 min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="step-badge">3</div>
                <h2 className="text-[13px] font-bold" style={{ color:'var(--text-primary)' }}>Select Roles</h2>
                <span className="text-[11px]" style={{ color:'var(--text-muted)' }}>— pick up to 3 targets</span>
              </div>
              <div className="flex gap-2">
                {selectedRoles.length > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background:'rgba(225,29,72,0.1)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>
                    {selectedRoles.length}/3
                  </span>
                )}
                {maxReached && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background:'rgba(251,191,36,0.15)', color:'#D97706', border:'1px solid rgba(251,191,36,0.3)' }}>
                    Max
                  </span>
                )}
              </div>
            </div>

            {/* Roles list — fills remaining height */}
            <div className="glass-card rounded-2xl overflow-y-auto flex-1 min-h-0" style={{ padding:0 }}>
              {availableRoles.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                       style={{ background:'rgba(225,29,72,0.1)' }}>
                    <Brain className="w-5 h-5 animate-spin-slow" style={{ color:'var(--accent)' }}/>
                  </div>
                  <p className="text-sm font-semibold" style={{ color:'var(--text-muted)' }}>Loading roles…</p>
                </div>
              ) : availableRoles.map((role, idx) => {
                const isSel = selectedRoles.some(r => r.id === role.id);
                const isOff = maxReached && !isSel;
                const accent = roleColors[idx % roleColors.length];
                return (
                  <div key={role.id}
                       onClick={() => toggleRole(role)}
                       className={clsx('flex items-center gap-4 px-5 py-4 border-b last:border-b-0 transition-all cursor-pointer',
                                       isOff && 'opacity-35 pointer-events-none')}
                       style={{ borderColor:'var(--card-border)', background: isSel ? `${accent}10` : 'transparent' }}
                       onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--hover-bg)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = isSel ? `${accent}10` : 'transparent'; }}>

                    {/* Checkbox */}
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                         style={{
                           background: isSel ? `linear-gradient(135deg, var(--accent), var(--accent-2))` : 'transparent',
                           border: isSel ? 'none' : '1.5px solid var(--text-faint)',
                           boxShadow: isSel ? '0 2px 8px var(--accent-glow)' : 'none',
                         }}>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white"/>}
                    </div>

                    {/* Color dot */}
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }}/>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold truncate" style={{ color:'var(--text-primary)' }}>{role.title}</div>
                      <div className="text-[11.5px] mt-0.5 font-medium truncate" style={{ color:'var(--text-muted)' }}>
                        {role.category} · {role.experience_level}
                      </div>
                    </div>

                    {isSel && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                            style={{ background:`${accent}22`, color:accent, border:`1px solid ${accent}40` }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA — bottom right of roles column */}
            <div className="flex justify-end shrink-0 pt-1">
              <button
                disabled={!isValid}
                onClick={handleSubmit}
                className="relative px-8 py-3 text-[14px] font-black rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: isValid
                    ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)'
                    : 'var(--card-border)',
                  color: isValid ? '#fff' : 'var(--text-faint)',
                  cursor: isValid ? 'pointer' : 'not-allowed',
                  boxShadow: isValid ? '0 6px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                  transform: isValid ? 'scale(1)' : 'scale(0.97)',
                }}
              >
                {isValid && (
                  <div className="absolute inset-0 pointer-events-none"
                       style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18), transparent 70%)' }}/>
                )}
                <span className="relative z-10">
                  {selectedMode === 'Interview Only' ? '📝 Start Interview →' : '🚀 Analyze Resume →'}
                </span>
              </button>
            </div>
          </div>

        </div>{/* end grid */}
      </div>
    </div>
  );
}
